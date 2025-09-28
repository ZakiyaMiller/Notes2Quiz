from fastapi import APIRouter, Depends, HTTPException
from . import services
from ..auth.dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post("/me", response_model=dict)
async def get_or_create_current_user(decoded_token: dict = Depends(get_current_user)):
    """
    This endpoint is called by the frontend after a successful Firebase login.
    It uses the ID token to either find the user in our database or create a new one.
    The user's ID token must be sent in the Authorization header as a Bearer token.
    """
    try:
        user = services.get_or_create_user(decoded_token)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # A generic catch-all for other potential errors during user creation
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")