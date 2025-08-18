"use client"

import type React from "react"
import { useState } from "react"
import type { Stock } from "@/types/stock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, TrendingUp, TrendingDown, Eye, Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { StockTermTooltip } from "@/components/stock-glossary"
import {
    formatCurrency,
    formatNumber,
    formatVolume,
    calculatePriceChange,
    getPriceChangeColor,
} from "@/lib/utils/format"

interface StockTableProps {
    stocks: Stock[]
    onStockClick?: (tradingCode: string) => void
}

type SortField = "tradingCode" | "ltp" | "change" | "volume" | "value"
type SortDirection = "asc" | "desc"

export function StockTable({ stocks, onStockClick }: StockTableProps) {
    const [sortField, setSortField] = useState<SortField>("tradingCode")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const handleFavoriteToggle = (tradingCode: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (isFavorite(tradingCode)) {
            removeFromFavorites(tradingCode)
        } else {
            addToFavorites(tradingCode)
        }
    }

    const sortedStocks = [...stocks].sort((a, b) => {
        let aValue: number | string
        let bValue: number | string

        switch (sortField) {
            case "tradingCode":
                aValue = a.tradingCode
                bValue = b.tradingCode
                break
            case "ltp":
                aValue = a.ltp
                bValue = b.ltp
                break
            case "change":
                aValue = calculatePriceChange(a.ltp, a.ycp).change
                bValue = calculatePriceChange(b.ltp, b.ycp).change
                break
            case "volume":
                aValue = a.volume
                bValue = b.volume
                break
            case "value":
                aValue = a.value
                bValue = b.value
                break
            default:
                aValue = a.tradingCode
                bValue = b.tradingCode
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-medium hover:bg-accent transition-colors"
            onClick={() => handleSort(field)}
        >
            {children}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="font-serif text-xl">Live Market Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[140px]">
                                    <StockTermTooltip term="TRADING CODE">
                                        <SortButton field="tradingCode">Trading Code</SortButton>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[100px]">
                                    <StockTermTooltip term="LTP">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="ltp">LTP</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[120px]">
                                    <StockTermTooltip term="CHANGE">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="change">Change</SortButton>
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
                                            <SortButton field="volume">Volume</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="text-right min-w-[120px] hidden lg:table-cell">
                                    <StockTermTooltip term="VALUE">
                                        <div className="flex justify-end w-full">
                                            <SortButton field="value">Value</SortButton>
                                        </div>
                                    </StockTermTooltip>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
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
