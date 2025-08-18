"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockAPI } from "@/lib/api"; // Make sure this path is correct
import { formatVolume } from "@/lib/utils/format";
import type { ChartTimeframe } from "@/types/stock";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface VolumeChartProps {
    tradingCode: string
    timeframe: ChartTimeframe
}

export function VolumeChart({ tradingCode, timeframe }: VolumeChartProps) {
    const { data: historyData = [], isLoading, isError, error } = useQuery({
        queryKey: ["stockHistory", tradingCode, timeframe],
        queryFn: () => StockAPI.getStockHistory(tradingCode),
    })


    const chartData = historyData.map((point) => ({
        ...point,
        displayDate: new Date(point.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }))

    console.log("chartData @@@@", chartData);


    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{new Date(data.date).toLocaleDateString()}</p>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-mono">{data.volume.toLocaleString()}</span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Volume
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">Loading...</div>
                    ) : isError ? (
                        <div className="text-red-500">{(error as Error).message}</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} className="text-xs" />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                    tickFormatter={(value) => formatVolume(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.6} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
