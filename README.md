# YouTube Analytics Dashboard

A comprehensive YouTube analytics platform with FastAPI backend and Next.js frontend for tracking YouTube channel performance and UTM link management.

## ✨ Features

- **Real YouTube Data**: Authentic metrics from YouTube API (no fabricated data)
- **Weekly Performance Tracking**: Monitor video performance week-over-week
- **UTM Link Management**: Create and track UTM links for YouTube videos
- **Google Analytics 4 Integration**: Advanced tracking capabilities
- **Interactive Dashboard**: Modern React-based UI with real-time data
- **Google OAuth**: Secure authentication with YouTube API access

## 🏗️ Architecture

### 📊 **Backend Service** (`/backend`)
- **Technology**: FastAPI (Python)
- **Features**: YouTube API integration, GA4 tracking, UTM link management, SQLite database
- **API Documentation**: Available at `http://localhost:8000/docs`

### 🎨 **Frontend Service** (`/frontend`)
- **Technology**: Next.js 14 (TypeScript/React)
- **Features**: Interactive dashboard, analytics visualization, UTM management UI, Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud Project with YouTube Data API enabled
- Google OAuth 2.0 credentials

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Environment Configuration

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
SECRET_KEY=your_jwt_secret_key
```

## 📊 Current Status

✅ **Backend**: Fully functional with YouTube API integration
✅ **Frontend**: Interactive dashboard with real-time data
✅ **Database**: SQLite with video and analytics data
✅ **Authentication**: Google OAuth integration
✅ **UTM Tracking**: Link creation and click tracking

## 🛠️ Recent Fixes

- Fixed duration parsing issues in weekly summary endpoint
- Resolved data population problems in frontend tables
- Improved error handling and data validation
- Enhanced API response formatting

## 📚 Documentation

- **API Documentation**: Available at `http://localhost:8000/docs`
- **Backend Details**: See `/backend/README.md`
- **Frontend Details**: See `/frontend/README.md`
