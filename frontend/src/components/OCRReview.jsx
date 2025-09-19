import React, { useEffect, useState } from "react";
import axios from "axios";

function OCRReview({ docId, backendBase = "http://127.0.0.1:8000" }) {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    axios.get(`${backendBase}/api/result/${docId}`)
      .then(res => {
        setDoc(res.data);
        const initial = res.data.cleaned_text ?? res.data.raw_text ?? "";
        setText(initial);
      })
      .catch(err => {
        setMessage("Failed to load OCR result.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [docId]);

  const saveEdits = async (accepted=false) => {
    setSaving(true);
    try {
      const payload = {
        cleaned_text: text,
        accepted,
        editor: "web-ui"
      };
      await axios.put(`${backendBase}/api/result/${docId}`, payload);
      setMessage(accepted ? "Saved & accepted ✅" : "Saved edits ✅");
    } catch (err) {
      console.error(err);
      setMessage("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading OCR preview…</div>;
  if (!doc) return <div>No document found for docId {docId}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>OCR Review</h2>
      <p><strong>Filename:</strong> {doc.filename}</p>
      <p><strong>Uploaded:</strong> {doc.upload_ts}</p>

      <label style={{ display: "block", marginBottom: 8 }}>Corrected text (edit below):</label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={() => saveEdits(false)} disabled={saving}>
          {saving ? "Saving…" : "Save edits"}
        </button>

        <button
          onClick={() => saveEdits(true)}
          disabled={saving}
          style={{ marginLeft: 12 }}
        >
          {saving ? "Saving…" : "Accept & continue"}
        </button>

        <button
          onClick={() => {
            alert(JSON.stringify(doc.ocr_json || doc.model_raw_output || "no raw output", null, 2));
          }}
          style={{ marginLeft: 12 }}
        >
          View raw model output
        </button>
      </div>

      <div style={{ marginTop: 10, color: "green" }}>{message}</div>
    </div>
  );
}

export default OCRReview;