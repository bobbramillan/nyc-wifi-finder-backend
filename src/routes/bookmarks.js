const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

// GET /api/bookmarks - get all bookmarks for a user
router.get('/', bookmarkController.getBookmarks);

// POST /api/bookmarks - add a bookmark
router.post('/', bookmarkController.addBookmark);

// DELETE /api/bookmarks/:id - remove a bookmark
router.delete('/:id', bookmarkController.removeBookmark);

module.exports = router;