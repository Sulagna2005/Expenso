# Expenso - Expense Tracking Backend

Django REST API backend for expense tracking with authentication, transactions, goals, and analytics.

## Features

- 🔐 JWT Authentication
- 💰 Transaction Management (Income/Expense)
- 🎯 Savings Goals & Challenges
- 📊 Analytics & Spending Recommendations
- 🔔 Notifications System
- 📖 Swagger API Documentation

## Tech Stack

- **Framework**: Django 4.2.7 + Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT Tokens
- **Docs**: Swagger UI + ReDoc
- **Container**: Docker

## Quick Start

### 1. Setup Environment
```bash
# Navigate to project
cd d:\Projects\Expenso

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Run migrations
python manage.py migrate

# Create sample data
python manage.py populate_sample_data

# Create admin user (optional)
python manage.py createsuperuser
```

### 3. Start Server
```bash
# Development server
python manage.py runserver

# Or use batch script
start_dev.bat
```

### 4. Access API
- **API Base**: http://127.0.0.1:8000/api/
- **Swagger**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/
- **Admin**: http://127.0.0.1:8000/admin/

## API Endpoints

### 🔐 Authentication
```
POST /api/auth/register/     # Register user
POST /api/auth/login/        # Login user
GET  /api/auth/profile/      # Get profile
PUT  /api/auth/profile/      # Update profile
```

### 💰 Transactions
```
GET  /api/transactions/           # List transactions
POST /api/transactions/           # Create transaction
GET  /api/transactions/history/   # 2-month history
GET  /api/transactions/dashboard/ # Dashboard data
GET  /api/transactions/notifications/ # Notifications
```

### 🎯 Goals
```
GET  /api/goals/savings/         # Savings goals
POST /api/goals/savings/         # Create goal
GET  /api/goals/challenges/      # Available challenges
GET  /api/goals/user-challenges/ # User challenges
GET  /api/goals/rewards/         # Reward points
```

### 📊 Analytics
```
GET /api/analytics/spending/        # Spending data
GET /api/analytics/recommendations/ # AI recommendations
```

## Testing

```bash
# Test API endpoints
python test_api.py

# Run Django tests
python manage.py test
```

## Docker Deployment

```bash
# Build and run
docker-compose up --build

# Access at http://localhost:8000
```

## Environment Variables

Create `.env` file:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Project Structure

```
expenso_backend/
├── 🔐 authentication/    # User auth & profiles
├── 💰 transactions/      # Income/expense tracking
├── 🎯 goals/            # Savings goals & rewards
├── 📊 analytics/        # Spending analytics
├── ⚙️  expenso_backend/ # Django settings
├── 🐳 Dockerfile       # Container config
├── 📋 requirements.txt  # Dependencies
└── 🚀 manage.py        # Django CLI
```

## Sample API Usage

### Register User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"pass123"}'
```

### Create Transaction
```bash
curl -X POST http://127.0.0.1:8000/api/transactions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_type":"expense","amount":50.00,"purpose":"Groceries"}'
```

## Deployment

See `DEPLOYMENT.md` for production deployment guides (Railway, Render, Heroku).