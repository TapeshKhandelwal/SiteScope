# SiteScope

A professional website analysis and SEO optimization platform powered by AI.

## Features

- **Website Analysis**: Extract meta tags, content, and performance metrics
- **AI Optimization**: Get AI-powered suggestions for titles, descriptions, and keywords
- **Performance Insights**: Analyze website speed for mobile and desktop
- **Interactive Chatbot**: Ask questions about analyzed websites
- **User Authentication**: Secure email-based authentication with OTP verification

## Tech Stack

**Frontend:**
- React.js
- Context API for state management
- Responsive CSS design

**Backend:**
- Django REST Framework
- PostgreSQL database
- Google Gemini AI integration
- Google PageSpeed Insights API

## Setup

### Backend

```bash
cd backend
python -m venv venvzz
source venvzz/bin/activate  # On Windows: venvzz\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `backend/api/.env`:

```
GEMINI_API_KEY=your_key
GEMINI_PROJECT=your_project
PAGE_INSIGHTS_API_KEY=your_key
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password
```

## Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL

## License

MIT License
