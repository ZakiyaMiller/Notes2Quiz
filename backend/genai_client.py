"""
Google Generative AI client initialization using settings configuration.
"""
from google import genai
from .config import settings
import os

# Set the environment variable for the API key
os.environ['GEMINI_API_KEY'] = settings.gemini_api_key

# Create the client instance using the new Google GenAI SDK
client = genai.Client()