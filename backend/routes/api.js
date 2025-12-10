/**
 * Main API routes - OCR, document management, and question generation
 */
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { requireAuth, getCurrentUser } = require('../auth/dependencies');
const { runGeminiOCR } = require('../services/ocr');
const { generateMCQs, generateShortAnswers, generateLongAnswers, extractJsonArray } = require('../services/questionGen');
const { loadDoc, saveDoc, DATA_DIR } = require('../database/jsonStore');
const { extractJsonFromCodeblock } = require('../utils/helpers');

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

/**
 * Health check endpoint
 * GET /api/
 */
router.get('/', (req, res) => {
    res.json({ msg: 'Backend running' });
});

/**
 * Upload and process an image with OCR
 * POST /api/upload
 */
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const currentUser = getCurrentUser(req);
        console.log(`DEBUG: Upload started for user:`, currentUser.uid);

        const docId = uuidv4();
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                error: 'No file uploaded',
                detail: 'Please provide a file to upload'
            });
        }

        const filename = file.originalname || `${docId}.bin`;
        const mimeType = file.mimetype || 'application/octet-stream';
        const uploadTs = new Date().toISOString();

        console.log(`DEBUG: File received, size: ${file.buffer.length} bytes`);

        // Save the uploaded file
        const ext = filename.split('.').pop() || 'png';
        const savedPath = path.join(DATA_DIR, `${docId}.${ext}`);

        try {
            fs.writeFileSync(savedPath, file.buffer);
            console.log(`DEBUG: Saved to path: ${savedPath}`);
        } catch (err) {
            console.error('DEBUG: File save error:', err);
            return res.status(500).json({
                error: 'Could not save uploaded file',
                detail: err.message
            });
        }

        // Run OCR
        let modelOutput;
        try {
            console.log('DEBUG: Starting OCR processing');
            modelOutput = await runGeminiOCR(file.buffer, mimeType);
            console.log(`DEBUG: OCR completed, output length: ${modelOutput ? modelOutput.length : 0}`);
        } catch (err) {
            console.error('DEBUG: OCR error:', err);
            return res.status(500).json({
                error: 'OCR generation failed',
                detail: err.message
            });
        }

        // Parse OCR output
        let parsedJson = null;
        let rawText = '';
        let lines = [];

        try {
            const cleanedOutput = extractJsonFromCodeblock(modelOutput);
            parsedJson = JSON.parse(cleanedOutput);
            rawText = parsedJson.text || '';
            lines = parsedJson.lines || [];
            console.log('DEBUG: JSON parsing successful');
        } catch (err) {
            rawText = modelOutput || '';
            lines = [];
            parsedJson = { text: rawText, lines: lines };
            console.log('DEBUG: JSON parsing failed, using fallback');
        }

        // Save document data
        const docData = {
            doc_id: docId,
            filename: filename,
            saved_image: savedPath,
            upload_ts: uploadTs,
            raw_text: rawText,
            model_raw_output: modelOutput,
            ocr_json: parsedJson,
            user_id: currentUser.uid
        };

        console.log('DEBUG: Saving document data');
        saveDoc(docId, docData);
        console.log('DEBUG: Upload completed successfully');

        res.json({
            doc_id: docId,
            lines: lines,
            ocr_json: parsedJson
        });

    } catch (error) {
        console.error('DEBUG: Unexpected error in upload endpoint:', error);
        res.status(500).json({
            error: 'Upload failed',
            detail: error.message
        });
    }
});

/**
 * Get document result by ID
 * GET /api/result/:doc_id
 */
router.get('/result/:doc_id', async (req, res) => {
    try {
        const { doc_id } = req.params;
        const doc = loadDoc(doc_id);

        if (!doc) {
            return res.status(404).json({ detail: 'doc_id not found' });
        }

        res.json(doc);
    } catch (error) {
        console.error('Error getting result:', error);
        res.status(500).json({ detail: error.message });
    }
});

/**
 * Update document OCR result
 * PUT /api/result/:doc_id
 */
router.put('/result/:doc_id', async (req, res) => {
    try {
        const { doc_id } = req.params;
        const { cleaned_text, accepted = true, editor } = req.body;

        const doc = loadDoc(doc_id);
        if (!doc) {
            return res.status(404).json({ detail: 'doc_id not found' });
        }

        const cleanedTs = new Date().toISOString();

        // Update document
        doc.cleaned_text = cleaned_text;
        doc.cleaned_ts = cleanedTs;
        doc.accepted = Boolean(accepted);

        if (editor) {
            doc.last_edited_by = editor;
        }

        // Add to edit history
        const history = doc.edit_history || [];
        history.push({
            ts: cleanedTs,
            editor: editor || 'unknown',
            accepted: Boolean(accepted),
            snippet: (cleaned_text || '').substring(0, 200)
        });
        doc.edit_history = history;

        saveDoc(doc_id, doc);

        res.json({
            status: 'ok',
            doc_id: doc_id,
            cleaned_ts: cleanedTs
        });

    } catch (error) {
        console.error('Error updating result:', error);
        res.status(500).json({ detail: error.message });
    }
});

/**
 * Generate questions from document
 * POST /api/generate
 */
router.post('/generate', async (req, res) => {
    try {
        const { doc_id, text_override = '', counts = {} } = req.body;

        if (!doc_id) {
            return res.status(400).json({ detail: 'doc_id is required' });
        }

        const doc = loadDoc(doc_id);
        if (!doc) {
            return res.status(404).json({ detail: 'doc_id not found' });
        }

        // Get text to use for generation
        const text = (text_override || '').trim() || doc.cleaned_text || doc.raw_text || '';

        if (!text) {
            return res.status(400).json({
                detail: 'No text available for question generation.'
            });
        }

        // Parse counts
        let mcqCount, shortCount, longCount;
        try {
            mcqCount = parseInt(counts.mcq || 0) || 0;
            shortCount = parseInt(counts.short || 0) || 0;
            longCount = parseInt(counts.long || 0) || 0;
        } catch (err) {
            return res.status(400).json({
                detail: 'Invalid counts payload; expected integers for mcq/short/long.'
            });
        }

        const aggregated = [];

        // Generate questions
        try {
            if (mcqCount > 0) {
                console.log(`Generating ${mcqCount} MCQs...`);
                const mcqRaw = await generateMCQs(text, mcqCount);
                const mcqQuestions = extractJsonArray(mcqRaw);
                if (Array.isArray(mcqQuestions)) {
                    mcqQuestions.forEach(q => {
                        q.type = q.type || 'mcq';
                    });
                    aggregated.push(...mcqQuestions);
                }
            }

            if (shortCount > 0) {
                console.log(`Generating ${shortCount} short answer questions...`);
                const shortRaw = await generateShortAnswers(text, shortCount);
                const shortQuestions = extractJsonArray(shortRaw);
                if (Array.isArray(shortQuestions)) {
                    shortQuestions.forEach(q => {
                        q.type = q.type || 'short';
                    });
                    aggregated.push(...shortQuestions);
                }
            }

            if (longCount > 0) {
                console.log(`Generating ${longCount} long answer questions...`);
                const longRaw = await generateLongAnswers(text, longCount);
                const longQuestions = extractJsonArray(longRaw);
                if (Array.isArray(longQuestions)) {
                    longQuestions.forEach(q => {
                        q.type = q.type || 'long';
                    });
                    aggregated.push(...longQuestions);
                }
            }
        } catch (err) {
            console.error('Question generation error:', err);
            return res.status(500).json({
                detail: `Question generation failed: ${err.message}`
            });
        }

        // Update document with questions
        const questionsTs = new Date().toISOString();
        doc.questions = aggregated;
        doc.questions_ts = questionsTs;
        saveDoc(doc_id, doc);

        res.json({
            doc_id: doc_id,
            questions: aggregated,
            generation_ts: questionsTs
        });

    } catch (error) {
        console.error('Error in generate endpoint:', error);
        res.status(500).json({ detail: error.message });
    }
});

module.exports = router;
