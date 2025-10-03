/**
 * Ghana Task Hub Backend Server
 * Node.js/Express API Server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock data storage
let users = [];
let tasks = [];
let messages = [];
let notifications = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Ghana Task Hub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ghana Task Hub API',
    docs: '/docs',
    health: '/health',
    version: '1.0.0'
  });
});

// API Documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    title: 'Ghana Task Hub API Documentation',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        requestOTP: 'POST /api/v1/auth/request-otp',
        verifyOTP: 'POST /api/v1/auth/verify-otp',
        register: 'POST /api/v1/auth/register',
        refresh: 'POST /api/v1/auth/refresh'
      },
      tasks: {
        create: 'POST /api/v1/tasks',
        list: 'GET /api/v1/tasks',
        get: 'GET /api/v1/tasks/:id',
        update: 'PUT /api/v1/tasks/:id',
        delete: 'DELETE /api/v1/tasks/:id'
      },
      users: {
        profile: 'GET /api/v1/users/profile'
      },
      payments: {
        transactions: 'GET /api/v1/payments/transactions',
        process: 'POST /api/v1/payments/process'
      },
      messaging: {
        messages: 'GET /api/v1/messaging/messages/:taskId',
        notifications: 'GET /api/v1/messaging/notifications'
      }
    }
  });
});

// Authentication endpoints
app.post('/api/v1/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required'
    });
  }

  // Generate mock OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP (in production, use Redis)
  console.log(`OTP for ${phone}: ${otp}`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      phone,
      userExists: users.some(u => u.phone === phone),
      expiresIn: 300 // 5 minutes
    }
  });
});

app.post('/api/v1/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Phone number and OTP are required'
    });
  }

  // Mock OTP verification (in production, verify from storage)
  if (otp.length !== 6) {
    return res.status(400).json({
      success: false,
      error: 'Invalid OTP format'
    });
  }

  res.json({
    success: true,
    message: 'OTP verified successfully',
    data: { phone }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { phone, otp, firstName, lastName, email, role } = req.body;
  
  if (!phone || !otp || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      error: 'All required fields must be provided'
    });
  }

  // Check if user already exists
  if (users.some(u => u.phone === phone)) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    phone,
    firstName,
    lastName,
    email: email || null,
    role,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // Generate mock JWT tokens
  const accessToken = `mock_access_token_${Date.now()}`;
  const refreshToken = `mock_refresh_token_${Date.now()}`;

  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      user: {
        id: newUser.id,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    }
  });
});

// Tasks endpoints
app.get('/api/v1/tasks', (req, res) => {
  const { page = 1, limit = 20, status, categoryId, clientId, taskerId } = req.query;
  
  let filteredTasks = [...tasks];
  
  if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
  if (categoryId) filteredTasks = filteredTasks.filter(t => t.categoryId === categoryId);
  if (clientId) filteredTasks = filteredTasks.filter(t => t.clientId === clientId);
  if (taskerId) filteredTasks = filteredTasks.filter(t => t.taskerId === taskerId);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedTasks,
    total: filteredTasks.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredTasks.length / limit)
  });
});

app.post('/api/v1/tasks', (req, res) => {
  const { title, description, categoryId, addressId, scheduledAt, durationEstMins, priceGHS, priority, isUrgent } = req.body;
  
  if (!title || !description || !categoryId || !addressId || !scheduledAt || !durationEstMins || !priceGHS) {
    return res.status(400).json({
      success: false,
      error: 'All required fields must be provided'
    });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    clientId: 'mock_client_id',
    taskerId: null,
    categoryId,
    addressId,
    scheduledAt,
    durationEstMins,
    status: 'CREATED',
    priority: priority || 'MEDIUM',
    isUrgent: isUrgent || false,
    priceGHS,
    platformFeeGHS: priceGHS * 0.05,
    currency: 'GHS',
    location: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.json({
    success: true,
    message: 'Task created successfully',
    data: { taskId: newTask.id }
  });
});

app.get('/api/v1/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

// Users endpoints
app.get('/api/v1/users/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'mock_user_id',
      phone: '+233123456789',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'CLIENT',
      status: 'ACTIVE'
    }
  });
});

// Payments endpoints
app.get('/api/v1/payments/transactions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        amount: 150.00,
        currency: 'GHS',
        type: 'TASK_PAYMENT',
        status: 'COMPLETED',
        description: 'Payment for cleaning service',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Messaging endpoints
app.get('/api/v1/messaging/messages/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        content: 'Hello, I\'m on my way to the location.',
        type: 'TEXT',
        senderId: 'tasker_123',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/v1/messaging/notifications', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'TASK_ASSIGNED',
        title: 'New Task Assignment',
        message: 'You have been assigned to a new cleaning task',
        priority: 'MEDIUM',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🇬🇭 Ghana Task Hub Backend Server');
  console.log('================================');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('================================');
});

module.exports = app;
