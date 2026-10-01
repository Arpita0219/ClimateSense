# ClimateSense Dashboard

A climate monitoring dashboard built with React and Vite, backed by a Node.js and Express API that stores sensor readings in MongoDB.

## Features

- Live climate overview cards
- Air quality, temperature, humidity, and CO₂ monitoring
- Trend charts and historical data tables
- Device and location status panels
- Alert and insight sections for environmental monitoring

## Stack

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons
- Node.js and Express REST API
- MongoDB with Mongoose for persistent sensor readings

## Run locally

```bash
npm install
npm run dev
```

Start the API in another terminal after starting MongoDB:

```bash
cd backend
npm install
MONGODB_URI=mongodb://127.0.0.1:27017/climatesense npm run dev
```

The API accepts sensor readings at `POST http://localhost:5000/api/sensors/data`. Required fields are `temperature`, `humidity`, and `light`; optional fields include `deviceId`, `location`, `aqi`, `co2`, `pressure`, `soilMoisture`, `rainfall`, `windSpeed`, and `uvIndex`. Readings are retained in MongoDB and served by the latest and history endpoints.

## Build

```bash
npm run build
```

The dashboard keeps its existing layout and displays fallback sample values when no saved reading is available. Configure `MONGODB_URI` for persistent sensor storage.
