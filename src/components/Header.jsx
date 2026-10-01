import { Bell, MapPin, Moon, Wifi, Zap } from 'lucide-react'

export default function Header({ darkMode, onToggleTheme }) {
  return (
    <header className={`sticky top-0 z-20 border-b px-5 py-4 backdrop-blur-xl ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200/80 bg-white/80'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
            <Zap size={18} />
          </div>
          <div>
            <div className={`text-xs uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Weather station</div>
            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <MapPin size={14} className="text-blue-500" />
              Lab site · Outdoor deck
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${darkMode ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
            <Wifi size={14} />
            Sensor stream online
          </div>
          <button type="button" className={`relative rounded-full border p-2 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-white">3</span>
          </button>
          <button type="button" onClick={onToggleTheme} className={`rounded-full border p-2 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
            <Moon size={16} />
          </button>
          <div className={`flex items-center gap-3 rounded-full border px-3 py-2 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'}`}>OP</div>
            <div className="hidden text-left lg:block">
              <div className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>Monitoring operator</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dashboard access</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
