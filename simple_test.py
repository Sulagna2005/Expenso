#!/usr/bin/env python
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_profile():
    # Login first
    login_data = {"email": "test@example.com", "password": "testpass123"}
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test profile GET
            profile_response = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
            print(f"Profile GET Status: {profile_response.status_code}")
            print(f"Profile Response: {profile_response.text}")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Server not running. Start with: python manage.py runserver")

if __name__ == "__main__":
    test_profile()