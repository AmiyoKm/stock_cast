"use client"

import { DSEXDataTable } from "@/components/dsex-data-table"
import { ErrorBoundary, ErrorFallback } from "@/components/error-boundary"
import { Header } from "@/components/header"
import { MarketOverviewSkeleton, StockTableSkeleton } from "@/components/loading-skeleton"
import { MarketOverview } from "@/components/market-overview"
import { StockGlossary } from "@/components/stock-glossary"
import { StockTable } from "@/components/stock-table"
import { Top30StocksTable } from "@/components/top30-stocks-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockAPI } from "@/lib/api"
import { transformRawStock } from "@/lib/utils"
import { calculatePriceChange } from "@/lib/utils/format"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export default function HomePage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("live")

    // Fetch all three data sources at once
    const { data: stocks = [], isLoading: isLoadingLive, error: liveError } = useQuery({
        queryKey: ["stock", "current"],
        queryFn: async () => {
            const res = await StockAPI.getAllStocks()
            if (res?.success && Array.isArray(res.data)) {
                return res.data.map(transformRawStock)
            }
            return []
        },
    })

    const { data: top30Stocks = [], isLoading: isLoadingTop30, error: top30Error } = useQuery({
        queryKey: ["stocks", "top30"],
        queryFn: async () => {
            const res = await StockAPI.getTop30Stocks()
            if (res?.success && Array.isArray(res.data)) {
                return res.data.map(transformRawStock)
            }
            return []
        },
    })

    const { data: dsexStocks = [], isLoading: isLoadingDSEX, error: dsexError } = useQuery({
        queryKey: ["stocks", "dsex"],
        queryFn: async () => {
            const res = await StockAPI.getDSEXData()
            if (res?.success && Array.isArray(res.data)) {
                return res.data.map(transformRawStock)
            }
            return []
        },
    })

    // Combine loading states and errors
    const isLoading = isLoadingLive || isLoadingTop30 || isLoadingDSEX
    const error = liveError || top30Error || dsexError

    // Filter stocks using useMemo for performance and simplicity
    const filteredStocks = useMemo(() => {
        if (searchQuery.trim() === "") return stocks
        return stocks.filter((stock) =>
            stock.tradingCode.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery, stocks])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    const handleStockClick = (tradingCode: string) => {
        router.push(`/stock/${tradingCode}`)
    }

    const handleRetry = () => {
        window.location.reload()
    }

    const marketStats = stocks.reduce(
        (acc, stock) => {
            const priceChange = calculatePriceChange(stock.ltp, stock.ycp)
            if (priceChange.change > 0) {
                acc.gainers++
            } else if (priceChange.change < 0) {
                acc.losers++
            } else {
                acc.unchanged++
            }
            return acc
        },
        { gainers: 0, losers: 0, unchanged: 0 },
    )

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header onSearch={handleSearch} />
                <main className="container mx-auto px-4 py-8">
                    <ErrorFallback error={error} resetError={handleRetry} />
                </main>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                <Header onSearch={handleSearch} />

                <main className="container mx-auto px-4 py-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Market Dashboard</h2>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Real-time stock prices and market data • Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-sm text-primary font-medium">Live</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <>
                            <MarketOverviewSkeleton />
                            <StockTableSkeleton />
                        </>
                    ) : (
                        <>
                            <MarketOverview
                                totalStocks={stocks.length}
                                gainers={marketStats.gainers}
                                losers={marketStats.losers}
                                unchanged={marketStats.unchanged}
                            />

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="live" className="font-medium">
                                        Live Market Data
                                    </TabsTrigger>
                                    <TabsTrigger value="top30" className="font-medium">
                                        Top 30 Stocks
                                    </TabsTrigger>
                                    <TabsTrigger value="dsex" className="font-medium">
                                        DSEX Data
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="live" className="space-y-4">
                                    <StockTable stocks={filteredStocks} onStockClick={handleStockClick} />
                                    {filteredStocks.length === 0 && searchQuery && (
                                        <div className="text-center py-12">
                                            <div className="max-w-md mx-auto">
                                                <h3 className="font-semibold text-lg mb-2">No stocks found</h3>
                                                <p className="text-muted-foreground mb-4">
                                                    No stocks found matching "{searchQuery}". Try adjusting your search terms.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="top30" className="space-y-4">
                                    <Top30StocksTable
                                        onStockClick={handleStockClick}
                                        searchQuery={searchQuery}
                                        stocks={top30Stocks}
                                    />
                                </TabsContent>

                                <TabsContent value="dsex" className="space-y-4">
                                    <DSEXDataTable
                                        onStockClick={handleStockClick}
                                        searchQuery={searchQuery}
                                        stocks={dsexStocks}
                                    />
                                </TabsContent>
                            </Tabs>

                            <StockGlossary />
                        </>
                    )}
                </main>
            </div>
        </ErrorBoundary>
    )
}
