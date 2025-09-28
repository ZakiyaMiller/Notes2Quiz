import { useState, useEffect } from 'react';
import QuizResult from './QuizResult';
import '../styles/Quiz.css';

function Quiz({ questions, timeLimit, onComplete, onExit }) {
    // =============================================================================
    // QUIZ STATE MANAGEMENT
    // =============================================================================
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
    const [quizStarted, setQuizStarted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // =============================================================================
    // TIMER LOGIC
    // =============================================================================
    useEffect(() => {
        if (!quizStarted || showResults) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, showResults]);

    // =============================================================================
    // QUIZ FUNCTIONS
    // =============================================================================

    /**
     * Start the quiz timer
     */
    const startQuiz = () => {
        setQuizStarted(true);
    };

    /**
     * Handle answer selection
     */
    const handleAnswerSelect = (questionIndex, selectedOption) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: selectedOption
        });
    };

    /**
     * Navigate to next question
     */
    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    /**
     * Navigate to previous question
     */
    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    /**
     * Get correct answer in consistent format
     */
    const getCorrectAnswer = (question) => {
        // Try different possible fields for correct answer
        const correctAnswer = question.correct_answer ||
            question.answer ||
            question.correctAnswer ||
            question.correct;

        console.log('Question:', question.question);
        console.log('Raw correct answer:', correctAnswer);
        console.log('Question options:', question.options || question.choices);

        // If correct answer is already a letter (A, B, C, D)
        if (typeof correctAnswer === 'string' && /^[A-D]$/i.test(correctAnswer.trim())) {
            return correctAnswer.toUpperCase();
        }

        // If correct answer is a number (0, 1, 2, 3)
        if (typeof correctAnswer === 'number' && correctAnswer >= 0 && correctAnswer <= 3) {
            return String.fromCharCode(65 + correctAnswer); // Convert 0,1,2,3 to A,B,C,D
        }

        // If correct answer is a string number ("0", "1", "2", "3")
        if (typeof correctAnswer === 'string' && /^[0-3]$/.test(correctAnswer.trim())) {
            return String.fromCharCode(65 + parseInt(correctAnswer));
        }

        // If correct answer is the full text, find matching option
        const options = question.options || question.choices || [];
        if (typeof correctAnswer === 'string' && options.length > 0) {
            // Clean up the correct answer text
            const cleanCorrectAnswer = correctAnswer.toLowerCase().trim()
                .replace(/^[A-D]\)\s*/, '') // Remove "A) " prefix if present
                .replace(/^\d\.\s*/, ''); // Remove "1. " prefix if present

            // Find matching option
            for (let i = 0; i < options.length; i++) {
                const cleanOption = options[i].toLowerCase().trim()
                    .replace(/^[A-D]\)\s*/, '') // Remove "A) " prefix if present
                    .replace(/^\d\.\s*/, ''); // Remove "1. " prefix if present

                if (cleanOption === cleanCorrectAnswer ||
                    options[i].toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                    return String.fromCharCode(65 + i); // Convert to A, B, C, D
                }
            }
        }

        // Default fallback - assume first option
        console.warn('Could not determine correct answer format, defaulting to A');
        return 'A';
    };

    /**
     * Submit quiz and calculate score - ENHANCED DEBUGGING
     */
    const handleSubmitQuiz = () => {
        let correctAnswers = 0;
        console.log('=== QUIZ SCORING DEBUG ===');
        console.log('Total questions:', questions.length);
        console.log('Selected answers:', selectedAnswers);

        questions.forEach((question, index) => {
            const selectedAnswer = selectedAnswers[index];
            const correctAnswer = getCorrectAnswer(question);
            const isCorrect = selectedAnswer === correctAnswer;

            console.log(`\nQuestion ${index + 1}:`);
            console.log('Question text:', question.question);
            console.log('Selected answer:', selectedAnswer);
            console.log('Correct answer:', correctAnswer);
            console.log('Is correct:', isCorrect);
            console.log('Raw question data:', question);

            if (isCorrect) {
                correctAnswers++;
            }
        });

        console.log('Final score:', correctAnswers, '/', questions.length);
        console.log('=== END DEBUG ===');

        setScore(correctAnswers);
        setShowResults(true);
        onComplete(correctAnswers, selectedAnswers);
    };

    /**
     * Format time display
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Get completion percentage
     */
    const getCompletionPercentage = () => {
        const answered = Object.keys(selectedAnswers).length;
        return Math.round((answered / questions.length) * 100);
    };

    // =============================================================================
    // RENDER COMPONENTS
    // =============================================================================

    // Quiz Introduction Screen
    if (!quizStarted) {
        return (
            <div className="quiz-container">
                <div className="quiz-intro">
                    <div className="intro-content">
                        <h2 className="quiz-title">🎯 Ready to Start Your Quiz?</h2>
                        <div className="quiz-details">
                            <div className="detail-item">
                                <span className="detail-icon">📝</span>
                                <span className="detail-text">{questions.length} Multiple Choice Questions</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">⏱️</span>
                                <span className="detail-text">{timeLimit} Minutes Time Limit</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">🎯</span>
                                <span className="detail-text">Select the best answer for each question</span>
                            </div>
                        </div>

                        {/* DEBUG INFO - Remove in production */}
                        <div className="debug-info" style={{
                            background: '#f0f0f0',
                            padding: '10px',
                            margin: '10px 0',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                        }}>
                            <h4>Debug Info (Remove in production):</h4>
                            <p>Total questions loaded: {questions.length}</p>
                            {questions.length > 0 && (
                                <div>
                                    <p>Sample question structure:</p>
                                    <pre>{JSON.stringify(questions[0], null, 2)}</pre>
                                </div>
                            )}
                        </div>

                        <div className="quiz-instructions">
                            <h3>📋 Instructions:</h3>
                            <ul>
                                <li>You have <strong>{timeLimit} minutes</strong> to complete the quiz</li>
                                <li>You can navigate between questions freely</li>
                                <li>Your answers are saved automatically</li>
                                <li>Submit before time runs out to save your progress</li>
                            </ul>
                        </div>
                        <div className="intro-actions">
                            <button onClick={onExit} className="btn btn-secondary">
                                ← Exit Quiz
                            </button>
                            <button onClick={startQuiz} className="btn btn-primary">
                                🚀 Start Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Results Screen
    if (showResults) {
        return (
            <QuizResult
                score={score}
                totalQuestions={questions.length}
                questions={questions}
                selectedAnswers={selectedAnswers}
                onExit={onExit}
            />
        );
    }

    // Main Quiz Interface
    if (questions.length === 0) {
        return (
            <div className="quiz-container">
                <div className="quiz-error">
                    <h2>❌ No Questions Available</h2>
                    <p>No questions were loaded for the quiz.</p>
                    <button onClick={onExit} className="btn btn-secondary">
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const options = question.options || question.choices || [];

    return (
        <div className="quiz-container">
            {/* Quiz Header */}
            <div className="quiz-header">
                <div className="quiz-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                </div>

                <div className="quiz-stats">
                    <div className="stat-item">
                        <span className="stat-icon">⏱️</span>
                        <span className={`stat-text ${timeRemaining <= 300 ? 'urgent' : ''}`}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">✅</span>
                        <span className="stat-text">
                            {getCompletionPercentage()}% Complete
                        </span>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="question-container">
                <div className="question-header">
                    <h2 className="question-title">
                        {question.question}
                    </h2>
                </div>

                <div className="options-container">
                    {options.map((option, index) => {
                        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                        const isSelected = selectedAnswers[currentQuestion] === optionLetter;

                        return (
                            <div
                                key={index}
                                className={`option-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion, optionLetter)}
                            >
                                <div className="option-marker">
                                    <span className="option-letter">{optionLetter}</span>
                                </div>
                                <div className="option-text">
                                    {typeof option === 'string' ? option.replace(/^[A-D]\)\s*/, '') : option}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Debug Info for Current Question - Remove in production */}
                <div className="debug-current" style={{
                    background: '#fffbf0',
                    padding: '10px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    border: '1px solid #ffeaa7'
                }}>
                    <strong>Debug - Current Question:</strong><br />
                    Selected: {selectedAnswers[currentQuestion] || 'None'}<br />
                    Correct: {getCorrectAnswer(question)}<br />
                    Raw answer field: {JSON.stringify(question.correct_answer || question.answer)}
                </div>
            </div>

            {/* Compact Quiz Navigation with integrated buttons */}
            <div className="quiz-navigation">
                <div className="navigation-container">
                    {/* Previous Button */}
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestion === 0}
                        className="nav-arrow prev-arrow"
                        title="Previous Question"
                    >
                        ←
                    </button>

                    {/* Question Grid */}
                    <div className="question-grid">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-dot ${currentQuestion === index ? 'current' : ''} ${selectedAnswers[index] ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestion(index)}
                                title={`Question ${index + 1}${selectedAnswers[index] ? ' (Answered)' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {/* Next/Submit Button */}
                    {currentQuestion < questions.length - 1 ? (
                        <button
                            onClick={nextQuestion}
                            className="nav-arrow next-arrow"
                            title="Next Question"
                        >
                            →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitQuiz}
                            className="nav-arrow submit-arrow"
                            title="Submit Quiz"
                        >
                            ✓
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Quiz;