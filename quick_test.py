import requests

# Step 1: Register user
print("1. Testing registration...")
reg_response = requests.post("http://127.0.0.1:8000/api/auth/register/", json={
    "email": "quicktest@example.com",
    "username": "quicktest",
    "password": "test123456"
})
print(f"Registration: {reg_response.status_code}")

# Step 2: Login to get token
print("2. Testing login...")
login_response = requests.post("http://127.0.0.1:8000/api/auth/login/", json={
    "email": "quicktest@example.com", 
    "password": "test123456"
})
print(f"Login: {login_response.status_code}")

if login_response.status_code == 200:
    token = login_response.json()['access']
    print(f"Token received: {token[:20]}...")
    
    # Step 3: Test protected endpoint
    print("3. Testing protected endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    protected_response = requests.get("http://127.0.0.1:8000/api/transactions/", headers=headers)
    print(f"Protected endpoint: {protected_response.status_code}")
    
    if protected_response.status_code == 200:
        print("✅ Protected endpoints working!")
    else:
        print(f"❌ Error: {protected_response.text}")
else:
    print(f"❌ Login failed: {login_response.text}")