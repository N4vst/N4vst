from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar', 'linkedin', 'twitter', 'preferences']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    organization_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                 'organization', 'organization_name', 'phone', 'position', 'is_verified', 
                 'date_joined', 'profile')
        read_only_fields = ('date_joined', 'is_verified')
    
    def get_organization_name(self, obj):
        if obj.organization:
            return obj.organization.name
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name', 
                 'organization', 'phone', 'position', 'profile')
        
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, **profile_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class MagicLinkRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class MagicLinkVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField(required=True) 