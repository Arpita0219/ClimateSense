export const sensorCards = [
  { key: 'temperature', label: 'Temperature', unit: '°C', value: 28.6, status: 'Normal', icon: 'Thermometer', trend: [28.1, 28.4, 28.6, 29.1, 28.7], change: '+1.2' },
  { key: 'humidity', label: 'Humidity', unit: '%', value: 64, status: 'Normal', icon: 'Droplets', trend: [61, 62, 64, 63, 64], change: '+2.4' },
  { key: 'aqi', label: 'Air Quality', unit: 'AQI', value: 82, status: 'Moderate', icon: 'Wind', trend: [74, 79, 81, 82, 86], change: '+4.1' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', value: 612, status: 'Good', icon: 'Leaf', trend: [580, 595, 608, 612, 620], change: '+18' },
  { key: 'pressure', label: 'Pressure', unit: 'hPa', value: 1012, status: 'Normal', icon: 'Gauge', trend: [1008, 1010, 1011, 1012, 1013], change: '+4' },
  { key: 'light', label: 'Light', unit: 'Lux', value: 650, status: 'Normal', icon: 'SunMedium', trend: [600, 620, 640, 650, 670], change: '+22' },
  { key: 'soilMoisture', label: 'Soil Moisture', unit: '%', value: 48, status: 'Low', icon: 'Sprout', trend: [52, 51, 49, 48, 46], change: '-3.1' },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', value: 2.4, status: 'Light', icon: 'CloudRain', trend: [1.8, 2.1, 2.3, 2.4, 2.9], change: '+0.5' },
  { key: 'windSpeed', label: 'Wind Speed', unit: 'km/h', value: 12, status: 'Normal', icon: 'Wind', trend: [9, 10, 12, 11, 12], change: '+1.1' },
  { key: 'uvIndex', label: 'UV Index', unit: '', value: 5.2, status: 'Moderate', icon: 'Sun', trend: [4.8, 5.0, 5.2, 5.4, 5.2], change: '+0.4' },
]

export const chartData = [
  { time: '00:00', temperature: 27.5, humidity: 61, aqi: 74, co2: 590 },
  { time: '02:00', temperature: 27.8, humidity: 60, aqi: 71, co2: 575 },
  { time: '04:00', temperature: 27.4, humidity: 64, aqi: 68, co2: 560 },
  { time: '06:00', temperature: 28.1, humidity: 66, aqi: 72, co2: 585 },
  { time: '08:00', temperature: 29.2, humidity: 62, aqi: 76, co2: 610 },
  { time: '10:00', temperature: 30.2, humidity: 58, aqi: 81, co2: 620 },
  { time: '12:00', temperature: 31.1, humidity: 54, aqi: 86, co2: 635 },
  { time: '14:00', temperature: 30.6, humidity: 57, aqi: 89, co2: 642 },
  { time: '16:00', temperature: 29.7, humidity: 60, aqi: 82, co2: 620 },
  { time: '18:00', temperature: 28.8, humidity: 63, aqi: 80, co2: 612 },
  { time: '20:00', temperature: 28.2, humidity: 65, aqi: 78, co2: 604 },
  { time: '22:00', temperature: 27.9, humidity: 64, aqi: 75, co2: 598 },
]

export const historicalTrends = [
  { date: 'May 01', temperature: 26.8, humidity: 61, aqi: 70, co2: 510, rainfall: 12 },
  { date: 'May 05', temperature: 27.1, humidity: 63, aqi: 74, co2: 530, rainfall: 14 },
  { date: 'May 09', temperature: 28.3, humidity: 65, aqi: 77, co2: 545, rainfall: 16 },
  { date: 'May 13', temperature: 29.1, humidity: 62, aqi: 82, co2: 580, rainfall: 18 },
  { date: 'May 17', temperature: 30.4, humidity: 59, aqi: 88, co2: 600, rainfall: 20 },
  { date: 'May 21', temperature: 29.7, humidity: 60, aqi: 80, co2: 610, rainfall: 17 },
  { date: 'May 25', temperature: 28.5, humidity: 64, aqi: 79, co2: 605, rainfall: 15 },
  { date: 'May 29', temperature: 29.2, humidity: 62, aqi: 83, co2: 618, rainfall: 19 },
]

export const locations = [
  { name: 'College Campus', temperature: 28.6, humidity: 64, aqi: 82, co2: 612, status: 'Online', x: 42, y: 30 },
  { name: 'Garden Area', temperature: 26.8, humidity: 68, aqi: 71, co2: 548, status: 'Online', x: 58, y: 58 },
  { name: 'Laboratory', temperature: 30.1, humidity: 57, aqi: 96, co2: 650, status: 'Warning', x: 74, y: 42 },
  { name: 'Agricultural Area', temperature: 27.4, humidity: 52, aqi: 62, co2: 500, status: 'Online', x: 28, y: 68 },
]

export const insights = [
  'Temperature increased by 3.2°C compared with yesterday.',
  'Air quality remained moderate for most of the day.',
  'Humidity was highest between 5 AM and 7 AM.',
  'CO₂ levels increased during afternoon hours.',
]

export const adminLogs = [
  'ESP32-001 transmitted sensor packet successfully at 09:12.',
  'Threshold update for AQI set to 95 by admin.',
  'Device ESP32-003 reported weak connectivity signal.',
  'Backup sync completed for all climate readings.',
]

export const alertData = [
  { parameter: 'Temperature', current: 34.8, threshold: 33, severity: 'High', time: '09:15', device: 'ESP32-001', location: 'College Campus' },
  { parameter: 'Air Quality', current: 118, threshold: 100, severity: 'Medium', time: '08:45', device: 'ESP32-002', location: 'Laboratory' },
  { parameter: 'CO₂ Level', current: 710, threshold: 680, severity: 'Critical', time: '07:30', device: 'ESP32-004', location: 'Agricultural Area' },
  { parameter: 'Soil Moisture', current: 18, threshold: 25, severity: 'Low', time: '06:50', device: 'ESP32-003', location: 'Garden Area' },
]

export const deviceOverview = [
  { name: 'ESP32 Climate Node', type: 'Climate', status: 'Online', location: 'College Campus', sensors: 6 },
  { name: 'Air Quality Monitor', type: 'Air', status: 'Online', location: 'Laboratory', sensors: 3 },
  { name: 'Garden Environmental Unit', type: 'Field', status: 'Warning', location: 'Garden Area', sensors: 4 },
]
