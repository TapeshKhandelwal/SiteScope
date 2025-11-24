from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_otp_email(email, otp_code, otp_type):
        """Send OTP email for registration or password reset"""
        try:
            if otp_type == 'registration':
                subject = 'Welcome to SiteScope - Verify Your Email'
                message = f"""
Hello,

Welcome to SiteScope! 

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
SiteScope Team
"""
            elif otp_type == 'password_reset':
                subject = 'SiteScope - Password Reset Request'
                message = f"""
Hello,

We received a request to reset your password.

Your password reset code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
SiteScope Team
"""
            else:
                logger.error(f"Invalid OTP type: {otp_type}")
                return False

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            logger.info(f"Email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False
