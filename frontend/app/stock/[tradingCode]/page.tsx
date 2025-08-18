"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Stock } from "@/types/stock"
import { mockStocks } from "@/lib/api"
import { Header } from "@/components/header"
import { StockDetailCard } from "@/components/stock-detail-card"
import { StockMetrics } from "@/components/stock-metrics"
import { StockPriceChart } from "@/components/stock-price-chart"
import { VolumeChart } from "@/components/volume-chart"
import { StockDetailSkeleton } from "@/components/loading-skeleton"
import { ErrorBoundary, ErrorFallback } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tradingCode = params.tradingCode as string

  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadStock = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // For now, use mock data - replace with actual API call later
        // const data = await StockAPI.getStockByTradingCode(tradingCode);
        const data = mockStocks.find((s) => s.tradingCode === tradingCode)

        if (!data) {
          throw new Error(`Stock with trading code "${tradingCode}" not found`)
        }

        setStock(data)
      } catch (err) {
        console.error("Failed to load stock:", err)
        setError(err instanceof Error ? err : new Error("Failed to load stock"))
      } finally {
        setLoading(false)
      }
    }

    if (tradingCode) {
      loadStock()
    }
  }, [tradingCode])

  const handleRetry = () => {
    setError(null)
    setStock(null)
    setLoading(true)
    // Trigger reload
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
          <StockDetailSkeleton />
        </main>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <ErrorFallback error={error || new Error("Stock not found")} resetError={handleRetry} />
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary>
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
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">{stock.tradingCode}</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Stock Details & Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-primary font-medium">Live</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <StockDetailCard stock={stock} />
              <StockPriceChart tradingCode={stock.tradingCode} currentPrice={stock.ltp} previousClose={stock.ycp} />
              <VolumeChart tradingCode={stock.tradingCode} timeframe="1M" />
            </div>
            <div className="space-y-6">
              <StockMetrics stock={stock} />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
