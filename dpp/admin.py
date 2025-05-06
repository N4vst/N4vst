from django.contrib import admin
from .models import ProductPassport

@admin.register(ProductPassport)
class ProductPassportAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ProductPassport model.
    """
    list_display = ('name', 'qr_code', 'created_at', 'updated_at')
    search_fields = ('name', 'qr_code')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('id', 'name', 'qr_code')
        }),
        ('Sustainability Data', {
            'fields': ('sustainability_data',),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    ) 