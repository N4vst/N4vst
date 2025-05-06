from rest_framework import viewsets, views, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import (
    Organization,
    ProductCategory,
    Material,
    Certificate,
    Product,
    ProductMaterial,
    ProductInstance,
    SupplyChainEvent,
    RepairRecord,
    RecyclingInstruction,
    ProductPassport
)
from .serializers import (
    OrganizationSerializer,
    ProductCategorySerializer,
    MaterialSerializer,
    CertificateSerializer,
    ProductSerializer,
    ProductMaterialSerializer,
    ProductInstanceSerializer,
    SupplyChainEventSerializer,
    RepairRecordSerializer,
    RecyclingInstructionSerializer,
    ProductPassportSerializer
)


class TrackedModelViewSetMixin:
    """
    Mixin that automatically sets created_by on creation and updated_by on updates
    """
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
    def perform_update(self, serializer):
        # Only add updated_by if the model has this field
        if 'updated_by' in [field.name for field in serializer.Meta.model._meta.fields]:
            serializer.save(updated_by=self.request.user)
        else:
            serializer.save()


class ProductPassportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Digital Product Passports.
    
    This viewset provides CRUD operations for ProductPassport objects. 
    It includes filtering, searching, and pagination capabilities.
    Redis caching is applied to list and retrieve actions for performance optimization.
    
    Following Sylius API-first design principles, this endpoint is designed to be
    consumed by various clients including frontend applications and external systems.
    """
    queryset = ProductPassport.objects.all()
    serializer_class = ProductPassportSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name']
    search_fields = ['name', 'qr_code']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        """List all product passports, with caching for performance."""
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific product passport, with caching for performance."""
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def delete_all(self, request):
        """Delete all product passports (GDPR compliance action)."""
        ProductPassport.objects.all().delete()
        return Response({"detail": "All product passports have been deleted."}, 
                        status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Get product passport by QR code."""
        try:
            passport = ProductPassport.objects.get(qr_code=pk)
            serializer = self.get_serializer(passport)
            return Response(serializer.data)
        except ProductPassport.DoesNotExist:
            return Response(
                {"error": "Product passport with this QR code does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )


class OrganizationViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_verified']
    search_fields = ['name', 'website']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products manufactured by this organization"""
        organization = self.get_object()
        products = Product.objects.filter(manufacturer=organization)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductCategoryViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products in this category"""
        category = self.get_object()
        products = Product.objects.filter(category=category)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class MaterialViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_recyclable']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products using this material"""
        material = self.get_object()
        products = Product.objects.filter(materials=material)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class CertificateViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['issuing_body', 'certificate_type']
    search_fields = ['name', 'description', 'issuing_body']
    ordering_fields = ['name', 'valid_from', 'valid_until', 'created_at']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products with this certificate"""
        certificate = self.get_object()
        products = Product.objects.filter(certificates=certificate)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'category', 'is_active', 'is_hazardous']
    search_fields = ['name', 'description', 'model_number', 'sku', 'barcode']
    ordering_fields = ['name', 'created_at', 'manufacturing_date']
    
    @action(detail=True, methods=['get'])
    def materials(self, request, pk=None):
        """Get materials used in this product"""
        product = self.get_object()
        product_materials = ProductMaterial.objects.filter(product=product)
        serializer = ProductMaterialSerializer(product_materials, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def instances(self, request, pk=None):
        """Get all instances of this product"""
        product = self.get_object()
        instances = ProductInstance.objects.filter(product=product)
        serializer = ProductInstanceSerializer(instances, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def passport(self, request, pk=None):
        """Get the complete product passport"""
        product = self.get_object()
        serializer = ProductPassportSerializer(product)
        return Response(serializer.data)


class ProductInstanceViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ProductInstance.objects.all()
    serializer_class = ProductInstanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'is_sold', 'current_owner', 'manufacturing_batch']
    search_fields = ['serial_number', 'product__name']
    ordering_fields = ['created_at', 'sold_date']
    
    @action(detail=True, methods=['get'])
    def supply_chain(self, request, pk=None):
        """Get supply chain events for this product instance"""
        instance = self.get_object()
        events = SupplyChainEvent.objects.filter(product_instance=instance)
        serializer = SupplyChainEventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def repairs(self, request, pk=None):
        """Get repair records for this product instance"""
        instance = self.get_object()
        repairs = RepairRecord.objects.filter(product_instance=instance)
        serializer = RepairRecordSerializer(repairs, many=True)
        return Response(serializer.data)


class SupplyChainEventViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = SupplyChainEvent.objects.all()
    serializer_class = SupplyChainEventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_instance', 'event_type', 'organization']
    search_fields = ['location', 'description']
    ordering_fields = ['date', 'created_at']


class RepairRecordViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = RepairRecord.objects.all()
    serializer_class = RepairRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_instance', 'repair_shop', 'warranty_covered']
    search_fields = ['issue', 'solution', 'parts_replaced', 'technician']
    ordering_fields = ['repair_date', 'created_at']


class RecyclingInstructionViewSet(TrackedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = RecyclingInstruction.objects.all()
    serializer_class = RecyclingInstructionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'recyclability_rating']
    search_fields = ['disassembly_steps', 'recyclable_parts', 'hazardous_parts']
    ordering_fields = ['recyclability_rating', 'created_at']


class ProductPassportView(views.APIView):
    """
    View to get a product passport by serial number
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, serial_number):
        try:
            instance = ProductInstance.objects.get(serial_number=serial_number)
            product = instance.product
            serializer = ProductPassportSerializer(product)
            
            # Add instance-specific data
            data = serializer.data
            instance_serializer = ProductInstanceSerializer(instance)
            data['specific_instance'] = instance_serializer.data
            
            # Add supply chain events
            events = SupplyChainEvent.objects.filter(product_instance=instance).order_by('-date')
            events_serializer = SupplyChainEventSerializer(events, many=True)
            data['supply_chain_events'] = events_serializer.data
            
            # Add repair records
            repairs = RepairRecord.objects.filter(product_instance=instance).order_by('-repair_date')
            repairs_serializer = RepairRecordSerializer(repairs, many=True)
            data['repair_records'] = repairs_serializer.data
            
            return Response(data)
        except ProductInstance.DoesNotExist:
            return Response(
                {"error": "Product instance with this serial number not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class ProductScanView(views.APIView):
    """
    Public view for scanning QR codes, returns basic product information
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, serial_number):
        try:
            instance = ProductInstance.objects.get(serial_number=serial_number)
            product = instance.product
            
            # Return limited public data for scanning
            data = {
                "product_name": product.name,
                "manufacturer": product.manufacturer.name,
                "model_number": product.model_number,
                "serial_number": instance.serial_number,
                "manufacturing_date": product.manufacturing_date,
                "is_hazardous": product.is_hazardous,
                "recycling_info": {
                    "is_recyclable": any(m.material.is_recyclable for m in product.product_materials.all()),
                },
                "passport_url": request.build_absolute_uri(f"/api/dpp/product-passport/{serial_number}/")
            }
            
            return Response(data)
        except ProductInstance.DoesNotExist:
            return Response(
                {"error": "Product instance with this serial number not found."},
                status=status.HTTP_404_NOT_FOUND
            ) 