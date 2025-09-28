import json
import os
from threading import Lock

# Define the path for our JSON database file.
# It will be created in the same directory as this script.
DB_FILE = os.path.join(os.path.dirname(__file__), 'db.json')

# A lock to prevent race conditions when multiple requests try to write to the file.
file_lock = Lock()

def _initialize_db():
    """Ensures the database file exists and has a basic structure."""
    with file_lock:
        if not os.path.exists(DB_FILE):
            # Create the file with an empty structure for users
            with open(DB_FILE, 'w') as f:
                json.dump({"users": {}}, f, indent=4)

def read_data():
    """
    Reads the entire database from the JSON file in a thread-safe manner.
    """
    _initialize_db()  # Ensure file exists before reading
    with file_lock:
        with open(DB_FILE, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                # If the file is empty or corrupted, return a default structure
                return {"users": {}}
    return data

def write_data(data: dict):
    """
    Writes the entire database to the JSON file in a thread-safe manner.
    """
    _initialize_db()  # Ensure file exists before writing
    with file_lock:
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=4)

# ==============================================================================
# User-specific data access functions
# ==============================================================================

def find_user_by_id(user_id: str) -> dict | None:
    """
    Finds a user by their ID (which will be the UID from Firebase).
    
    Args:
        user_id: The unique identifier for the user.
        
    Returns:
        The user's data as a dictionary, or None if not found.
    """
    db = read_data()
    return db.get("users", {}).get(user_id)

def save_user(user_data: dict):
    """
    Saves or updates a user's data in the JSON store.
    The user_data dictionary is expected to contain a 'uid' key.
    
    Args:
        user_data: A dictionary containing the user's details.
    """
    if 'uid' not in user_data:
        raise ValueError("User data must contain a 'uid' key.")
    
    user_id = user_data['uid']
    db = read_data()
    
    # Ensure the 'users' key exists
    if "users" not in db:
        db["users"] = {}
        
    db["users"][user_id] = user_data
    write_data(db)
    return user_data

# Initialize the database file on startup
_initialize_db()