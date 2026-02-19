import { NextResponse } from "next/server"

export const runtime = "edge"
export const revalidate = 1800 // Revalidate every 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location") || "Kigali"

  // Use OpenWeatherMap API (free tier)
  // You'll need to set NEXT_PUBLIC_WEATHER_API_KEY in your environment variables
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || process.env.WEATHER_API_KEY

  if (!apiKey) {
    // Return mock data if API key is not configured
    return NextResponse.json({
      location,
      temperature: 25,
      condition: "Partly Cloudy",
      icon: "partly-cloudy",
      humidity: 65,
      windSpeed: 12,
      description: "Partly cloudy with light winds",
    })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    if (!response.ok) {
      throw new Error("Weather API error")
    }

    const data = await response.json()

    return NextResponse.json({
      location: data.name || location,
      temperature: data.main.temp,
      condition: data.weather[0]?.main || "Clear",
      icon: data.weather[0]?.icon || "01d",
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind.speed || 0) * 3.6), // Convert m/s to km/h
      description: data.weather[0]?.description || "Clear sky",
    })
  } catch (error: any) {
    console.error("Weather API error:", error)
    
    // Return fallback data
    return NextResponse.json({
      location,
      temperature: 25,
      condition: "Clear",
      icon: "01d",
      humidity: 65,
      windSpeed: 12,
      description: "Weather data unavailable",
    })
  }
}

