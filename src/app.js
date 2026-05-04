const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Files ────────────────────────────────────────────────────────────
// Serve the built frontend from ProTracker/dist
const distPath = path.resolve(__dirname, '../ProTracker/dist');

// 1. Serve static files first
app.use(express.static(distPath));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── SPA Fallback ────────────────────────────────────────────────────────────
// If no API route or static file matches, and it's not a request for a file (extension), serve index.html
app.use((req, res) => {
  // If it's an API request, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  // If the request has an extension (e.g., .js, .css, .png), it's a missing static asset
  if (path.extname(req.path)) {
    console.log(`[Static] Asset not found: ${req.path}`);
    return res.status(404).end();
  }

  // Otherwise, it's a frontend route (SPA) - serve index.html
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[SPA Fallback] Error sending index.html:`, err);
      res.status(500).send('Frontend build not found or inaccessible.');
    }
  });
});

// ── Central Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
