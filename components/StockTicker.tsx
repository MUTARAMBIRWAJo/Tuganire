"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockTickerProps {
  symbols?: string[]
}

export default function StockTicker({ symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"] }: StockTickerProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const symbolsParam = symbols.join(",")
        const response = await fetch(`/api/public/stocks?symbols=${symbolsParam}`)
        if (!response.ok) throw new Error("Failed to fetch stocks")
        const data = await response.json()
        setStocks(data.stocks || [])
      } catch (err) {
        console.error("Stock fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStocks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [symbols.join(",")])

  if (loading && stocks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    )
  }

  if (stocks.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-lg">Market Watch</h3>
      </div>
      <div className="space-y-3">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0
          const isNegative = stock.change < 0
          
          return (
            <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <div className="flex-1">
                <div className="font-semibold text-sm">{stock.symbol}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">${stock.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-xs ${
                  isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600"
                }`}>
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
                  <span>
                  {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Link 
        href="/articles?category=business" 
        className="block mt-4 text-center text-sm text-blue-600 hover:underline"
      >
        View Business News →
      </Link>
    </div>
  )
}

