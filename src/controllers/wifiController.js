const axios = require('axios');

const NYC_WIFI_API = process.env.NYC_WIFI_API;

exports.getWiFiSpots = async (req, res) => {
    try {
        const limit = req.query.limit || 500;
        const borough = req.query.borough;

        let url = `${NYC_WIFI_API}?$limit=${limit}`;
        if (borough) {
            url += `&borough=${borough}`;
        }

        const response = await axios.get(url);

        const spots = response.data
            .filter(item => item.objectid && item.latitude && item.longitude)
            .map(item => ({
                id: parseInt(item.objectid),
                name: item.name || 'Public WiFi',
                location: item.location || 'NYC',
                borough: mapBoroughCode(item.borough),
                neighborhood: item.ntaname || 'Unknown',
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude)
            }));

        res.json({ success: true, count: spots.length, data: spots });
    } catch (error) {
        console.error('Error fetching WiFi spots:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch WiFi spots' });
    }
};

exports.getWiFiSpotById = async (req, res) => {
    try {
        const { id } = req.params;
        const url = `${NYC_WIFI_API}?objectid=${id}`;

        const response = await axios.get(url);

        if (!response.data.length) {
            return res.status(404).json({ success: false, error: 'WiFi spot not found' });
        }

        const item = response.data[0];
        const spot = {
            id: parseInt(item.objectid),
            name: item.name || 'Public WiFi',
            location: item.location || 'NYC',
            borough: mapBoroughCode(item.borough),
            neighborhood: item.ntaname || 'Unknown',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude)
        };

        res.json({ success: true, data: spot });
    } catch (error) {
        console.error('Error fetching WiFi spot:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch WiFi spot' });
    }
};

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