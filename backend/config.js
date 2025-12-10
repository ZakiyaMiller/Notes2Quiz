/**
 * Configuration module - loads environment variables
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : path.join(__dirname, 'serviceAccountKey.json'),
    port: process.env.PORT || 8000,
};

// Validate required config
if (!config.geminiApiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment variables');
}

module.exports = config;
