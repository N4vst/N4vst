from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'organizations', views.OrganizationViewSet)
router.register(r'categories', views.ProductCategoryViewSet)
router.register(r'materials', views.MaterialViewSet)
router.register(r'certificates', views.CertificateViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'instances', views.ProductInstanceViewSet)
router.register(r'events', views.SupplyChainEventViewSet)
router.register(r'repairs', views.RepairRecordViewSet)
router.register(r'recycling', views.RecyclingInstructionViewSet)
router.register(r'passports', views.ProductPassportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('product-passport/<str:serial_number>/', views.ProductPassportView.as_view(), name='product-passport-detail'),
    path('product-scan/<str:serial_number>/', views.ProductScanView.as_view(), name='product-scan'),
] 