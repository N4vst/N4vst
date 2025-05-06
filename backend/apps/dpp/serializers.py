from rest_framework import serializers
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


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'address', 'website', 'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('is_verified',)


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ('id', 'name', 'description', 'parent', 'created_at', 'updated_at')


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ('id', 'name', 'description', 'is_recyclable', 'recycling_instructions', 
                 'environmental_impact', 'created_at', 'updated_at')


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ('id', 'name', 'issuing_body', 'description', 'certificate_type', 
                 'valid_from', 'valid_until', 'verification_url', 'created_at', 'updated_at')


class ProductMaterialSerializer(serializers.ModelSerializer):
    material_name = serializers.StringRelatedField(source='material.name', read_only=True)
    
    class Meta:
        model = ProductMaterial
        fields = ('id', 'material', 'material_name', 'percentage', 'notes')


class ProductSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.StringRelatedField(source='manufacturer.name', read_only=True)
    category_name = serializers.StringRelatedField(source='category.name', read_only=True)
    materials = ProductMaterialSerializer(source='product_materials', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'manufacturer', 'manufacturer_name', 'category', 
                 'category_name', 'model_number', 'sku', 'barcode', 'weight', 'dimensions', 
                 'manufacturing_date', 'expiry_date', 'carbon_footprint', 'is_hazardous', 
                 'is_active', 'image', 'materials', 'certificates', 'created_at', 'updated_at')


class ProductInstanceSerializer(serializers.ModelSerializer):
    product_name = serializers.StringRelatedField(source='product.name', read_only=True)
    current_owner_name = serializers.StringRelatedField(source='current_owner.name', read_only=True)
    
    class Meta:
        model = ProductInstance
        fields = ('id', 'product', 'product_name', 'serial_number', 'qr_code', 
                 'manufacturing_batch', 'is_sold', 'sold_date', 'current_owner', 
                 'current_owner_name', 'created_at', 'updated_at')


class SupplyChainEventSerializer(serializers.ModelSerializer):
    product_instance_serial = serializers.StringRelatedField(source='product_instance.serial_number', read_only=True)
    organization_name = serializers.StringRelatedField(source='organization.name', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = SupplyChainEvent
        fields = ('id', 'product_instance', 'product_instance_serial', 'event_type', 
                 'event_type_display', 'organization', 'organization_name', 'location', 
                 'date', 'description', 'created_at', 'updated_at')


class RepairRecordSerializer(serializers.ModelSerializer):
    product_instance_serial = serializers.StringRelatedField(source='product_instance.serial_number', read_only=True)
    repair_shop_name = serializers.StringRelatedField(source='repair_shop.name', read_only=True)
    
    class Meta:
        model = RepairRecord
        fields = ('id', 'product_instance', 'product_instance_serial', 'repair_date', 
                 'repair_shop', 'repair_shop_name', 'issue', 'solution', 'parts_replaced', 
                 'technician', 'warranty_covered', 'cost', 'created_at', 'updated_at')


class RecyclingInstructionSerializer(serializers.ModelSerializer):
    product_name = serializers.StringRelatedField(source='product.name', read_only=True)
    
    class Meta:
        model = RecyclingInstruction
        fields = ('id', 'product', 'product_name', 'disassembly_steps', 'recyclable_parts', 
                 'hazardous_parts', 'special_handling', 'recyclability_rating', 
                 'created_at', 'updated_at')


class ProductPassportSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductPassport model.
    
    Handles the conversion between ProductPassport model instances and JSON representations.
    Utilizes the model's methods for properly handling encrypted sustainability_data.
    """
    sustainability_data = serializers.JSONField(required=False)
    
    class Meta:
        model = ProductPassport
        fields = ['id', 'name', 'qr_code', 'sustainability_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def to_representation(self, instance):
        """Convert model instance to JSON, handling encrypted sustainability_data."""
        ret = super().to_representation(instance)
        # Get the decrypted and parsed sustainability data
        ret['sustainability_data'] = instance.get_sustainability_data()
        return ret
    
    def to_internal_value(self, data):
        """Convert JSON to model instance data, handling sustainability_data."""
        # Remove sustainability_data to handle it separately
        sustainability_data = data.pop('sustainability_data', {})
        
        # Process the rest of the fields normally
        validated_data = super().to_internal_value(data)
        
        # Add sustainability_data back if it was provided
        if sustainability_data:
            validated_data['sustainability_data_dict'] = sustainability_data
        
        return validated_data
    
    def create(self, validated_data):
        """Create a new ProductPassport instance, handling sustainability_data."""
        # Extract the sustainability data if provided
        sustainability_data_dict = validated_data.pop('sustainability_data_dict', {})
        
        # Create the instance
        instance = super().create(validated_data)
        
        # Set the sustainability data
        if sustainability_data_dict:
            instance.set_sustainability_data(sustainability_data_dict)
            instance.save()
        
        return instance
    
    def update(self, instance, validated_data):
        """Update a ProductPassport instance, handling sustainability_data."""
        # Extract the sustainability data if provided
        sustainability_data_dict = validated_data.pop('sustainability_data_dict', None)
        
        # Update the instance
        instance = super().update(instance, validated_data)
        
        # Update the sustainability data if provided
        if sustainability_data_dict is not None:
            instance.set_sustainability_data(sustainability_data_dict)
            instance.save()
        
        return instance 