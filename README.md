# NYC WiFi Finder — Backend

REST API for the NYC WiFi Finder iOS app. Handles bookmarks stored in MongoDB and personalized WiFi spot recommendations using vector similarity search.

## How recommendations work

All 500 NYC WiFi spots are embedded into 1024-dimension vectors using Voyage AI's `voyage-3-lite` model. Each spot is converted to a text description (name, neighborhood, borough) before embedding.

When a user requests recommendations, the backend:
1. Fetches the embeddings of all their bookmarked spots
2. Averages them into a single taste profile vector
3. Computes cosine similarity between the profile and every unbookmarked spot
4. Returns the top 10 most similar spots with a reason string

No user accounts needed — each device is identified by its `identifierForVendor` UUID.

## Tech stack

- Node.js + Express
- MongoDB + Mongoose
- Voyage AI (vector embeddings)
- NYC Open Data API

## Getting started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Voyage AI API key (free tier works)

### Setup

```bash
git clone https://github.com/bobbramillan/nyc-wifi-finder-backend.git
cd nyc-wifi-finder-backend
npm install
```

Create a `.env` file in the root:

```
PORT=3000
NYC_WIFI_API=https://data.cityofnewyork.us/resource/yjub-udmw.json
MONGODB_URI=your_mongodb_connection_string
VOYAGE_API_KEY=your_voyage_api_key
```

```bash
npm run dev
```

On first run the server seeds all 500 WiFi spots with embeddings into MongoDB. This takes ~30 minutes on Voyage AI's free tier (rate limited to 3 requests/min). It only runs once — subsequent starts detect existing data and skip seeding.

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wifi` | All 500 NYC WiFi spots |
| GET | `/api/wifi/:id` | Single spot by ID |
| GET | `/api/bookmarks?userID=x` | Get bookmarks for a device |
| POST | `/api/bookmarks` | Save a bookmark |
| DELETE | `/api/bookmarks/:spotID?userID=x` | Remove a bookmark |
| POST | `/api/recommendations` | Get recommendations based on bookmarks |
| GET | `/health` | Health check |

### Bookmark request body

```json
{
  "userID": "device-uuid",
  "spotID": 10604,
  "spotName": "Baisley Pond Park",
  "borough": "Queens",
  "neighborhood": "Springfield Gardens North"
}
```

### Recommendation request body

```json
{
  "userID": "device-uuid",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

## Data source

[NYC Open Data — WiFi Hotspot Locations](https://data.cityofnewyork.us/City-Government/NYC-Wi-Fi-Hotspot-Locations/yjub-udmw/about_data)

## Author

Bavanan Bramillan · [GitHub](https://github.com/bobbramillan)

## License

MIT