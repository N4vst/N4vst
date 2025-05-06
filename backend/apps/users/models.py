from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimeStampedModel


class User(AbstractUser):
    """
    Custom User model for the application
    """
    email = models.EmailField(_('email address'), unique=True)
    organization = models.ForeignKey(
        'dpp.Organization', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='users',
        verbose_name=_('Organization')
    )
    phone = models.CharField(_('phone number'), max_length=20, blank=True, null=True)
    position = models.CharField(_('position'), max_length=100, blank=True, null=True)
    is_verified = models.BooleanField(_('verified'), default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        
    def __str__(self):
        return self.email


class UserProfile(TimeStampedModel):
    """
    Additional user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(_('bio'), blank=True, null=True)
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(_('date of birth'), blank=True, null=True)
    address = models.TextField(_('address'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
        
    def __str__(self):
        return f"Profile for {self.user.email}"


class MagicLink(models.Model):
    """
    Magic link for passwordless authentication and email verification
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='magic_links',
        verbose_name=_('user')
    )
    token = models.CharField(_('token'), max_length=255, unique=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    expires_at = models.DateTimeField(_('expires at'))
    is_used = models.BooleanField(_('is used'), default=False)
    is_registration = models.BooleanField(_('is registration verification'), default=False)
    
    class Meta:
        verbose_name = _('magic link')
        verbose_name_plural = _('magic links')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Magic link for {self.user.email} ({self.token[:8]}...)"
        
    def is_valid(self):
        """Check if the magic link is still valid"""
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now() 