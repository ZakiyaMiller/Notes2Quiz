/**
 * Firebase Admin SDK initialization and token verification
 */
const admin = require('firebase-admin');
const config = require('../config');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const serviceAccount = require(config.googleApplicationCredentials);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
        console.error('CRITICAL: Error initializing Firebase Admin SDK:', error.message);
    }
}

/**
 * Verifies the Firebase ID token.
 * @param {string} idToken - The ID token from the client.
 * @returns {Promise<object>} The decoded token claims (user information).
 * @throws {Error} If the token is invalid.
 */
async function verifyIdToken(idToken) {
    if (!idToken) {
        const error = new Error('Authentication token is missing.');
        error.status = 401;
        throw error;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        if (error.code === 'auth/id-token-expired' ||
            error.code === 'auth/invalid-id-token' ||
            error.code === 'auth/argument-error') {
            const authError = new Error('Invalid authentication token.');
            authError.status = 401;
            throw authError;
        }
        const serverError = new Error('Could not verify authentication token.');
        serverError.status = 500;
        throw serverError;
    }
}

module.exports = {
    admin,
    verifyIdToken
};
