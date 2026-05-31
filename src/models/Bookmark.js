const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    spotID: {
        type: Number,
        required: true
    },
    spotName: {
        type: String,
        required: true
    },
    borough: {
        type: String,
        required: true
    },
    neighborhood: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate bookmarks for the same user + spot
bookmarkSchema.index({ userID: 1, spotID: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);