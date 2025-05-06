from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.dpp.views import ProductPassportViewSet
from apps.users.views import UserViewSet, CustomTokenObtainPairView

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'passports', ProductPassportViewSet)
router.register(r'users', UserViewSet)

# API URL Configuration
# Following Sylius API-first design principles for clear API documentation
# and easy consumption by various clients

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # JWT authentication
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Schema documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/dpp/', include('apps.dpp.urls')),
    
    # DPP-specific API endpoints for Digital Product Passports
    path('api/passports/', include('apps.dpp.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 