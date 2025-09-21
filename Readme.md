# Notes2Quiz - AI-Powered Quiz Generator
Transform handwritten notes into interactive quizzes using AI and OCR technology.

## Tech Stack

### Backend
- **Python 3.8+** with FastAPI
- **Google Gemini AI** for question generation

### Frontend
- **React 18** with Vite
- **Vanilla CSS3** 
- **Modern ES6+ JavaScript**

### Prerequisites
- Python 3.8+
- Node.js 16+ (for React build tools)
- Google AI API Key ([Get here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone & Setup Environment**
   ```bash
   git clone https://github.com/ZakiyaMiller/Notes2Quiz.git
   cd Notes2Quiz
   cp .env.example backend/.env
   ```

2. **Add your Google AI API key to `backend/.env`:**
   ```bash
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

4. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open** `http://localhost:5173` in your browser
## Usage

1. Upload handwritten notes (image)
2. Review extracted text via OCR
3. Generate quiz questions (MCQ, Short, Long Answer)
4. Take interactive quiz and view results

## Project Structure

```
Notes2Quiz/
├── backend/          # Python FastAPI server
│   ├── app.py       # Main application
│   ├── ocr.py       # Text extraction
│   └── ques_gen.py  # AI question generation
└── frontend/        # React application
    ├── src/components/  # Quiz components
    └── src/styles/     # CSS styling
```
