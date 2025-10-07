const express = require('express');
const { getAnalytics } = require("../controllers/analyticsController");
var router = express.Router();

router.get('/analytics',getAnalytics);

module.exports = router;