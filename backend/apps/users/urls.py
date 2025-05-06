from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, RegisterView, CustomTokenObtainPairView

# Create a router for viewsets
router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('magic-link/request/', UserViewSet.as_view({'post': 'magic_link_request'}), name='magic_link_request'),
    path('magic-link/verify/', UserViewSet.as_view({'post': 'magic_link_verify'}), name='magic_link_verify'),
    path('', include(router.urls)),
] 