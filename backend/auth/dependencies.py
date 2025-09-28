from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

# This is now mainly for documentation and OpenAPI spec generation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(request: Request) -> dict:
    """
    Dependency that retrieves the current user from the request state,
    which is populated by the FirebaseAuthMiddleware.
    
    Raises:
        HTTPException: If no authenticated user is found in the request state.
    """
    if not hasattr(request.state, "user") or not request.state.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return request.state.user