/**
 * Firebase Authentication Middleware
 */
const { verifyIdToken } = require('./firebaseAuth');

/**
 * Middleware that extracts and verifies Firebase ID token from Authorization header.
 * Attaches the decoded user to req.user if valid.
 */
async function firebaseAuthMiddleware(req, res, next) {
    // Clear any previous user state
    req.user = null;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // If no token, just proceed. Route-level protection will handle it.
        return next();
    }

    try {
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            return next(); // Invalid format, let route handle protection
        }

        const token = parts[1];
        const decodedToken = await verifyIdToken(token);

        // Attach the decoded token to the request for use in endpoints
        req.user = decodedToken;
        next();
    } catch (error) {
        // For invalid tokens, return error immediately
        if (error.status === 401) {
            return res.status(401).json({
                detail: `Invalid authentication token: ${error.message}`
            });
        }
        // For other errors, return 500
        return res.status(500).json({
            detail: `Could not process authentication token: ${error.message}`
        });
    }
}

module.exports = {
    firebaseAuthMiddleware
};
