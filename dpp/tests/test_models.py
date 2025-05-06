from django.test import TestCase
from dpp.models import ProductPassport
import uuid

class ProductPassportModelTest(TestCase):
    """
    Test case for the ProductPassport model.
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
    
    def test_product_passport_creation(self):
        """
        Test that a ProductPassport instance can be created.
        """
        self.assertTrue(isinstance(self.passport, ProductPassport))
        self.assertEqual(self.passport.name, self.passport_data['name'])
        self.assertEqual(self.passport.qr_code, self.passport_data['qr_code'])
        self.assertEqual(self.passport.sustainability_data, self.passport_data['sustainability_data'])
        self.assertTrue(isinstance(self.passport.id, uuid.UUID))
    
    def test_string_representation(self):
        """
        Test the string representation of the ProductPassport model.
        """
        expected_string = f"{self.passport.name} ({self.passport.qr_code})"
        self.assertEqual(str(self.passport), expected_string) 