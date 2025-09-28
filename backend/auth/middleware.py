from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from typing import Callable, Awaitable
from ..auth import firebase_auth
import firebase_admin

class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        # Clear any previous user state
        request.state.user = None

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            # If no token, just proceed. The route dependency will handle protection.
            return await call_next(request)

        try:
            scheme, token = auth_header.split()
            if scheme.lower() == "bearer":
                # Verify the token
                decoded_token = firebase_auth.verify_id_token(token)
                # Attach the decoded token to the request state for use in endpoints
                request.state.user = decoded_token
        except (ValueError, firebase_admin.auth.InvalidIdTokenError) as e:
            # This will catch malformed headers or invalid tokens.
            # We can return an error immediately for invalid tokens.
            return JSONResponse(
                status_code=401,
                content={"detail": f"Invalid authentication token: {e}"},
            )
        except Exception as e:
            # Catch other potential verification errors
            return JSONResponse(
                status_code=500,
                content={"detail": f"Could not process authentication token: {e}"},
            )

        response = await call_next(request)
        return response