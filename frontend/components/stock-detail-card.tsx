"use client"

import type { Stock } from "@/types/stock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { formatCurrency, calculatePriceChange, getPriceChangeColor } from "@/lib/utils/format"

interface StockDetailCardProps {
  stock: Stock
}

export function StockDetailCard({ stock }: StockDetailCardProps) {
  const priceChange = calculatePriceChange(stock.ltp, stock.ycp)
  const changeColor = getPriceChangeColor(priceChange.isPositive)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

  const handleFavoriteToggle = () => {
    if (isFavorite(stock.tradingCode)) {
      removeFromFavorites(stock.tradingCode)
    } else {
      addToFavorites(stock.tradingCode)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="font-serif text-2xl">{stock.tradingCode}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} className="h-8 w-8">
              <Heart
                className={`h-5 w-5 ${
                  isFavorite(stock.tradingCode)
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              />
            </Button>
          </div>
          <Badge variant={priceChange.isPositive ? "default" : "destructive"} className="gap-1">
            {priceChange.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {priceChange.changePercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Section */}
        <div className="text-center py-6 border-b">
          <div className="space-y-2">
            <div className="text-4xl font-bold font-mono">{formatCurrency(stock.ltp)}</div>
            <div className={`text-lg font-mono ${changeColor}`}>
              {priceChange.change >= 0 ? "+" : ""}
              {priceChange.change.toFixed(2)}
              <span className="text-sm ml-2">
                ({priceChange.changePercent >= 0 ? "+" : ""}
                {priceChange.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last Traded Price • {new Date(stock.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Today's Range</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">High</span>
                <span className="font-mono font-semibold text-primary">{formatCurrency(stock.high)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Low</span>
                <span className="font-mono font-semibold text-destructive">{formatCurrency(stock.low)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Open</span>
                <span className="font-mono">{formatCurrency(stock.openp)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Previous Close</span>
                <span className="font-mono">{formatCurrency(stock.ycp)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Trading Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-mono font-semibold">{stock.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trades</span>
                <span className="font-mono">{stock.trade.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono">{formatCurrency(stock.value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Price</span>
                <span className="font-mono">{formatCurrency(stock.value / stock.volume)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Low: {formatCurrency(stock.low)}</span>
            <span>High: {formatCurrency(stock.high)}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-destructive via-yellow-500 to-primary rounded-full"
              style={{
                left: `${((stock.ltp - stock.low) / (stock.high - stock.low)) * 100}%`,
                width: "2px",
                backgroundColor: priceChange.isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))",
              }}
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">Current Price Position</div>
        </div>
      </CardContent>
    </Card>
  )
}
