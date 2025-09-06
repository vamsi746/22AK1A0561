const urls = new Map(); // key: shortcode -> value: { originalUrl, createdAt, expiry, validityMinutes, shortcode, stats }

module.exports = {
  urls,
  get: (code) => urls.get(code),
  set: (code, data) => urls.set(code, data),
  delete: (code) => urls.delete(code),
  has: (code) => urls.has(code),
};
