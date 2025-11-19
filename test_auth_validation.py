#!/usr/bin/env python
"""
Test script to verify authentication system with unique email validation
"""
import requests
import json
import random
import string

BASE_URL = "http://127.0.0.1:8000/api"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_registration():
    print("=== Testing User Registration ===")
    
    # Test 1: Valid registration
    print("\n1. Testing valid registration...")
    user_data = {
        "email": f"test_{generate_random_string()}@example.com",
        "username": f"user_{generate_random_string()}",
        "password": "testpass123",
        "full_name": "Test User",
        "country": "US"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=user_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✓ Registration successful for {data['user']['email']}")
        print(f"✓ Currency set to: {data['user']['currency']}")
        print(f"✓ Full name: {data['user']['full_name']}")
        print(f"✓ Country: {data['user']['country']}")
        return user_data
    else:
        print(f"✗ Registration failed: {response.text}")
        return None

def test_duplicate_email(user_data):
    print("\n2. Testing duplicate email registration...")
    
    # Try to register with same email
    duplicate_data = user_data.copy()
    duplicate_data["username"] = f"different_{generate_random_string()}"
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=duplicate_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 400:
        print("✓ Duplicate email correctly rejected")
        print(f"Error: {response.json()}")
    else:
        print(f"✗ Duplicate email should be rejected: {response.text}")

def test_duplicate_username(user_data):
    print("\n3. Testing duplicate username registration...")
    
    # Try to register with same username
    duplicate_data = user_data.copy()
    duplicate_data["email"] = f"different_{generate_random_string()}@example.com"
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=duplicate_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 400:
        print("✓ Duplicate username correctly rejected")
        print(f"Error: {response.json()}")
    else:
        print(f"✗ Duplicate username should be rejected: {response.text}")

def test_invalid_email():
    print("\n4. Testing invalid email registration...")
    
    invalid_data = {
        "email": "invalid-email",
        "username": f"user_{generate_random_string()}",
        "password": "testpass123",
        "full_name": "Test User",
        "country": "US"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=invalid_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 400:
        print("✓ Invalid email correctly rejected")
        print(f"Error: {response.json()}")
    else:
        print(f"✗ Invalid email should be rejected: {response.text}")

def test_missing_fields():
    print("\n5. Testing missing required fields...")
    
    incomplete_data = {
        "email": f"test_{generate_random_string()}@example.com",
        "password": "testpass123"
        # Missing username, full_name, country
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=incomplete_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 400:
        print("✓ Missing fields correctly rejected")
        print(f"Error: {response.json()}")
    else:
        print(f"✗ Missing fields should be rejected: {response.text}")

def test_login(user_data):
    print("\n6. Testing login...")
    
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✓ Login successful")
        print(f"✓ Access token received: {data['access'][:20]}...")
        return data['access']
    else:
        print(f"✗ Login failed: {response.text}")
        return None

def test_currency_mapping():
    print("\n7. Testing currency mapping for different countries...")
    
    countries_to_test = [
        ("IN", "INR"),
        ("GB", "GBP"),
        ("DE", "EUR"),
        ("JP", "JPY"),
        ("CA", "CAD")
    ]
    
    for country_code, expected_currency in countries_to_test:
        user_data = {
            "email": f"test_{country_code.lower()}_{generate_random_string()}@example.com",
            "username": f"user_{country_code.lower()}_{generate_random_string()}",
            "password": "testpass123",
            "full_name": f"Test User {country_code}",
            "country": country_code
        }
        
        response = requests.post(f"{BASE_URL}/auth/register/", json=user_data)
        if response.status_code == 201:
            data = response.json()
            actual_currency = data['user']['currency']
            if actual_currency == expected_currency:
                print(f"✓ {country_code} -> {expected_currency}")
            else:
                print(f"✗ {country_code} -> Expected {expected_currency}, got {actual_currency}")
        else:
            print(f"✗ Failed to register user for {country_code}: {response.text}")

def main():
    print("Starting Authentication System Validation Tests")
    print("=" * 50)
    
    try:
        # Test valid registration
        user_data = test_registration()
        if not user_data:
            print("Cannot continue tests without successful registration")
            return
        
        # Test duplicate validations
        test_duplicate_email(user_data)
        test_duplicate_username(user_data)
        
        # Test validation errors
        test_invalid_email()
        test_missing_fields()
        
        # Test login
        access_token = test_login(user_data)
        
        # Test currency mapping
        test_currency_mapping()
        
        print("\n" + "=" * 50)
        print("✓ All authentication tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"✗ Test failed with error: {e}")

if __name__ == "__main__":
    main()