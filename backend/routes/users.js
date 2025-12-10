/**
 * User routes - handles user registration and retrieval
 */
const express = require('express');
const router = express.Router();
const { requireAuth, getCurrentUser } = require('../auth/dependencies');
const { findUserById, saveUser } = require('../database/jsonStore');

/**
 * Get or create the current user based on Firebase token
 * POST /users/me
 */
router.post('/me', requireAuth, async (req, res) => {
    try {
        const decodedToken = getCurrentUser(req);

        const userId = decodedToken.uid;
        if (!userId) {
            return res.status(400).json({
                detail: "Decoded token is missing 'uid'."
            });
        }

        // Check if the user already exists
        let user = findUserById(userId);

        if (user) {
            // User exists, return their data
            // Optionally update last_login here
            return res.json(user);
        }

        // User does not exist, create a new record
        const newUser = {
            uid: userId,
            email: decodedToken.email || null,
            name: decodedToken.name || null,
            picture: decodedToken.picture || null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
        };

        // Save the new user
        const savedUser = saveUser(newUser);
        res.json(savedUser);

    } catch (error) {
        console.error('Error in /users/me:', error);
        if (error.status) {
            return res.status(error.status).json({ detail: error.message });
        }
        res.status(500).json({ detail: `An error occurred: ${error.message}` });
    }
});

module.exports = router;
