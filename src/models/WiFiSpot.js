const mongoose = require('mongoose');

const wifiSpotSchema = new mongoose.Schema({
    spotID: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String },
    borough: { type: String },
    neighborhood: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    embedding: { type: [Number], default: [] }
});

module.exports = mongoose.model('WiFiSpot', wifiSpotSchema);