"""
Utility helpers for parsing model output.
"""
import re
import json
from typing import Any

def extract_json_from_codeblock(text: str) -> str:
    """
    Extract JSON contained in Markdown code fences (```...```) if present.
    """
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1)
    return text

def extract_json_array(text: Any):
    """
    Try to parse text (possibly with noise) into a JSON array of objects.
    Returns parsed Python object on success, otherwise returns original text.
    """
    if not isinstance(text, str):
        return text

    text = extract_json_from_codeblock(text).strip()

    # try array first
    arr_match = re.search(r"\[\s*(?:\{[\s\S]*?\}\s*,?\s*)+\]", text)
    if arr_match:
        try:
            return json.loads(arr_match.group(0))
        except Exception:
            pass

    # try to parse entire text
    try:
        return json.loads(text)
    except Exception:
        pass

    # fallback: find first object and wrap as array
    obj_match = re.search(r"\{[\s\S]*?\}", text)
    if obj_match:
        try:
            return json.loads("[" + obj_match.group(0) + "]")
        except Exception:
            pass

    return text