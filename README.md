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

<img width="1832" height="869" alt="image" src="https://github.com/user-attachments/assets/0fa767f1-863c-4de9-856e-2b48d2086ab0" />
<img width="1047" height="855" alt="image" src="https://github.com/user-attachments/assets/4511a1b6-a8ba-4cf8-97c3-5e9bc5767dc0" />
<img width="734" height="789" alt="image" src="https://github.com/user-attachments/assets/0b9f3def-d437-4e43-9dd4-9ad1aa0101aa" />
<img width="1333" height="824" alt="image" src="https://github.com/user-attachments/assets/ba1092e3-8dc1-46ce-8d23-d47a82fc5787" />
<img width="1362" height="780" alt="image" src="https://github.com/user-attachments/assets/4148debd-2a76-4194-b7ca-d386e18f7419" />
<img width="1357" height="756" alt="image" src="https://github.com/user-attachments/assets/52eaad06-16c3-4508-b2aa-a1fc1edc1d94" />
<img width="1395" height="759" alt="image" src="https://github.com/user-attachments/assets/1d460205-eaa4-4368-a86e-fab3edb8827e" />




