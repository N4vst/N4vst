from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import ProductPassport
from .serializers import ProductPassportSerializer

@extend_schema_view(
    list=extend_schema(description="List all product passports with pagination"),
    retrieve=extend_schema(description="Retrieve a specific product passport by ID"),
    create=extend_schema(description="Create a new product passport"),
    update=extend_schema(description="Update a product passport (full update)"),
    partial_update=extend_schema(description="Update a product passport (partial update)"),
    destroy=extend_schema(description="Delete a specific product passport"),
    delete_all=extend_schema(description="Delete all product passports (GDPR compliance)"),
)
class ProductPassportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Digital Product Passports.
    
    This ViewSet provides CRUD operations for ProductPassport instances,
    with additional functionality for GDPR compliance (bulk deletion).
    Redis caching is implemented for read operations to optimize performance.
    
    Inspired by Sylius' API-first design, this ViewSet follows RESTful principles
    and provides a clear separation between the API and the underlying implementation.
    """
    queryset = ProductPassport.objects.all()
    serializer_class = ProductPassportSerializer
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @method_decorator(vary_on_cookie)
    def list(self, request, *args, **kwargs):
        """
        List all product passports with caching for improved performance.
        """
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @method_decorator(vary_on_cookie)
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific product passport with caching for improved performance.
        """
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        """
        Delete all product passports.
        
        This endpoint is provided to comply with GDPR requirements,
        allowing users to delete all their data if needed.
        """
        count, _ = ProductPassport.objects.all().delete()
        return Response(
            {"message": f"Deleted {count} product passports successfully."},
            status=status.HTTP_204_NO_CONTENT
        ) 