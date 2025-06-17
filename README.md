# Resume Analysis AI

## Project Overview
A full-stack web application for resume analysis using AI-powered technologies.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: MongoDB
- AI: Google Gemini AI

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB

### Backend Setup
1. Navigate to backend directory
```bash
cd backend
npm install
```

2. Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

3. Run backend
```bash
npm run dev
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd frontend
npm install
```

2. Run frontend
```bash
npm run dev
```

## Deployment
- Backend: Render
- Frontend: Vercel

## Environment Variables
Ensure to set the following in your deployment platforms:
- MONGODB_URI
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASSWORD
- GEMINI_API_KEY

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License 