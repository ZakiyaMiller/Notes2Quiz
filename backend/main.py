from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .users import routes as user_routes
from .routes import router as api_router  # Import the main API router
from .auth.middleware import FirebaseAuthMiddleware

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Notes2QA API",
    description="API for the Notes2QA application.",
    version="1.0.0",
)

# ==============================================================================
# Middleware
# ==============================================================================

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the custom Firebase authentication middleware
app.add_middleware(FirebaseAuthMiddleware)


# ==============================================================================
# API Routers
# ==============================================================================

# Include the router for user-related endpoints (e.g., /users/me)
app.include_router(user_routes.router)

# Include the main router for other API endpoints (e.g., /api/upload)
app.include_router(api_router, prefix="/api")


# ==============================================================================
# Root Endpoint
# ==============================================================================

@app.get("/")
async def root():
    return {"message": "Welcome to the Notes2QA API!"}