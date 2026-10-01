export default function StatusBadge({ label, tone = 'good' }) {
  const toneMap = {
    good: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    moderate: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneMap[tone] || toneMap.good}`}>
      {label}
    </span>
  )
}
