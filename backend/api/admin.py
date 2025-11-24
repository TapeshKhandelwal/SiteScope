from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_verified', 'is_staff', 'created_at']
    list_filter = ['is_verified', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'is_verified'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp_code', 'otp_type', 'is_used', 'created_at', 'expires_at']
    list_filter = ['otp_type', 'is_used', 'created_at']
    search_fields = ['email', 'otp_code']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
