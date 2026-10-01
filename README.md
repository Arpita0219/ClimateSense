# ClimateSense

ClimateSense is a full-stack IoT environmental monitoring project built for a smart campus or field deployment. It combines an ESP32-powered sensor setup with a Node.js backend and a React dashboard to track temperature, humidity, air quality, pressure, light, soil moisture, wind speed, and related environment metrics in real time.

```text
ESP32 / DHT11 sensors -> Express API -> MongoDB or demo storage -> React dashboard
                                  \-> Socket.IO live updates
```

The dashboard includes Overview, Live Data, Forecast, Charts, Map, and Devices views, and it supports live updates, historical analysis, CSV export, and a responsive monitoring interface. The forecast and map content are illustrative UI placeholders unless a real data source is added.

## Project layout

```text
backend/
  server.js        Express API, Socket.IO server, MongoDB integration
  package.json
  README.md
frontend/
  src/             React dashboard and UI logic
  public/
  package.json
  vite.config.js
README.md
```

## Features

- Real-time dashboard updates using Socket.IO
- REST API for latest, historical, and summary readings
- MongoDB persistence with automatic in-memory fallback for demo mode
- CSV export for recent readings
- Responsive interface for campus/environment monitoring
- ESP32 and DHT11-compatible sensor flow for local IoT deployments

## Tech stack

- Frontend: React, Vite, Recharts, Tailwind CSS, Lucide icons, Socket.IO client
- Backend: Node.js, Express, Mongoose, Socket.IO, CORS, dotenv
- Database: MongoDB Atlas or local MongoDB instance
- Hardware: ESP32 + DHT11 (or similar temperature/humidity sensors)

## Requirements

- Node.js 18+ recommended; 20+ is preferred for the current frontend toolchain
- npm
- MongoDB URI for persistent storage, or leave it unset to use demo mode
- Arduino IDE with ESP32 support and the DHT sensor library for hardware uploads

## Local setup

Open two terminals in the repository root.

### 1) Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the frontend terminal, usually `http://localhost:5173`.

## Environment variables

### Backend

Create `backend/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
API_KEY=replace-with-a-long-random-value
```

For a local MongoDB instance:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/climatesense
```

Notes:
- If `MONGODB_URI` is not set, the app runs in demo mode and uses in-memory readings.
- If `API_KEY` is not set, the default development key is `climatesense-demo-key`.
- For production or real hardware, set a strong API key before deployment.

### Frontend

Create `frontend/.env` when the backend is hosted elsewhere:

```dotenv
VITE_API_URL=https://your-backend.example.com
VITE_SOCKET_URL=https://your-backend.example.com
```

If these are omitted, the frontend uses `http://localhost:5000` by default.

## API endpoints

The backend listens on `http://localhost:5000` by default.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API health and database/demo-mode status |
| `GET` | `/api/weather/latest` | Most recent sensor reading |
| `GET` | `/api/weather/history?range=1h\|24h\|7d` | Historical readings in chronological order |
| `GET` | `/api/weather/stats?range=1h\|24h\|7d` | Min/max/average temperature and humidity |
| `POST` | `/api/weather` | Store a new reading; requires `x-api-key` |

Example request:

```bash
curl -X POST http://localhost:5000/api/weather \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: replace-with-a-long-random-value' \
  -d '{"deviceId":"esp32-belgaum-01","temperature":28.4,"humidity":61}'
```

`deviceId` is optional and defaults to `esp32-demo`. `pressure` and `windSpeed` are optional numeric values. A successful POST returns HTTP `201` and emits a Socket.IO `newReading` event that the dashboard listens for.

## ESP32 + DHT11 example

Install the Arduino DHT library and connect the sensor as follows:
- DHT11 VCC -> 3.3V
- DHT11 GND -> GND
- DHT11 DATA -> GPIO 4

Example sketch:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* WIFI_SSID = "your-wifi-name";
const char* WIFI_PASSWORD = "your-wifi-password";
const char* API_URL = "http://192.168.1.10:5000/api/weather";
const char* API_KEY = "replace-with-a-long-random-value";
const char* DEVICE_ID = "esp32-belgaum-01";

constexpr int DHTPIN = 4;
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected, IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT11 read failed");
    delay(10000);
    return;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  String body = "{\"deviceId\":\"" + String(DEVICE_ID) +
                "\",\"temperature\":" + String(temperature, 1) +
                ",\"humidity\":" + String(humidity, 1) + "}";

  int statusCode = http.POST(body);
  Serial.printf("POST status: %d\n", statusCode);
  if (statusCode > 0) {
    Serial.println(http.getString());
  }
  http.end();

  delay(10000);
}
```

> Use the LAN IP of the machine running the backend instead of `localhost` when posting from the ESP32. The device must be able to reach the server over the same network.

## Why the API key is important

The API key is used to protect the sensor data submission endpoint between the ESP32 and the backend.

Without the API key, anyone who knows your backend URL could send fake readings:

```json
{
  "temperature": 100,
  "humidity": 5,
  "deviceId": "fake-device"
}
```

That would allow unauthorized data to be submitted to the backend and potentially stored in MongoDB.

With the API key enabled, the ESP32 sends the secret together with the sensor data:

```http
POST /api/weather
x-api-key: my-secret-key
```

The backend verifies it before saving any reading:

```js
if (req.headers['x-api-key'] !== process.env.API_KEY) {
  return res.status(401).json({ message: 'Unauthorized' });
}
```

So in this project, the API key is mainly an authentication layer for the ESP32-to-backend communication. It does not measure temperature, connect to Wi-Fi, or connect to MongoDB by itself; it simply ensures only authorized devices can send sensor data.

> In one sentence: “The API key authenticates the ESP32 device when sending sensor readings to the backend and prevents unauthorized devices from submitting data.”

## Deployment notes

### Render backend

- Set the service root to `backend/`
- Build command: `npm install`
- Start command: `npm start`
- Configure `MONGODB_URI` and `API_KEY` in environment variables
- Health check path: `/api/health`

### Vercel frontend

- Set the project root to `frontend/`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` and `VITE_SOCKET_URL` to point to the deployed backend

## Validation

```bash
cd frontend
npm run build
npm run lint
```

```bash
cd backend
node --check server.js
```

This project is designed to be easy to run locally and to scale into a public-facing IoT monitoring dashboard with real sensor data or a hosted backend.
