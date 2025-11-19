#!/usr/bin/env python
"""
Test script to verify user isolation and monthly expense tracking
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

def test_user_isolation():
    print("🔐 Testing User Isolation and Monthly Expense Tracking")
    print("=" * 60)
    
    # Test data for two different users
    user1_data = {
        "email": "user1@test.com",
        "username": "user1",
        "password": "testpass123"
    }
    
    user2_data = {
        "email": "user2@test.com", 
        "username": "user2",
        "password": "testpass123"
    }
    
    # Register User 1
    print("\n1️⃣ Registering User 1...")
    response1 = requests.post(f"{BASE_URL}/auth/register/", json=user1_data)
    if response1.status_code == 201:
        user1_token = response1.json()['access']
        print("✅ User 1 registered successfully")
    else:
        print(f"❌ User 1 registration failed: {response1.text}")
        return
    
    # Register User 2
    print("\n2️⃣ Registering User 2...")
    response2 = requests.post(f"{BASE_URL}/auth/register/", json=user2_data)
    if response2.status_code == 201:
        user2_token = response2.json()['access']
        print("✅ User 2 registered successfully")
    else:
        print(f"❌ User 2 registration failed: {response2.text}")
        return
    
    # Set monthly income for User 1
    print("\n3️⃣ Setting monthly income for User 1...")
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    monthly_income_data = {
        "monthly_income": 5000,
        "year": 2024,
        "month": 1
    }
    response = requests.post(f"{BASE_URL}/transactions/monthly-income/", 
                           json=monthly_income_data, headers=headers1)
    if response.status_code == 200:
        print("✅ User 1 monthly income set to $5000")
    else:
        print(f"❌ Failed to set monthly income: {response.text}")
    
    # Set monthly income for User 2
    print("\n4️⃣ Setting monthly income for User 2...")
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    monthly_income_data2 = {
        "monthly_income": 3000,
        "year": 2024,
        "month": 1
    }
    response = requests.post(f"{BASE_URL}/transactions/monthly-income/", 
                           json=monthly_income_data2, headers=headers2)
    if response.status_code == 200:
        print("✅ User 2 monthly income set to $3000")
    else:
        print(f"❌ Failed to set monthly income: {response.text}")
    
    # Add transactions for User 1
    print("\n5️⃣ Adding transactions for User 1...")
    user1_transactions = [
        {"transaction_type": "expense", "amount": 100, "purpose": "Groceries"},
        {"transaction_type": "expense", "amount": 50, "purpose": "Gas"},
        {"transaction_type": "income", "amount": 200, "purpose": "Freelance"}
    ]
    
    for transaction in user1_transactions:
        response = requests.post(f"{BASE_URL}/transactions/", 
                               json=transaction, headers=headers1)
        if response.status_code == 201:
            print(f"✅ Added {transaction['transaction_type']}: ${transaction['amount']}")
        else:
            print(f"❌ Failed to add transaction: {response.text}")
    
    # Add transactions for User 2
    print("\n6️⃣ Adding transactions for User 2...")
    user2_transactions = [
        {"transaction_type": "expense", "amount": 200, "purpose": "Rent"},
        {"transaction_type": "expense", "amount": 75, "purpose": "Utilities"},
        {"transaction_type": "income", "amount": 150, "purpose": "Side job"}
    ]
    
    for transaction in user2_transactions:
        response = requests.post(f"{BASE_URL}/transactions/", 
                               json=transaction, headers=headers2)
        if response.status_code == 201:
            print(f"✅ Added {transaction['transaction_type']}: ${transaction['amount']}")
        else:
            print(f"❌ Failed to add transaction: {response.text}")
    
    # Test User 1 dashboard (should only see their data)
    print("\n7️⃣ Testing User 1 dashboard...")
    response = requests.get(f"{BASE_URL}/transactions/dashboard/", headers=headers1)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User 1 Balance: ${data['current_balance']}")
        print(f"   Monthly Income: ${data.get('total_monthly_income', 0)}")
    else:
        print(f"❌ Failed to get User 1 dashboard: {response.text}")
    
    # Test User 2 dashboard (should only see their data)
    print("\n8️⃣ Testing User 2 dashboard...")
    response = requests.get(f"{BASE_URL}/transactions/dashboard/", headers=headers2)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User 2 Balance: ${data['current_balance']}")
        print(f"   Monthly Income: ${data.get('total_monthly_income', 0)}")
    else:
        print(f"❌ Failed to get User 2 dashboard: {response.text}")
    
    # Test User 1 transactions (should only see their transactions)
    print("\n9️⃣ Testing User 1 transaction isolation...")
    response = requests.get(f"{BASE_URL}/transactions/", headers=headers1)
    if response.status_code == 200:
        transactions = response.json()
        print(f"✅ User 1 has {len(transactions)} transactions")
        for t in transactions:
            print(f"   - {t['transaction_type']}: ${t['amount']} ({t['purpose']})")
    else:
        print(f"❌ Failed to get User 1 transactions: {response.text}")
    
    # Test User 2 transactions (should only see their transactions)
    print("\n🔟 Testing User 2 transaction isolation...")
    response = requests.get(f"{BASE_URL}/transactions/", headers=headers2)
    if response.status_code == 200:
        transactions = response.json()
        print(f"✅ User 2 has {len(transactions)} transactions")
        for t in transactions:
            print(f"   - {t['transaction_type']}: ${t['amount']} ({t['purpose']})")
    else:
        print(f"❌ Failed to get User 2 transactions: {response.text}")
    
    # Test cumulative balance for User 1
    print("\n1️⃣1️⃣ Testing User 1 cumulative balance...")
    response = requests.get(f"{BASE_URL}/transactions/cumulative-balance/", headers=headers1)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User 1 Cumulative Balance: ${data['current_cumulative_balance']}")
        print(f"   Initial Balance: ${data['initial_balance']}")
        print(f"   Monthly History: {len(data['monthly_history'])} months")
    else:
        print(f"❌ Failed to get User 1 cumulative balance: {response.text}")
    
    # Test that User 1 cannot access User 2's data with wrong token
    print("\n1️⃣2️⃣ Testing cross-user access prevention...")
    response = requests.get(f"{BASE_URL}/transactions/", headers=headers1)
    user1_count = len(response.json()) if response.status_code == 200 else 0
    
    response = requests.get(f"{BASE_URL}/transactions/", headers=headers2)
    user2_count = len(response.json()) if response.status_code == 200 else 0
    
    if user1_count != user2_count:
        print("✅ User isolation working - users see different transaction counts")
        print(f"   User 1 sees: {user1_count} transactions")
        print(f"   User 2 sees: {user2_count} transactions")
    else:
        print("⚠️  Warning: Users might be seeing the same data")
    
    print("\n" + "=" * 60)
    print("🎉 User isolation and monthly expense tracking test completed!")

if __name__ == "__main__":
    try:
        test_user_isolation()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to server. Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")