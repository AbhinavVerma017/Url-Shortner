# URL Shortener

<div align="center">

<img src="public/favicon.ico" width="64" alt="Logo" />

<p>
<a href="#"><img alt="Node" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white"></a>
<a href="#"><img alt="Express" src="https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white"></a>
<a href="#"><img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas%20or%20Local-47A248?logo=mongodb&logoColor=white"></a>
<a href="#"><img alt="Redis" src="https://img.shields.io/badge/Redis-Cache--First-DC382D?logo=redis&logoColor=white"></a>
<a href="#"><img alt="License" src="https://img.shields.io/badge/License-ISC-blue"></a>
</p>

</div>

A modern, Bitly-inspired URL shortener built with Node.js, Express, MongoDB, Redis caching, and a beautiful responsive frontend.

## Features

- 🚀 **Fast URL Shortening** - Create short links instantly
- 📊 **Analytics Dashboard** - Track clicks and link performance
- ⚡ **Redis Cache-First Redirects** - Hot paths served from cache for speed
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional interface inspired by Bitly
- 💾 **Local Storage** - Recent links saved in browser
- 🔗 **Click Tracking** - Monitor link usage and engagement
- 📋 **Copy to Clipboard** - One-click copying with visual feedback

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Redis (local or Upstash/Redis Cloud)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (example):
   ```env
   MONGO_URI=mongodb://localhost:27017/url_shortener # or Atlas connection string
   BASE_URL=http://localhost:5000
   PORT=5000
   # Redis (either REDIS_URL or host/port/db)
   # REDIS_URL=rediss://:<password>@<host>:<port>
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_DB=0
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:5000`

## Usage

1. **Shorten URLs**: Paste any long URL into the input field and click "Shorten"
2. **Copy Links**: Click the "Copy" button to copy your short URL to clipboard
3. **View Analytics**: Check the analytics section to see your link statistics
4. **Recent Links**: View and manage your recently created links

## API Endpoints

- `POST /api/shorten` - Create a new short URL. Body: `{ "originalUrl": "https://example.com" }`
  ```bash
  curl -X POST http://localhost:5000/api/shorten \
    -H "Content-Type: application/json" \
    -d '{"originalUrl":"https://example.com"}'
  ```

- `GET /:shortId` - Redirect to original URL (root-level short link)
  ```bash
  open http://localhost:5000/abc123
  ```

- `GET /api/analytics` - Get aggregated analytics (cached ~60s)
  ```bash
  curl http://localhost:5000/api/analytics
  ```

## Project Structure

```
src/
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── config/         # Database & Redis configuration
├── app.js          # Express app configuration
└── server.js       # Server entry point

public/
├── css/           # Stylesheets
├── js/            # Frontend JavaScript
└── index.html     # Main HTML file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Features in Detail

### Modern UI/UX
- Gradient hero section with call-to-action
- Card-based layout for features and analytics
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and visual feedback

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### Analytics
- Click tracking for each shortened URL
- Recent links history
- Visual statistics dashboard
- Local storage for offline functionality

### Caching Strategy (Redis)
- Redirects use a cache-first read on key `short:<shortCode>` with 1h TTL.
- Shorten flow caches both directions: `original:<url>` and `short:<code>`.
- Analytics are cached under `analytics` with a short TTL (~60s). Cache may be invalidated on creates/redirects to refresh data.

### Performance Notes
- Cache hit: 0 DB queries on redirect (Redis GET + async click increment)
- Cache miss: Single DB update + cache fill; subsequent hits are fast
- Analytics: TTL limits load; optional targeted invalidation keeps data fresh

### Architecture (High Level)
```
Client → Express (routes)
  → Services (shorten · redirect · analytics)
    → MongoDB (Url model)
    → Redis (cache: short:<code>, original:<url>, analytics)
```

## Resume-Ready Highlights
- Built URL shortener (Node/Express, MongoDB, Redis) with cache-first redirects
- Reduced DB reads on hot paths via Redis TTL caching
- Implemented analytics with TTL and selective invalidation for freshness
- Production-friendly: env-driven config, static hosting, structured services

### Environment Variables
- `MONGO_URI` (required): MongoDB connection string.
- `BASE_URL` (required): Base URL used when generating short links.
- `PORT` (optional): Defaults to 5000 locally; platforms often inject their own.
- Redis config via either `REDIS_URL` (preferred for Upstash) or `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`.

## Deployment (Free-tier friendly)

Recommended combo:
- App: Render (Web Service)
- MongoDB: MongoDB Atlas (M0)
- Redis: Upstash Redis (free)

Steps:
1. Push repository to GitHub.
2. Create MongoDB Atlas cluster (M0), allow network access, get connection string → set `MONGO_URI`.
3. Create Upstash Redis DB → set `REDIS_URL` (or host/port/db vars).
4. On Render → New Web Service → connect repo.
   - Start command: `node src/server.js`
   - Environment: set `PORT` (Render provides one), `MONGO_URI`, `BASE_URL` (your Render URL), and Redis vars.
5. Deploy and open your Render URL. Test `POST /api/shorten` and a short redirect.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.


# Url-Shortner
