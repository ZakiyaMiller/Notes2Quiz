from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import routes

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Quiz Generator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes.router, prefix="/api")

# Basic health check endpoint
@app.get("/")
async def root():
    return {"message": "Quiz Generator API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notes2QA backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)