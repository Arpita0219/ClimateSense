# ClimateSense

ClimateSense is an IoT-based smart weather monitoring system that collects live environmental data from an ESP32 connected to a DHT11 sensor and displays it through a modern dashboard. The project is designed for real-time monitoring of temperature, humidity, and related atmospheric conditions in a campus, lab, or field environment.

The system connects three main layers:

```text
DHT11 Sensor -> ESP32 -> Backend API -> MongoDB / Demo Storage -> React Dashboard
                                    \-> Socket.IO live updates
```

This project demonstrates how sensor data can be acquired from hardware, validated by a secure backend, stored persistently, and presented in an interactive UI for analysis and monitoring.

## Why this project exists

Many environmental monitoring systems still depend on manual checking or disconnected spreadsheets. ClimateSense solves that by creating an automated, connected solution where sensor readings are captured continuously and made visible in real time through a web dashboard.

The project is useful for:
- indoor or outdoor environmental monitoring
- smart campus or lab tracking
- field monitoring in rural or agricultural areas
- learning IoT, backend, and frontend integration
- showcasing end-to-end embedded system development

## Project overview

ClimateSense includes:
- ESP32-based sensor reading from DHT11
- secure HTTP POST requests to a backend
- Express.js API for weather data handling
- MongoDB persistence when configured
- demo-mode fallback for local testing
- Socket.IO live updates to the frontend
- React dashboard for overview, history, charts, and device monitoring

## System architecture

```text
+------------------+      +---------------------+      +--------------------+
| DHT11 Sensor     | ---> | ESP32 Controller    | ---> | Express Backend    |
| Temperature      |      | Wi-Fi + HTTP client |      | Node.js + MongoDB  |
| Humidity         |      | Sends sensor data   |      | Socket.IO          |
+------------------+      +---------------------+      +--------------------+
                                                            |
                                                            v
                                                  +--------------------+
                                                  | React Frontend     |
                                                  | Charts + Dashboard |
                                                  +--------------------+
```

The backend acts as the central service that receives readings, validates them, optionally stores them, and pushes the latest data to the frontend in real time.

## Features

- Live temperature and humidity monitoring
- ESP32 sensor integration with DHT11
- Secure API key validation for unauthorized submissions
- MongoDB storage with fallback demo mode
- Historical data retrieval by range
- Summary statistics for min, max, and average values
- Socket.IO real-time updates
- CSV export support in the dashboard
- Responsive UI for monitoring on desktop or smaller screens
- Device-connected status and sensor health presentation

## Tech stack

### Frontend
- React
- Vite
- Recharts
- Tailwind CSS
- Lucide icons
- Socket.IO client

### Backend
- Node.js
- Express.js
- Mongoose
- MongoDB
- Socket.IO
- dotenv
- CORS

### Hardware
- ESP32 development board
- DHT11 temperature and humidity sensor

## Folder structure

```text
backend/
  server.js               Express server, API routes, Socket.IO, MongoDB logic
  package.json            Backend dependencies and scripts
  README.md               Backend-specific documentation
frontend/
  src/                    React dashboard source files
  public/                 Static assets
  package.json            Frontend dependencies and scripts
  vite.config.js         Vite configuration
README.md                 Project overview and setup guide
```

## Requirements

Before running the project, make sure you have:
- Node.js 18+ or newer
- npm installed
- MongoDB Atlas account or local MongoDB server (optional for demo mode)
- Arduino IDE with ESP32 board support
- DHT sensor library installed for the Arduino sketch

## Local setup

Open two terminals in the repository root.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the URL shown in the frontend terminal, usually:

```text
http://localhost:5173
```

## Environment variables

### Backend

Create a file named `.env` inside `backend/`:

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
- If `MONGODB_URI` is missing, the app runs in demo mode with in-memory readings.
- If `API_KEY` is missing, the default development key is `climatesense-demo-key`.
- For real hardware or deployment, set a strong API key.

### Frontend

Create a `.env` file inside `frontend/` when your backend is hosted elsewhere:

```dotenv
VITE_API_URL=https://your-backend.example.com
VITE_SOCKET_URL=https://your-backend.example.com
```

If these are not set, the frontend uses:

```text
http://localhost:5000
```

## API endpoints

The API is hosted by the backend on `http://localhost:5000` by default.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Checks if the backend is running and whether MongoDB is connected |
| `GET` | `/api/weather/latest` | Returns the most recent sensor reading |
| `GET` | `/api/weather/history?range=1h\|24h\|7d` | Returns readings inside a selected time range |
| `GET` | `/api/weather/stats?range=1h\|24h\|7d` | Returns min, max, and average temperature and humidity |
| `POST` | `/api/weather` | Saves a sensor reading; requires `x-api-key` |

Example request:

```bash
curl -X POST http://localhost:5000/api/weather \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: replace-with-a-long-random-value' \
  -d '{"deviceId":"esp32-belgaum-01","temperature":28.4,"humidity":61}'
```

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

> Use the LAN IP of the machine running the backend instead of `localhost` when sending data from the ESP32.

## Why the API key is important

The API key protects the data submission endpoint so that only the ESP32 can send readings to the backend.

Without the API key, anyone who discovers the backend URL could send fake sensor data and pollute the database.

```http
POST /api/weather
x-api-key: my-secret-key
```

The backend checks the header before saving data:

```js
if (req.headers['x-api-key'] !== process.env.API_KEY) {
  return res.status(401).json({ message: 'Unauthorized' });
}
```

This is a security measure for the ESP32-to-backend communication and helps prevent unauthorized or fake sensor submissions.

## Deployment notes

### Render backend

- Set the service root to `backend/`
- Build command: `npm install`
- Start command: `npm start`
- Add `MONGODB_URI` and `API_KEY` in Render environment settings
- Health check path: `/api/health`

### Vercel frontend

- Set the project root to `frontend/`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to the hosted backend

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

## Summary

ClimateSense is a practical IoT project that combines embedded hardware, backend APIs, and a real-time web dashboard into a complete environmental monitoring solution. It demonstrates how a small sensor node can collect data, send it securely to a server, store it, and visualize it for decision-making in near real time.

This project is suitable for learning, demonstration, and extension to larger smart environment monitoring systems.
