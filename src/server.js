require('dotenv').config();
const path = require('path');
const app = require('./app');
const analyticsRoutes = require('./routes/analyticsRoutes');
const urlRoutes = require('./routes/urlRoutes');
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // API routes - mount under /api prefix to avoid conflicts with frontend
  app.use('/api', analyticsRoutes);
  app.use('/api', urlRoutes);

  // URL redirection route - only match valid short codes (alphanumeric, 6-12 chars)
  const { redirectUrl } = require('./controllers/urlController');
  app.get('/:shortId', (req, res, next) => {
    const shortId = req.params.shortId;
    if (!/^[a-zA-Z0-9_-]{6,12}$/.test(shortId)) {
      return next();
    }
    redirectUrl(req, res, next);
  });

  // Catch-all handler: send back index.html file for any non-API routes
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see your URL shortener`);
  });
});
