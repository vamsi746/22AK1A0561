const express = require('express');
const { nanoid } = require('nanoid');
const store = require('../store');
const router = express.Router();

// Helpers
function isValidUrl(u){
  try { new URL(u); return true; } catch(e){ return false; }
}
function isValidShortcode(s){
  if(!s || typeof s !== 'string') return false;
  return /^[A-Za-z0-9]{4,30}$/.test(s);
}
function generateUniqueCode(){
  let code;
  do {
    code = nanoid(8).replace(/[^A-Za-z0-9]/g, '').slice(0,8);
    if (code.length < 4) {
      code = (Math.random().toString(36).slice(2,8));
    }
  } while (store.has(code));
  return code;
}

// POST /shorturls  -> create short link
router.post('/shorturls', (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing required field: url' });
    if (!isValidUrl(url)) return res.status(400).json({ error: 'Invalid URL format' });

    let minutes = 30; // default
    if (validity !== undefined) {
      const v = Number(validity);
      if (!Number.isInteger(v) || v <= 0) return res.status(400).json({ error: 'validity must be a positive integer (minutes)' });
      minutes = v;
    }

    let code = null;
    if (shortcode) {
      if (!isValidShortcode(shortcode)) return res.status(400).json({ error: 'shortcode must be alphanumeric (4-30 chars)' });
      if (store.has(shortcode)) return res.status(409).json({ error: 'shortcode already exists' });
      code = shortcode;
    } else {
      code = generateUniqueCode();
    }

    const createdAt = new Date();
    const expiry = new Date(createdAt.getTime() + minutes * 60 * 1000);

    const entry = {
      originalUrl: url,
      createdAt: createdAt.toISOString(),
      expiry: expiry.toISOString(),
      validityMinutes: minutes,
      shortcode: code,
      stats: {
        clicks: 0,
        clickData: []
      }
    };

    store.set(code, entry);

    const host = req.get('host'); // hostname:port
    const shortLink = `${req.protocol}://${host}/${code}`;

    return res.status(201).json({ shortLink, expiry: entry.expiry });
  } catch (err) { next(err); }
});

// GET /:shortcode  -> redirect
router.get('/:shortcode', (req, res, next) => {
  try {
    const code = req.params.shortcode;
    const entry = store.get(code);
    if (!entry) return res.status(404).json({ error: 'shortcode not found' });

    const now = new Date();
    if (now > new Date(entry.expiry)) {
      store.delete(code);
      return res.status(410).json({ error: 'short link expired' });
    }

    // record click analytics
    const timestamp = new Date().toISOString();
    const referrer = req.get('referer') || req.get('referrer') || null;
    const geo = req.get('cf-ipcountry') || req.get('x-country') || 'Unknown';
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';

    entry.stats.clicks += 1;
    entry.stats.clickData.unshift({
      timestamp,
      referrer,
      geo,
      ip
    });

    if (entry.stats.clickData.length > 500) entry.stats.clickData.length = 500;

    store.set(code, entry);

    res.set('Location', entry.originalUrl);
    return res.status(302).end();
  } catch (err) { next(err); }
});

// GET /shorturls/:shortcode -> stats
router.get('/shorturls/:shortcode', (req, res, next) => {
  try {
    const code = req.params.shortcode;
    const entry = store.get(code);
    if (!entry) return res.status(404).json({ error: 'shortcode not found' });

    const now = new Date();
    if (now > new Date(entry.expiry)) {
      store.delete(code);
      return res.status(410).json({ error: 'short link expired' });
    }

    return res.json({
      originalUrl: entry.originalUrl,
      createdAt: entry.createdAt,
      expiry: entry.expiry,
      clicks: entry.stats.clicks,
      clickData: entry.stats.clickData
    });
  } catch (err) { next(err); }
});

module.exports = router;
