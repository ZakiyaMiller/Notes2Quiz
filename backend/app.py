"""
Create FastAPI app, configure middleware and register routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routes import router as api_router

load_dotenv()

def create_app() -> FastAPI:
    app = FastAPI(title="notes2questions - MVP backend")

    origins = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="")

    return app