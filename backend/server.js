require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// CORS: sirf allowed frontend domains
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // origin undefined = Postman/curl/server-to-server, allow
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json());

app.get('/', (req, res) => res.json({ success: true, message: 'Student API is running' }));
app.use('/api/students', studentRoutes);

// 404 + error handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  const status = err.message === 'Not allowed by CORS' ? 403 : 500;
  res.status(status).json({ success: false, message: status === 403 ? err.message : 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
