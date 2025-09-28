import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status
from ..config import settings # Import the settings object

# Check if the app is already initialized to prevent errors
if not firebase_admin._apps:
    try:
        # Explicitly use the path from our settings configuration
        cred = credentials.Certificate(settings.google_application_credentials)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"CRITICAL: Error initializing Firebase Admin SDK: {e}")
        # This is a critical error, so we should probably exit or handle it explicitly
        # For now, printing a clear error is a big improvement.

def verify_id_token(id_token: str) -> dict:
    """
    Verifies the Firebase ID token.

    Args:
        id_token: The ID token from the client.

    Returns:
        The decoded token claims (user information).

    Raises:
        HTTPException: If the token is invalid.
    """
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
        )
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not verify authentication token.",
        )