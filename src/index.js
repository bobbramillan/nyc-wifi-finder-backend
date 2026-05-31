require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const seedSpots = require('./services/seedSpots');

const wifiRoutes = require('./routes/wifi');
const bookmarkRoutes = require('./routes/bookmarks');
const recommendationRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    seedSpots();
});

app.use(cors());
app.use(express.json());

app.use('/api/wifi', wifiRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'NYC WiFi Finder API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});