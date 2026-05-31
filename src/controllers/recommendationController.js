const WiFiSpotModel = require('../models/WiFiSpot');
const Bookmark = require('../models/Bookmark');
const { embedTexts, spotToText } = require('../services/embeddingService');

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

exports.getRecommendations = async (req, res) => {
    try {
        const { userID = 'default', latitude, longitude } = req.body;

        // Get user's bookmarked spot IDs
        const bookmarks = await Bookmark.find({ userID });

        if (bookmarks.length === 0) {
            // Cold start — return nearest spots if location provided
            if (!latitude || !longitude) {
                return res.json({ success: true, count: 0, data: [] });
            }

            const allSpots = await WiFiSpotModel.find({}, { embedding: 0 });
            const nearest = allSpots
                .map(spot => ({
                    ...spot.toObject(),
                    distance: Math.sqrt(
                        Math.pow(spot.latitude - latitude, 2) +
                        Math.pow(spot.longitude - longitude, 2)
                    ),
                    reason: 'Near you — bookmark spots to get personalised picks'
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);

            return res.json({ success: true, count: nearest.length, data: nearest });
        }

        const bookmarkedIDs = bookmarks.map(b => b.spotID);

        // Fetch embeddings of bookmarked spots
        const bookmarkedSpots = await WiFiSpotModel.find({ spotID: { $in: bookmarkedIDs } });

        if (bookmarkedSpots.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        // Average the embeddings into a taste profile
        const embeddingLength = bookmarkedSpots[0].embedding.length;
        const profileEmbedding = new Array(embeddingLength).fill(0);

        for (const spot of bookmarkedSpots) {
            for (let i = 0; i < embeddingLength; i++) {
                profileEmbedding[i] += spot.embedding[i];
            }
        }
        for (let i = 0; i < embeddingLength; i++) {
            profileEmbedding[i] /= bookmarkedSpots.length;
        }

        // Find all spots not already bookmarked
        const candidateSpots = await WiFiSpotModel.find({ spotID: { $nin: bookmarkedIDs } });

        // Score each candidate by cosine similarity to the profile
        const scored = candidateSpots.map(spot => {
            const similarity = cosineSimilarity(profileEmbedding, spot.embedding);
            const topMatch = bookmarkedSpots.reduce((best, b) => {
                const s = cosineSimilarity(b.embedding, spot.embedding);
                return s > best.score ? { score: s, name: b.name } : best;
            }, { score: 0, name: '' });

            return {
                spotID: spot.spotID,
                name: spot.name,
                location: spot.location,
                borough: spot.borough,
                neighborhood: spot.neighborhood,
                latitude: spot.latitude,
                longitude: spot.longitude,
                score: Math.round(similarity * 100),
                reason: `Similar to "${topMatch.name}" which you bookmarked`
            };
        });

        const top10 = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        res.json({ success: true, count: top10.length, data: top10 });
    } catch (error) {
        console.error('Recommendation error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
    }
};