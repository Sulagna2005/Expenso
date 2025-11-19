#!/usr/bin/env python3
import requests
import json

# Test login endpoint
url = "http://127.0.0.1:8000/api/auth/login/"
data = {
    "email": "test@example.com",
    "password": "testpass123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")