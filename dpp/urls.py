from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductPassportViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'passports', ProductPassportViewSet, basename='product-passport')

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
] 