from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, logout
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from .scraper import WebScraper
from .ai_service import GeminiAIService
from .models import User, OTP
from .serializers import (
    UserSerializer, RegisterSerializer, VerifyOTPSerializer,
    LoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)
from .email_service import EmailService


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint to verify API is working
    Also sets CSRF token cookie
    """
    # Ensure CSRF token is set
    get_token(request)
    return Response({
        'status': 'success',
        'message': 'Backend API is running!',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Get CSRF token - sets the CSRF cookie
    """
    csrf_token = get_token(request)
    return Response({
        'success': True,
        'csrfToken': csrf_token
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def hello_world(request):
    """
    Example endpoint that responds to GET and POST requests
    """
    if request.method == 'GET':
        return Response({
            'message': 'Hello from Django Backend!',
            'method': 'GET'
        })
    elif request.method == 'POST':
        data = request.data
        return Response({
            'message': 'Data received successfully!',
            'method': 'POST',
            'received_data': data
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def scrape_website(request):
    """
    Scrape a website and extract all relevant information
    
    Request body:
    {
        "url": "https://example.com"
    }
    """
    url = request.data.get('url')
    
    if not url:
        return Response({
            'error': 'URL is required',
            'message': 'Please provide a URL in the request body'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Basic URL validation
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        scraper = WebScraper(url)
        data = scraper.scrape()
        
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to scrape the website. Please check the URL and try again.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_optimize_title(request):
    """
    Generate AI-powered meta title suggestions
    
    Request body:
    {
        "current_title": "...",
        "meta_description": "...",
        "content_preview": "...",
        "keywords": "..."
    }
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    current_title = request.data.get('current_title', '')
    meta_description = request.data.get('meta_description', '')
    content_preview = request.data.get('content_preview', '')
    keywords = request.data.get('keywords', '')
    
    try:
        suggestions = ai_service.generate_meta_title(
            current_title, meta_description, content_preview, keywords
        )
        
        if isinstance(suggestions, dict) and 'error' in suggestions:
            return Response({
                'success': False,
                'error': suggestions['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'suggestions': suggestions
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_optimize_description(request):
    """
    Generate AI-powered meta description suggestions
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    current_description = request.data.get('current_description', '')
    meta_title = request.data.get('meta_title', '')
    content_preview = request.data.get('content_preview', '')
    keywords = request.data.get('keywords', '')
    
    try:
        suggestions = ai_service.generate_meta_description(
            current_description, meta_title, content_preview, keywords
        )
        
        if isinstance(suggestions, dict) and 'error' in suggestions:
            return Response({
                'success': False,
                'error': suggestions['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'suggestions': suggestions
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_keywords(request):
    """
    Generate AI-powered keyword suggestions
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    meta_title = request.data.get('meta_title', '')
    meta_description = request.data.get('meta_description', '')
    content_preview = request.data.get('content_preview', '')
    headings = request.data.get('headings', [])
    
    try:
        keywords = ai_service.generate_keywords(
            meta_title, meta_description, content_preview, headings
        )
        
        if isinstance(keywords, dict) and 'error' in keywords:
            return Response({
                'success': False,
                'error': keywords['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'keywords': keywords
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_content_improvements(request):
    """
    Generate AI-powered content improvement suggestions
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    content_preview = request.data.get('content_preview', '')
    meta_title = request.data.get('meta_title', '')
    headings = request.data.get('headings', [])
    target_keywords = request.data.get('target_keywords', '')
    
    try:
        improvements = ai_service.generate_content_improvements(
            content_preview, meta_title, headings, target_keywords
        )
        
        if isinstance(improvements, dict) and 'error' in improvements:
            return Response({
                'success': False,
                'error': improvements['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'improvements': improvements
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_heading_suggestions(request):
    """
    Generate AI-powered heading structure suggestions
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    current_headings = request.data.get('current_headings', {})
    meta_title = request.data.get('meta_title', '')
    content_preview = request.data.get('content_preview', '')
    
    try:
        suggestions = ai_service.generate_heading_suggestions(
            current_headings, meta_title, content_preview
        )
        
        if isinstance(suggestions, dict) and 'error' in suggestions:
            return Response({
                'success': False,
                'error': suggestions['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'suggestions': suggestions
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_comprehensive_analysis(request):
    """
    Generate comprehensive AI-powered SEO analysis
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    scraped_data = request.data.get('scraped_data', {})
    
    try:
        analysis = ai_service.generate_comprehensive_analysis(scraped_data)
        
        if isinstance(analysis, dict) and 'error' in analysis:
            return Response({
                'success': False,
                'error': analysis['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'analysis': analysis
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat_about_website(request):
    """
    Chat with AI about the analyzed website
    
    Request body:
    {
        "question": "user's question",
        "scraped_data": {...},
        "chat_history": [...]
    }
    """
    ai_service = GeminiAIService()
    
    if not ai_service.is_configured():
        return Response({
            'error': 'Gemini API not configured',
            'message': 'Please add GEMINI_API_KEY to your environment variables'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    question = request.data.get('question', '')
    scraped_data = request.data.get('scraped_data', {})
    chat_history = request.data.get('chat_history', [])
    
    if not question:
        return Response({
            'success': False,
            'error': 'Question is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = ai_service.chat_about_website(question, scraped_data, chat_history)
        
        if isinstance(result, dict) and 'error' in result:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'answer': result['answer'],
            'optimized_question': result.get('optimized_question', question),
            'original_question': result.get('original_question', question)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== Authentication Endpoints ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user and send OTP for email verification
    """
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        first_name = serializer.validated_data.get('first_name', '')
        last_name = serializer.validated_data.get('last_name', '')
        
        # Create user (unverified)
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_verified=False
        )
        
        # Generate and send OTP
        otp = OTP.create_otp(email, 'registration')
        email_sent = EmailService.send_otp_email(email, otp.otp_code, 'registration')
        
        return Response({
            'success': True,
            'message': 'Registration successful. Please check your email for OTP.',
            'email': email,
            'otp_sent': email_sent
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # If user was created but OTP failed, delete the user
        try:
            User.objects.filter(email=email).delete()
        except:
            pass
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP and activate user account
    """
    serializer = VerifyOTPSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp_code = serializer.validated_data['otp_code']
    
    try:
        # Find the OTP
        otp = OTP.objects.filter(
            email=email,
            otp_code=otp_code,
            otp_type='registration',
            is_used=False
        ).first()
        
        if not otp:
            return Response({
                'success': False,
                'error': 'Invalid OTP code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp.is_valid():
            return Response({
                'success': False,
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Verify the user
        user = User.objects.get(email=email)
        user.is_verified = True
        user.save()
        
        # Log the user in
        login(request, user)
        
        return Response({
            'success': True,
            'message': 'Email verified successfully. You are now logged in.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP for email verification or password reset
    """
    email = request.data.get('email')
    otp_type = request.data.get('otp_type', 'registration')
    
    if not email:
        return Response({
            'success': False,
            'error': 'Email is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if user exists
        user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({
                'success': False,
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if otp_type == 'registration' and user.is_verified:
            return Response({
                'success': False,
                'error': 'Email already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate and send new OTP
        otp = OTP.create_otp(email, otp_type)
        email_sent = EmailService.send_otp_email(email, otp.otp_code, otp_type)
        
        return Response({
            'success': True,
            'message': 'OTP sent successfully. Please check your email.',
            'otp_sent': email_sent
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user with email and password
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    return Response({
        'success': True,
        'message': 'Login successful.',
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout current user
    """
    logout(request)
    return Response({
        'success': True,
        'message': 'Logout successful.'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user
    """
    return Response({
        'success': True,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Initiate forgot password process by sending OTP
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        # Generate and send OTP
        otp = OTP.create_otp(email, 'password_reset')
        email_sent = EmailService.send_otp_email(email, otp.otp_code, 'password_reset')
        
        return Response({
            'success': True,
            'message': 'Password reset OTP sent. Please check your email.',
            'email': email,
            'otp_sent': email_sent
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password using OTP
    """
    serializer = ResetPasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp_code = serializer.validated_data['otp_code']
    new_password = serializer.validated_data['new_password']
    
    try:
        # Find the OTP
        otp = OTP.objects.filter(
            email=email,
            otp_code=otp_code,
            otp_type='password_reset',
            is_used=False
        ).first()
        
        if not otp:
            return Response({
                'success': False,
                'error': 'Invalid OTP code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp.is_valid():
            return Response({
                'success': False,
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Update user password
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
