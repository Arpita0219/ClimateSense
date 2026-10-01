import { ArrowRight, Cpu, Database, RadioTower, ShieldCheck, Waves, ScanSearch } from 'lucide-react'
import { useState } from 'react'

const featureCards = [
  { title: 'Live temperature', icon: Waves },
  { title: 'Humidity tracking', icon: ScanSearch },
  { title: 'Light intensity', icon: Database },
  { title: 'Environmental alerts', icon: ShieldCheck },
  { title: 'Cloud sync', icon: RadioTower },
  { title: 'Smart insights', icon: Cpu },
]

export default function ProjectHero({ onNavigate }) {
  const [activeFeature, setActiveFeature] = useState('Live temperature')

  return (
    <div className="interactive-lift relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 shadow-[0_30px_80px_-45px_rgba(59,130,246,0.35)] lg:p-10">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
            Weather & Environment Monitor
          </div>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Real-time weather data for a smarter campus environment.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">
            ESP32-based sensing using DHT11 or DHT22 and LDR modules collects temperature, relative humidity, and light intensity, then pushes the readings to a cloud backend for live monitoring and alerting.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-indigo-700">
            ESP32 + DHT22 + LDR
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={() => onNavigate?.('Weather', 'weather-panel')} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-500">
              View live overview
              <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => onNavigate?.('Sensor Data', 'sensor-data-panel')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50">
              Explore workspace
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-2xl font-semibold text-slate-900">24</div>
              <div className="text-xs text-slate-500">Active devices</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-2xl font-semibold text-slate-900">1.2M</div>
              <div className="text-xs text-slate-500">Telemetry points</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-2xl font-semibold text-slate-900">08</div>
              <div className="text-xs text-slate-500">Monitoring sites</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_35px_90px_-35px_rgba(15,23,42,0.4)] backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-500">Data pipeline</div>
              <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Live</div>
            </div>
            <div className="space-y-5">
                <div className="interactive-lift flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white"><Cpu size={18} /></div>
                  <div>
                    <div className="font-medium text-slate-800">ESP32</div>
                    <div className="text-xs text-slate-500">Temperature & humidity</div>
                  </div>
                </div>
                <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-3/4 rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="pipeline-line h-px w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-slate-300" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">Temp</div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">Flow</div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">Load</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="pipeline-line h-px w-full bg-gradient-to-r from-slate-300 via-indigo-400 to-blue-500" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Database size={18} /></div>
                  <div>
                    <div className="font-medium text-slate-800">Cloud layer</div>
                    <div className="text-xs text-slate-500">HTTP POST / MQTT</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="pipeline-line h-px w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-slate-300" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-blue-50 p-3">
                <div className="flex items-center gap-3">
                        <div className="live-pulse flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Waves size={18} /></div>
                  <div>
                    <div className="font-medium text-slate-800">Dashboard</div>
                    <div className="text-xs text-slate-500">Alerts + trends</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-10 grid gap-4 md:grid-cols-3">
        {featureCards.map(({ title, icon: Icon }) => (
          <button key={title} type="button" onClick={() => setActiveFeature(title)} className={`interactive-lift rounded-2xl border p-4 text-left backdrop-blur-sm ${activeFeature === title ? 'border-blue-400 bg-blue-50/90 shadow-lg shadow-blue-100' : 'border-slate-200 bg-white/70'}`}>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Icon size={18} />
            </div>
            <div className="font-medium text-slate-800">{title}</div>
            {activeFeature === title && <div className="mt-2 text-xs text-blue-700">Monitoring active</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
