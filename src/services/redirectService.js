const db = require('../models/url');
const redisClient = require('../config/redis');

async function getUrlAndRedirect(shortId) {
  try {
    // 1. First, check if URL is cached in Redis
    const cachedUrl = await redisClient.get(`short:${shortId}`);
    if (cachedUrl) {
      // Update clicks in DB (async, no need to wait for redirect)
      db.findOneAndUpdate(
        { shortCode: shortId },
        { 
          $inc: { clicks: 1 }, 
          $push: { history: { timestamp: new Date() } } 
        }
      ).exec(); // non-blocking

      // Clear analytics cache so it gets fresh data next time
      try {
        await redisClient.del("analytics");
      } catch (redisError) {
        console.error("Failed to clear analytics cache:", redisError);
      }

      return cachedUrl; // return original URL directly from cache
    }

    // 2. If not cached, check DB
    const urlEntry = await db.findOne({ shortCode: shortId });
    if (!urlEntry) return null;

    // Increment clicks and add history
    urlEntry.clicks += 1;
    urlEntry.history.push({ timestamp: new Date() });
    await urlEntry.save();

    // 3. Cache the result for future redirects (1 hour)
    try {
      await redisClient.set(`short:${shortId}`, urlEntry.originalUrl, 'EX', 3600);
    } catch (redisError) {
      console.error("Failed to cache URL:", redisError);
      // Continue even if caching fails
    }

    // Clear analytics cache so it gets fresh data next time
    try {
      await redisClient.del("analytics");
    } catch (redisError) {
      console.error("Failed to clear analytics cache:", redisError);
    }

    return urlEntry.originalUrl;
  } catch (error) {
    console.error("Error in getUrlAndRedirect:", error);
    return null;
  }
}

module.exports = { getUrlAndRedirect };
