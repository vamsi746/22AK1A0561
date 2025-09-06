const fs = require('fs');
const path = require('path');

module.exports = function loggingMiddleware(req, res, next) {
  const logDir = path.join(__dirname, '..', 'logs');
  fs.mkdirSync(logDir, { recursive: true });

  const start = process.hrtime.bigint();
  const requestId = `${Date.now()}-${Math.floor(Math.random()*1e6)}`;
  req.requestId = requestId;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `[${new Date().toISOString()}] ${requestId} ${req.ip} "${req.method} ${req.originalUrl}" ${res.statusCode} ${durationMs.toFixed(2)}ms "${req.get('user-agent') || ''}" "${req.get('referer') || ''}"\n`;
    fs.appendFile(path.join(logDir, 'requests.log'), line, (err) => {
      /* silent on write errors */
    });
  });

  next();
};
