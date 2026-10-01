import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io'
import 'dotenv/config'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const PORT = Number(process.env.PORT || 5000)
const API_KEY = process.env.API_KEY || 'climatesense-demo-key'
const MONGODB_URI = process.env.MONGODB_URI || ''
const fallbackReadings = buildSeedReadings()

const readingSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, default: 'esp32-demo' },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, default: 1010 },
    windSpeed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

const Reading = mongoose.models.Reading || mongoose.model('Reading', readingSchema)

function buildSeedReadings() {
  const readings = []
  const now = Date.now()

  for (let index = 0; index < 24; index += 1) {
    const time = new Date(now - (23 - index) * 60 * 60 * 1000)
    const temperature = 24 + Math.sin(index / 3) * 4 + (index % 5) * 0.6
    const humidity = 56 + Math.cos(index / 4) * 12 + (index % 4) * 2

    readings.push({
      deviceId: 'esp32-demo',
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(0)),
      pressure: 1008 + (index % 4),
      windSpeed: 8 + (index % 6),
      createdAt: time.toISOString(),
    })
  }

  return readings
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1
}

function normalizeReading(rawReading = {}) {
  const temperature = Number(rawReading.temperature)
  const humidity = Number(rawReading.humidity)

  if (!Number.isFinite(temperature) || !Number.isFinite(humidity)) {
    throw new Error('temperature and humidity must be numeric values')
  }

  return {
    deviceId: String(rawReading.deviceId || 'esp32-demo').trim() || 'esp32-demo',
    temperature: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(0)),
    pressure: Number(rawReading.pressure ?? 1010),
    windSpeed: Number(rawReading.windSpeed ?? 0),
    createdAt: rawReading.createdAt ? new Date(rawReading.createdAt).toISOString() : new Date().toISOString(),
  }
}

async function persistReading(readingPayload) {
  const reading = normalizeReading(readingPayload)

  if (isDatabaseReady()) {
    const saved = await Reading.create(reading)
    return saved.toObject()
  }

  fallbackReadings.push(reading)
  if (fallbackReadings.length > 720) {
    fallbackReadings.splice(0, fallbackReadings.length - 720)
  }

  return reading
}

function getRangeInMs(range = '24h') {
  const ranges = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  }

  return ranges[range] || ranges['24h']
}

function getRangeReadings(range = '24h', source = fallbackReadings) {
  const cutoffTime = Date.now() - getRangeInMs(range)
  return [...source]
    .filter((entry) => new Date(entry.createdAt).getTime() >= cutoffTime)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

function computeStats(readings) {
  if (readings.length === 0) {
    return {
      minTemp: 0,
      maxTemp: 0,
      avgTemp: 0,
      minHumidity: 0,
      maxHumidity: 0,
      avgHumidity: 0,
    }
  }

  const temperatures = readings.map((entry) => Number(entry.temperature || 0))
  const humidities = readings.map((entry) => Number(entry.humidity || 0))

  return {
    minTemp: Math.min(...temperatures),
    maxTemp: Math.max(...temperatures),
    avgTemp: temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length,
    minHumidity: Math.min(...humidities),
    maxHumidity: Math.max(...humidities),
    avgHumidity: humidities.reduce((sum, value) => sum + value, 0) / humidities.length,
  }
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error(`MongoDB connection failed: ${error.message}`))
} else {
  console.warn('MONGODB_URI is not set; using in-memory fallback storage for demo mode')
}

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/weather') {
    const incomingKey = req.header('x-api-key') || req.query.api_key

    if (!incomingKey || incomingKey !== API_KEY) {
      return res.status(401).json({ message: 'Invalid or missing x-api-key header' })
    }
  }

  return next()
})

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: isDatabaseReady() ? 'connected' : 'demo-mode',
    message: 'ClimateSense backend is running',
  })
})

app.get('/api/weather/latest', async (_req, res) => {
  try {
    if (isDatabaseReady()) {
      const latest = await Reading.findOne().sort({ createdAt: -1 }).lean()
      return res.json({ reading: latest || fallbackReadings.at(-1) })
    }

    const latestEntry = fallbackReadings.at(-1)
    return res.json({ reading: latestEntry || null })
  } catch (error) {
    return res.status(500).json({ message: 'Could not load latest reading', error: error.message })
  }
})

app.get('/api/weather/history', async (req, res) => {
  const range = String(req.query.range || '24h')

  try {
    if (isDatabaseReady()) {
      const cutoff = new Date(Date.now() - getRangeInMs(range))
      const documents = await Reading.find({ createdAt: { $gte: cutoff } }).sort({ createdAt: 1 }).lean()
      return res.json({ readings: documents })
    }

    return res.json({ readings: getRangeReadings(range, fallbackReadings) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not load history data', error: error.message })
  }
})

app.get('/api/weather/stats', async (req, res) => {
  const range = String(req.query.range || '24h')

  try {
    let readings = []

    if (isDatabaseReady()) {
      const cutoff = new Date(Date.now() - getRangeInMs(range))
      readings = await Reading.find({ createdAt: { $gte: cutoff } }).lean()
    } else {
      readings = getRangeReadings(range, fallbackReadings)
    }

    return res.json({ stats: computeStats(readings) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not load stats', error: error.message })
  }
})

app.post('/api/weather', async (req, res) => {
  const { temperature, humidity, deviceId, pressure, windSpeed } = req.body || {}

  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ message: 'temperature and humidity are required' })
  }

  try {
    const savedReading = await persistReading({
      temperature,
      humidity,
      deviceId,
      pressure,
      windSpeed,
    })

    io.emit('newReading', savedReading)

    return res.status(201).json({
      message: 'Weather reading saved successfully',
      reading: savedReading,
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

io.on('connection', (socket) => {
  socket.emit('serverStatus', { status: 'connected' })
  socket.on('disconnect', () => {
    console.log('Client disconnected from socket')
  })
})

server.listen(PORT, () => {
  console.log(`ClimateSense backend running on http://localhost:${PORT}`)
})

export { app }
