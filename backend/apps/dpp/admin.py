from django.contrib import admin
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
    RecyclingInstruction
)


class ProductMaterialInline(admin.TabularInline):
    model = ProductMaterial
    extra = 1


class ProductInstanceInline(admin.TabularInline):
    model = ProductInstance
    extra = 0


class SupplyChainEventInline(admin.TabularInline):
    model = SupplyChainEvent
    extra = 0


class RepairRecordInline(admin.TabularInline):
    model = RepairRecord
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('name', 'address', 'tax_id')


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_recyclable', 'created_at')
    list_filter = ('is_recyclable', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuing_body', 'certificate_type', 'valid_from', 'valid_until')
    list_filter = ('issuing_body', 'certificate_type', 'valid_from', 'valid_until')
    search_fields = ('name', 'description', 'issuing_body')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'manufacturer', 'category', 'model_number', 'sku', 'is_active')
    list_filter = ('is_active', 'is_hazardous', 'manufacturer', 'category', 'created_at')
    search_fields = ('name', 'description', 'model_number', 'sku', 'barcode')
    inlines = [ProductMaterialInline, ProductInstanceInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'manufacturer', 'category')
        }),
        ('Product Details', {
            'fields': ('model_number', 'sku', 'barcode', 'weight', 'dimensions', 
                      'manufacturing_date', 'expiry_date', 'is_active', 'image')
        }),
        ('Environmental Impact', {
            'fields': ('carbon_footprint', 'is_hazardous')
        }),
        ('Certificates', {
            'fields': ('certificates',)
        }),
    )


@admin.register(ProductInstance)
class ProductInstanceAdmin(admin.ModelAdmin):
    list_display = ('product', 'serial_number', 'manufacturing_batch', 'is_sold', 'sold_date', 'current_owner')
    list_filter = ('is_sold', 'product', 'manufacturing_batch', 'sold_date', 'current_owner')
    search_fields = ('serial_number', 'product__name', 'manufacturing_batch')
    inlines = [SupplyChainEventInline, RepairRecordInline]


@admin.register(SupplyChainEvent)
class SupplyChainEventAdmin(admin.ModelAdmin):
    list_display = ('product_instance', 'event_type', 'organization', 'location', 'date')
    list_filter = ('event_type', 'organization', 'date')
    search_fields = ('product_instance__serial_number', 'location', 'description')
    date_hierarchy = 'date'


@admin.register(RepairRecord)
class RepairRecordAdmin(admin.ModelAdmin):
    list_display = ('product_instance', 'repair_date', 'repair_shop', 'issue', 'warranty_covered', 'cost')
    list_filter = ('repair_date', 'repair_shop', 'warranty_covered')
    search_fields = ('product_instance__serial_number', 'issue', 'solution', 'parts_replaced', 'technician')
    date_hierarchy = 'repair_date'


@admin.register(RecyclingInstruction)
class RecyclingInstructionAdmin(admin.ModelAdmin):
    list_display = ('product', 'recyclability_rating', 'created_at')
    list_filter = ('recyclability_rating', 'created_at')
    search_fields = ('product__name', 'disassembly_steps', 'recyclable_parts', 'hazardous_parts') 