# Expenso Frontend

React.js frontend for the Expenso expense tracking application.

## Features

- 🔐 JWT Authentication with login/register
- 📱 Responsive dashboard with sidebar navigation
- 💳 Card UI with balance display
- 📊 Interactive charts and analytics
- 🎯 Goals and challenges system
- 📈 Transaction history with filtering
- ⚙️ Settings and profile management
- 🔔 Real-time notifications
- ➕ Quick transaction entry

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router DOM** - Navigation
- **Redux Toolkit** - State management
- **Axios** - API communication
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **Vite** - Build tool

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Top navigation with notifications
│   └── Sidebar.jsx     # Side navigation menu
├── pages/              # Page components
│   ├── AuthPage.jsx    # Login/Register
│   ├── Dashboard.jsx   # Main dashboard layout
│   ├── Home.jsx        # Dashboard home with card UI
│   ├── Goals.jsx       # Savings goals & challenges
│   ├── Analytics.jsx   # Charts & recommendations
│   ├── History.jsx     # Transaction history
│   ├── Profile.jsx     # User profile management
│   ├── Settings.jsx    # App settings
│   └── ProfileSetup.jsx # Initial profile setup
├── store/              # Redux state management
│   ├── store.js        # Store configuration
│   ├── authSlice.js    # Authentication state
│   ├── transactionSlice.js # Transaction state
│   └── goalSlice.js    # Goals state
├── services/           # API services
│   └── api.js          # Axios API client
└── hooks/              # Custom React hooks
```

## Key Features Implementation

### Authentication Flow
- Login/Register forms with validation
- JWT token storage and management
- Protected routes with automatic redirects
- Profile setup for new users

### Dashboard Layout
- Responsive sidebar navigation
- Top navbar with notifications and quick actions
- Card-based UI design
- Mobile-friendly responsive design

### Transaction Management
- Quick transaction entry modal
- Real-time balance updates
- Transaction history with filtering
- Category-based spending analysis

### Goals & Challenges
- Monthly savings goal setting
- Progress tracking with visual indicators
- Challenge system with reward points
- Goal achievement notifications

### Analytics & Insights
- Interactive charts (Line, Bar, Pie)
- Weekly and monthly spending trends
- Category breakdown visualization
- Smart spending recommendations

### Settings & Profile
- User profile management
- Notification preferences
- Theme and localization settings
- Data export and account management

## API Integration

The frontend communicates with the Django backend through:
- Axios HTTP client with JWT token interceptors
- RESTful API endpoints for all operations
- Real-time data updates
- Error handling with user-friendly messages

## Development

```bash
# Start backend (Django)
cd ../
python manage.py runserver

# Start frontend (React)
cd frontend/
npm run dev
```

Access the application at http://localhost:3000