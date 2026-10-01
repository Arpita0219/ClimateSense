import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

export default function MetricCard({ label, value, unit, status, trend, change, icon: Icon }) {
  const positive = Number(change) >= 0

  return (
    <div className="interactive-lift group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition duration-300 group-hover:rotate-6 group-hover:bg-emerald-100 group-hover:text-emerald-700">
            {Icon ? <Icon size={18} /> : <Activity size={18} />}
          </div>
          <div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">{status}</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>

      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{unit}</div>
        </div>
      </div>

      <div className="h-12">
        <svg viewBox="0 0 100 40" className="h-full w-full">
          <path
            d={trend
              .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * 25} ${40 - point / 2}`)
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-500 transition-all duration-700 group-hover:text-blue-500"
          />
        </svg>
      </div>
    </div>
  )
}
