#!/usr/bin/env python
"""
Simple API test script for Expenso backend
Run this after starting the Django server to test basic functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_user_registration():
    """Test user registration endpoint"""
    url = f"{BASE_URL}/auth/register/"
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Registration Status: {response.status_code}")
        if response.status_code == 200:
            print("[SUCCESS] User registration successful")
            return response.json()
        else:
            print(f"[ERROR] Registration failed: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("[ERROR] Server not running. Start with: python manage.py runserver")
        return None

def test_user_login():
    """Test user login endpoint"""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login Status: {response.status_code}")
        if response.status_code == 200:
            print("[SUCCESS] User login successful")
            return response.json()
        else:
            print(f"[ERROR] Login failed: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("[ERROR] Server not running")
        return None

def test_swagger_docs():
    """Test if Swagger documentation is accessible"""
    url = "http://127.0.0.1:8000/swagger/"
    
    try:
        response = requests.get(url)
        print(f"Swagger Docs Status: {response.status_code}")
        if response.status_code == 200:
            print("[SUCCESS] Swagger documentation accessible")
        else:
            print("[ERROR] Swagger docs not accessible")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Server not running")

if __name__ == "__main__":
    print("Testing Expenso API Endpoints...")
    print("=" * 50)
    
    # Test registration
    user_data = test_user_registration()
    
    # Test login
    login_data = test_user_login()
    
    # Test Swagger docs
    test_swagger_docs()
    
    print("=" * 50)
    print("API testing complete!")
    print("\nAccess API documentation at:")
    print("   Swagger UI: http://127.0.0.1:8000/swagger/")
    print("   ReDoc: http://127.0.0.1:8000/redoc/")