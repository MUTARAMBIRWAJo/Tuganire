import { NextResponse } from "next/server"

export const runtime = "edge"
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolsParam = searchParams.get("symbols") || "AAPL,GOOGL,MSFT,TSLA,AMZN"
  const symbols = symbolsParam.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)

  // Use Alpha Vantage API (free tier) or Yahoo Finance API
  // You'll need to set NEXT_PUBLIC_STOCK_API_KEY in your environment variables
  const apiKey = process.env.NEXT_PUBLIC_STOCK_API_KEY || process.env.STOCK_API_KEY

  if (!apiKey) {
    // Return mock data if API key is not configured
    const mockStocks = symbols.map(symbol => ({
      symbol,
      name: getStockName(symbol),
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
    }))

    return NextResponse.json({ stocks: mockStocks })
  }

  try {
    // Using Alpha Vantage API
    const stocks = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
            {
              next: { revalidate: 300 }, // Cache for 5 minutes
            }
          )

          if (!response.ok) {
            throw new Error("Stock API error")
          }

          const data = await response.json()
          const quote = data["Global Quote"]

          if (!quote || !quote["05. price"]) {
            throw new Error("Invalid stock data")
          }

          const price = parseFloat(quote["05. price"])
          const change = parseFloat(quote["09. change"] || "0")
          const changePercent = parseFloat(quote["10. change percent"]?.replace("%", "") || "0")

          return {
            symbol,
            name: quote["01. symbol"] || getStockName(symbol),
            price,
            change,
            changePercent,
          }
        } catch (error) {
          // Return fallback data for this symbol
          return {
            symbol,
            name: getStockName(symbol),
            price: 100 + Math.random() * 100,
            change: (Math.random() - 0.5) * 5,
            changePercent: (Math.random() - 0.5) * 3,
          }
        }
      })
    )

    return NextResponse.json({ stocks })
  } catch (error: any) {
    console.error("Stock API error:", error)
    
    // Return fallback data
    const fallbackStocks = symbols.map(symbol => ({
      symbol,
      name: getStockName(symbol),
      price: 100 + Math.random() * 100,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 3,
    }))

    return NextResponse.json({ stocks: fallbackStocks })
  }
}

function getStockName(symbol: string): string {
  const names: Record<string, string> = {
    AAPL: "Apple Inc.",
    GOOGL: "Alphabet Inc.",
    MSFT: "Microsoft Corporation",
    TSLA: "Tesla, Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    NVDA: "NVIDIA Corporation",
    NFLX: "Netflix, Inc.",
  }
  return names[symbol] || `${symbol} Corporation`
}

