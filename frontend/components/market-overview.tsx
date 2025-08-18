"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock } from "lucide-react"

interface MarketOverviewProps {
  totalStocks: number
  gainers: number
  losers: number
  unchanged: number
}

export function MarketOverview({ totalStocks, gainers, losers, unchanged }: MarketOverviewProps) {
  const totalVolume = 45678900 // Mock total market volume
  const totalValue = 12450000000 // Mock total market value in BDT
  const marketTrend = ((gainers - losers) / totalStocks) * 100
  const lastUpdate = new Date().toLocaleTimeString()

  return (
    <div className="space-y-6">
      {/* Market Summary Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold">Dhaka Stock Exchange</h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdate}
        </p>
      </div>

      {/* Primary Market Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalStocks}</div>
            <p className="text-xs text-muted-foreground">Active trading today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">{gainers}</div>
            <p className="text-xs text-muted-foreground">Stocks up today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{losers}</div>
            <p className="text-xs text-muted-foreground">Stocks down today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unchanged</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{unchanged}</div>
            <p className="text-xs text-muted-foreground">No change today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
            {marketTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${marketTrend > 0 ? "text-primary" : "text-destructive"}`}>
              {marketTrend > 0 ? "+" : ""}
              {marketTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall market sentiment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(totalVolume / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Shares traded today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">৳{(totalValue / 1000000000).toFixed(1)}B</div>
            <p className="text-xs text-muted-foreground">Total turnover today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
