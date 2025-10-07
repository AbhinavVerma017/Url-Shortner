const db = require('../models/url');
const shortid = require('shortid');
const redisClient = require('../config/redis');


async function shortenUrl(originalUrl) {
    try {
        if (!originalUrl) {
            return { status: 400, data: { error: "Original URL is required" } };
        }

        // Basic URL validation
        try {
            new URL(originalUrl);
        } catch {
            return { status: 400, data: { error: "Invalid URL format" } };
        }

        // 1. First check Redis cache
        const cached = await redisClient.get(`original:${originalUrl}`);
        if (cached) {
            const cachedData = JSON.parse(cached);
            return {
                status: 200,
                data: {
                    ...cachedData,
                    message: "URL already exists (from cache)"
                }
            };
        }

        // 2. Check database
        const existingUrl = await db.findOne({ originalUrl });
        if (existingUrl) {
            const existingData = {
                shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
                originalUrl: originalUrl,
                shortCode: existingUrl.shortCode,
            };

            // Cache the result
            try {
                await redisClient.set(`original:${originalUrl}`, JSON.stringify(existingData), "EX", 3600);
                await redisClient.set(`short:${existingUrl.shortCode}`, originalUrl, "EX", 3600);
            } catch (redisError) {
                console.error("Failed to cache existing URL:", redisError);
            }

            return {
                status: 200,
                data: {
                    ...existingData,
                    message: "URL already exists"
                }
            }
        }
        
        // 3. Create new short URL
        const shortCode = shortid.generate();
        const shortUrl = new db({ originalUrl, shortCode });
        await shortUrl.save();

        const newData = {
            shortUrl: `${process.env.BASE_URL}/${shortCode}`,
            originalUrl,
            shortCode,
        };

        // Cache the new URL
        try {
            await redisClient.set(`original:${originalUrl}`, JSON.stringify(newData), "EX", 3600);
            await redisClient.set(`short:${shortCode}`, originalUrl, "EX", 3600);
        } catch (redisError) {
            console.error("Failed to cache new URL:", redisError);
        }

        // Clear analytics cache since we have new data
        try {
            await redisClient.del("analytics");
        } catch (redisError) {
            console.error("Failed to clear analytics cache:", redisError);
        }

        return {
            status: 201,
            data: {
                ...newData,
                message: "New short URL created"
            }
        };
    } catch (error) {
        console.error("Error in shortenUrl:", error);
        return { status: 500, data: { error: "Failed to create short URL" } };
    }
}


module.exports = { shortenUrl };