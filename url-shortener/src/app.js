const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const shorturlsRouter = require('./routes/shorturls');

const app = express();

app.use(express.json());
app.use(logger);             // Required: custom logging middleware
app.use('/', shorturlsRouter);

// centralized error handler (logs to errors.log)
app.use((err, req, res, next) => {
  const fs = require('fs');
  const logDir = path.join(__dirname, '..', 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  const errLine = `[${new Date().toISOString()}] ERROR ${err.status || 500} ${req.method} ${req.originalUrl} - ${err.message}\n${err.stack || ''}\n`;
  fs.appendFileSync(path.join(logDir, 'errors.log'), errLine);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
