#!/usr/bin/env python
"""
Test profile endpoint specifically
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_profile_endpoint():
    """Test profile endpoint with authentication"""
    
    # First, login to get token
    login_url = f"{BASE_URL}/auth/login/"
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return
            
        token_data = login_response.json()
        access_token = token_data.get('access')
        
        if not access_token:
            print("No access token received")
            return
            
        # Test profile endpoint
        profile_url = f"{BASE_URL}/auth/profile/"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        profile_response = requests.get(profile_url, headers=headers)
        print(f"Profile Status: {profile_response.status_code}")
        print(f"Profile Response: {profile_response.text}")
        
        if profile_response.status_code == 200:
            print("[SUCCESS] Profile endpoint working")
            profile_data = profile_response.json()
            print(f"Profile Data: {json.dumps(profile_data, indent=2)}")
        else:
            print(f"[ERROR] Profile endpoint failed: {profile_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Server not running. Start with: python manage.py runserver")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")

if __name__ == "__main__":
    print("Testing Profile Endpoint...")
    print("=" * 50)
    test_profile_endpoint()