# Uptime Monitor Backend

A Node.js + MongoDB backend for a SaaS Uptime Monitoring service.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

**Required Environment Variables:**

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `ALERT_EMAIL` - Email for sending alerts (Gmail recommended)
- `ALERT_PASSWORD` - App password for the email account
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (optional)

### 3. Database Setup

Make sure MongoDB is running locally or use MongoDB Atlas:

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/uptime-monitor
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Monitors (Protected Routes)

- `GET /api/monitors` - Get user's monitors
- `POST /api/monitors` - Create a new monitor
- `PUT /api/monitors/:id` - Update a monitor
- `DELETE /api/monitors/:id` - Delete a monitor

## 🔧 Troubleshooting

### 500 Internal Server Error

1. **Check Environment Variables**: Ensure all required variables are set in `.env`
2. **Database Connection**: Verify MongoDB is running and `MONGO_URI` is correct
3. **JWT Secret**: Make sure `JWT_SECRET` is set and not empty

### Common Issues

- **"MONGO_URI environment variable is required"**: Add MongoDB connection string to `.env`
- **"JWT_SECRET environment variable is missing"**: Add a secret key to `.env`
- **CORS errors**: Update `FRONTEND_URL` in `.env` to match your frontend URL

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `ALERT_PASSWORD`

## 🏗️ Project Structure

```
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   └── monitorController.js # Monitor CRUD operations
├── middleware/
│   └── authMiddleware.js   # JWT authentication
├── models/
│   ├── User.js            # User model
│   ├── Monitor.js         # Monitor model
│   └── MonitorLog.js      # Monitor logs model
├── routes/
│   ├── auth.js            # Auth routes
│   └── monitors.js        # Monitor routes
├── utils/
│   ├── cron.js            # Scheduled monitoring
│   └── email.js           # Email notifications
└── index.js               # Main server file
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- CORS protection
- Environment variable protection

## 📊 Monitoring Features

- URL uptime monitoring
- Configurable check frequency
- Email alerts on status changes
- Response time tracking
- Status history logging
