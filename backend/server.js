import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const latestReading = {
  deviceId: 'ESP32_01',
  location: 'Lab site',
  temperature: 28.6,
  humidity: 64,
  light: 740,
  timestamp: new Date().toISOString(),
}

const history = [
  { ...latestReading, temperature: 27.8, humidity: 61, light: 690, timestamp: new Date(Date.now() - 60000).toISOString() },
  { ...latestReading, temperature: 28.1, humidity: 62, light: 710, timestamp: new Date(Date.now() - 120000).toISOString() },
  { ...latestReading, temperature: 28.6, humidity: 64, light: 740, timestamp: new Date(Date.now() - 180000).toISOString() },
]

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Weather monitor backend is running' })
})

app.get('/api/sensors/latest', (_req, res) => {
  res.json(latestReading)
})

app.get('/api/sensors/history', (_req, res) => {
  res.json(history)
})

app.post('/api/sensors/data', (req, res) => {
  const { temperature, humidity, light, deviceId, location } = req.body || {}

  if (temperature === undefined || humidity === undefined || light === undefined) {
    return res.status(400).json({ message: 'temperature, humidity, and light are required' })
  }

  const newReading = {
    deviceId: deviceId || 'ESP32_01',
    location: location || 'Lab site',
    temperature: Number(temperature),
    humidity: Number(humidity),
    light: Number(light),
    timestamp: new Date().toISOString(),
  }

  history.push(newReading)
  latestReading.deviceId = newReading.deviceId
  latestReading.location = newReading.location
  latestReading.temperature = newReading.temperature
  latestReading.humidity = newReading.humidity
  latestReading.light = newReading.light
  latestReading.timestamp = newReading.timestamp

  res.status(201).json({ message: 'Data received', data: newReading })
})

app.listen(PORT, () => {
  console.log(`Weather monitor backend running on http://localhost:${PORT}`)
})

export { app }
