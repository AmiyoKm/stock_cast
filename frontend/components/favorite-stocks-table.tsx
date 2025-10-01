"use client"

import { StockTermTooltip } from "@/components/stock-glossary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorCard } from "@/components/ui/error-card"
import { LoadingCard } from "@/components/ui/loading-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    calculatePriceChange,
    formatCurrency,
    formatNumber,
    formatVolume,
    getPriceChangeColor,
} from "@/lib/utils/format"
import { sortStocks, type SortDirection, type SortField } from "@/lib/utils/sort"
import { useTableSort } from "@/lib/utils/table-handlers"
import { Eye, Star, TrendingDown, TrendingUp, Trash2 } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { SortButton } from "./ui/sort-button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StockAPI } from "@/lib/api/stock"


export default function FavoriteStocksTable() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const [sortField, setSortField] = useState<SortField>("tradingCode")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    const { data, isLoading, isError } = useQuery({
        queryKey: ["favoriteStocks"],
        queryFn: StockAPI.getFavoriteStocks,
    })

    const removeFavoriteMutation = useMutation({
        mutationFn: StockAPI.removeFavoriteStock,
        onSuccess: () => {
            toast.success("Success", {
                description: "Stock removed from favorites.",
            })
            return queryClient.invalidateQueries({ queryKey: ["favoriteStocks"] })
        },
        onError: (err) => {
            toast.error("Error", {
                description: err.message || "Could not remove stock from favorites.",
            })
        },
    })

    const handleSort = useTableSort(
        sortField,
        setSortField,
        sortDirection,
        setSortDirection
    )

    const handleRemoveFavorite = (tradingCode: string) => {
        removeFavoriteMutation.mutate({ trading_code: tradingCode })
    };

    const handleStockClick = (tradingCode: string) => {
        router.push(`/stock/${tradingCode}`);
    };

    if (isLoading) {
        return <LoadingCard title="Favorite Stocks" />
    }

    if (isError) {
        return <ErrorCard title="Favorite Stocks" />
    }

    const stocks = data?.stocks || []
    const sortedStocks = sortStocks(stocks, sortField, sortDirection)

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="font-serif text-xl">Your Favorite Stocks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[140px]">
                                    <StockTermTooltip term="TRADING CODE">
                                        <SortButton field="tradingCode" onClick={handleSort}>Trading Code</SortButton>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[100px]">
                                    <StockTermTooltip term="LTP">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="ltp" onClick={handleSort}>LTP</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[120px]">
                                    <StockTermTooltip term="CHANGE">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="change" onClick={handleSort}>Change</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[80px] hidden sm:table-cell">
                                    <StockTermTooltip term="HIGH">
                                        <div className="flex justify-end w-full">
                                            <span className="font-medium">High</span>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[80px] hidden sm:table-cell">
                                    <StockTermTooltip term="LOW">
                                        <div className="flex justify-end w-full">
                                            <span className="font-medium">Low</span>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[100px] hidden md:table-cell">
                                    <StockTermTooltip term="VOLUME">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="volume" onClick={handleSort}>Volume</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[120px] hidden lg:table-cell">
                                    <StockTermTooltip term="VALUE">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="value" onClick={handleSort}>Value</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStocks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <Star className="h-12 w-12 text-muted-foreground" />
                                            <h3 className="font-semibold text-lg">No Favorite Stocks</h3>
                                            <p className="text-muted-foreground">You haven&apos;t added any stocks to your favorites yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedStocks.map((stock) => {
                                    const priceChange = calculatePriceChange(stock.ltp, stock.ycp)
                                    const changeColor = getPriceChangeColor(priceChange.isPositive)

                                    return (
                                        <TableRow
                                            key={stock.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                            onClick={() => handleStockClick(stock.tradingCode)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{stock.tradingCode}</span>
                                                    {priceChange.isPositive ? (
                                                        <TrendingUp className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold tabular-nums">
                                                {formatCurrency(stock.ltp)}
                                            </TableCell>
                                            <TableCell className={`text-right font-mono tabular-nums ${changeColor}`}>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-semibold">
                                                        {priceChange.change >= 0 ? "+" : ""}
                                                        {priceChange.change.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs opacity-75">
                                                        ({priceChange.changePercent >= 0 ? "+" : ""}
                                                        {priceChange.changePercent.toFixed(2)}%)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-primary tabular-nums hidden sm:table-cell">
                                                {formatCurrency(stock.high)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-destructive tabular-nums hidden sm:table-cell">
                                                {formatCurrency(stock.low)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono tabular-nums hidden md:table-cell">
                                                {formatVolume(stock.volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm tabular-nums hidden lg:table-cell">
                                                {formatNumber(stock.value)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleStockClick(stock.tradingCode)
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveFavorite(stock.tradingCode)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
