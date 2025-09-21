import { useState } from "react";
import axios from "axios";
import OCRReview from "./components/OCRReview.jsx";
import Questions from "./components/Questions.jsx";
import Quiz from "./components/Quiz.jsx";
import QuizResult from "./components/QuizResult.jsx";
import "./App.css";

function App() {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Workflow state - determines which path user takes
  const [workflowStep, setWorkflowStep] = useState('upload');
  const [workflowType, setWorkflowType] = useState(null);

  // Quiz/Question Paper mode toggle
  const [assessmentMode, setAssessmentMode] = useState('quiz');

  // Question generation state
  const [questions, setQuestions] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [counts, setCounts] = useState({ mcq: 10, short: 0, long: 0 });
  const [enabled, setEnabled] = useState({ mcq: true, short: false, long: false });

  // Quiz-specific state
  const [quizTime, setQuizTime] = useState(30);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Quiz results state
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  // =============================================================================
  // NAVIGATION FUNCTIONS
  // =============================================================================
  const goBackToUpload = () => {
    setWorkflowStep('upload');
    setWorkflowType(null);
    setText("");
    setDocId("");
    setQuestions([]);
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizAnswers({});
    setError("");
    setGenError("");
  };

  const goBackToConfiguration = () => {
    setWorkflowStep('configure');
    setQuestions([]);
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizAnswers({});
    setGenError("");
  };

  const goBackToQuizStart = () => {
    setWorkflowStep('quiz');
    setQuizScore(0);
    setQuizAnswers({});
  };

  const goBackToReview = () => {
    setWorkflowStep('review');
    setQuestions([]);
    setQuizQuestions([]);
    setGenError("");
  };

  const resetWorkflow = () => {
    setFile(null);
    setText("");
    setDocId("");
    setQuestions([]);
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizAnswers({});
    setWorkflowStep('upload');
    setWorkflowType(null);
    setAssessmentMode('quiz');
    setCounts({ mcq: 10, short: 0, long: 0 });
    setEnabled({ mcq: true, short: false, long: false });
    setQuizTime(30);
    setError("");
    setGenError("");
  };

  // =============================================================================
  // CORE FUNCTIONS
  // =============================================================================
  const handleModeToggle = (mode) => {
    setAssessmentMode(mode);
    if (mode === 'quiz') {
      setEnabled({ mcq: true, short: false, long: false });
      setCounts({ mcq: 10, short: 0, long: 0 });
    } else {
      setEnabled({ mcq: true, short: true, long: true });
      setCounts({ mcq: 5, short: 3, long: 2 });
    }
  };

  const handleUpload = async (selectedWorkflow) => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    setError("");
    setLoading(true);
    setWorkflowType(selectedWorkflow);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Backend response:", res.data);
      setText(JSON.stringify(res.data.lines ?? []));
      setDocId(res.data.doc_id);

      if (selectedWorkflow === 'direct') {
        setWorkflowStep('configure');
      } else if (selectedWorkflow === 'review') {
        setWorkflowStep('review');
      }

    } catch (err) {
      console.error(err);
      setError(
        "Upload failed. Check backend is running and CORS/proxy settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFromReview = () => {
    setWorkflowStep('configure');
  };

  const handleGenerateQuestions = async () => {
    if (!docId) {
      setGenError("No document to generate questions from.");
      return;
    }
    setGenError("");
    setGenLoading(true);

    try {
      const sendCounts = {};
      if (enabled.mcq) sendCounts.mcq = parseInt(counts.mcq || 0);
      if (enabled.short) sendCounts.short = parseInt(counts.short || 0);
      if (enabled.long) sendCounts.long = parseInt(counts.long || 0);

      const res = await axios.post("http://127.0.0.1:8000/api/generate", {
        doc_id: docId,
        text_override: "",
        counts: sendCounts,
      });

      const generatedQuestions = res.data.questions || [];
      setQuestions(generatedQuestions);

      if (assessmentMode === 'quiz') {
        const mcqQuestions = generatedQuestions.filter(q => q.type === 'mcq' || q.type === 'multiple_choice');
        setQuizQuestions(mcqQuestions);
        setWorkflowStep('quiz');
      } else {
        setWorkflowStep('questionpaper-results');
      }
    } catch (err) {
      setGenError("Failed to generate questions.");
      console.error(err);
    } finally {
      setGenLoading(false);
    }
  };

  const handleQuizComplete = (score, answers) => {
    console.log('Quiz completed:', { score, answers });
    setQuizScore(score);
    setQuizAnswers(answers);
    setWorkflowStep('quiz-results');
  };

  const handleQuizExit = () => {
    goBackToConfiguration();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
  };

  const getDisplayText = () => {
    try {
      const lines = JSON.parse(text);
      if (Array.isArray(lines)) {
        return lines.join("\n");
      }
      return "No lines found.";
    } catch {
      return text || "No OCR output yet.";
    }
  };

  // =============================================================================
  // COMPONENT RENDER
  // =============================================================================

  return (
    <div className="quiz-app">

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={resetWorkflow}>
            <span className="brand-icon">🎓</span>
            <span className="brand-text">Notes2Quiz</span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#about" className="nav-link">About</a>
            {workflowStep !== 'upload' && (
              <button onClick={resetWorkflow} className="nav-btn">
                🏠 Home
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Application Header/Hero - Only show on upload step */}
      {workflowStep === 'upload' && (
        <header className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Transform Your Handwritten Study Notes into
                <span className="highlight-text">Interactive Quizzes</span>
              </h1>
              <p className="hero-subtitle">
                Upload an image of your handwritten notes and get instant practice questions.
                Perfect for exam preparation and knowledge testing.
              </p>

              <div className="hero-features">
                <div className="feature-badge">
                  <span className="feature-icon">⚡</span>
                  <span>Instant Generation</span>
                </div>
                <div className="feature-badge">
                  <span className="feature-icon">🎯</span>
                  <span>Smart Questions</span>
                </div>
                <div className="feature-badge">
                  <span className="feature-icon">📱</span>
                  <span>Mobile Friendly</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="floating-cards">
                <div className="float-card card-1">
                  <span className="card-icon">📚</span>
                  <span className="card-text">Upload Notes</span>
                </div>
                <div className="float-card card-2">
                  <span className="card-icon">🤖</span>
                  <span className="card-text">AI Processing</span>
                </div>
                <div className="float-card card-3">
                  <span className="card-icon">🎯</span>
                  <span className="card-text">Take Quiz</span>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-arrow">↓</div>
            <span className="scroll-text">Get Started Below</span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* UPLOAD STEP - Enhanced Design */}
        {workflowStep === 'upload' && (
          <>
            {/* Upload Section */}
            <section className="upload-section" id="upload">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">
                    📤 Upload Your Study Material
                  </h2>
                  <p className="section-subtitle">
                    Choose an image of your notes, textbook pages, or study materials
                  </p>
                </div>

                <div className="upload-card">
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="hidden-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      {file ? (
                        <div className="file-preview">
                          <div className="file-icon">📄</div>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                          <div className="file-status">✅ Ready to process</div>
                        </div>
                      ) : (
                        <div className="upload-prompt">
                          <div className="upload-icon">📤</div>
                          <div className="upload-text">Click or drag to upload</div>
                          <div className="upload-hint">Supports JPG, PNG, and other image formats</div>
                        </div>
                      )}
                    </label>
                  </div>

                  {error && (
                    <div className="message message-error">
                      <span className="message-icon">❌</span>
                      {error}
                    </div>
                  )}

                  {/* Workflow Options */}
                  {file && (
                    <div className="workflow-section">
                      <h3 className="workflow-title">Choose Your Workflow:</h3>
                      <div className="workflow-grid">
                        <div className="workflow-card">
                          <div className="workflow-header">
                            <span className="workflow-icon">⚡</span>
                            <h4 className="workflow-name">Quick Generate</h4>
                          </div>
                          <p className="workflow-desc">
                            Instantly extract text and generate quiz questions
                          </p>
                          <button
                            onClick={() => handleUpload('direct')}
                            disabled={loading}
                            className="btn btn-primary workflow-btn"
                          >
                            {loading && workflowType === 'direct' ? (
                              <>
                                <span className="loading-spinner"></span>
                                Processing...
                              </>
                            ) : (
                              'Start Quick Generate'
                            )}
                          </button>
                        </div>

                        <div className="workflow-card">
                          <div className="workflow-header">
                            <span className="workflow-icon">📖</span>
                            <h4 className="workflow-name">Review & Edit</h4>
                          </div>
                          <p className="workflow-desc">
                            Review extracted text before generating questions
                          </p>
                          <button
                            onClick={() => handleUpload('review')}
                            disabled={loading}
                            className="btn btn-secondary workflow-btn"
                          >
                            {loading && workflowType === 'review' ? (
                              <>
                                <span className="loading-spinner"></span>
                                Processing...
                              </>
                            ) : (
                              'Extract & Review'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">Why Choose Notes2Quiz?</h2>
                  <p className="section-subtitle">
                    Powerful features to enhance your learning experience
                  </p>
                </div>

                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <span className="feature-icon">🤖</span>
                    </div>
                    <h3 className="feature-title">AI-Powered Generation</h3>
                    <p className="feature-desc">
                      Advanced AI analyzes your notes and creates relevant, challenging questions automatically.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <span className="feature-icon">⏱️</span>
                    </div>
                    <h3 className="feature-title">Timed Practice</h3>
                    <p className="feature-desc">
                      Simulate real exam conditions with customizable time limits and instant feedback.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <span className="feature-icon">📊</span>
                    </div>
                    <h3 className="feature-title">Detailed Analytics</h3>
                    <p className="feature-desc">
                      Get comprehensive performance insights and identify areas for improvement.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <span className="feature-icon">🎯</span>
                    </div>
                    <h3 className="feature-title">Multiple Question Types</h3>
                    <p className="feature-desc">
                      Support for MCQs, short answers, and long-form questions to test different skills.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How it Works Section */}
            <section className="how-it-works-section" id="how-it-works">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">How It Works</h2>
                  <p className="section-subtitle">
                    Get from notes to quiz in just three simple steps
                  </p>
                </div>

                <div className="steps-container">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3 className="step-title">Upload Your Notes</h3>
                      <p className="step-desc">
                        Take a photo or upload an image of your study materials, handwritten notes, or textbook pages.
                      </p>
                    </div>
                  </div>

                  <div className="step-connector"></div>

                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3 className="step-title">AI Processing</h3>
                      <p className="step-desc">
                        Our AI extracts text from your image and generates intelligent questions based on the content.
                      </p>
                    </div>
                  </div>

                  <div className="step-connector"></div>

                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3 className="step-title">Take the Quiz</h3>
                      <p className="step-desc">
                        Practice with your personalized quiz and get instant feedback on your performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="footer" id="about">
              <div className="footer-container">
                <div className="footer-content">
                  <div className="footer-brand">
                    <div className="brand-logo">
                      <span className="brand-icon">🎓</span>
                      <span className="brand-text">Notes2Quiz Generator</span>
                    </div>
                    <p className="brand-tagline">
                      Transforming the way you study with AI-powered quiz generation.
                    </p>
                  </div>

                  <div className="footer-links">
                    <div className="link-group">
                      <h4 className="link-title">Product</h4>
                      <a href="#features" className="footer-link">Features</a>
                      <a href="#how-it-works" className="footer-link">How it Works</a>
                      <a href="#upload" className="footer-link">Get Started</a>
                    </div>

                    <div className="link-group">
                      <h4 className="link-title">Support</h4>
                      <a href="#" className="footer-link">Help Center</a>
                      <a href="#" className="footer-link">Contact</a>
                      <a href="#" className="footer-link">FAQ</a>
                    </div>
                  </div>
                </div>

                <div className="footer-bottom">
                  <p className="copyright">
                    © 2025 Notes2Quiz Generator. Made with ❤️ for students everywhere.
                  </p>
                </div>
              </div>
            </footer>
          </>
        )}

        {/* REVIEW STEP - OCR Text Review */}
        {workflowStep === 'review' && (
          <div className="content-card">
            <div className="card-header">
              <div className="step-navigation">
                <button onClick={goBackToUpload} className="btn btn-outline btn-sm">
                  ← Back to Upload
                </button>
              </div>
              <h2 className="section-title">📖 Review Extracted Text</h2>
              <p className="section-subtitle">
                Verify and edit the text extracted from your image
              </p>
            </div>
            <div className="card-body">
              <OCRReview
                docId={docId}
                text={getDisplayText()}
                setText={setText}
                onContinue={handleContinueFromReview}
                onBack={goBackToUpload}
              />
            </div>
          </div>
        )}

        {/* CONFIGURE STEP - Quiz Configuration */}
        {workflowStep === 'configure' && (
          <div className="content-card">
            <div className="card-header">
              <div className="step-navigation">
                <button onClick={goBackToUpload} className="btn btn-outline btn-sm">
                  ← Back to Upload
                </button>
                {workflowType === 'review' && (
                  <button onClick={goBackToReview} className="btn btn-outline btn-sm">
                    📖 Back to Review
                  </button>
                )}
              </div>
              <h2 className="section-title">⚙️ Quiz Configuration</h2>
              <p className="section-subtitle">
                Choose question types and quantities for your quiz
              </p>

              {/* Assessment Mode Slider */}
              <div className="mode-selector">
                <div className="mode-toggle">
                  <button
                    className={`mode-option ${assessmentMode === 'quiz' ? 'active' : ''}`}
                    onClick={() => handleModeToggle('quiz')}
                  >
                    🎯 Quiz Mode
                    <span className="mode-description">Timed MCQ practice</span>
                  </button>
                  <button
                    className={`mode-option ${assessmentMode === 'questionpaper' ? 'active' : ''}`}
                    onClick={() => handleModeToggle('questionpaper')}
                  >
                    📋 Question Paper
                    <span className="mode-description">Comprehensive assessment</span>
                  </button>
                  <div className={`mode-slider ${assessmentMode}`}></div>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="question-controls">

                {/* Quiz Mode - Special Configuration */}
                {assessmentMode === 'quiz' && (
                  <div className="quiz-config">
                    <div className="quiz-settings">
                      <div className="setting-group">
                        <label className="setting-label">
                          🎯 Number of Questions
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={20}
                          value={counts.mcq}
                          onChange={(e) =>
                            setCounts({ ...counts, mcq: Math.max(5, Number(e.target.value)) })
                          }
                          className="setting-input"
                        />
                      </div>
                      <div className="setting-group">
                        <label className="setting-label">
                          ⏱️ Time Limit (minutes)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={120}
                          value={quizTime}
                          onChange={(e) => setQuizTime(Math.max(10, Number(e.target.value)))}
                          className="setting-input"
                        />
                      </div>
                    </div>
                    <div className="quiz-info">
                      <div className="info-card">
                        <span className="info-icon">📊</span>
                        <div className="info-content">
                          <span className="info-title">Quiz Format</span>
                          <span className="info-desc">Multiple choice questions only</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <span className="info-icon">⏰</span>
                        <div className="info-content">
                          <span className="info-title">Time per Question</span>
                          <span className="info-desc">{Math.round(quizTime / counts.mcq * 10) / 10} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Paper Mode - Original Configuration */}
                {assessmentMode === 'questionpaper' && (
                  <>
                    {/* Multiple Choice Questions */}
                    <div className="control-group">
                      <div className="control-header">
                        <div className="checkbox-wrapper">
                          <div
                            className={`custom-checkbox ${enabled.mcq ? 'checked' : ''}`}
                            onClick={() => setEnabled({ ...enabled, mcq: !enabled.mcq })}
                          ></div>
                          <label className="control-label">
                            🎯 Multiple Choice Questions
                          </label>
                        </div>
                        {enabled.mcq && (
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={counts.mcq}
                            onChange={(e) =>
                              setCounts({ ...counts, mcq: Math.max(0, Number(e.target.value)) })
                            }
                            className="count-input"
                          />
                        )}
                      </div>
                    </div>

                    {/* Short Answer Questions */}
                    <div className="control-group">
                      <div className="control-header">
                        <div className="checkbox-wrapper">
                          <div
                            className={`custom-checkbox ${enabled.short ? 'checked' : ''}`}
                            onClick={() => setEnabled({ ...enabled, short: !enabled.short })}
                          ></div>
                          <label className="control-label">
                            ✍️ Short Answer Questions
                          </label>
                        </div>
                        {enabled.short && (
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={counts.short}
                            onChange={(e) =>
                              setCounts({ ...counts, short: Math.max(0, Number(e.target.value)) })
                            }
                            className="count-input"
                          />
                        )}
                      </div>
                    </div>

                    {/* Long Answer Questions */}
                    <div className="control-group">
                      <div className="control-header">
                        <div className="checkbox-wrapper">
                          <div
                            className={`custom-checkbox ${enabled.long ? 'checked' : ''}`}
                            onClick={() => setEnabled({ ...enabled, long: !enabled.long })}
                          ></div>
                          <label className="control-label">
                            📝 Long Answer Questions
                          </label>
                        </div>
                        {enabled.long && (
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={counts.long}
                            onChange={(e) =>
                              setCounts({ ...counts, long: Math.max(0, Number(e.target.value)) })
                            }
                            className="count-input"
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {genError && (
                <div className="message message-error">
                  ❌ {genError}
                </div>
              )}

              <div className="config-actions">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={genLoading}
                  className="btn btn-primary"
                >
                  {genLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Generating {assessmentMode === 'quiz' ? 'Quiz' : 'Question Paper'}...
                    </>
                  ) : (
                    <>
                      🎯 {assessmentMode === 'quiz' ? 'Start Quiz' : 'Generate Question Paper'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ STEP - Timed Quiz Interface */}
        {workflowStep === 'quiz' && (
          <Quiz
            questions={quizQuestions}
            timeLimit={quizTime}
            onComplete={handleQuizComplete}
            onExit={handleQuizExit}
          />
        )}

        {/* QUIZ RESULTS STEP - Using QuizResult Component */}
        {workflowStep === 'quiz-results' && (
          <QuizResult
            score={quizScore}
            totalQuestions={quizQuestions.length}
            questions={quizQuestions}
            selectedAnswers={quizAnswers}
            onExit={resetWorkflow}
            onRetakeQuiz={goBackToQuizStart}
            onBackToConfig={goBackToConfiguration}
          />
        )}

        {/* QUESTION PAPER RESULTS STEP - Traditional Question Paper Display */}
        {workflowStep === 'questionpaper-results' && questions.length > 0 && (
          <div className="content-card">
            <div className="card-header">
              <div className="step-navigation">
                <button onClick={goBackToConfiguration} className="btn btn-outline btn-sm">
                  ← Back to Configuration
                </button>
                <button onClick={goBackToUpload} className="btn btn-outline btn-sm">
                  📤 Back to Upload
                </button>
              </div>
              <h2 className="section-title">
                📋 Your Generated Question Paper
              </h2>
              <p className="section-subtitle">
                Review your practice questions and answers
              </p>
            </div>
            <div className="card-body">
              <Questions questions={questions} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
