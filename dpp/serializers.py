from rest_framework import serializers
from .models import ProductPassport

class ProductPassportSerializer(serializers.ModelSerializer):
    """
    Serializer for the ProductPassport model.
    
    This serializer handles the conversion between ProductPassport instances and their JSON representations.
    It includes validation for the required fields and ensures that the sustainability_data is properly
    handled as JSON.
    """
    
    class Meta:
        model = ProductPassport
        fields = ['id', 'name', 'qr_code', 'sustainability_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_qr_code(self, value):
        """
        Validate that the QR code is unique.
        """
        if ProductPassport.objects.filter(qr_code=value).exists():
            if self.instance and self.instance.qr_code == value:
                return value
            raise serializers.ValidationError("A product passport with this QR code already exists.")
        return value
    
    def validate_sustainability_data(self, value):
        """
        Ensure sustainability_data is a valid JSON object.
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Sustainability data must be a valid JSON object.")
        return value 