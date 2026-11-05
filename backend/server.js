const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

if (process.env.FRONTEND_URL) {
  // Allow comma-separated origins if provided
  const envOrigins = process.env.FRONTEND_URL.split(',').map((o) => o.trim());
  allowedOrigins.push(...envOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (such as mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    // If FRONTEND_URL is "*", allow any
    if (process.env.FRONTEND_URL === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Match any Netlify preview or production deploy
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    // Match any Render frontend service (e.g., service-2.onrender.com)
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    // Otherwise still allow in non-production, or restrict in production
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API Information Route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Student Information Management System',
    tier: 'Tier 2: Application / Business Logic Layer',
    cloudPlatform: 'Render',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      getAllStudents: 'GET /api/students',
      getSingleStudent: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id',
    },
    documentation: 'See README.md for complete deployment instructions on Netlify, Render, and MongoDB Atlas.',
  });
});

// Health check endpoint (Used by frontend to test connection & Render uptime)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    tiers: {
      frontend: 'Netlify Presentation Tier',
      backend: 'Render Node.js/Express Server (Active)',
      database: {
        platform: 'MongoDB Atlas',
        status: dbStatusMap[dbState] || 'unknown',
        databaseName: mongoose.connection.name || 'not-connected',
      },
    },
  });
});

// Mount student CRUD routes
app.use('/api/students', studentRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Node.js Express server running on port ${PORT}`);
  console.log(`🌐 Architecture Tier 2: Render Application Layer`);
});
