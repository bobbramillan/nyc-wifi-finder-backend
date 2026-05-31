const express = require('express');
const router = express.Router();
const wifiController = require('../controllers/wifiController');

// GET /api/wifi - get all NYC wifi spots
router.get('/', wifiController.getWiFiSpots);

// GET /api/wifi/:id - get a single spot by ID
router.get('/:id', wifiController.getWiFiSpotById);

module.exports = router;