const { getAnalysisData } = require('../services/analyticsService')
exports.getAnalytics = async (req, res, next) => {
    try {
        const result = await getAnalysisData();
        res.status(result.status).json(result.data);
    }catch (error){
        next(error);
    }
};