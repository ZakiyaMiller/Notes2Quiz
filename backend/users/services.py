from ..database import json_store
from datetime import datetime

def get_or_create_user(decoded_token: dict) -> dict:
    """
    Retrieves a user from the database based on the Firebase UID.
    If the user does not exist, it creates a new user record.

    Args:
        decoded_token: The dictionary of claims from the verified Firebase ID token.

    Returns:
        The user's data as a dictionary.
    """
    user_id = decoded_token.get("uid")
    if not user_id:
        # This should ideally not happen if the token is verified
        raise ValueError("Decoded token is missing 'uid'.")

    # Check if the user already exists in our JSON store
    user = json_store.find_user_by_id(user_id)

    if user:
        # Optionally, you could update user details here if they've changed
        # For now, we just return the existing user
        return user
    else:
        # User does not exist, create a new record
        new_user = {
            "uid": user_id,
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat(),
        }
        # Save the new user to our JSON store
        return json_store.save_user(new_user)