#!/usr/bin/env python3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expenso_backend.settings')
django.setup()

from authentication.models import User

# Create test user
try:
    user = User.objects.create_user(
        email='test@example.com',
        username='test@example.com',
        password='testpass123',
        full_name='Test User',
        country='US'
    )
    print(f"Created user: {user.email}")
except Exception as e:
    print(f"User might already exist: {e}")
    user = User.objects.get(email='test@example.com')
    print(f"Found existing user: {user.email}")