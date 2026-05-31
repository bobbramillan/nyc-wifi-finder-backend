const axios = require('axios');
const WiFiSpotModel = require('../models/WiFiSpot');
const { embedTexts, spotToText } = require('./embeddingService');

function mapBoroughCode(code) {
    switch (code) {
        case '1': return 'Manhattan';
        case '2': return 'The Bronx';
        case '3': return 'Brooklyn';
        case '4': return 'Queens';
        case '5': return 'Staten Island';
        default:  return 'Unknown';
    }
}

function cleanName(name, neighborhood) {
    if (!name || /^[a-z]{2}-\d{2}-\d+$/i.test(name)) {
        return neighborhood ? `LinkNYC Kiosk - ${neighborhood}` : 'LinkNYC Kiosk';
    }
    return name;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedSpots() {
    const count = await WiFiSpotModel.countDocuments();

    if (count >= 500) {
        console.log(`Spots already seeded (${count} spots in DB), skipping.`);
        return;
    }

    const existing = await WiFiSpotModel.find({}, { spotID: 1 });
    const existingIDs = new Set(existing.map(s => s.spotID));
    console.log(`Resuming seed — ${existingIDs.size} spots already done.`);

    const response = await axios.get(`${process.env.NYC_WIFI_API}?$limit=500`);
    const raw = response.data;

    const spots = raw
        .filter(item => item.objectid && item.latitude && item.longitude)
        .map(item => ({
            spotID: parseInt(item.objectid),
            name: cleanName(item.name, item.ntaname),
            location: item.location || 'NYC',
            borough: mapBoroughCode(item.borough),
            neighborhood: item.ntaname || 'Unknown',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude)
        }))
        .filter(spot => !existingIDs.has(spot.spotID));

    console.log(`${spots.length} spots left to seed...`);

    const batchSize = 10;
    for (let i = 0; i < spots.length; i += batchSize) {
        const batch = spots.slice(i, i + batchSize);
        const texts = batch.map(spotToText);
        const embeddings = await embedTexts(texts);

        for (let j = 0; j < batch.length; j++) {
            batch[j].embedding = embeddings[j];
        }

        await WiFiSpotModel.insertMany(batch);
        console.log(`Seeded ${existingIDs.size + i + batch.length}/${existingIDs.size + spots.length} spots`);

        if (i + batchSize < spots.length) {
            console.log('Waiting 25s to respect rate limit...');
            await sleep(25000);
        }
    }

    console.log('Seeding complete!');
}

module.exports = seedSpots;