"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Stock } from "@/types/stock"
import { mockStocks } from "@/lib/api"
import { Header } from "@/components/header"
import { StockTable } from "@/components/stock-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/contexts/favorites-context"
import { Heart, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react"
import { formatCurrency, calculatePriceChange, getPriceChangeColor } from "@/lib/utils/format"

export default function WatchlistPage() {
  const router = useRouter()
  const { favorites, removeFromFavorites } = useFavorites()
  const [favoriteStocks, setFavoriteStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavoriteStocks = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filter stocks that are in favorites
      const favoriteTradingCodes = favorites.map((fav) => fav.tradingCode)
      const filteredStocks = mockStocks.filter((stock) => favoriteTradingCodes.includes(stock.tradingCode))

      setFavoriteStocks(filteredStocks)
      setLoading(false)
    }

    loadFavoriteStocks()
  }, [favorites])

  const handleStockClick = (tradingCode: string) => {
    router.push(`/stock/${tradingCode}`)
  }

  const totalValue = favoriteStocks.reduce((sum, stock) => sum + stock.ltp * 100, 0) // Assuming 100 shares each
  const totalGainLoss = favoriteStocks.reduce((sum, stock) => {
    const change = calculatePriceChange(stock.ltp, stock.ycp)
    return sum + change.change * 100 // Assuming 100 shares each
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Heart className="h-8 w-8 text-red-500" />
                My Watchlist
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">Track your favorite stocks and investments</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {favorites.length} stocks tracked
          </Badge>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your watchlist by adding stocks you want to track
              </p>
              <Button onClick={() => router.push("/")} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Browse Stocks
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Portfolio Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(totalValue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Based on 100 shares each</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-mono ${getPriceChangeColor(totalGainLoss >= 0)}`}>
                    {totalGainLoss >= 0 ? "+" : ""}
                    {formatCurrency(totalGainLoss)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {totalGainLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs ${getPriceChangeColor(totalGainLoss >= 0)}`}>
                      {((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  {favoriteStocks.length > 0 && (
                    <>
                      <div className="font-mono font-semibold">
                        {
                          favoriteStocks.reduce((best, stock) => {
                            const bestChange = calculatePriceChange(best.ltp, best.ycp)
                            const stockChange = calculatePriceChange(stock.ltp, stock.ycp)
                            return stockChange.changePercent > bestChange.changePercent ? stock : best
                          }).tradingCode
                        }
                      </div>
                      <div className="text-xs text-primary mt-1">
                        +
                        {favoriteStocks
                          .reduce((best, stock) => {
                            const bestChange = calculatePriceChange(best.ltp, best.ycp)
                            const stockChange = calculatePriceChange(stock.ltp, stock.ycp)
                            return stockChange.changePercent > bestChange.changePercent ? stockChange : bestChange
                          })
                          .changePercent.toFixed(2)}
                        %
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Favorite Stocks Table */}
            <StockTable stocks={favoriteStocks} onStockClick={handleStockClick} />
          </>
        )}
      </main>
    </div>
  )
}
