from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
    path('hello/', views.hello_world, name='hello_world'),
    path('scrape/', views.scrape_website, name='scrape_website'),
    
    # AI Optimization endpoints
    path('ai/optimize-title/', views.ai_optimize_title, name='ai_optimize_title'),
    path('ai/optimize-description/', views.ai_optimize_description, name='ai_optimize_description'),
    path('ai/generate-keywords/', views.ai_generate_keywords, name='ai_generate_keywords'),
    path('ai/content-improvements/', views.ai_content_improvements, name='ai_content_improvements'),
    path('ai/heading-suggestions/', views.ai_heading_suggestions, name='ai_heading_suggestions'),
    path('ai/comprehensive-analysis/', views.ai_comprehensive_analysis, name='ai_comprehensive_analysis'),
    path('ai/chat/', views.ai_chat_about_website, name='ai_chat_about_website'),
    
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('auth/resend-otp/', views.resend_otp, name='resend_otp'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/user/', views.get_current_user, name='get_current_user'),
    path('auth/forgot-password/', views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', views.reset_password, name='reset_password'),
]

