import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  Droplets,
  Gauge,
  GaugeIcon,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Sprout,
  SunMedium,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { SensorTrendChart, MultiMetricChart } from './components/ChartsPanel'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import ProjectHero from './components/ProjectHero'
import Sidebar from './components/Sidebar'
import StatusBadge from './components/StatusBadge'
import {
  adminLogs,
  alertData,
  deviceOverview,
  historicalTrends,
  insights,
  locations,
} from './data/mockData'
import { fetchLatestReadings } from './services/api'

const sensorIconMap = {
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  Gauge,
  SunMedium,
  Sprout,
  CloudRain,
  GaugeIcon,
  Lightbulb,
}

const fallbackReading = {
  temperature: 28.6,
  humidity: 64,
  light: 740,
  deviceId: 'ESP32_01',
  location: 'Lab site',
  timestamp: new Date().toISOString(),
}

const steps = [
  'Devices send telemetry',
  'Signals are normalized',
  'System validates data',
  'Monitoring dashboard highlights events',
]

function App() {
  const [reading, setReading] = useState(fallbackReading)
  const [darkMode, setDarkMode] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')

  const handleNavSelect = (name, sectionId) => {
    setActiveNav(name)

    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    const loadReading = async () => {
      try {
        const latest = await fetchLatestReadings()
        if (latest?.temperature != null && latest?.humidity != null && latest?.light != null) {
          setReading(latest)
        }
      } catch {
        setReading(fallbackReading)
      }
    }

    loadReading()
    const intervalId = setInterval(loadReading, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const sensorCards = [
    {
      key: 'temperature',
      label: 'Temperature',
      value: Number(reading.temperature ?? 0),
      unit: '°C',
      status: Number(reading.temperature) > 30 ? 'High' : 'Normal',
      change: '+0.8',
      trend: [27.5, 27.9, 28.2, 28.5, Number(reading.temperature)],
      icon: 'Thermometer',
    },
    {
      key: 'humidity',
      label: 'Humidity',
      value: Number(reading.humidity ?? 0),
      unit: '%',
      status: Number(reading.humidity) > 80 ? 'High' : 'Normal',
      change: '+2.1',
      trend: [59, 60, 62, 63, Number(reading.humidity)],
      icon: 'Droplets',
    },
    {
      key: 'light',
      label: 'Light Intensity',
      value: Number(reading.light ?? 0),
      unit: 'lux',
      status: Number(reading.light) > 900 ? 'Bright' : 'Normal',
      change: '+45',
      trend: [640, 670, 700, 720, Number(reading.light)],
      icon: 'SunMedium',
    },
    {
      key: 'device',
      label: 'Sensor Health',
      value: 'Online',
      unit: '',
      status: 'Stable',
      change: '0.0',
      trend: [6, 7, 8, 8, 9],
      icon: 'Gauge',
    },
  ]

  const statusList = [
    {
      label: 'Temperature',
      value: Number(reading.temperature) > 30 ? 'High' : 'Normal',
      tone: Number(reading.temperature) > 30 ? 'moderate' : 'good',
    },
    {
      label: 'Relative Humidity',
      value: Number(reading.humidity) > 80 ? 'High' : 'Stable',
      tone: Number(reading.humidity) > 80 ? 'moderate' : 'good',
    },
    {
      label: 'Light Intensity',
      value: Number(reading.light) > 900 ? 'Bright' : 'Moderate',
      tone: Number(reading.light) > 900 ? 'moderate' : 'good',
    },
    {
      label: 'Ambient Condition',
      value: 'Good',
      tone: 'good',
    },
    {
      label: 'Sensor Health',
      value: 'Online',
      tone: 'good',
    },
  ]

  const summaryStats = [
    { label: 'Reading source', value: reading.deviceId || 'ESP32_01', detail: reading.location || 'Lab site' },
    { label: 'Latest update', value: new Date(reading.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), detail: 'Live sensor feed' },
    { label: 'Monitoring sites', value: '01', detail: 'Weather station' },
    { label: 'Alert state', value: 'Low', detail: 'No critical issues' },
  ]

  const panelClass = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <div className="dashboard-shell mx-auto flex max-w-[1700px]">
        <Sidebar
          darkMode={darkMode}
          activeNav={activeNav}
          onSelectNav={handleNavSelect}
          onToggleTheme={() => setDarkMode((value) => !value)}
        />

        <main className="flex-1">
          <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />

          <div className="dashboard-content space-y-8 p-4 md:p-6 xl:p-8">
            <div id="overview-panel">
              <ProjectHero onNavigate={handleNavSelect} />
            </div>

            <section id="overview-metrics" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryStats.map((item) => (
                <div key={item.label} className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                  <div className={`mt-3 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                  <div className={`mt-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.detail}</div>
                </div>
              ))}
            </section>

            <section id="weather-panel" className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Live Monitoring</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Weather & Environment Dashboard</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <CheckCircle2 size={15} />
                      Device Online
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Activity size={14} />
                      Last updated: {new Date(reading.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sensorCards.map((card) => (
                    <MetricCard
                      key={card.key}
                      label={card.label}
                      value={card.value}
                      unit={card.unit}
                      status={card.status}
                      change={card.change}
                      trend={card.trend}
                      icon={sensorIconMap[card.icon]}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Current Weather Status</h3>
                    <StatusBadge label="Good" tone="good" />
                  </div>
                  <div className="space-y-3">
                    {statusList.map((item) => (
                      <div key={item.label} className={`flex items-center justify-between rounded-2xl px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</span>
                        <StatusBadge label={item.value} tone={item.tone} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Status</h3>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Stable
                    </div>
                  </div>
                  <div className={`space-y-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="flex items-center justify-between"><span>Data Sync</span><span className="font-medium text-emerald-700">In sync</span></div>
                    <div className="flex items-center justify-between"><span>API Health</span><span className="font-medium text-emerald-700">99.4%</span></div>
                    <div className="flex items-center justify-between"><span>Battery</span><span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>92%</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section id="trends-panel" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Real-Time Graphs</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days'].map((range) => (
                    <button key={range} type="button" className={`rounded-full px-3 py-1.5 ${range === 'Last 24 hours' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <SensorTrendChart title="Temperature vs Time" dataKey="temperature" color="#10b981" />
                <SensorTrendChart title="Humidity vs Time" dataKey="humidity" color="#3b82f6" />
                <SensorTrendChart title="Air Quality vs Time" dataKey="aqi" color="#f59e0b" />
                <SensorTrendChart title="CO₂ vs Time" dataKey="co2" color="#8b5cf6" />
              </div>
            </section>

            <section id="sensor-data-panel" className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <MultiMetricChart />
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>How It Works</h3>
                  <ArrowRight className="text-slate-400" size={18} />
                </div>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step} className={`flex items-center gap-3 rounded-2xl p-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">{index + 1}</div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="alerts-panel" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Climate Trends</h3>
                <div className="mt-5 h-72">
                  <SensorTrendChart title="Daily Temperature Trends" dataKey="temperature" color="#14b8a6" />
                </div>
              </div>
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Alerts & Notifications</h3>
                <div className="mt-5 space-y-3">
                  {alertData.map((alert) => (
                    <div key={`${alert.parameter}-${alert.time}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800">{alert.parameter}</div>
                        <StatusBadge label={alert.severity} tone={alert.severity === 'Critical' ? 'critical' : alert.severity === 'High' ? 'moderate' : 'neutral'} />
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Current: {alert.current} vs threshold {alert.threshold}</div>
                      <div className="mt-1 text-xs text-slate-500">{alert.location} · {alert.device} · {alert.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="devices-panel" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>IoT Devices</h3>
                <div className="mt-5 space-y-3">
                  {deviceOverview.map((device) => (
                    <div key={device.name} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800">{device.name}</div>
                          <div className="text-xs text-slate-500">{device.location}</div>
                        </div>
                        <StatusBadge label={device.status} tone={device.status === 'Warning' ? 'moderate' : 'good'} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{device.type}</span>
                        <span>{device.sensors} sensors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div id="sites-panel" className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Monitoring Locations</h3>
                <div className="relative mt-5 h-64 overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_20%),linear-gradient(135deg,#f8fafc,#e2e8f0)]">
                  {locations.map((location) => (
                    <div key={location.name} className="absolute" style={{ left: `${location.x}%`, top: `${location.y}%` }}>
                      <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full ${location.status === 'Warning' ? 'bg-amber-400' : 'bg-emerald-500'} shadow-lg`} />
                        <div className="mt-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm">{location.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="environment-panel" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Environmental Insights</h3>
                <div className="mt-5 space-y-3">
                  {insights.map((insight) => (
                    <div key={insight} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><ShieldCheck size={16} /></div>
                      <p className="text-sm text-slate-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] ${panelClass}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h3>
                <div className="mt-5 space-y-3">
                  {adminLogs.map((log) => (
                    <div key={log} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="settings-panel" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
              <h3 className="text-xl font-semibold text-slate-900">Historical Data</h3>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Temperature</th>
                      <th className="px-4 py-3 font-medium">Humidity</th>
                      <th className="px-4 py-3 font-medium">AQI</th>
                      <th className="px-4 py-3 font-medium">CO₂</th>
                      <th className="px-4 py-3 font-medium">Pressure</th>
                      <th className="px-4 py-3 font-medium">Rainfall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {historicalTrends.map((row) => (
                      <tr key={row.date}>
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3">09:30</td>
                        <td className="px-4 py-3">{row.temperature}°C</td>
                        <td className="px-4 py-3">{row.humidity}%</td>
                        <td className="px-4 py-3">{row.aqi}</td>
                        <td className="px-4 py-3">{row.co2} ppm</td>
                        <td className="px-4 py-3">1012 hPa</td>
                        <td className="px-4 py-3">{row.rainfall} mm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Export CSV</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
