"use client"

import { StockTermTooltip } from "@/components/stock-glossary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorCard } from "@/components/ui/error-card"
import { LoadingCard } from "@/components/ui/loading-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFavorites } from "@/contexts/favorites-context"
import {
    calculatePriceChange,
    formatCurrency,
    formatNumber,
    formatVolume,
    getPriceChangeColor,
} from "@/lib/utils/format"
import { sortStocks, type SortDirection, type SortField } from "@/lib/utils/sort"
import { handleFavoriteToggle as toggleFavorite, useTableSort } from "@/lib/utils/table-handlers"
import type { Stock } from "@/types/stock"
import { Eye, Heart, TrendingDown, TrendingUp } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { SortButton } from "./ui/sort-button"

interface DSEXDataTableProps {
    onStockClick?: (tradingCode: string) => void
    searchQuery?: string
    stocks?: Stock[]
}

export function DSEXDataTable({ onStockClick, searchQuery = "", stocks = [] }: DSEXDataTableProps) {
    const [sortField, setSortField] = useState<SortField>("tradingCode")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

    const isLoading = stocks.length === 0
    const error: Error | null = null

    if (!stocks || stocks.length === 0) {
        return <LoadingCard title="DSEX Market Data" />
    }

    // Use reusable table sort handler
    const handleSort = useTableSort(
        sortField,
        setSortField,
        sortDirection,
        setSortDirection
    )

    // Use reusable favorite toggle handler
    const handleFavoriteToggle = (tradingCode: string, e: React.MouseEvent) => {
        toggleFavorite(tradingCode, e, isFavorite, addToFavorites, removeFromFavorites)
    }

    // Filter stocks based on searchQuery
    const filteredStocks = searchQuery.trim() === ""
        ? stocks
        : stocks.filter((stock) =>
            stock.tradingCode.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Use the reusable sort function
    const sortedStocks = sortStocks(filteredStocks, sortField, sortDirection)

    if (isLoading) {
        return <LoadingCard title="DSEX Market Data" />
    }

    if (error) {
        return <ErrorCard title="DSEX Market Data" />
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="font-serif text-xl">DSEX Market Data</CardTitle>
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
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStocks.length === 0 && searchQuery && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6">
                                        <div className="text-center">
                                            <div className="max-w-md mx-auto">
                                                <p className="text-muted-foreground">
                                                    No stocks found matching "{searchQuery}".
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {sortedStocks.map((stock) => {
                                const priceChange = calculatePriceChange(stock.ltp, stock.ycp)
                                const changeColor = getPriceChangeColor(priceChange.isPositive)

                                return (
                                    <TableRow
                                        key={stock.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                        onClick={() => onStockClick?.(stock.tradingCode)}
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
                                                    onClick={(e) => handleFavoriteToggle(stock.tradingCode, e)}
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 ${isFavorite(stock.tradingCode)
                                                            ? "fill-red-500 text-red-500"
                                                            : "text-muted-foreground hover:text-red-500"
                                                            }`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onStockClick?.(stock.tradingCode)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
