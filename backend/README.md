# ClimateSense Backend

This service provides the API and real-time layer for the ClimateSense IoT monitoring dashboard. It accepts sensor readings, stores them in MongoDB when configured, falls back to in-memory demo data otherwise, and streams updates to the frontend over Socket.IO.

## Local development

From this folder:

```bash
npm install
npm run dev
```

The server runs on `http://localhost:5000` by default.

## Environment variables

Create a `.env` file in this directory:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
API_KEY=replace-with-a-long-random-value
```

If `MONGODB_URI` is omitted, the backend starts in demo mode with seeded data. If `API_KEY` is omitted, it uses the development fallback key `climatesense-demo-key`.

## Reading schema

The `Reading` model stores:

| Field | Type | Notes |
| --- | --- | --- |
| `temperature` | Number | Required |
| `humidity` | Number | Required |
| `deviceId` | String | Defaults to `esp32-demo` |
| `pressure` | Number | Optional, defaults to `1010` |
| `windSpeed` | Number | Optional, defaults to `0` |
| `createdAt` | Date | Auto-generated |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Backend health and storage mode |
| `GET` | `/api/weather/latest` | Latest reading |
| `GET` | `/api/weather/history?range=1h\|24h\|7d` | Historical readings |
| `GET` | `/api/weather/stats?range=1h\|24h\|7d` | Summary statistics |
| `POST` | `/api/weather` | Save a new reading; requires API key |

Example POST:

```bash
curl -X POST http://localhost:5000/api/weather \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: replace-with-a-long-random-value' \
  -d '{"deviceId":"esp32-belgaum-01","temperature":28.4,"humidity":61}'
```

The request accepts numeric `temperature` and `humidity`, plus optional `pressure` and `windSpeed`. A successful save returns HTTP `201` and emits a `newReading` Socket.IO event.

## Frontend integration

The frontend defaults to `http://localhost:5000` for REST and Socket.IO traffic. If the backend is hosted elsewhere, set:

```dotenv
VITE_API_URL=https://your-backend.example.com
VITE_SOCKET_URL=https://your-backend.example.com
```

## Deployment

For Render, use this folder as the service root, `npm install` as the build command, and `npm start` as the start command. Set `MONGODB_URI` and `API_KEY` in the deployment environment and use `/api/health` for health checks.

See the project-level [README.md](../README.md) for frontend setup and the ESP32 sample sketch.
