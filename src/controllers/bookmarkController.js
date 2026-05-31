const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res) => {
    try {
        const userID = req.query.userID || 'default';
        const bookmarks = await Bookmark.find({ userID });
        res.json({ success: true, count: bookmarks.length, data: bookmarks });
    } catch (error) {
        console.error('Error fetching bookmarks:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch bookmarks' });
    }
};

exports.addBookmark = async (req, res) => {
    try {
        const { userID = 'default', spotID, spotName, borough, neighborhood } = req.body;

        if (!spotID || !spotName || !borough || !neighborhood) {
            return res.status(400).json({ success: false, error: 'spotID, spotName, borough and neighborhood are required' });
        }

        const bookmark = await Bookmark.create({ userID, spotID, spotName, borough, neighborhood });
        res.status(201).json({ success: true, data: bookmark });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Spot already bookmarked' });
        }
        console.error('Error adding bookmark:', error.message);
        res.status(500).json({ success: false, error: 'Failed to add bookmark' });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        const userID = req.query.userID || 'default';
        const spotID = parseInt(req.params.id);

        const result = await Bookmark.findOneAndDelete({ userID, spotID });

        if (!result) {
            return res.status(404).json({ success: false, error: 'Bookmark not found' });
        }

        res.json({ success: true, message: 'Bookmark removed' });
    } catch (error) {
        console.error('Error removing bookmark:', error.message);
        res.status(500).json({ success: false, error: 'Failed to remove bookmark' });
    }
};