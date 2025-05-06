import pytest
import json
import uuid
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.dpp.models import ProductPassport

# Fixtures for tests
@pytest.fixture
def api_client():
    """Return an API client for testing"""
    return APIClient()

@pytest.fixture
def passport_data():
    """Return test data for a product passport"""
    return {
        'name': 'Test Product',
        'qr_code': f'QR-{uuid.uuid4().hex[:10]}',
        'sustainability_data': {
            'carbon_footprint': 25.5,
            'recyclable': True,
            'materials': ['aluminum', 'plastic'],
            'manufacturing_location': 'EU'
        }
    }

@pytest.fixture
def passport(passport_data):
    """Create and return a test product passport"""
    passport = ProductPassport.objects.create(
        name=passport_data['name'],
        qr_code=passport_data['qr_code']
    )
    passport.set_sustainability_data(passport_data['sustainability_data'])
    passport.save()
    return passport

# Model tests
@pytest.mark.django_db
def test_create_passport(passport_data):
    """Test creating a ProductPassport model instance"""
    passport = ProductPassport.objects.create(
        name=passport_data['name'],
        qr_code=passport_data['qr_code']
    )
    passport.set_sustainability_data(passport_data['sustainability_data'])
    passport.save()
    
    assert str(passport) == f"{passport_data['name']} ({passport_data['qr_code']})"
    assert passport.name == passport_data['name']
    assert passport.qr_code == passport_data['qr_code']
    assert passport.get_sustainability_data() == passport_data['sustainability_data']

@pytest.mark.django_db
def test_passport_json_handling():
    """Test JSON handling methods of ProductPassport model"""
    passport = ProductPassport.objects.create(
        name="Test JSON",
        qr_code="QR-TEST-JSON"
    )
    
    # Test setting and getting JSON data
    test_data = {'key1': 'value1', 'key2': 2, 'key3': [1, 2, 3]}
    passport.set_sustainability_data(test_data)
    passport.save()
    
    # Refresh from DB to ensure data was saved
    passport.refresh_from_db()
    retrieved_data = passport.get_sustainability_data()
    
    assert retrieved_data == test_data
    assert retrieved_data['key1'] == 'value1'
    assert retrieved_data['key3'] == [1, 2, 3]
    
    # Test handling empty or invalid data
    passport.sustainability_data = None
    assert passport.get_sustainability_data() == {}
    
    passport.sustainability_data = "not-json"
    assert passport.get_sustainability_data() == {}

# API tests
@pytest.mark.django_db
def test_passport_list(api_client, passport):
    """Test listing all passports"""
    url = reverse('productpassport-list')
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['name'] == passport.name
    assert response.data['results'][0]['qr_code'] == passport.qr_code

@pytest.mark.django_db
def test_passport_create(api_client, passport_data):
    """Test creating a passport via API"""
    url = reverse('productpassport-list')
    response = api_client.post(url, passport_data, format='json')
    
    assert response.status_code == status.HTTP_201_CREATED
    assert ProductPassport.objects.count() == 1
    assert response.data['name'] == passport_data['name']
    assert response.data['qr_code'] == passport_data['qr_code']
    assert response.data['sustainability_data'] == passport_data['sustainability_data']

@pytest.mark.django_db
def test_passport_retrieve(api_client, passport, passport_data):
    """Test retrieving a passport by ID"""
    url = reverse('productpassport-detail', kwargs={'pk': passport.id})
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == passport_data['name']
    assert response.data['qr_code'] == passport_data['qr_code']
    assert response.data['sustainability_data'] == passport_data['sustainability_data']

@pytest.mark.django_db
def test_passport_update(api_client, passport):
    """Test updating a passport via API"""
    url = reverse('productpassport-detail', kwargs={'pk': passport.id})
    
    update_data = {
        'name': 'Updated Name',
        'sustainability_data': {
            'carbon_footprint': 30.0,
            'recyclable': False
        }
    }
    
    response = api_client.patch(url, update_data, format='json')
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == update_data['name']
    assert response.data['sustainability_data'] == update_data['sustainability_data']
    
    # Check that qr_code was not changed
    assert response.data['qr_code'] == passport.qr_code

@pytest.mark.django_db
def test_passport_delete(api_client, passport):
    """Test deleting a passport via API"""
    url = reverse('productpassport-detail', kwargs={'pk': passport.id})
    response = api_client.delete(url)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert ProductPassport.objects.count() == 0

@pytest.mark.django_db
def test_passport_qr_code_lookup(api_client, passport, passport_data):
    """Test looking up a passport by QR code"""
    url = reverse('productpassport-qr-code', kwargs={'pk': passport.qr_code})
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == passport_data['name']
    assert response.data['qr_code'] == passport_data['qr_code']
    assert response.data['sustainability_data'] == passport_data['sustainability_data']

@pytest.mark.django_db
def test_passport_delete_all(api_client):
    """Test deleting all passports (GDPR compliance)"""
    # Create some passports
    for i in range(3):
        passport = ProductPassport.objects.create(
            name=f"Test {i}",
            qr_code=f"QR-TEST-{i}"
        )
    
    assert ProductPassport.objects.count() == 3
    
    url = reverse('productpassport-delete-all')
    response = api_client.post(url)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert ProductPassport.objects.count() == 0 