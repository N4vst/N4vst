from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, MagicLink


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('email', 'username', 'first_name', 'last_name', 'organization', 'is_staff', 'is_verified')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified', 'organization')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'first_name', 'last_name', 'organization', 'phone', 'position')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(MagicLink)
class MagicLinkAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_short', 'created_at', 'expires_at', 'is_used', 'is_registration')
    list_filter = ('is_used', 'is_registration', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)
    
    def token_short(self, obj):
        """Display a shortened version of the token in the admin list"""
        return f"{obj.token[:8]}..."
    token_short.short_description = 'Token' 