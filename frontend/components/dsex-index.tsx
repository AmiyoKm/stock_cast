"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { formatNumber, formatPercentage } from "@/lib/utils/format"

interface DSEXData {
  index: number
  change: number
  changePercent: number
  timestamp: string
}

export function DSEXIndex() {
  const [dsexData, setDsexData] = useState<DSEXData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDSEX = async () => {
      try {
        // For now, use mock data - replace with real API call when backend is ready
        // const response = await StockAPI.getDSEXData()
        // setDsexData(response)

        // Mock DSEX data
        setDsexData({
          index: 6247.85,
          change: 45.23,
          changePercent: 0.73,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Failed to fetch DSEX data:", error)
        // Fallback mock data
        setDsexData({
          index: 6247.85,
          change: 45.23,
          changePercent: 0.73,
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDSEX()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDSEX, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Activity className="h-5 w-5" />
            DSEX Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dsexData) return null

  const isPositive = dsexData.change >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Activity className="h-5 w-5" />
          DSEX Index
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatNumber(dsexData.index)}</span>
            <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercentage(dsexData.changePercent)}
            </Badge>
          </div>
          <p className={`text-sm ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}
            {formatNumber(dsexData.change)} points
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(dsexData.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
