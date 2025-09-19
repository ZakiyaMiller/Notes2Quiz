"""
Create and export the Google GenAI client instance.
"""
import os
from dotenv import load_dotenv
from google import genai
# Lazily create and cache the client to avoid raising at import time.
_client = None

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY environment variable before running.")

client = genai.Client(api_key=API_KEY)