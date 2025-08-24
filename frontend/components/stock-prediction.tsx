"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockAPI } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils/format"
import type { PredictionData, PredictionPeriod } from "@/types/prediction"
import { useMutation } from "@tanstack/react-query"
import { Calendar, Target, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface StockPredictionProps {
    tradingCode: string
    currentPrice: number
}

export function StockPrediction({ tradingCode, currentPrice }: StockPredictionProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<PredictionPeriod>(7)
    const [allPredictions, setAllPredictions] = useState<PredictionData | null>(null)

    const predictionMutation = useMutation({
        mutationFn: async () => {
            return await StockAPI.getStockPrediction(tradingCode, 7)
        },
        onSuccess: (data) => {
            setAllPredictions(data)
        }
    })

    useEffect(() => {
        predictionMutation.mutate()
    }, [tradingCode])

    const handlePeriodChange = (period: PredictionPeriod) => {
        setSelectedPeriod(period)
    }

    // Extract mutation states
    const loading = predictionMutation.isPending
    const error = predictionMutation.error
        ? predictionMutation.error instanceof Error
            ? predictionMutation.error.message
            : "Failed to fetch predictions"
        : null

    const getPredictionData = () => {
        if (!allPredictions) return null

        const key = `${selectedPeriod}_day` as keyof PredictionData
        return allPredictions[key]
    }

    const getChartData = () => {
        const predictionData = getPredictionData()
        if (!predictionData) return []

        return predictionData.prices.map((price: number, index: number) => ({
            date: predictionData.dates[index],
            price: price,
            day: index + 1,
        }))
    }

    const getPriceChange = () => {
        const predictionData = getPredictionData()
        if (!predictionData) return { amount: 0, percentage: 0 }

        const finalPrice = predictionData.final_price
        const change = finalPrice - currentPrice
        const percentage = (change / currentPrice) * 100

        return { amount: change, percentage }
    }

    const priceChange = getPriceChange()
    const isPositive = priceChange.amount >= 0

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-xl flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Price Predictions
                    </CardTitle>
                    <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        AI Forecast
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="flex gap-2">
                    {([1, 3, 7] as PredictionPeriod[]).map((period) => (
                        <Button
                            key={period}
                            variant={selectedPeriod === period ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePeriodChange(period)}
                            disabled={loading}
                            className="flex-1"
                        >
                            {period} Day{period > 1 ? "s" : ""}
                        </Button>
                    ))}
                </div>

                {loading && (
                    <div className="space-y-4">
                        <div className="h-8 bg-muted animate-pulse rounded" />
                        <div className="h-48 bg-muted animate-pulse rounded" />
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button variant="outline" onClick={() => predictionMutation.mutate()}>
                            Retry
                        </Button>
                    </div>
                )}

                {allPredictions && !loading && !error && (
                    <>
                        {/* Prediction Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Current Price</p>
                                <p className="text-2xl font-bold">{formatCurrency(currentPrice)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Predicted ({selectedPeriod} day{selectedPeriod > 1 ? "s" : ""})
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold">{formatCurrency(getPredictionData()?.final_price || 0)}</p>
                                    <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-destructive"}`}>
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span className="text-sm font-medium">{formatPercentage(Math.abs(priceChange.percentage))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Change Indicator */}
                        <div
                            className={`p-4 rounded-lg border ${isPositive ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Expected Change</span>
                                <div className={`flex items-center gap-2 ${isPositive ? "text-success" : "text-destructive"}`}>
                                    <span className="font-bold">
                                        {isPositive ? "+" : ""}
                                        {formatCurrency(priceChange.amount)}
                                    </span>
                                    <span className="text-sm">
                                        ({isPositive ? "+" : ""}
                                        {formatPercentage(priceChange.percentage)})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Prediction Chart */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Price Trajectory</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="date"
                                            className="text-xs fill-muted-foreground"
                                            tickFormatter={(value) =>
                                                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            }
                                        />
                                        <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                            <p className="text-sm font-medium">
                                                                {new Date(label ?? "").toLocaleDateString("en-US", {
                                                                    weekday: "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </p>
                                                            <p className="text-sm text-primary">
                                                                Price: {formatCurrency(payload[0].value as number)}
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                                        />
                                        <ReferenceLine y={currentPrice} label="Current Price" stroke="red" strokeDasharray="3 3" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium mb-1">⚠️ Investment Disclaimer</p>
                            <p>
                                These predictions are generated by AI models and should not be considered as financial advice. Stock
                                prices are subject to market volatility and various external factors. Always conduct your own research
                                before making investment decisions.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
