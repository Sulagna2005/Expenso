# Monthly Expense Tracking API

## Overview
Each user account has complete isolation with their own credentials and expense tracking. Users can register, set monthly income, track expenses, and view cumulative balances across months.

## 🔐 User Authentication & Isolation

### Register New User
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token",
  "user": {
    "email": "user@example.com",
    "username": "username",
    "full_name": null,
    "monthly_income": null,
    "initial_balance": "0.00"
  }
}
```

### Login User
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 💰 Monthly Income Management

### Set Monthly Income
```bash
POST /api/transactions/monthly-income/
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "monthly_income": 5000.00,
  "year": 2024,
  "month": 1
}
```

**Response:**
```json
{
  "success": true,
  "monthly_income": 5000.0,
  "year": 2024,
  "month": 1
}
```

### Get Monthly Income
```bash
GET /api/transactions/monthly-income/?year=2024&month=1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "monthly_income": 5000.0,
  "year": 2024,
  "month": 1
}
```

## 📊 Transaction Management

### Add Transaction
```bash
POST /api/transactions/
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "transaction_type": "expense",
  "amount": 150.00,
  "purpose": "Groceries"
}
```

### Get User's Transactions
```bash
GET /api/transactions/
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** Only returns transactions for the authenticated user
```json
[
  {
    "id": 1,
    "transaction_type": "expense",
    "amount": "150.00",
    "purpose": "Groceries",
    "date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

## 📈 Dashboard & Balance Tracking

### Get Dashboard Data
```bash
GET /api/transactions/dashboard/
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "current_balance": 4850.00,
  "total_monthly_income": 5000.00,
  "today_spending": 25.00,
  "card_number": "1234567890123456",
  "card_holder_name": "John Doe"
}
```

**Balance Calculation:**
- `current_balance` = `initial_balance` + `sum(all_monthly_incomes)` + `sum(transaction_incomes)` - `sum(expenses)`
- Includes cumulative data from all previous months

### Get Cumulative Balance History
```bash
GET /api/transactions/cumulative-balance/
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "initial_balance": 0.0,
  "current_cumulative_balance": 4850.0,
  "monthly_history": [
    {
      "year": 2024,
      "month": 1,
      "monthly_income": 5000.0,
      "transaction_income": 200.0,
      "expenses": 350.0,
      "cumulative_balance": 4850.0
    }
  ]
}
```

## 📅 Monthly Statistics

### Get Monthly Statistics
```bash
POST /api/transactions/monthly/2024/1/
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "monthly_income": 5000.00
}
```

**Response:**
```json
{
  "monthly_income": 5000.0,
  "total_transactions": 5,
  "total_addon": 200.0,
  "total_expenses": 350.0,
  "month_balance": 4850.0,
  "transactions": [...]
}
```

## 🔒 Security Features

### User Isolation
- Each user can only access their own data
- JWT tokens ensure secure authentication
- All endpoints filter data by `request.user`
- Cross-user data access is prevented

### Data Privacy
- Users cannot see other users' transactions
- Monthly income is private per user
- Balance calculations are user-specific
- No shared data between accounts

## 📝 Usage Examples

### Complete User Workflow

1. **Register Account**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"secure123"}'
```

2. **Set Monthly Income**
```bash
curl -X POST http://127.0.0.1:8000/api/transactions/monthly-income/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"monthly_income":4500,"year":2024,"month":1}'
```

3. **Add Expenses**
```bash
curl -X POST http://127.0.0.1:8000/api/transactions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_type":"expense","amount":200,"purpose":"Rent"}'
```

4. **Check Balance**
```bash
curl -X GET http://127.0.0.1:8000/api/transactions/dashboard/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Multi-Month Tracking

Users can track expenses across multiple months:

```bash
# January income
POST /api/transactions/monthly-income/
{"monthly_income": 5000, "year": 2024, "month": 1}

# February income  
POST /api/transactions/monthly-income/
{"monthly_income": 5200, "year": 2024, "month": 2}

# View cumulative balance
GET /api/transactions/cumulative-balance/
```

## ⚡ Key Features

- ✅ **Complete User Isolation** - Each account is completely separate
- ✅ **Monthly Income Tracking** - Set different income per month
- ✅ **Cumulative Balance** - Shows total money across all months
- ✅ **Secure Authentication** - JWT-based with proper token validation
- ✅ **Individual Expense Tracking** - Each user manages their own expenses
- ✅ **Monthly Statistics** - Detailed breakdown per month
- ✅ **Cross-Platform** - Works with any HTTP client

## 🚀 Testing

Run the test script to verify user isolation:
```bash
python test_user_isolation.py
```

This will create two test users and verify that they can only access their own data.