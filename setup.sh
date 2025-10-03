#!/bin/bash

# Ghana Task Hub Setup Script
# This script sets up both frontend and backend for local development

set -e

echo "🇬🇭 Ghana Task Hub Local Setup"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js $NODE_VERSION found"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org"
        exit 1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_status "Python $PYTHON_VERSION found"
    else
        print_error "Python 3.8+ is not installed. Please install Python from https://python.org"
        exit 1
    fi
    
    # Check pip
    if command -v pip3 &> /dev/null; then
        print_status "pip3 found"
    else
        print_error "pip3 is not installed. Please install pip for Python"
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    
    cd backend
    
    # Create virtual environment
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    print_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating environment file..."
        cp env.example .env
        print_warning "Please update backend/.env with your configuration"
    fi
    
    cd ..
    print_status "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_info "Creating frontend environment file..."
        cp env.local .env.local
        print_warning "Please update .env.local with your configuration"
    fi
    
    print_status "Frontend setup complete"
}

# Create database initialization script
create_db_init() {
    print_info "Creating database initialization script..."
    
    cat > backend/init.sql << EOF
-- Ghana Task Hub Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks("clientId");
CREATE INDEX IF NOT EXISTS idx_tasks_tasker_id ON tasks("taskerId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks("createdAt");

-- Insert default categories
INSERT INTO task_categories (id, name, description, icon) VALUES
('cleaning', 'Cleaning Services', 'House and office cleaning services', '🧹'),
('maintenance', 'Maintenance', 'Home and office maintenance', '🔧'),
('delivery', 'Delivery Services', 'Package and food delivery', '📦'),
('transport', 'Transportation', 'Ride sharing and transport', '🚗'),
('consultation', 'Consultation', 'Professional consultation services', '💼'),
('other', 'Other Services', 'Other miscellaneous services', '⚡')
ON CONFLICT (id) DO NOTHING;
EOF
    
    print_status "Database initialization script created"
}

# Main setup function
main() {
    check_requirements
    setup_backend
    setup_frontend
    create_db_init
    
    echo ""
    print_status "Setup complete! 🎉"
    echo ""
    print_info "To start the application:"
    echo "  Backend:  python start-backend.py"
    echo "  Frontend: node start-frontend.js"
    echo ""
    print_info "Or use Docker:"
    echo "  docker-compose up"
    echo ""
    print_info "URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    echo ""
    print_warning "Remember to update your environment files with actual configuration!"
}

# Run main function
main "$@"
