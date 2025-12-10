# Notes2Quiz - AI-Powered Quiz Generator

Transform handwritten notes into interactive quizzes using AI and OCR technology.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Google Gemini AI** for OCR and question generation
- **Firebase Admin SDK** for authentication

### Frontend
- **React 18** with Vite
- **Firebase** for user authentication
- **Axios** for API requests

## Prerequisites

- Node.js 18+
- Google AI API Key ([Get here](https://aistudio.google.com/app/apikey))
- Firebase Project with Authentication enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZakiyaMiller/Notes2Quiz.git
   cd Notes2Quiz
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the backend folder:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   PORT=8000
   ```
   
   Add your Firebase `serviceAccountKey.json` to the backend folder.
   
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open** `http://localhost:5173` in your browser

## Usage

1. Sign in with your account
2. Upload handwritten notes (image)
3. Review and edit the extracted text
4. Generate quiz questions (MCQ, Short Answer, Long Answer)
5. Take the interactive quiz and view results

## Project Structure

```
Notes2Quiz/
├── backend/              # Node.js Express server
│   ├── server.js         # Main entry point
│   ├── config.js         # Environment configuration
│   ├── auth/             # Firebase authentication
│   ├── routes/           # API routes
│   ├── services/         # OCR & question generation
│   └── database/         # JSON file storage
├── frontend/             # React application
│   ├── src/components/   # Quiz components
│   ├── src/auth/         # Authentication context
│   └── src/styles/       # CSS styling
└── data/                 # Stored documents
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check |
| POST | `/api/upload` | Upload image for OCR |
| GET | `/api/result/:id` | Get document by ID |
| PUT | `/api/result/:id` | Update OCR result |
| POST | `/api/generate` | Generate questions |
| POST | `/users/me` | Get/create user profile |
