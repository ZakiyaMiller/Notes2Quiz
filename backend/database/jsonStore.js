/**
 * JSON file-based storage for documents and users
 */
const fs = require('fs');
const path = require('path');

// Define paths
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(__dirname, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==============================================================================
// Document Storage Functions (for OCR results and questions)
// ==============================================================================

/**
 * Get the file path for a document
 * @param {string} docId - Document ID
 * @returns {string} File path
 */
function getDocPath(docId) {
    return path.join(DATA_DIR, `${docId}.json`);
}

/**
 * Load a document by ID
 * @param {string} docId - Document ID
 * @returns {object|null} Document data or null if not found
 */
function loadDoc(docId) {
    const filePath = getDocPath(docId);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading document ${docId}:`, error);
        return null;
    }
}

/**
 * Save a document
 * @param {string} docId - Document ID
 * @param {object} data - Document data
 */
function saveDoc(docId, data) {
    const filePath = getDocPath(docId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==============================================================================
// User Database Functions
// ==============================================================================

/**
 * Initialize the database file if it doesn't exist
 */
function initializeDb() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 4), 'utf-8');
    }
}

/**
 * Read the entire database
 * @returns {object} Database contents
 */
function readData() {
    initializeDb();
    try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: {} };
    }
}

/**
 * Write the entire database
 * @param {object} data - Data to write
 */
function writeData(data) {
    initializeDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

/**
 * Find a user by their ID (Firebase UID)
 * @param {string} userId - User ID
 * @returns {object|null} User data or null if not found
 */
function findUserById(userId) {
    const db = readData();
    return db.users[userId] || null;
}

/**
 * Save or update a user
 * @param {object} userData - User data (must contain 'uid' key)
 * @returns {object} The saved user data
 */
function saveUser(userData) {
    if (!userData.uid) {
        throw new Error("User data must contain a 'uid' key.");
    }

    const userId = userData.uid;
    const db = readData();

    if (!db.users) {
        db.users = {};
    }

    db.users[userId] = userData;
    writeData(db);
    return userData;
}

// Initialize database on module load
initializeDb();

module.exports = {
    // Document functions
    DATA_DIR,
    getDocPath,
    loadDoc,
    saveDoc,

    // User functions
    findUserById,
    saveUser,
    readData,
    writeData
};
