from pydantic import BaseModel
from typing import Optional, Dict, Any

class OCRUpdateRequest(BaseModel):
    """Model for updating OCR results after user review"""
    cleaned_text: str
    accepted: bool = True
    editor: Optional[str] = None

class GenerateRequest(BaseModel):
    """Model for question generation requests"""
    doc_id: str
    text_override: Optional[str] = ""
    counts: Optional[Dict[str, int]] = None

# User and session models