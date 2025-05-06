from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel
from encrypted_model_fields.fields import EncryptedTextField
import uuid
import json

User = get_user_model()


class Organization(TimeStampedModel):
    """
    Organizations that own products or are involved in supply chain
    """
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    tax_id = models.CharField(max_length=100, verbose_name=_("Tax ID"), blank=True, null=True)
    address = models.TextField(verbose_name=_("Address"), blank=True, null=True)
    website = models.URLField(verbose_name=_("Website"), blank=True, null=True)
    is_verified = models.BooleanField(default=False, verbose_name=_("Is verified"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_organizations', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Organization")
        verbose_name_plural = _("Organizations")
        
    def __str__(self):
        return self.name


class ProductCategory(TimeStampedModel):
    """
    Categories for products
    """
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, 
                              related_name='children', verbose_name=_("Parent category"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_categories', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Product category")
        verbose_name_plural = _("Product categories")
        
    def __str__(self):
        return self.name


class Material(TimeStampedModel):
    """
    Materials used in products
    """
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    is_recyclable = models.BooleanField(default=False, verbose_name=_("Is recyclable"))
    recycling_instructions = models.TextField(verbose_name=_("Recycling instructions"), blank=True, null=True)
    environmental_impact = models.TextField(verbose_name=_("Environmental impact"), blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_materials', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Material")
        verbose_name_plural = _("Materials")
        
    def __str__(self):
        return self.name


class Certificate(TimeStampedModel):
    """
    Certificates for products or organizations
    """
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    issuing_body = models.CharField(max_length=255, verbose_name=_("Issuing body"))
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    certificate_type = models.CharField(max_length=100, verbose_name=_("Certificate type"))
    valid_from = models.DateField(verbose_name=_("Valid from"))
    valid_until = models.DateField(verbose_name=_("Valid until"), blank=True, null=True)
    verification_url = models.URLField(verbose_name=_("Verification URL"), blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_certificates', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Certificate")
        verbose_name_plural = _("Certificates")
        
    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    """
    Core product model for the Digital Product Passport
    """
    name = models.CharField(max_length=255, verbose_name=_("Product name"))
    description = models.TextField(verbose_name=_("Description"))
    manufacturer = models.ForeignKey(Organization, on_delete=models.CASCADE, 
                                     related_name='manufactured_products',
                                     verbose_name=_("Manufacturer"))
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, 
                                 blank=True, null=True, 
                                 related_name='products',
                                 verbose_name=_("Category"))
    model_number = models.CharField(max_length=100, verbose_name=_("Model number"), blank=True, null=True)
    sku = models.CharField(max_length=100, verbose_name=_("SKU"), blank=True, null=True)
    barcode = models.CharField(max_length=100, verbose_name=_("Barcode"), blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Weight (g)"), blank=True, null=True)
    dimensions = models.CharField(max_length=100, verbose_name=_("Dimensions"), blank=True, null=True)
    manufacturing_date = models.DateField(verbose_name=_("Manufacturing date"), blank=True, null=True)
    expiry_date = models.DateField(verbose_name=_("Expiry date"), blank=True, null=True)
    carbon_footprint = models.DecimalField(max_digits=10, decimal_places=2, 
                                          verbose_name=_("Carbon footprint (kg CO2)"), 
                                          blank=True, null=True)
    is_hazardous = models.BooleanField(default=False, verbose_name=_("Is hazardous"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is active"))
    image = models.ImageField(upload_to='products/', verbose_name=_("Product image"), blank=True, null=True)
    materials = models.ManyToManyField(Material, through='ProductMaterial', related_name='products')
    certificates = models.ManyToManyField(Certificate, blank=True, related_name='products')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_products', 
                                 verbose_name=_("Created by"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='updated_products',
                                 verbose_name=_("Updated by"))
    
    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        
    def __str__(self):
        return self.name


class ProductMaterial(TimeStampedModel):
    """
    Materials used in a specific product with percentage
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_materials')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='product_instances')
    percentage = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_("Percentage"), 
                                    blank=True, null=True)
    notes = models.TextField(verbose_name=_("Notes"), blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_product_materials', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Product material")
        verbose_name_plural = _("Product materials")
        unique_together = ('product', 'material')
        
    def __str__(self):
        return f"{self.product.name} - {self.material.name} ({self.percentage}%)"


class ProductInstance(TimeStampedModel):
    """
    Instance of a product (individual item) with unique identifier
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='instances')
    serial_number = models.CharField(max_length=100, verbose_name=_("Serial number"), unique=True)
    qr_code = models.ImageField(upload_to='qr_codes/', verbose_name=_("QR Code"), blank=True, null=True)
    manufacturing_batch = models.CharField(max_length=100, verbose_name=_("Manufacturing batch"), 
                                          blank=True, null=True)
    is_sold = models.BooleanField(default=False, verbose_name=_("Is sold"))
    sold_date = models.DateField(verbose_name=_("Sold date"), blank=True, null=True)
    current_owner = models.ForeignKey(Organization, on_delete=models.SET_NULL, 
                                     blank=True, null=True, 
                                     related_name='owned_products',
                                     verbose_name=_("Current owner"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_product_instances', 
                                 verbose_name=_("Created by"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='updated_product_instances',
                                 verbose_name=_("Updated by"))
    
    class Meta:
        verbose_name = _("Product instance")
        verbose_name_plural = _("Product instances")
        
    def __str__(self):
        return f"{self.product.name} - {self.serial_number}"


class SupplyChainEvent(TimeStampedModel):
    """
    Events in the supply chain for product tracking
    """
    MANUFACTURING = 'manufacturing'
    PACKAGING = 'packaging'
    DISTRIBUTION = 'distribution'
    RETAIL = 'retail'
    RECYCLING = 'recycling'
    DISPOSAL = 'disposal'
    
    EVENT_TYPES = [
        (MANUFACTURING, _('Manufacturing')),
        (PACKAGING, _('Packaging')),
        (DISTRIBUTION, _('Distribution')),
        (RETAIL, _('Retail')),
        (RECYCLING, _('Recycling')),
        (DISPOSAL, _('Disposal')),
    ]
    
    product_instance = models.ForeignKey(ProductInstance, on_delete=models.CASCADE, 
                                        related_name='supply_chain_events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, verbose_name=_("Event type"))
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, 
                                    related_name='supply_chain_events')
    location = models.CharField(max_length=255, verbose_name=_("Location"), blank=True, null=True)
    date = models.DateTimeField(verbose_name=_("Event date"))
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_supply_chain_events', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Supply chain event")
        verbose_name_plural = _("Supply chain events")
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.product_instance} - {self.get_event_type_display()} ({self.date})"


class RepairRecord(TimeStampedModel):
    """
    Repair records for product instances
    """
    product_instance = models.ForeignKey(ProductInstance, on_delete=models.CASCADE, 
                                        related_name='repair_records')
    repair_date = models.DateField(verbose_name=_("Repair date"))
    repair_shop = models.ForeignKey(Organization, on_delete=models.CASCADE, 
                                   related_name='repair_records')
    issue = models.TextField(verbose_name=_("Issue"))
    solution = models.TextField(verbose_name=_("Solution"))
    parts_replaced = models.TextField(verbose_name=_("Parts replaced"), blank=True, null=True)
    technician = models.CharField(max_length=255, verbose_name=_("Technician"), blank=True, null=True)
    warranty_covered = models.BooleanField(default=False, verbose_name=_("Warranty covered"))
    cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Cost"), 
                              blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_repair_records', 
                                 verbose_name=_("Created by"))
    
    class Meta:
        verbose_name = _("Repair record")
        verbose_name_plural = _("Repair records")
        ordering = ['-repair_date']
        
    def __str__(self):
        return f"{self.product_instance} - {self.repair_date}"


class RecyclingInstruction(TimeStampedModel):
    """
    Recycling instructions for products
    """
    product = models.OneToOneField(Product, on_delete=models.CASCADE, 
                                 related_name='recycling_instruction')
    disassembly_steps = models.TextField(verbose_name=_("Disassembly steps"))
    recyclable_parts = models.TextField(verbose_name=_("Recyclable parts"))
    hazardous_parts = models.TextField(verbose_name=_("Hazardous parts"), blank=True, null=True)
    special_handling = models.TextField(verbose_name=_("Special handling"), blank=True, null=True)
    recyclability_rating = models.PositiveSmallIntegerField(verbose_name=_("Recyclability rating (1-10)"), 
                                                          blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='created_recycling_instructions', 
                                 verbose_name=_("Created by"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='updated_recycling_instructions',
                                 verbose_name=_("Updated by"))
    
    class Meta:
        verbose_name = _("Recycling instruction")
        verbose_name_plural = _("Recycling instructions")
        
    def __str__(self):
        return f"Recycling instructions for {self.product.name}"


class ProductPassport(models.Model):
    """
    Model representing a Digital Product Passport (DPP).
    
    This model implements the EU regulations for Digital Product Passports, storing
    product information and sustainability data. The data is encrypted for GDPR compliance.
    
    The model is inspired by Sylius' API-first design principle, focusing on data that
    can be exposed via API endpoints and consumed by various clients.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Product name")
    qr_code = models.CharField(max_length=100, unique=True, help_text="Unique QR code for product identification")
    sustainability_data = EncryptedTextField(
        help_text="Encrypted text data containing sustainability information in compliance with EU regulations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.qr_code})"
    
    def set_sustainability_data(self, data_dict):
        """Set JSON data for sustainability_data field"""
        self.sustainability_data = json.dumps(data_dict)
    
    def get_sustainability_data(self):
        """Get JSON data from sustainability_data field"""
        try:
            return json.loads(self.sustainability_data)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Product Passport"
        verbose_name_plural = "Product Passports" 