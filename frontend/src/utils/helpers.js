export const formatValue = (value, unit = '') => {
  if (value === null || value === undefined) return '—'
  const formatted = Number(value).toFixed(value % 1 === 0 ? 0 : 1)
  return `${formatted}${unit}`
}

export const getStatusTone = (status) => {
  const normalized = status?.toLowerCase()
  if (normalized?.includes('critical') || normalized?.includes('warning') || normalized?.includes('low')) return 'text-amber-600 bg-amber-100'
  if (normalized?.includes('moderate') || normalized?.includes('warning')) return 'text-yellow-600 bg-yellow-100'
  return 'text-emerald-600 bg-emerald-100'
}

export const getEnvStatus = (temperature, humidity, aqi, co2, uvIndex) => {
  if (temperature > 33 || aqi > 100 || co2 > 700 || uvIndex > 8) return 'Critical'
  if (temperature > 29 || humidity > 70 || aqi > 80 || uvIndex > 5) return 'Moderate'
  return 'Good'
}

export const celsiusToFahrenheit = (value) => Number(value * 1.8 + 32).toFixed(1)

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
