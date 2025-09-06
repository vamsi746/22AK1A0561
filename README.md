# URL Shortener Microservice

A backend microservice built with **Node.js + Express** that shortens long URLs, applies expiry rules, supports custom codes, and tracks usage analytics.

---

## 🚀 Features
- Shorten long URLs into unique short codes.
- Optional **custom shortcode** (alphanumeric, unique).
- **Default validity = 30 minutes**, configurable in minutes.
- Redirect short URLs to original links until expiry.
- Retrieve **analytics**: total clicks, click details (timestamp, referrer, geo, ip).
- Mandatory **custom logging middleware** (all requests/errors written to `logs/`).
- Robust error handling (`400`, `404`, `409`, `410`).

---

## 🛠️ Tech Stack
- **Node.js + Express**
- **nanoid** for unique shortcode generation
- **Custom Logging Middleware** (file-based)
- **In-memory Map** as storage (sufficient for this assessment)

---

---

## ⚙️ Setup & Run
```bash
# Clone repo
git clone https://github.com/vamsi746/22AK1A0561.git
cd 22AK1A0561

# Install dependencies
npm install

# Start in dev mode
npm run dev

# Or production mode
npm start
```


