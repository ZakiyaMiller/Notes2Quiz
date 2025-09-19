import React from "react";
import MCQQues from "./MCQQues";
import ShortAnswerQues from "./ShortAnswerQues";
import LongAnswerQues from "./LongAnswerQues";

function Questions({ questions }) {
  if (!questions || questions.length === 0) return <div>No questions generated.</div>;

  return (
    <div>
      <h2>Generated Questions</h2>
      {questions.map((q, idx) => {
        if (q.type === "mcq") return <MCQQues key={idx} q={q} idx={idx} />;
        if (q.type === "short") return <ShortAnswerQues key={idx} q={q} idx={idx} />;
        if (q.type === "long") return <LongAnswerQues key={idx} q={q} idx={idx} />;
        return <div key={idx}>Unknown question type</div>;
      })}
    </div>
  );
}

export default Questions;