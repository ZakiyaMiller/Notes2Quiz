/**
 * Gemini OCR service for extracting text from images
 */
const { model } = require('./genaiClient');

/**
 * Runs OCR on an image using Gemini AI.
 * @param {Buffer} imageBuffer - The image data as a Buffer
 * @param {string} mimeType - The MIME type of the image
 * @returns {Promise<string>} The raw model output string
 */
async function runGeminiOCR(imageBuffer, mimeType) {
    const prompt = `
Extract the textual contents of the provided image of handwritten notes and return STRICT JSON only.
Return your answer as a JSON object with exactly these two fields:
JSON format:
{
  "text": "<full extracted text as a single string>",
  "lines": ["line1", "line2", ...]
}
Both fields must always be present, even if empty. Do not add any commentary or extra fields. Return only valid JSON.
`;

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Create the image part for the API
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType
        }
    };

    // Generate content with the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    return response.text();
}

module.exports = {
    runGeminiOCR
};
