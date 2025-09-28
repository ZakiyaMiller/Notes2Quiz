"""
All API endpoints. Uses helper modules for OCR, storage, generation, utils, and genai client.
"""
import uuid
import json
import re
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Path as FastAPIPath, Body
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from .database.models import OCRUpdateRequest, GenerateRequest # Corrected import path
from .auth.dependencies import get_current_user
from .ocr import _run_gemini_ocr
from .utils import extract_json_from_codeblock
from .storage import save_doc_json, load_doc, DATA_DIR
from .ques_gen import generate_mcqs, generate_short_answers, generate_long_answers, extract_json_array
from .genai_client import client

router = APIRouter()

@router.get("/")
def root():
    return {"msg": "Backend running"}

@router.post("/upload")
async def upload(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        print(f"DEBUG: Upload started for user: {current_user}")
        doc_id = str(uuid.uuid4())
        filename = file.filename or f"{doc_id}.bin"
        mime_type = file.content_type or "application/octet-stream"
        upload_ts = datetime.utcnow().isoformat()

        try:
            contents = await file.read()
            print(f"DEBUG: File read successfully, size: {len(contents)} bytes")
        except Exception as e:
            print(f"DEBUG: File read error: {e}")
            raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {e}")

        ext = filename and filename.split(".")[-1] or "png"
        saved_path = DATA_DIR / f"{doc_id}.{ext}"
        print(f"DEBUG: Saving to path: {saved_path}")
        with open(saved_path, "wb") as f:
            f.write(contents)

        try:
            print("DEBUG: Starting OCR processing")
            model_output = await run_in_threadpool(_run_gemini_ocr, contents, mime_type)
            print(f"DEBUG: OCR completed, output length: {len(model_output) if model_output else 0}")
        except Exception as e:
            print(f"DEBUG: OCR error: {e}")
            return JSONResponse(status_code=500, content={
                "error": "OCR generation failed",
                "detail": str(e)
            })

        parsed_json = None
        try:
            cleaned_output = extract_json_from_codeblock(model_output)
            parsed_json = json.loads(cleaned_output)
            raw_text = parsed_json.get("text", "")
            lines = parsed_json.get("lines", [])
            print("DEBUG: JSON parsing successful")
        except Exception:
            raw_text = model_output or ""
            lines = []
            parsed_json = {"text": raw_text, "lines": lines}
            print("DEBUG: JSON parsing failed, using fallback")

        doc_data = {
            "doc_id": doc_id,
            "filename": filename,
            "saved_image": str(saved_path),
            "upload_ts": upload_ts,
            "raw_text": raw_text,
            "model_raw_output": model_output,
            "ocr_json": parsed_json
        }
        print("DEBUG: Saving document data")
        save_doc_json(doc_id, doc_data)
        print("DEBUG: Upload completed successfully")

        return {"doc_id": doc_id, "lines": lines, "ocr_json": parsed_json}
    except Exception as e:
        print(f"DEBUG: Unexpected error in upload endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/result/{doc_id}")
async def get_result(doc_id: str = FastAPIPath(..., description="Document ID returned by /api/upload")):
    doc = load_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="doc_id not found")
    return doc

@router.put("/result/{doc_id}")
async def update_result(doc_id: str, payload: OCRUpdateRequest = Body(...)):
    doc = load_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="doc_id not found")

    doc["cleaned_text"] = payload.cleaned_text
    doc["cleaned_ts"] = datetime.utcnow().isoformat()
    doc["accepted"] = bool(payload.accepted)
    if payload.editor:
        doc["last_edited_by"] = payload.editor

    history = doc.get("edit_history", [])
    history_entry = {
        "ts": doc["cleaned_ts"],
        "editor": payload.editor or "unknown",
        "accepted": bool(payload.accepted),
        "snippet": payload.cleaned_text[:200]
    }
    history.append(history_entry)
    doc["edit_history"] = history

    save_doc_json(doc_id, doc)
    return {"status": "ok", "doc_id": doc_id, "cleaned_ts": doc["cleaned_ts"]}

@router.post("/generate")
async def generate(req: GenerateRequest):
    doc = load_doc(req.doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="doc_id not found")
    text = req.text_override.strip() or doc.get("cleaned_text") or doc.get("raw_text") or ""
    if not text:
        raise HTTPException(status_code=400, detail="No text available for question generation.")

    counts_input = req.counts or {}
    try:
        mcq_count = int(counts_input.get("mcq", 0) or 0)
        short_count = int(counts_input.get("short", 0) or 0)
        long_count = int(counts_input.get("long", 0) or 0)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid counts payload; expected integers for mcq/short/long.")

    aggregated = []

    try:
        if mcq_count > 0:
            mcq_raw = generate_mcqs(text, client, count=mcq_count)
            mcq_questions = extract_json_array(mcq_raw)
            if isinstance(mcq_questions, list):
                for q in mcq_questions:
                    q.setdefault("type", "mcq")
                aggregated.extend(mcq_questions)
        if short_count > 0:
            short_raw = generate_short_answers(text, client, count=short_count)
            short_questions = extract_json_array(short_raw)
            if isinstance(short_questions, list):
                for q in short_questions:
                    q.setdefault("type", "short")
                aggregated.extend(short_questions)
        if long_count > 0:
            long_raw = generate_long_answers(text, client, count=long_count)
            long_questions = extract_json_array(long_raw)
            if isinstance(long_questions, list):
                for q in long_questions:
                    q.setdefault("type", "long")
                aggregated.extend(long_questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

    doc["questions"] = aggregated
    doc["questions_ts"] = datetime.utcnow().isoformat()
    save_doc_json(req.doc_id, doc)

    return {
        "doc_id": req.doc_id,
        "questions": aggregated,
        "generation_ts": doc["questions_ts"]
    }