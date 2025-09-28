from google import genai
from .genai_client import client

def _clean_model_response(response):
    """
    Normalize model response into a cleaned string:
    - use response.text if available
    - fallback to response.candidates[0].content.text
    - strip Markdown code fences if present
    """
    text = getattr(response, "text", None)
    if not text:
        # defensive: some SDKs return candidates list
        try:
            text = response.candidates[0].content.text
        except Exception:
            text = ""

    import re
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        return m.group(1).strip()
    return text.strip()

def extract_json_array(raw_text):
    """
    Parse the raw model response text and return a JSON array.
    Returns an empty list if parsing fails.
    """
    try:
        import json
        # Try to parse the cleaned text as JSON
        parsed = json.loads(raw_text)
        # Ensure it's a list
        if isinstance(parsed, list):
            return parsed
        elif isinstance(parsed, dict):
            # If it's a single object, wrap it in a list
            return [parsed]
        else:
            return []
    except (json.JSONDecodeError, TypeError):
        return []


def generate_mcqs(text, client, count=10):
    prompt = f"""
<DOC>
{text}
</DOC>
Generate exactly {count} multiple-choice questions (MCQs) from the text above.
Return a JSON array, where each item has:
{{
"question": "the question text",
"options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
"answer": "the correct option (as text)",
"explanation": "a short explanation",
"source_span": "the relevant text span from the DOC"
}}


Return ONLY valid JSON, no commentary or markdown.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return _clean_model_response(response)

# generate short answer questions
def generate_short_answers(text, client, count=5):
    prompt = f"""
<DOC>
{text}
</DOC>
Generate exactly {count} short-answer questions from the text above.
Return a JSON array, where each item has:
- question: the question text (expects a short textual answer)
- answer: the short answer text
- explanation: a short explanation or rubric
- source_span: the relevant text span from the DOC

Return ONLY valid JSON, no commentary or markdown.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return _clean_model_response(response)


# generate long answer (essay) questions
def generate_long_answers(text, client, count=3):
    prompt = f"""
<DOC>
{text}
</DOC>
Generate exactly {count} long-answer (essay) questions from the text above.
Return a JSON array, where each item has:
- question: the question text (expects a longer written answer)
- answer: an exemplar/outline answer (can be multi-paragraph)
- explanation: guidance on marking/expected key points
- source_span: the relevant text span from the DOC

Return ONLY valid JSON, no commentary or markdown.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return _clean_model_response(response)