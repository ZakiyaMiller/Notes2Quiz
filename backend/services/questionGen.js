/**
 * Question generation service using Gemini AI
 */
const { model } = require('./genaiClient');

/**
 * Clean model response - extract JSON from markdown code blocks if present
 * @param {string} text - Raw model response text
 * @returns {string} Cleaned response text
 */
function cleanModelResponse(text) {
    if (!text) return '';

    // Check for markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        return match[1].trim();
    }
    return text.trim();
}

/**
 * Parse raw model response text and return a JSON array.
 * @param {string} rawText - Raw text from model
 * @returns {Array} Parsed array or empty array if parsing fails
 */
function extractJsonArray(rawText) {
    try {
        const cleaned = cleanModelResponse(rawText);
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
            return parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
            // If it's a single object, wrap it in an array
            return [parsed];
        }
        return [];
    } catch (error) {
        // Try to find array pattern in text
        try {
            const arrMatch = rawText.match(/\[\s*(?:\{[\s\S]*?\}\s*,?\s*)+\]/);
            if (arrMatch) {
                return JSON.parse(arrMatch[0]);
            }
        } catch (e) {
            // Ignore parsing errors
        }
        return [];
    }
}

/**
 * Generate MCQ questions from text
 * @param {string} text - Source text
 * @param {number} count - Number of questions to generate
 * @returns {Promise<string>} Raw model response
 */
async function generateMCQs(text, count = 10) {
    const prompt = `
<DOC>
${text}
</DOC>
Generate exactly ${count} multiple-choice questions (MCQs) from the text above.
Return a JSON array, where each item has:
{
"question": "the question text",
"options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
"answer": "the correct option (as text)",
"explanation": "a short explanation",
"source_span": "the relevant text span from the DOC"
}

Return ONLY valid JSON, no commentary or markdown.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return cleanModelResponse(response.text());
}

/**
 * Generate short answer questions from text
 * @param {string} text - Source text
 * @param {number} count - Number of questions to generate
 * @returns {Promise<string>} Raw model response
 */
async function generateShortAnswers(text, count = 5) {
    const prompt = `
<DOC>
${text}
</DOC>
Generate exactly ${count} short-answer questions from the text above.
Return a JSON array, where each item has:
- question: the question text (expects a short textual answer)
- answer: the short answer text
- explanation: a short explanation or rubric
- source_span: the relevant text span from the DOC

Return ONLY valid JSON, no commentary or markdown.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return cleanModelResponse(response.text());
}

/**
 * Generate long answer (essay) questions from text
 * @param {string} text - Source text
 * @param {number} count - Number of questions to generate
 * @returns {Promise<string>} Raw model response
 */
async function generateLongAnswers(text, count = 3) {
    const prompt = `
<DOC>
${text}
</DOC>
Generate exactly ${count} long-answer (essay) questions from the text above.
Return a JSON array, where each item has:
- question: the question text (expects a longer written answer)
- answer: an exemplar/outline answer (can be multi-paragraph)
- explanation: guidance on marking/expected key points
- source_span: the relevant text span from the DOC

Return ONLY valid JSON, no commentary or markdown.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return cleanModelResponse(response.text());
}

module.exports = {
    cleanModelResponse,
    extractJsonArray,
    generateMCQs,
    generateShortAnswers,
    generateLongAnswers
};
