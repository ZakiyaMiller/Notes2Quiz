import '../styles/QuizResult.css';

function QuizResult({ score, totalQuestions, questions, selectedAnswers, onExit, onBackToConfig, onRetakeQuiz }) {
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * Get performance message based on score percentage
     */
    const getPerformanceMessage = () => {
        const percentage = (score / totalQuestions) * 100;

        if (percentage >= 90) return { text: "Excellent! Outstanding performance! 🌟", type: "excellent" };
        if (percentage >= 80) return { text: "Great job! You're doing well! 🎉", type: "great" };
        if (percentage >= 70) return { text: "Good work! Keep it up! 👍", type: "good" };
        if (percentage >= 60) return { text: "Not bad! Room for improvement. 💪", type: "average" };
        return { text: "Keep studying! You'll get better! 📚", type: "needswork" };
    };

    /**
     * Get grade letter based on percentage
     */
    const getGradeLetter = () => {
        const percentage = (score / totalQuestions) * 100;

        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    };

    /**
     * Get correct option letter for a question
     */
    const getCorrectOptionLetter = (question) => {
        const correctAnswer = question.correct_answer || question.answer;

        // If correct answer is already a letter (A, B, C, D)
        if (/^[A-D]$/.test(correctAnswer)) {
            return correctAnswer;
        }

        // Find the option that matches the correct answer text
        const options = question.options || question.choices || [];
        const correctIndex = options.findIndex(option =>
            option.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ||
            option.replace(/^[A-D]\)\s*/, '').toLowerCase().trim() === correctAnswer.toLowerCase().trim()
        );

        return correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : 'A';
    };

    // =============================================================================
    // PERFORMANCE METRICS
    // =============================================================================

    const percentage = Math.round((score / totalQuestions) * 100);
    const performanceMsg = getPerformanceMessage();
    const gradeLetter = getGradeLetter();
    const correctCount = score;
    const incorrectCount = totalQuestions - score;

    return (
        <div className="quiz-results-container">

            {/* Results Header */}
            <div className="results-header">
                <div className="header-content">
                    <h1 className="results-title">🎉 Quiz Complete!</h1>

                    {/* Score Display */}
                    <div className="score-section">
                        <div className="main-score">
                            <div className="score-circle">
                                <div className="score-inner">
                                    <span className="score-number">{score}</span>
                                    <span className="score-divider">/</span>
                                    <span className="score-total">{totalQuestions}</span>
                                </div>
                                <div className="score-percentage">{percentage}%</div>
                            </div>
                            <div className="grade-display">
                                <span className="grade-letter">{gradeLetter}</span>
                            </div>
                        </div>

                        {/* Performance Message */}
                        <div className={`performance-message ${performanceMsg.type}`}>
                            <span className="performance-text">{performanceMsg.text}</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-card correct">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <span className="stat-number">{correctCount}</span>
                                <span className="stat-label">Correct</span>
                            </div>
                        </div>
                        <div className="stat-card incorrect">
                            <div className="stat-icon">❌</div>
                            <div className="stat-content">
                                <span className="stat-number">{incorrectCount}</span>
                                <span className="stat-label">Incorrect</span>
                            </div>
                        </div>
                        <div className="stat-card accuracy">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-content">
                                <span className="stat-number">{percentage}%</span>
                                <span className="stat-label">Accuracy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Question Review */}
            <div className="questions-review">
                <div className="review-header">
                    <h2 className="review-title">📋 Question by Question Review</h2>
                    <p className="review-subtitle">
                        See your answers compared to the correct ones
                    </p>
                </div>

                <div className="questions-list">
                    {questions.map((question, index) => {
                        const userAnswer = selectedAnswers[index];
                        const correctAnswer = getCorrectOptionLetter(question);
                        const isCorrect = userAnswer === correctAnswer;
                        const options = question.options || question.choices || [];

                        return (
                            <div key={index} className={`question-review-item ${isCorrect ? 'correct' : 'incorrect'}`}>

                                {/* Question Header */}
                                <div className="question-review-header">
                                    <div className="question-info">
                                        <span className="question-num">Question {index + 1}</span>
                                        <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? (
                                                <>
                                                    <span className="badge-icon">✓</span>
                                                    <span className="badge-text">Correct</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="badge-icon">✗</span>
                                                    <span className="badge-text">Incorrect</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="question-content">
                                    <h3 className="question-text">{question.question}</h3>

                                    {/* Answer Options */}
                                    <div className="options-review">
                                        {options.map((option, optionIndex) => {
                                            const optionLetter = String.fromCharCode(65 + optionIndex);
                                            const isUserChoice = userAnswer === optionLetter;
                                            const isCorrectChoice = correctAnswer === optionLetter;

                                            let optionClass = 'option-review';

                                            if (isCorrectChoice) {
                                                optionClass += ' correct-option';
                                            }

                                            if (isUserChoice && !isCorrectChoice) {
                                                optionClass += ' user-incorrect';
                                            }

                                            if (isUserChoice && isCorrectChoice) {
                                                optionClass += ' user-correct';
                                            }

                                            return (
                                                <div key={optionIndex} className={optionClass}>
                                                    <div className="option-marker">
                                                        <span className="option-letter">{optionLetter}</span>
                                                        {isUserChoice && (
                                                            <span className="user-choice-indicator">👤</span>
                                                        )}
                                                        {isCorrectChoice && (
                                                            <span className="correct-indicator">✓</span>
                                                        )}
                                                    </div>
                                                    <div className="option-text">
                                                        {option.replace(/^[A-D]\)\s*/, '')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Answer Summary */}
                                    <div className="answer-summary">
                                        <div className="answer-row">
                                            <span className="answer-label">Your Answer:</span>
                                            <span className={`answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                {userAnswer ? `Option ${userAnswer}` : 'Not answered'}
                                            </span>
                                        </div>
                                        <div className="answer-row">
                                            <span className="answer-label">Correct Answer:</span>
                                            <span className="answer-value correct">Option {correctAnswer}</span>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    {question.explanation && (
                                        <div className="explanation-section">
                                            <div className="explanation-header">
                                                <span className="explanation-icon">💡</span>
                                                <span className="explanation-title">Explanation</span>
                                            </div>
                                            <div className="explanation-text">
                                                {question.explanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="results-actions">
                <button onClick={onBackToConfig} className="btn btn-secondary action-btn">
                    ⚙️ Change Settings
                </button>
                <button onClick={onRetakeQuiz} className="btn btn-primary action-btn">
                    🔄 Retake Quiz
                </button>
                <button onClick={onExit} className="btn btn-outline action-btn">
                    🏠 New Quiz
                </button>
                <button
                    onClick={() => window.print()}
                    className="btn btn-secondary action-btn"
                >
                    🖨️ Print Results
                </button>
            </div>
        </div>
    );
}

export default QuizResult;