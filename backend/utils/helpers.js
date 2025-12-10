/**
 * Utility helpers for parsing model output
 */

/**
 * Extract JSON contained in Markdown code fences (```...```) if present.
 * @param {string} text - Text that may contain code-fenced JSON
 * @returns {string} Extracted JSON or original text
 */
function extractJsonFromCodeblock(text) {
    if (!text || typeof text !== 'string') return text;

    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        return match[1];
    }
    return text;
}

/**
 * Try to parse text (possibly with noise) into a JSON array of objects.
 * @param {any} text - Text to parse
 * @returns {any} Parsed object/array on success, otherwise original text
 */
function extractJsonArray(text) {
    if (typeof text !== 'string') {
        return text;
    }

    let cleanedText = extractJsonFromCodeblock(text).trim();

    // Try array pattern first
    const arrMatch = cleanedText.match(/\[\s*(?:\{[\s\S]*?\}\s*,?\s*)+\]/);
    if (arrMatch) {
        try {
            return JSON.parse(arrMatch[0]);
        } catch (e) {
            // Continue to other methods
        }
    }

    // Try to parse entire text
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        // Continue to fallback
    }

    // Fallback: find first object and wrap as array
    const objMatch = cleanedText.match(/\{[\s\S]*?\}/);
    if (objMatch) {
        try {
            return JSON.parse('[' + objMatch[0] + ']');
        } catch (e) {
            // Return original text if all parsing fails
        }
    }

    return text;
}

/**
 * Generate a simple UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
}

module.exports = {
    extractJsonFromCodeblock,
    extractJsonArray,
    generateUUID
};
