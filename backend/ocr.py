"""
Gemini OCR wrapper. Runs blocking model calls in threadpool from routes.
"""
from google import genai
from google.genai import types
from .genai_client import client

def _run_gemini_ocr(image_bytes: bytes, mime_type: str) -> str:
    """
    Blocking call to Gemini that returns the raw model output string.
    """
    # Create image part from bytes
    img_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    prompt = """
Extract the textual contents of the provided image of handwritten notes and return STRICT JSON only.
Return your answer as a JSON object with exactly these two fields:
JSON format:
{
  "text": "<full extracted text as a single string>",
  "lines": ["line1", "line2", ...]
}
Both fields must always be present, even if empty. Do not add any commentary or extra fields. Return only valid JSON.
"""
    
    # Use the new Gemini API client
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt, img_part],
    )
    
    # return raw model text for downstream parsing and storage
    return response.text