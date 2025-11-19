#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to Python path
sys.path.append('d:\\Projects\\Expenso')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expenso_backend.settings')
django.setup()

from authentication.models import User
from authentication.serializers import UserProfileSerializer
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

def test_profile_endpoint():
    # Create test user
    try:
        user = User.objects.get(email='test@example.com')
        print(f"Found existing user: {user.email}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email='test@example.com',
            username='test@example.com',
            password='testpass123',
            full_name='Test User',
            country='US'
        )
        print(f"Created new user: {user.email}")
    
    # Test serializer
    serializer = UserProfileSerializer(user)
    print(f"Serializer data: {serializer.data}")
    
    # Test API endpoint
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    response = client.get('/api/auth/profile/')
    print(f"API Response Status: {response.status_code}")
    print(f"API Response Data: {response.data}")

if __name__ == "__main__":
    test_profile_endpoint()