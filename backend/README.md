# Weather Monitor Backend

This backend is a simple Express API for the ESP32 weather and environment monitoring dashboard.

## Endpoints

- GET /api/health
- GET /api/sensors/latest
- GET /api/sensors/history
- POST /api/sensors/data

## Run

```bash
cd backend
npm install
npm run dev
```

## Example POST body

```json
{
  "deviceId": "ESP32_01",
  "location": "Lab site",
  "temperature": 28.4,
  "humidity": 62.1,
  "light": 740
}
```
