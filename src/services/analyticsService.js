const db = require('../models/url');
const redisClient = require("../config/redis");

async function getAnalysisData() {
    try {
        // Try to get analytics data from cache
        const cached = await redisClient.get("analytics");
        if (cached) {
            // Add success message when sending response, but don't store it in Redis
            const analyticsData = JSON.parse(cached);
            return {
                status: 200,
                data: {
                    ...analyticsData,
                    message: "Analytics data fetched successfully"
                }
            };
        }

        // Get total number of URLs
        const totalUrls = await db.countDocuments();

        if (totalUrls === 0) {
            const noRecordData = { message: "No record found" };
            // Optionally cache the "no record" message
            await redisClient.set("analytics", JSON.stringify(noRecordData), "EX", 60);
            return { status: 200, data: noRecordData };
        }

        // Get latest 10 URLs
        const latestUrls = await db.find().sort({ createdAt: -1 }).limit(10);
        const urls = latestUrls.map(url => ({
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt
        }));

        // Aggregate total clicks
        const totalClicksAgg = await db.aggregate([
            { $group: { _id: null, totalClicks: { $sum: "$clicks" } } }
        ]);
        const totalClicks = totalClicksAgg.length > 0 ? totalClicksAgg[0].totalClicks : 0;

        // Store only analytics data in Redis, not the message
        const analyticsData = {
            totalUrls,
            totalClicks,
            recentUrls: urls
        };

        // Cache the analytics data for 60 seconds
        await redisClient.set("analytics", JSON.stringify(analyticsData), "EX", 60);

        // Add success message to response
        return {
            status: 200,
            data: {
                ...analyticsData,
                message: "Analytics data fetched successfully"
            }
        };
    } catch (error) {
        // In case of error, return a 500 status and error message
        return {
            status: 500,
            data: { message: "Failed to fetch analytics data", error: error.message }
        };
    }
}

module.exports = { getAnalysisData };