import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Cloud,
  CloudDrizzle,
  Download,
  Droplets,
  Gauge,
  MoonStar,
  SunMedium,
  Thermometer,
  Wifi,
  WifiOff,
  Wind,
} from 'lucide-react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE
const rangeOptions = [
  { key: '1h', label: '1 hour' },
  { key: '24h', label: '24 hours' },
  { key: '7d', label: '7 days' },
]

const navItems = [
  { key: 'overview', label: 'Overview', icon: Cloud },
  { key: 'liveData', label: 'Live Data', icon: Gauge },
  { key: 'forecast', label: 'Forecast', icon: CloudDrizzle },
  { key: 'charts', label: 'Charts', icon: Thermometer },
  { key: 'map', label: 'Map', icon: Wind },
  { key: 'devices', label: 'Devices', icon: Wifi },
]

const fallbackLatest = {
  temperature: 28.4,
  humidity: 61,
  deviceId: 'esp32-01',
  createdAt: new Date().toISOString(),
}

const safeNumber = (value, fallback = 0) => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

const getWeatherCondition = (temperature, humidity) => {
  if (temperature >= 32 || humidity >= 75) {
    return { label: 'Hot and humid', tone: 'hot' }
  }
  if (temperature >= 25 && humidity >= 60) {
    return { label: 'Warm and humid', tone: 'warm' }
  }
  if (temperature <= 16 || humidity <= 35) {
    return { label: 'Cold and dry', tone: 'cold' }
  }
  return { label: 'Comfortable', tone: 'comfortable' }
}

const formatSecondsAgo = (dateValue) => {
  const diffSeconds = Math.max(0, Math.round((Date.now() - new Date(dateValue).getTime()) / 1000))

  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  return `${Math.floor(diffSeconds / 3600)}h ago`
}

const toChartData = (rows = []) =>
  rows
    .filter((item) => item && item.createdAt)
    .map((item) => ({
      ...item,
      temperature: safeNumber(item.temperature),
      humidity: safeNumber(item.humidity),
      label: new Date(item.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

const normalizeLatest = (payload) => payload?.reading ?? payload ?? fallbackLatest

const normalizeHistory = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.readings)) return payload.readings
  return []
}

const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 15) return 'day'
  if (hour >= 15 && hour < 19) return 'afternoon'
  return 'night'
}

function App() {
  const [range, setRange] = useState('24h')
  const [latest, setLatest] = useState(fallbackLatest)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({
    minTemp: 0,
    maxTemp: 0,
    avgTemp: 0,
    minHumidity: 0,
    maxHumidity: 0,
    avgHumidity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [page, setPage] = useState(1)
  const [socketConnected, setSocketConnected] = useState(false)
  const [activeNav, setActiveNav] = useState('overview')
  const [timeOfDay, setTimeOfDay] = useState('day')

  const weatherState = useMemo(
    () => getWeatherCondition(safeNumber(latest?.temperature), safeNumber(latest?.humidity)),
    [latest],
  )

  const chartData = useMemo(() => toChartData(history), [history])
  const recentRows = useMemo(
    () => [...history].reverse().slice((page - 1) * 5, page * 5),
    [history, page],
  )
  const pageCount = Math.max(1, Math.ceil(history.length / 5))
  const isOnline =
    latest && latest.createdAt && Date.now() - new Date(latest.createdAt).getTime() <= 30000

  const fetchJson = async (url) => {
    const response = await fetch(url)
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload.message || 'Request failed.')
    }

    return payload
  }

  const loadDashboard = async (selectedRange = range) => {
    setError('')
    setLoading(true)

    try {
      const [latestResponse, historyResponse, statsResponse] = await Promise.all([
        fetchJson(`${API_BASE}/api/weather/latest`),
        fetchJson(`${API_BASE}/api/weather/history?range=${selectedRange}`),
        fetchJson(`${API_BASE}/api/weather/stats`),
      ])

      setLatest(normalizeLatest(latestResponse))
      setHistory(normalizeHistory(historyResponse))
      setStats(statsResponse?.stats || statsResponse || {})
      setPage(1)
    } catch (err) {
      setError(err.message || 'Unable to load weather readings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard(range)
  }, [range])

  useEffect(() => {
    const syncTimeOfDay = () => setTimeOfDay(getTimeOfDay(new Date().getHours()))
    const initialSync = window.setTimeout(syncTimeOfDay, 0)
    const timeSync = window.setInterval(syncTimeOfDay, 60000)

    return () => {
      window.clearTimeout(initialSync)
      window.clearInterval(timeSync)
    }
  }, [])

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => setSocketConnected(true))
    socket.on('disconnect', () => setSocketConnected(false))
    socket.on('newReading', (reading) => {
      setLatest(reading)
      setHistory((previous) => [...previous, reading].slice(-200))
      setPage(1)
    })

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    if (socketConnected) return undefined

    const timer = setInterval(() => {
      loadDashboard(range)
    }, 5000)

    return () => clearInterval(timer)
  }, [socketConnected, range])

  const handleDownloadCsv = () => {
    const csvRows = [
      ['deviceId', 'temperature', 'humidity', 'createdAt'],
      ...history.map((item) => [
        item.deviceId || '',
        safeNumber(item.temperature),
        safeNumber(item.humidity),
        new Date(item.createdAt).toISOString(),
      ]),
    ]

    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'weather-readings.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const temperatureTone =
    safeNumber(latest?.temperature) >= 30 ? 'hot' : safeNumber(latest?.temperature) <= 16 ? 'cold' : 'comfortable'

  const humidityTone =
    safeNumber(latest?.humidity) >= 70 ? 'humid' : safeNumber(latest?.humidity) <= 35 ? 'dry' : 'balanced'

  const latestTemperature = safeNumber(latest?.temperature, 0)
  const latestHumidity = safeNumber(latest?.humidity, 0)

  const handleNavSelect = (nextNav) => {
    setActiveNav(nextNav)
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard">
        <aside className="sidebar">
          <div className="brand-row" aria-label="Branding">
            <div className="brand-icon">
              <Cloud />
            </div>
            <div className="brand-name">ClimateSense</div>
          </div>

          <nav className="nav-list" aria-label="Sidebar navigation">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`nav-item ${activeNav === key ? 'active' : ''}`}
                onClick={() => handleNavSelect(key)}
                aria-pressed={activeNav === key}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div className="topbar-spacer" aria-hidden="true" />

            <div className="topbar-actions">
              <div className="device-status-pill">
                <span className="status-dot" />
                ESP32-01 Online
              </div>

              <button
                type="button"
                className="theme-toggle"
                onClick={() => setDarkMode((current) => !current)}
              >
                {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
              </button>
            </div>
          </header>

          {error && (
            <div className="alert-box">
              <strong>Weather feed error:</strong> {error}
            </div>
          )}

          {activeNav === 'overview' ? (
            <>
          <section className="overview-grid">
            <div id="overview-panel" className={`hero-card ${activeNav === 'overview' ? 'is-active-panel' : ''}`}>
              <div className="hero-header">
                <div className="location-block">
                  <span className="location-icon"><Gauge /></span>
                  <div>
                    <h2>Belgaum, Karnataka</h2>
                    <p>Live from IoT Sensor</p>
                    <small className="online-status">
                      <span className="status-dot" />
                      Device connected
                    </small>
                  </div>
                </div>

                <div className="last-updated">
                  <span>Last updated</span>
                  <strong>
                    {latest?.createdAt ? new Date(latest.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'N/A'}
                  </strong>
                </div>
              </div>

              <div className={`hero-scene ${weatherState.tone} time-${timeOfDay}`} aria-hidden="true">
                <div className="scene-sun" />
                <div className="scene-cloud cloud-one" />
                <div className="scene-cloud cloud-two" />
                <div className="mountain back" />
                <div className="mountain front" />
                <div className="city-block left" />
                <div className="city-block right" />
                <div className="tree t1" />
                <div className="tree t2" />
                <div className="tree t3" />
              </div>

              <div className="hero-metrics">
                <div className="big-temp">{latestTemperature.toFixed(1)}°C</div>
                <div className="condition-panel">
                  <div className={`condition-pill ${weatherState.tone}`}>
                    {weatherState.label}
                  </div>
                  <div className="condition-text">Feels like {Math.max(0, latestTemperature + 2).toFixed(1)}°C</div>
                  <div className="condition-text">Humidity {latestHumidity.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div id="live-data-panel" className={`side-panel ${activeNav === 'liveData' ? 'is-active-panel' : ''}`}>
              <div className="mini-grid">
                <div className={`metric-box ${temperatureTone}`}>
                  <div className="metric-head">
                    <span className="metric-icon"><Thermometer size={18} /></span>
                    <span>Temperature</span>
                  </div>
                  <strong>{latestTemperature.toFixed(1)}°C</strong>
                  <small>{latestTemperature >= 30 ? 'Hot' : latestTemperature <= 16 ? 'Cold' : 'Comfort'}</small>
                </div>

                <div className={`metric-box ${humidityTone}`}>
                  <div className="metric-head">
                    <span className="metric-icon"><Droplets size={18} /></span>
                    <span>Humidity</span>
                  </div>
                  <strong>{latestHumidity.toFixed(0)}%</strong>
                  <small>{latestHumidity >= 70 ? 'Humid' : latestHumidity <= 35 ? 'Dry' : 'Balanced'}</small>
                </div>

                <div className={`metric-box ${temperatureTone}`}>
                  <div className="metric-head">
                    <span className="metric-icon"><Wind size={18} /></span>
                    <span>Wind</span>
                  </div>
                  <strong>12 km/h</strong>
                  <small>Light breeze</small>
                </div>

                <div className={`metric-box ${humidityTone}`}>
                  <div className="metric-head">
                    <span className="metric-icon"><Gauge size={18} /></span>
                    <span>Pressure</span>
                  </div>
                  <strong>1010 hPa</strong>
                  <small>Stable</small>
                </div>
              </div>

              <div className="highlights-card">
                <div className="card-title-row">
                  <h3>Today’s Highlights</h3>
                  <button type="button" className="ghost-button">›</button>
                </div>
                <div className="highlight-list">
                  <div className="highlight-item">
                    <span className="metric-icon warm"><SunMedium size={18} /></span>
                    <span>Highest Temperature</span>
                    <strong>{stats?.maxTemp ? `${stats.maxTemp.toFixed(1)}°C` : '0°C'}</strong>
                  </div>
                  <div className="highlight-item">
                    <span className="metric-icon cool"><Cloud /></span>
                    <span>Lowest Temperature</span>
                    <strong>{stats?.minTemp ? `${stats.minTemp.toFixed(1)}°C` : '0°C'}</strong>
                  </div>
                  <div className="highlight-item">
                    <span className="metric-icon rain"><CloudDrizzle size={18} /></span>
                    <span>Rainfall</span>
                    <strong>0 mm</strong>
                  </div>
                  <div className="highlight-item">
                    <span className="metric-icon amber"><SunMedium size={18} /></span>
                    <span>UV Index</span>
                    <strong>6 (High)</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="data-grid">
            <div id="charts-panel" className={`chart-card ${activeNav === 'charts' ? 'is-active-panel' : ''}`}>
              <div className="card-header">
                <div className="range-switcher">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={option.key === range ? 'range-btn active' : 'range-btn'}
                      onClick={() => setRange(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="small-forecast-box">
                  <span>7-Day Forecast</span>
                  <span>›</span>
                </div>
              </div>

              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tempFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3dd9a8" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="#3dd9a8" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,157,170,0.18)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6a7d85', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6a7d85', fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="temperature" stroke="#22c55e" strokeWidth={3} fill="url(#tempFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="forecast-panel" className={`forecast-card ${activeNav === 'forecast' ? 'is-active-panel' : ''}`}>
              <div className="card-title-row">
                <h3>7-Day Forecast</h3>
                <button type="button" className="ghost-button">›</button>
              </div>

              <div className="forecast-list">
                {[
                  { day: 'Today', condition: 'Partly cloudy', temp: '32° / 22°', icon: SunMedium },
                  { day: 'Tue', condition: 'Sunny', temp: '33° / 21°', icon: SunMedium },
                  { day: 'Wed', condition: 'Cloudy', temp: '31° / 20°', icon: Cloud },
                  { day: 'Thu', condition: 'Light rain', temp: '29° / 19°', icon: CloudDrizzle },
                  { day: 'Fri', condition: 'Partly cloudy', temp: '30° / 20°', icon: Cloud },
                  { day: 'Sat', condition: 'Sunny', temp: '31° / 21°', icon: SunMedium },
                  { day: 'Sun', condition: 'Cloudy', temp: '30° / 20°', icon: Cloud },
                ].map(({ day, condition, temp, icon: Icon }) => (
                  <div key={day} className="forecast-row">
                    <span className="forecast-day">{day}</span>
                    <span className="forecast-condition"><Icon size={16} /> {condition}</span>
                    <strong>{temp}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div id="map-panel" className={`map-card ${activeNav === 'map' ? 'is-active-panel' : ''}`}>
              <div className="card-title-row">
                <h3>Map</h3>
                <button type="button" className="ghost-button">›</button>
              </div>

              <div className="map-panel">
                <div className="map-line line-a" />
                <div className="map-line line-b" />
                <div className="map-line line-c" />
                <span className="map-pin pin-1">Belgaum</span>
                <span className="map-pin pin-2">Mumbai</span>
                <span className="map-pin pin-3">Nashik</span>
                <span className="map-pin pin-4">Nagpur</span>
              </div>
            </div>

            <div className={`sensor-card ${activeNav === 'liveData' ? 'is-active-panel' : ''}`}>
              <div className="card-title-row">
                <h3>Live Sensor Data</h3>
                <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="sensor-list">
                <div className="sensor-row">
                  <span className="sensor-icon"><Thermometer size={16} /></span>
                  <span>Temperature</span>
                  <strong>{latestTemperature.toFixed(1)}°C</strong>
                </div>
                <div className="sensor-row">
                  <span className="sensor-icon"><Droplets size={16} /></span>
                  <span>Humidity</span>
                  <strong>{latestHumidity.toFixed(0)}%</strong>
                </div>
                <div className="sensor-row">
                  <span className="sensor-icon"><Gauge size={16} /></span>
                  <span>Pressure</span>
                  <strong>1010 hPa</strong>
                </div>
                <div className="sensor-row">
                  <span className="sensor-icon"><Wind size={16} /></span>
                  <span>Wind</span>
                  <strong>12 km/h</strong>
                </div>
              </div>
            </div>

            <div id="devices-panel" className={`stats-card ${activeNav === 'devices' ? 'is-active-panel' : ''}`}>
              <div className="card-title-row">
                <h3>Today’s Stats</h3>
                <div className="socket-badge">
                  {socketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {socketConnected ? 'Live' : 'Polling'}
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <span>Min Temp</span>
                  <strong>{stats?.minTemp ? `${stats.minTemp.toFixed(1)}°C` : '0°C'}</strong>
                </div>
                <div className="stat-box">
                  <span>Max Temp</span>
                  <strong>{stats?.maxTemp ? `${stats.maxTemp.toFixed(1)}°C` : '0°C'}</strong>
                </div>
                <div className="stat-box">
                  <span>Avg Temp</span>
                  <strong>{stats?.avgTemp ? `${stats.avgTemp.toFixed(1)}°C` : '0°C'}</strong>
                </div>
                <div className="stat-box">
                  <span>Avg Humidity</span>
                  <strong>{stats?.avgHumidity ? `${stats.avgHumidity.toFixed(0)}%` : '0%'}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="bottom-row">
            <div className="table-card">
              <div className="card-title-row">
                <h3>Recent Readings</h3>
                <button type="button" className="download-button" onClick={handleDownloadCsv}>
                  <Download size={14} />
                  CSV
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Temp</th>
                      <th>Humidity</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-state">No readings available yet.</td>
                      </tr>
                    ) : (
                      recentRows.map((item) => (
                        <tr key={`${item.deviceId}-${item.createdAt}`}>
                          <td>{item.deviceId || 'esp32'}</td>
                          <td>{safeNumber(item.temperature).toFixed(1)}°C</td>
                          <td>{safeNumber(item.humidity).toFixed(0)}%</td>
                          <td>{new Date(item.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-row">
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </button>
                <span>
                  Page {page} / {pageCount}
                </span>
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                  Next
                </button>
              </div>
            </div>

            <div className="device-card">
              <div className="card-title-row">
                <h3>Device Status</h3>
                <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="device-status-row">
                <div className="device-status-box">
                  <span className="label">Last updated</span>
                  <strong>{latest?.createdAt ? formatSecondsAgo(latest.createdAt) : 'N/A'}</strong>
                </div>
                <div className="device-status-box">
                  <span className="label">Condition</span>
                  <strong>{weatherState.label}</strong>
                </div>
              </div>

              <div className="gauge-panel">
                <div className="gauge-labels">
                  <span>Cold</span>
                  <span>Comfort</span>
                  <span>Hot</span>
                </div>
                <div className="gauge-track">
                  <div
                    className={`gauge-fill ${weatherState.tone}`}
                    style={{ width: `${Math.min(100, Math.max(10, ((latestTemperature + 10) / 50) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
            </>
          ) : (
            <div className="page-view">
              <header className="page-heading">
                <div>
                  <span className="page-kicker">ClimateSense / Monitoring</span>
                  <h2>{navItems.find((item) => item.key === activeNav)?.label}</h2>
                  <p>
                    {activeNav === 'liveData' && 'Current sensor measurements and the latest incoming readings.'}
                    {activeNav === 'forecast' && 'A seven-day local forecast overview alongside the latest sensor conditions.'}
                    {activeNav === 'charts' && 'Explore temperature and humidity history across the selected time range.'}
                    {activeNav === 'map' && 'Weather station locations and nearby monitoring coverage.'}
                    {activeNav === 'devices' && 'Connection health and recent activity for registered monitoring devices.'}
                  </p>
                </div>
                <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Sensor online' : 'Sensor offline'}
                </span>
              </header>

              {activeNav === 'liveData' && (
                <div className="page-columns">
                  <section className="page-section">
                    <div className="card-title-row">
                      <h3>Current conditions</h3>
                      <span className={`socket-badge ${socketConnected ? 'is-live' : ''}`}>
                        {socketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {socketConnected ? 'Live stream' : 'Polling'}
                      </span>
                    </div>
                    <div className="page-metric-grid">
                      <div className={`metric-box ${temperatureTone}`}>
                        <div className="metric-head"><span className="metric-icon"><Thermometer size={18} /></span><span>Temperature</span></div>
                        <strong>{latestTemperature.toFixed(1)}°C</strong>
                        <small>{weatherState.label}</small>
                      </div>
                      <div className={`metric-box ${humidityTone}`}>
                        <div className="metric-head"><span className="metric-icon"><Droplets size={18} /></span><span>Humidity</span></div>
                        <strong>{latestHumidity.toFixed(0)}%</strong>
                        <small>Relative humidity</small>
                      </div>
                      <div className="metric-box comfortable">
                        <div className="metric-head"><span className="metric-icon"><Gauge size={18} /></span><span>Pressure</span></div>
                        <strong>{safeNumber(latest?.pressure, 1010).toFixed(0)} hPa</strong>
                        <small>Atmospheric pressure</small>
                      </div>
                      <div className="metric-box cold">
                        <div className="metric-head"><span className="metric-icon"><Wind size={18} /></span><span>Wind speed</span></div>
                        <strong>{safeNumber(latest?.windSpeed, 0).toFixed(1)} km/h</strong>
                        <small>Latest device value</small>
                      </div>
                    </div>
                  </section>

                  <section className="page-section">
                    <div className="card-title-row"><h3>Latest readings</h3><button type="button" className="download-button" onClick={handleDownloadCsv}><Download size={14} /> Export CSV</button></div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Device</th><th>Temperature</th><th>Humidity</th><th>Received</th></tr></thead>
                        <tbody>
                          {recentRows.length === 0 ? (
                            <tr><td colSpan="4" className="empty-state">No readings available yet.</td></tr>
                          ) : recentRows.map((item) => (
                            <tr key={`${item.deviceId}-${item.createdAt}`}>
                              <td>{item.deviceId || 'esp32'}</td>
                              <td>{safeNumber(item.temperature).toFixed(1)}°C</td>
                              <td>{safeNumber(item.humidity).toFixed(0)}%</td>
                              <td>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {activeNav === 'forecast' && (
                <div className="page-columns forecast-page-grid">
                  <section className="page-section forecast-feature">
                    <span className="page-kicker">Belgaum, Karnataka · Today</span>
                    <div className="forecast-feature-temp">{latestTemperature.toFixed(1)}°</div>
                    <h3>{weatherState.label}</h3>
                    <p>Current sensor conditions are shown alongside the sample outlook below.</p>
                    <div className="forecast-facts"><span>Humidity <strong>{latestHumidity.toFixed(0)}%</strong></span><span>Feels like <strong>{(latestTemperature + 2).toFixed(1)}°C</strong></span></div>
                  </section>
                  <section className="page-section">
                    <div className="card-title-row"><h3>7-day outlook</h3><span className="small-forecast-box">Local forecast</span></div>
                    <div className="forecast-list">
                      {[
                        { day: 'Today', condition: 'Partly cloudy', temp: '32° / 22°', icon: SunMedium },
                        { day: 'Tue', condition: 'Sunny', temp: '33° / 21°', icon: SunMedium },
                        { day: 'Wed', condition: 'Cloudy', temp: '31° / 20°', icon: Cloud },
                        { day: 'Thu', condition: 'Light rain', temp: '29° / 19°', icon: CloudDrizzle },
                        { day: 'Fri', condition: 'Partly cloudy', temp: '30° / 20°', icon: Cloud },
                        { day: 'Sat', condition: 'Sunny', temp: '31° / 21°', icon: SunMedium },
                        { day: 'Sun', condition: 'Cloudy', temp: '30° / 20°', icon: Cloud },
                      ].map(({ day, condition, temp, icon: Icon }) => (
                        <div key={day} className="forecast-row"><span className="forecast-day">{day}</span><span className="forecast-condition"><Icon size={16} /> {condition}</span><strong>{temp}</strong></div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeNav === 'charts' && (
                <div className="page-columns">
                  <section className="page-section chart-page-section">
                    <div className="card-header">
                      <div className="range-switcher">
                        {rangeOptions.map((option) => (
                          <button key={option.key} type="button" className={option.key === range ? 'range-btn active' : 'range-btn'} onClick={() => setRange(option.key)}>{option.label}</button>
                        ))}
                      </div>
                      <button type="button" className="download-button" onClick={handleDownloadCsv}><Download size={14} /> Export</button>
                    </div>
                    <div className="chart-wrap chart-page-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,157,170,0.18)" />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6a7d85', fontSize: 11 }} />
                          <YAxis yAxisId="temperature" tickLine={false} axisLine={false} tick={{ fill: '#6a7d85', fontSize: 11 }} />
                          <YAxis yAxisId="humidity" orientation="right" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#6a7d85', fontSize: 11 }} />
                          <Tooltip />
                          <Line yAxisId="temperature" type="monotone" dataKey="temperature" name="Temperature °C" stroke="#e28c3d" strokeWidth={3} dot={false} />
                          <Line yAxisId="humidity" type="monotone" dataKey="humidity" name="Humidity %" stroke="#3299c6" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                  <section className="page-section">
                    <div className="card-title-row"><h3>Selected range summary</h3></div>
                    <div className="stats-grid">
                      <div className="stat-box"><span>Minimum temperature</span><strong>{safeNumber(stats.minTemp).toFixed(1)}°C</strong></div>
                      <div className="stat-box"><span>Maximum temperature</span><strong>{safeNumber(stats.maxTemp).toFixed(1)}°C</strong></div>
                      <div className="stat-box"><span>Average temperature</span><strong>{safeNumber(stats.avgTemp).toFixed(1)}°C</strong></div>
                      <div className="stat-box"><span>Average humidity</span><strong>{safeNumber(stats.avgHumidity).toFixed(0)}%</strong></div>
                    </div>
                  </section>
                </div>
              )}

              {activeNav === 'map' && (
                <div className="page-columns map-page-grid">
                  <section className="page-section map-page-section">
                    <div className="card-title-row"><h3>Monitoring locations</h3><span className="status-badge online">4 stations</span></div>
                    <div className="map-panel map-page-visual">
                      <div className="map-line line-a" /><div className="map-line line-b" /><div className="map-line line-c" />
                      <span className="map-pin pin-1">Belgaum · Active</span><span className="map-pin pin-2">Mumbai</span><span className="map-pin pin-3">Nashik</span><span className="map-pin pin-4">Nagpur</span>
                    </div>
                  </section>
                  <section className="page-section">
                    <div className="card-title-row"><h3>Station details</h3></div>
                    <div className="station-detail"><span className="status-dot" /><div><strong>Belgaum weather station</strong><small>{latest?.deviceId || 'esp32-01'} · {isOnline ? 'Connected' : 'No recent signal'}</small></div></div>
                    <div className="station-detail"><span className="station-muted-dot" /><div><strong>Mumbai station</strong><small>Location marker · no connected device</small></div></div>
                    <div className="station-detail"><span className="station-muted-dot" /><div><strong>Nashik station</strong><small>Location marker · no connected device</small></div></div>
                    <div className="station-detail"><span className="station-muted-dot" /><div><strong>Nagpur station</strong><small>Location marker · no connected device</small></div></div>
                  </section>
                </div>
              )}

              {activeNav === 'devices' && (
                <div className="page-columns">
                  <section className="page-section">
                    <div className="card-title-row"><h3>Registered devices</h3><span className="status-badge online">1 device</span></div>
                    <article className="device-record">
                      <div className="device-record-icon"><Wifi size={20} /></div>
                      <div className="device-record-copy"><strong>{latest?.deviceId || 'esp32-01'}</strong><span>ESP32 weather station · DHT11 sensor</span><small>Last received {latest?.createdAt ? formatSecondsAgo(latest.createdAt) : 'never'}</small></div>
                      <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                    </article>
                    <div className="device-detail-grid">
                      <div className="device-status-box"><span className="label">Transport</span><strong>{socketConnected ? 'WebSocket live' : 'HTTP polling'}</strong></div>
                      <div className="device-status-box"><span className="label">Last temperature</span><strong>{latestTemperature.toFixed(1)}°C</strong></div>
                      <div className="device-status-box"><span className="label">Last humidity</span><strong>{latestHumidity.toFixed(0)}%</strong></div>
                      <div className="device-status-box"><span className="label">Readings loaded</span><strong>{history.length}</strong></div>
                    </div>
                  </section>
                  <section className="page-section">
                    <div className="card-title-row"><h3>Device activity</h3><button type="button" className="download-button" onClick={handleDownloadCsv}><Download size={14} /> Export log</button></div>
                    <div className="table-wrap">
                      <table><thead><tr><th>Timestamp</th><th>Temperature</th><th>Humidity</th></tr></thead>
                        <tbody>{recentRows.length === 0 ? <tr><td colSpan="3" className="empty-state">No activity recorded.</td></tr> : recentRows.map((item) => <tr key={`${item.deviceId}-${item.createdAt}`}><td>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{safeNumber(item.temperature).toFixed(1)}°C</td><td>{safeNumber(item.humidity).toFixed(0)}%</td></tr>)}</tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
