import React from "react";
function ShortAnswerQues({ q, idx }) {
  return (
    <div style={{ marginBottom: 24, padding: 12, border: "1px solid #eee" }}>
      <div><b>Q{idx + 1} (Short):</b> {q.question}</div>
      <div><b>Answer:</b> {q.answer}</div>
      <div><b>Explanation:</b> {q.explanation}</div>
    </div>
  );
}

export default ShortAnswerQues;