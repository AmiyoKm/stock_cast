"use client"

import type { Stock } from "@/types/stock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, BarChart3, DollarSign, Clock, Target, AlertTriangle, Shield, Zap } from "lucide-react"
import { formatCurrency, formatNumber, calculatePriceChange } from "@/lib/utils/format"

interface StockMetricsProps {
  stock: Stock
}

export function StockMetrics({ stock }: StockMetricsProps) {
  const priceChange = calculatePriceChange(stock.ltp, stock.ycp)
  const volatility = ((stock.high - stock.low) / stock.low) * 100
  const volumeScore = Math.min((stock.volume / 1000000) * 100, 100) // Normalize to 100

  const momentum =
    priceChange.changePercent > 2
      ? "Strong"
      : priceChange.changePercent > 0
        ? "Positive"
        : priceChange.changePercent < -2
          ? "Weak"
          : "Neutral"
  const liquidityScore = Math.min((stock.trade / 100) * 10, 100) // Based on number of trades
  const priceRange = ((stock.ltp - stock.low) / (stock.high - stock.low)) * 100
  const beta = 1 + volatility / 10 // Simplified beta calculation
  const rsi = 50 + priceChange.changePercent * 2 // Simplified RSI

  return (
    <div className="space-y-4">
      {/* Enhanced Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Company Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Market Cap</span>
            <Badge variant="outline">৳{((stock.ltp * stock.volume) / 1000000).toFixed(1)}M</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Beta Coefficient</span>
            <Badge variant={beta > 1.5 ? "destructive" : beta > 1 ? "secondary" : "default"}>{beta.toFixed(2)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Day's Range</span>
            <Badge variant="outline">
              {formatCurrency(stock.low)} - {formatCurrency(stock.high)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price Position</span>
            <Badge variant={priceRange > 70 ? "default" : priceRange < 30 ? "destructive" : "secondary"}>
              {priceRange.toFixed(0)}% of range
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Daily Change</span>
              <span className={`text-sm font-mono ${priceChange.isPositive ? "text-primary" : "text-destructive"}`}>
                {priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
            <Progress value={Math.abs(priceChange.changePercent) * 10} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Volatility Index</span>
              <span className="text-sm font-mono">{volatility.toFixed(2)}%</span>
            </div>
            <Progress value={volatility * 2} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">RSI (14)</span>
              <span className="text-sm font-mono">{Math.max(0, Math.min(100, rsi)).toFixed(0)}</span>
            </div>
            <Progress value={Math.max(0, Math.min(100, rsi))} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Liquidity Score</span>
              <span className="text-sm font-mono">{liquidityScore.toFixed(0)}/100</span>
            </div>
            <Progress value={liquidityScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Trading Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trading Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Avg. Trade Size</div>
              <div className="text-sm text-muted-foreground font-mono">{formatCurrency(stock.value / stock.trade)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Total Trades</div>
              <div className="text-sm text-muted-foreground font-mono">{formatNumber(stock.trade)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Momentum</div>
              <Badge
                variant={
                  momentum === "Strong"
                    ? "default"
                    : momentum === "Positive"
                      ? "secondary"
                      : momentum === "Weak"
                        ? "destructive"
                        : "outline"
                }
              >
                {momentum}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">{new Date(stock.date).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            {volatility > 5 ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Risk Level</span>
              <Badge variant={volatility > 5 ? "destructive" : volatility > 2 ? "secondary" : "default"}>
                {volatility > 5 ? "High" : volatility > 2 ? "Medium" : "Low"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Liquidity Risk</span>
              <Badge variant={liquidityScore < 30 ? "destructive" : liquidityScore < 60 ? "secondary" : "default"}>
                {liquidityScore < 30 ? "High" : liquidityScore < 60 ? "Medium" : "Low"}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Volatility: {volatility.toFixed(2)}% (Daily range)</div>
              <div>• Beta: {beta.toFixed(2)} (Market correlation)</div>
              <div>• Liquidity: {liquidityScore.toFixed(0)}/100 (Trading activity)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
