/**
 * Google Generative AI client initialization
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Create the Generative AI client instance
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Get the model instance
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

module.exports = {
    genAI,
    model
};
