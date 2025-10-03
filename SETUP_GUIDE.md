# 🇬🇭 Ghana Task Hub - Local Development Setup

This guide will help you set up the Ghana Task Hub application for local development with both frontend (React/TypeScript) and backend (Python/FastAPI).

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
- **Python 3.8+** - [Download from python.org](https://python.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Optional (for full functionality)
- **PostgreSQL 13+** - For production database
- **Redis** - For caching and sessions
- **Docker** - For containerized development

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Run the setup script
setup.bat
```

#### macOS/Linux
```bash
# Make the script executable and run it
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy env.example .env  # Windows
cp env.example .env    # macOS/Linux

# Update .env with your configuration
```

#### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
copy env.local .env.local  # Windows
cp env.local .env.local    # macOS/Linux

# Update .env.local with your configuration
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
# Option 1: Using the startup script
python start-backend.py

# Option 2: Direct command
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend Server
```bash
# Option 1: Using the startup script
node start-frontend.js

# Option 2: Using npm
npm run start

# Option 3: Direct command
npx vite --host 0.0.0.0 --port 3000
```

### Using Docker (Alternative)
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down
```

## 🌐 Access URLs

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## ⚙️ Configuration

### Backend Environment Variables

Update `backend/.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://ghana_user:ghana_pass@localhost:5432/ghana_task_hub

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Payment Gateways
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Frontend Environment Variables

Update `.env.local` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Payment Gateways (Public keys only)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_your_flutterwave_public_key
```

## 🗄️ Database Setup

### Option 1: SQLite (Default - No Setup Required)
The application uses SQLite by default for development, so no additional setup is needed.

### Option 2: PostgreSQL (Recommended for Production)

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE ghana_task_hub;
CREATE USER ghana_user WITH PASSWORD 'ghana_pass';
GRANT ALL PRIVILEGES ON DATABASE ghana_task_hub TO ghana_user;
```

3. Update `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://ghana_user:ghana_pass@localhost:5432/ghana_task_hub
```

### Option 3: Docker Database
```bash
# Start only the database services
docker-compose up postgres redis minio
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
npm test
```

## 📁 Project Structure

```
ghana-task-hub/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── services/                 # API services
│   ├── stores/                   # State management
│   └── types/                    # TypeScript types
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── api/v1/              # API endpoints
│   │   ├── core/                # Core functionality
│   │   └── models/              # Database models
│   ├── requirements.txt         # Python dependencies
│   └── main.py                  # FastAPI application
├── docker-compose.yml           # Docker configuration
├── setup.bat                    # Windows setup script
├── setup.sh                     # Unix setup script
└── README.md                    # This file
```

## 🔧 Development Features

### Frontend Features
- ⚡ **Vite** - Fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful UI components
- 📱 **PWA Support** - Progressive Web App features
- 🌙 **Dark Mode** - Theme switching
- 📱 **Mobile Responsive** - Mobile-first design

### Backend Features
- 🚀 **FastAPI** - Modern Python web framework
- 🔒 **JWT Authentication** - Secure token-based auth
- 📊 **SQLAlchemy** - Database ORM
- 🔄 **Auto-reload** - Development hot reload
- 📚 **Auto Documentation** - Interactive API docs
- 🛡️ **CORS Support** - Cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   
   # Kill process using port 8000
   npx kill-port 8000
   ```

2. **Python Virtual Environment Issues**
   ```bash
   # Remove and recreate virtual environment
   rmdir /s venv  # Windows
   rm -rf venv    # macOS/Linux
   python -m venv venv
   ```

3. **Node Modules Issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify environment variables are set properly

## 🎯 Next Steps

After successful setup:

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Test Authentication**: Try the phone/OTP flow
3. **Create Tasks**: Test the task creation workflow
4. **Payment Integration**: Configure payment gateways
5. **Deploy**: Use Docker for production deployment

## 📝 Development Notes

- The backend uses mock implementations for development
- OTP codes are logged to console (remove in production)
- File uploads use local storage (configure S3/MinIO for production)
- SMS notifications are mocked (configure Twilio for production)

---

**Happy coding! 🚀**
