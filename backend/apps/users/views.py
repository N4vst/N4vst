from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.shortcuts import get_object_or_404
import uuid
import datetime
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    ChangePasswordSerializer,
    UserProfileSerializer,
    MagicLinkRequestSerializer,
    MagicLinkVerifySerializer
)
from .models import UserProfile, MagicLink

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'magic_link_request', 'magic_link_verify']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'magic_link_request':
            return MagicLinkRequestSerializer
        elif self.action == 'magic_link_verify':
            return MagicLinkVerifySerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check old password
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": ["Wrong password."]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"status": "password set"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['put'], serializer_class=UserProfileSerializer)
    def update_profile(self, request):
        """Update user profile"""
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
            
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def magic_link_request(self, request):
        """Request a magic link for passwordless login"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists or not for security
            return Response(
                {"detail": "If an account with this email exists, a magic link has been sent."},
                status=status.HTTP_200_OK
            )
        
        # Create or update magic link
        token = str(uuid.uuid4())
        expires_at = timezone.now() + datetime.timedelta(minutes=15)
        
        magic_link, created = MagicLink.objects.update_or_create(
            user=user,
            defaults={
                'token': token,
                'expires_at': expires_at,
                'is_used': False
            }
        )
        
        # Create the magic link URL
        magic_link_url = f"{settings.FRONTEND_URL}/magic-login/{token}"
        
        # Send email with magic link
        subject = "Your Magic Login Link"
        message = f"Click the link below to log in:\n\n{magic_link_url}\n\nThis link will expire in 15 minutes."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        
        try:
            send_mail(subject, message, from_email, recipient_list)
        except Exception as e:
            return Response(
                {"detail": "Failed to send magic link email."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {"detail": "If an account with this email exists, a magic link has been sent."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'])
    def magic_link_verify(self, request):
        """Verify a magic link token and return JWT tokens"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        # Find the magic link
        try:
            magic_link = MagicLink.objects.get(
                token=token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except MagicLink.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired magic link."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark the magic link as used
        magic_link.is_used = True
        magic_link.save()
        
        # Get the user
        user = magic_link.user
        
        # Generate JWT tokens using CustomTokenObtainPairView
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        # Return tokens and user data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create magic link for email verification
        token = str(uuid.uuid4())
        expires_at = timezone.now() + datetime.timedelta(days=1)
        
        MagicLink.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
            is_used=False,
            is_registration=True
        )
        
        # Create verification link
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
        
        # Send email verification
        subject = "Verify Your Email Address"
        message = f"Welcome to the Digital Product Passport System! Please verify your email by clicking the link below:\n\n{verification_url}\n\nThis link will expire in 24 hours."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]
        
        try:
            send_mail(subject, message, from_email, recipient_list)
        except Exception as e:
            pass  # Still allow registration to succeed
        
        return Response(
            {"detail": "Registration successful. Please check your email to verify your account."},
            status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that also returns user information
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # If the login was successful, add user data to the response
        if response.status_code == 200:
            user = User.objects.get(email=request.data['email'])
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        
        return response 