const {shortenUrl} = require('../services/shortenService');
const { getUrlAndRedirect } = require('../services/redirectService');
const db = require('../models/url')

exports.createShortUrl = async (req, res, next) => {
  try {
    const result = await shortenUrl(req.body.originalUrl);
    res.status(result.status).json(result.data);
  }catch(error){
    next(error);
  }
}

exports.redirectUrl = async (req, res, next) => {
  try {
    const redirectTo = await getUrlAndRedirect(req.params.shortId);
    if (!redirectTo) return res.status(404).json({ error: "Short URL not found" });
    res.redirect(redirectTo);
  } catch (error) {
    next(error);
  }
};




