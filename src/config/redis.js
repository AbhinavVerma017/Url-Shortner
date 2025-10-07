// config/redis.js
const Redis = require("ioredis");

const redisClient = new Redis(
  process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
  }
);

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

process.on("SIGINT", async () => {
  await redisClient.quit();
  console.log("Redis connection closed. Exiting process...");
  process.exit(0);
});

module.exports = redisClient;
