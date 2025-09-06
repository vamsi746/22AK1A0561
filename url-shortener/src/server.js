const fs = require('fs');
const path = require('path');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const LOG_DIR = path.join(__dirname, '..', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

fs.appendFileSync(path.join(LOG_DIR, 'server.log'),
  `[${new Date().toISOString()}] Server starting on port ${PORT}\n`
);

const server = app.listen(PORT, () => {
  fs.appendFileSync(path.join(LOG_DIR, 'server.log'),
    `[${new Date().toISOString()}] Server listening on port ${PORT}\n`
  );
});

// Cleanup job: remove expired entries every 60s
setInterval(() => {
  try {
    const store = require('./store');
    const removed = [];
    const now = Date.now();
    for (const [code, entry] of store.urls) {
      if (new Date(entry.expiry).getTime() <= now) {
        store.delete(code);
        removed.push(code);
      }
    }
    if (removed.length) {
      fs.appendFileSync(path.join(LOG_DIR, 'cleanup.log'),
        `[${new Date().toISOString()}] removed expired: ${removed.join(',')}\n`);
    }
  } catch (err) {
    fs.appendFileSync(path.join(LOG_DIR, 'errors.log'),
      `[${new Date().toISOString()}] cleanup-error ${err.message}\n${err.stack || ''}\n`);
  }
}, 60 * 1000);
