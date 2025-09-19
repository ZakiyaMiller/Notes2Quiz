"""
Pydantic request/response models used by routes.
"""
from pydantic import BaseModel
from typing import Optional, Dict

class OCRUpdateRequest(BaseModel):
    cleaned_text: str
    accepted: Optional[bool] = False
    editor: Optional[str] = None

class GenerateRequest(BaseModel):
    doc_id: str
    text_override: str = ""
    counts: Optional[Dict[str, int]] = None