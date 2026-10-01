export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiEndpoints = [
  'GET /api/health',
  'GET /api/sensors/latest',
  'GET /api/sensors/history',
  'GET /api/devices',
  'GET /api/devices/:id',
  'GET /api/alerts',
  'GET /api/locations',
  'POST /api/sensors/data',
  'POST /api/devices',
  'PUT /api/devices/:id',
  'DELETE /api/devices/:id',
]

const safeJson = async (response) => {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

export const mockSensorData = {
  deviceId: 'ESP32-001',
  location: 'College Campus',
  temperature: 28.6,
  humidity: 64,
  aqi: 82,
  co2: 612,
  pressure: 1012,
  soilMoisture: 48,
  rainfall: 2.4,
  light: 650,
  windSpeed: 12,
  uvIndex: 5.2,
  lastUpdated: new Date().toISOString(),
}

export const fetchLatestReadings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/latest`)

    if (!response.ok) {
      throw new Error('Backend unavailable')
    }

    const data = await safeJson(response)
    return {
      ...data,
      lastUpdated: data.timestamp || new Date().toISOString(),
    }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 350))
    return { ...mockSensorData, lastUpdated: new Date().toISOString() }
  }
}

export const fetchAlerts = async () => [
  {
    id: 1,
    parameter: 'Temperature',
    currentValue: 34.8,
    threshold: 33,
    severity: 'High',
    date: '2026-09-20 09:15',
    device: 'ESP32-001',
    location: 'College Campus',
  },
  {
    id: 2,
    parameter: 'Air Quality',
    currentValue: 118,
    threshold: 100,
    severity: 'Medium',
    date: '2026-09-20 08:45',
    device: 'ESP32-002',
    location: 'Laboratory',
  },
  {
    id: 3,
    parameter: 'Soil Moisture',
    currentValue: 18,
    threshold: 25,
    severity: 'Critical',
    date: '2026-09-20 07:10',
    device: 'ESP32-004',
    location: 'Agricultural Area',
  },
]

export const fetchDeviceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`)

    if (!response.ok) {
      throw new Error('Devices endpoint unavailable')
    }

    return await safeJson(response)
  } catch {
    return [
      {
        id: 'ESP32-001',
        name: 'ESP32 Climate Node',
        status: 'Online',
        location: 'College Campus',
        sensors: ['DHT22', 'MQ135', 'BMP280', 'Soil Moisture', 'Rain Sensor', 'LDR'],
        lastSeen: '10 sec ago',
        firmware: 'v2.4.1',
        battery: '92%',
        ipStatus: 'MQTT Active',
      },
      {
        id: 'ESP32-002',
        name: 'Air Quality Monitor',
        status: 'Online',
        location: 'Laboratory',
        sensors: ['MQ135', 'PM Sensor', 'DHT22'],
        lastSeen: '27 sec ago',
        firmware: 'v2.3.9',
        battery: '88%',
        ipStatus: 'Wi-Fi Stable',
      },
      {
        id: 'ESP32-003',
        name: 'Garden Environmental Unit',
        status: 'Warning',
        location: 'Garden Area',
        sensors: ['DHT22', 'UV Sensor', 'Rain Sensor'],
        lastSeen: '2 min ago',
        firmware: 'v2.4.2',
        battery: '67%',
        ipStatus: 'Signal Weak',
      },
    ]
  }
}

export const fetchDeviceDataLegacy = async () => [
  {
    id: 'ESP32-001',
    name: 'ESP32 Climate Node',
    status: 'Online',
    location: 'College Campus',
    sensors: ['DHT22', 'MQ135', 'BMP280', 'Soil Moisture', 'Rain Sensor', 'LDR'],
    lastSeen: '10 sec ago',
    firmware: 'v2.4.1',
    battery: '92%',
    ipStatus: 'MQTT Active',
  },
  {
    id: 'ESP32-002',
    name: 'Air Quality Monitor',
    status: 'Online',
    location: 'Laboratory',
    sensors: ['MQ135', 'PM Sensor', 'DHT22'],
    lastSeen: '27 sec ago',
    firmware: 'v2.3.9',
    battery: '88%',
    ipStatus: 'Wi-Fi Stable',
  },
  {
    id: 'ESP32-003',
    name: 'Garden Environmental Unit',
    status: 'Warning',
    location: 'Garden Area',
    sensors: ['DHT22', 'UV Sensor', 'Rain Sensor'],
    lastSeen: '2 min ago',
    firmware: 'v2.4.2',
    battery: '67%',
    ipStatus: 'Signal Weak',
  },
]
