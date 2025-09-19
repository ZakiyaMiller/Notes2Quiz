import React from "react";
function MCQQues({ q, idx }) {
  return (
    <div style={{ marginBottom: 24, padding: 12, border: "1px solid #eee" }}>
      <div><b>Q{idx + 1} (MCQ):</b> {q.question}</div>
      <ul>
        {q.options.map((opt, i) => (
          <li key={i}>{opt}</li>
        ))}
      </ul>
      <div><b>Answer:</b> {q.answer}</div>
      <div><b>Explanation:</b> {q.explanation}</div>
    </div>
  );
}

export default MCQQues;