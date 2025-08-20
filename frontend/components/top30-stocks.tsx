"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { mockStocks } from "@/lib/api"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils/format"
import type { Stock } from "@/types/stock"

export function Top30Stocks() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTop30 = async () => {
      try {
        // For now, use mock data - replace with real API call when backend is ready
        // const response = await StockAPI.getTop30Stocks()
        // setStocks(response.data)
        setStocks(mockStocks.slice(0, 7)) // Show top 7 as mock top 30
      } catch (error) {
        console.error("Failed to fetch top 30 stocks:", error)
        setStocks(mockStocks.slice(0, 7))
      } finally {
        setLoading(false)
      }
    }

    fetchTop30()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stocks.map((stock, index) => {
            const change = stock.ltp - stock.ycp
            const changePercent = (change / stock.ycp) * 100
            const isPositive = change >= 0

            return (
              <div
                key={stock.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{stock.tradingCode}</p>
                    <p className="text-xs text-muted-foreground">Vol: {formatNumber(stock.volume)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(stock.ltp)}</p>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                      {formatPercentage(changePercent)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
