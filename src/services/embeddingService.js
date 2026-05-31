const { VoyageAIClient } = require('voyageai');

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

// Convert a WiFi spot into a text description for embedding
function spotToText(spot) {
    return `WiFi hotspot named ${spot.name} located at ${spot.location} in ${spot.neighborhood}, ${spot.borough}, New York City.`;
}

// Generate embedding for a single spot
async function embedSpot(spot) {
    const result = await client.embed({
        input: [spotToText(spot)],
        model: 'voyage-3-lite'
    });
    return result.data[0].embedding;
}

// Generate embeddings for multiple texts in one batch
async function embedTexts(texts) {
    const result = await client.embed({
        input: texts,
        model: 'voyage-3-lite'
    });
    return result.data.map(d => d.embedding);
}

module.exports = { embedSpot, embedTexts, spotToText };