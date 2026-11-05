const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve all static frontend assets (css, js, html)
app.use(express.static(__dirname));

// Health check endpoint for Service 2
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'service-2',
    name: 'Frontend Container Service',
    status: 'healthy',
    backendTarget: 'https://student-management-system-oq04.onrender.com',
    timestamp: new Date().toISOString(),
  });
});

// SPA catch-all route to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Service 2 (Frontend Container) running on port ${PORT}`);
  console.log(`🌐 Connected to Backend Service: https://student-management-system-oq04.onrender.com`);
});
