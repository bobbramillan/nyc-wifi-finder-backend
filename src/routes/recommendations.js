const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// POST /api/recommendations
router.post('/', recommendationController.getRecommendations);

module.exports = router;