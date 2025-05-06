from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from dpp.models import ProductPassport
from dpp.serializers import ProductPassportSerializer
import json
import uuid

class ProductPassportAPITest(APITestCase):
    """
    Test case for the ProductPassport API endpoints.
    """
    
    def setUp(self):
        """
        Set up test data.
        """
        self.passport_data = {
            'name': 'Test Product',
            'qr_code': 'TESTQR123456',
            'sustainability_data': {
                'carbon_footprint': 10.5,
                'recyclable': True,
                'materials': ['wood', 'metal']
            }
        }
        
        self.passport = ProductPassport.objects.create(**self.passport_data)
        self.url_list = reverse('product-passport-list')
        self.url_detail = reverse('product-passport-detail', kwargs={'pk': self.passport.id})
    
    def test_get_all_passports(self):
        """
        Test retrieving all passports.
        """
        response = self.client.get(self.url_list)
        passports = ProductPassport.objects.all()
        serializer = ProductPassportSerializer(passports, many=True)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], serializer.data)
    
    def test_get_single_passport(self):
        """
        Test retrieving a single passport.
        """
        response = self.client.get(self.url_detail)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.passport_data['name'])
        self.assertEqual(response.data['qr_code'], self.passport_data['qr_code'])
        self.assertEqual(response.data['sustainability_data'], self.passport_data['sustainability_data'])
    
    def test_create_passport(self):
        """
        Test creating a new passport.
        """
        new_passport_data = {
            'name': 'New Test Product',
            'qr_code': 'NEWQR123456',
            'sustainability_data': {
                'carbon_footprint': 5.2,
                'recyclable': False,
                'materials': ['plastic']
            }
        }
        
        response = self.client.post(
            self.url_list,
            data=json.dumps(new_passport_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], new_passport_data['name'])
        self.assertEqual(response.data['qr_code'], new_passport_data['qr_code'])
        self.assertEqual(response.data['sustainability_data'], new_passport_data['sustainability_data'])
        
    def test_update_passport(self):
        """
        Test updating a passport.
        """
        updated_data = {
            'name': 'Updated Test Product',
            'qr_code': self.passport_data['qr_code'],
            'sustainability_data': {
                'carbon_footprint': 15.0,
                'recyclable': False,
                'materials': ['plastic', 'metal']
            }
        }
        
        response = self.client.put(
            self.url_detail,
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], updated_data['name'])
        self.assertEqual(response.data['sustainability_data'], updated_data['sustainability_data'])
    
    def test_delete_passport(self):
        """
        Test deleting a passport.
        """
        response = self.client.delete(self.url_detail)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductPassport.objects.filter(id=self.passport.id).count(), 0)
    
    def test_delete_all_passports(self):
        """
        Test the delete_all endpoint for GDPR compliance.
        """
        url_delete_all = reverse('product-passport-delete-all')
        
        # Create a few more passports for testing
        for i in range(3):
            ProductPassport.objects.create(
                name=f'Extra Product {i}',
                qr_code=f'EXTRAQR{i}',
                sustainability_data={'test': True}
            )
        
        self.assertEqual(ProductPassport.objects.count(), 4)
        
        response = self.client.delete(url_delete_all)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductPassport.objects.count(), 0) 