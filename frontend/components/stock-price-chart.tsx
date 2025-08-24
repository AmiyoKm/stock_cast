"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockAPI } from "@/lib/api"
import { getDateInString } from "@/lib/time"
import { formatCurrency } from "@/lib/utils/format"
import type { ChartTimeframe } from "@/types/stock"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface StockPriceChartProps {
    tradingCode: string
    currentPrice: number
    previousClose: number
}

const timeframes: { value: ChartTimeframe; label: string }[] = [
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
    { value: "3M", label: "3M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
]

export function StockPriceChart({ tradingCode, currentPrice, previousClose }: StockPriceChartProps) {
    const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>("1M")
    const [chartType, setChartType] = useState<"line" | "area">("area")

    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    const start = getDateInString(now, selectedTimeframe)

    const { data: historyData } = useQuery({
        queryKey: ["stocks", start, end],
        queryFn: () => StockAPI.getStockHistory(tradingCode, start, end)
    })

    if (historyData == undefined) {
        return
    }

    const isPositive = currentPrice >= previousClose

    const chartData = historyData.map((point) => ({
        ...point,
        displayDate: new Date(point.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }))


    if (!chartData || chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center text-muted-foreground">No chart data available</div>
                </CardContent>
            </Card>
        )
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{new Date(data.date).toLocaleDateString()}</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Close:</span>
                            <span className="font-mono">{formatCurrency(data.closep)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">High:</span>
                            <span className="font-mono text-primary">{formatCurrency(data.high)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Low:</span>
                            <span className="font-mono text-destructive">{formatCurrency(data.low)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-mono">{data.volume.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Price Chart
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-primary" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <Badge variant={isPositive ? "default" : "destructive"}>
                            {(((currentPrice - previousClose) / previousClose) * 100).toFixed(2)}%
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {timeframes.map((timeframe) => (
                            <Button
                                key={timeframe.value}
                                variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedTimeframe(timeframe.value)}
                                className="h-8 px-3"
                            >
                                {timeframe.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-1">
                        <Button
                            variant={chartType === "line" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChartType("line")}
                            className="h-8 px-3"
                        >
                            Line
                        </Button>
                        <Button
                            variant={chartType === "area" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChartType("area")}
                            className="h-8 px-3"
                        >
                            Area
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-80 w-full" style={{ minHeight: "320px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "area" ? (
                            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    domain={["dataMin - 5", "dataMax + 5"]}
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `৳${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="closep"
                                    stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        ) : (
                                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    {/* Y-Axis for Price */}
                                    <YAxis
                                        yAxisId="price"
                                        domain={["dataMin - 5", "dataMax + 5"]}
                                        tickFormatter={(value) => `৳${value}`}
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    {/* Y-Axis for Volume */}
                                    <YAxis
                                        yAxisId="volume"
                                        orientation="right"
                                        tickFormatter={(value) => `${value / 1000}k`} // Format volume
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        yAxisId="price"
                                        type="monotone"
                                        dataKey="closep"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Bar
                                        yAxisId="volume"
                                        dataKey="volume"
                                        fill="hsl(var(--secondary))"
                                        className="opacity-50"
                                    />
                                </ComposedChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
