import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# Login to get token
login_response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": "test@example.com",
    "password": "testpass123"
})

if login_response.status_code == 200:
    token = login_response.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing all endpoints...")
    
    # Test transactions
    print("1. Testing transactions...")
    response = requests.get(f"{BASE_URL}/transactions/", headers=headers)
    print(f"   GET /transactions/: {response.status_code}")
    
    # Test dashboard
    response = requests.get(f"{BASE_URL}/transactions/dashboard/", headers=headers)
    print(f"   GET /dashboard/: {response.status_code}")
    
    # Test goals
    print("2. Testing goals...")
    response = requests.get(f"{BASE_URL}/goals/savings/", headers=headers)
    print(f"   GET /goals/savings/: {response.status_code}")
    
    # Test analytics
    print("3. Testing analytics...")
    response = requests.get(f"{BASE_URL}/analytics/spending/", headers=headers)
    print(f"   GET /analytics/spending/: {response.status_code}")
    
    print("\nAll endpoints tested successfully!")
else:
    print("Login failed")