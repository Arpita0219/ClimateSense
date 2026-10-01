# Weather Monitor Backend

This Node.js and Express API stores ESP32 sensor readings in MongoDB using Mongoose.

## Endpoints

- GET /api/health
- GET /api/sensors/latest
- GET /api/sensors/history
- POST /api/sensors/data

Sensor history accepts an optional `limit` query parameter (1-1000, default 100).

## Run

```bash
cd backend
npm install
MONGODB_URI=mongodb://127.0.0.1:27017/climatesense npm run dev
```

Set `MONGODB_URI` to a local MongoDB instance or a MongoDB Atlas connection string before starting the backend. The API starts even if MongoDB is unavailable so `/api/health` can report its status, but sensor data endpoints return HTTP 503 until the database connects.

## Example POST body

```json
{
  "deviceId": "ESP32_01",
  "location": "Lab site",
  "temperature": 28.4,
  "humidity": 62.1,
  "light": 740,
  "aqi": 82,
  "co2": 612
}
```

Run the React dashboard from the repository root in a separate terminal with `npm install` and `npm run dev`. It reads the latest stored temperature, humidity, and light values from the API.
