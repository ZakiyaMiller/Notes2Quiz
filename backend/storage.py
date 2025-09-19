"""
Storage helpers: DATA_DIR, load/save functions.
"""
import json
from pathlib import Path as FsPath
from typing import Optional


# Create data directory relative to backend folder
DATA_DIR = FsPath(__file__).parent.parent / "data"  # This creates notes2QA/data/
DATA_DIR.mkdir(exist_ok=True)

def _doc_path(doc_id: str) -> FsPath:
    return DATA_DIR / f"{doc_id}.json"

def load_doc(doc_id: str) -> Optional[dict]:
    p = _doc_path(doc_id)
    if not p.exists():
        return None
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_doc_json(doc_id: str, data: dict):
    p = _doc_path(doc_id)
    with p.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)