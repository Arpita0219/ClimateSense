import { useState } from 'react'
import {
  Activity,
  Bell,
  Cloud,
  Database,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Shield,
  SunMedium,
  Thermometer,
  TrendingUp,
  User,
} from 'lucide-react'

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, sectionId: 'overview-panel' },
  { name: 'Weather', icon: Activity, sectionId: 'weather-panel' },
  { name: 'Trends', icon: TrendingUp, sectionId: 'trends-panel' },
  { name: 'Sensor Data', icon: Database, sectionId: 'sensor-data-panel' },
  { name: 'Alerts', icon: Bell, sectionId: 'alerts-panel' },
  { name: 'Devices', icon: Cloud, sectionId: 'devices-panel' },
  { name: 'Sites', icon: MapPinned, sectionId: 'sites-panel' },
  { name: 'Environment', icon: Gauge, sectionId: 'environment-panel' },
  { name: 'Settings', icon: Shield, sectionId: 'settings-panel' },
]

export default function Sidebar({ darkMode, onToggleTheme, activeNav, onSelectNav }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <aside
      className={`hidden h-screen w-72 shrink-0 flex-col border-r p-5 backdrop-blur-xl lg:flex ${
        darkMode
          ? 'border-slate-700 bg-slate-900 text-slate-100'
          : 'border-slate-200/80 bg-white/80 text-slate-800'
      }`}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} shadow-lg shadow-blue-200`}>
          <Thermometer size={22} />
        </div>
        <div>
          <div className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>WeatherNet</div>
          <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Environment monitor</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ name, icon: Icon, sectionId }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectNav(name, sectionId)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
              activeNav === name
                ? darkMode
                  ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/40'
                  : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : darkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}
      </nav>

      <div className={`mt-5 space-y-2 border-t pt-5 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setProfileOpen((value) => !value)}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
            darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User size={18} />
          Operator profile
        </button>

        {profileOpen && (
          <div className={`rounded-2xl border p-3 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <div className="font-medium">Monitoring operator</div>
            <div className="mt-1 text-xs opacity-80">Dashboard access</div>
            <div className="mt-2 text-xs opacity-70">Lab site · Weather station</div>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
            darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SunMedium size={18} />
          {darkMode ? 'Light mode' : 'Theme'}
        </button>
      </div>
    </aside>
  )
}
