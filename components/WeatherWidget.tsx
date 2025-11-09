"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, CloudSun, Droplets, Wind, MapPin } from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  description: string
}

interface WeatherWidgetProps {
  defaultLocation?: string
}

export default function WeatherWidget({ defaultLocation = "Kigali" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/public/weather?location=${encodeURIComponent(defaultLocation)}`)
        if (!response.ok) throw new Error("Failed to fetch weather")
        const data = await response.json()
        setWeather(data)
      } catch (err: any) {
        setError(err.message || "Unable to load weather")
        console.error("Weather fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [defaultLocation])

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes("rain") || lower.includes("drizzle")) return <CloudRain className="h-8 w-8" />
    if (lower.includes("cloud")) return <Cloud className="h-8 w-8" />
    if (lower.includes("partly") || lower.includes("few")) return <CloudSun className="h-8 w-8" />
    return <Sun className="h-8 w-8" />
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-400 rounded w-24 mb-2"></div>
          <div className="h-8 bg-blue-400 rounded w-32 mb-4"></div>
          <div className="h-4 bg-blue-400 rounded w-40"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{defaultLocation}</span>
        </div>
        <p className="text-sm text-gray-200">Weather unavailable</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{weather.location}</span>
        </div>
        <div className="text-blue-200">
          {getWeatherIcon(weather.condition)}
        </div>
      </div>
      
      <div className="flex items-end gap-4 mb-4">
        <div className="text-4xl font-bold">{Math.round(weather.temperature)}°</div>
        <div className="text-sm text-blue-100 mb-1">{weather.description}</div>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-blue-100">
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  )
}

