"use client"

import { ErrorBoundary, ErrorFallback } from "@/components/error-boundary"
import { Header } from "@/components/header"
import { StockDetailSkeleton } from "@/components/loading-skeleton"
import { StockDetailCard } from "@/components/stock-detail-card"
import { StockMetrics } from "@/components/stock-metrics"
import { StockPriceChart } from "@/components/stock-price-chart"
import { Button } from "@/components/ui/button"
import { VolumeChart } from "@/components/volume-chart"
import { StockAPI } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function StockDetailPage() {
    const params = useParams()
    const router = useRouter()
    const tradingCode = params.tradingCode as string

    const { data: stock, isLoading, isError, error } = useQuery({
        queryKey: ["stocks", tradingCode],
        queryFn: () => StockAPI.getStockByTradingCode(tradingCode)
    })

    if (isLoading) {
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

    if (isError || !stock) {
        function handleRetry(): void {
            router.refresh()
        }
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
