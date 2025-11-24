from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import random
import string

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

class OTP(models.Model):
    OTP_TYPES = (
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
    )

    email = models.EmailField(max_length=255)
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPES)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'otps'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.otp_type} - {self.otp_code}"

    def is_valid(self):
        """Check if OTP is still valid (not used and not expired)"""
        return not self.is_used and timezone.now() < self.expires_at

    @staticmethod
    def generate_otp():
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_otp(email, otp_type, expiry_minutes=10):
        """Create a new OTP for given email and type"""
        otp_code = OTP.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=expiry_minutes)
        
        # Invalidate all previous OTPs of same type for this email
        OTP.objects.filter(email=email, otp_type=otp_type, is_used=False).update(is_used=True)
        
        # Create new OTP
        otp = OTP.objects.create(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=expires_at
        )
        return otp
