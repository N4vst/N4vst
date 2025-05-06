from django.db import models
from encrypted_model_fields.fields import EncryptedTextField
import uuid

class ProductPassport(models.Model):
    """
    Model representing a Digital Product Passport (DPP).
    
    This model stores product passport data including an encrypted sustainability_data field
    to ensure GDPR compliance and data protection. The QR code is unique and used for
    identification.
    
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
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Product Passport"
        verbose_name_plural = "Product Passports" 