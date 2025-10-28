import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PredictionPeriod } from "@/types/prediction";

interface StockPredictionSummaryProps {
    currentPrice: number;
    finalPrice: number;
    selectedPeriod: PredictionPeriod;
    priceChange: {
        amount: number;
        percentage: number;
    };
}

export function StockPredictionSummary({ currentPrice, finalPrice, selectedPeriod, priceChange }: StockPredictionSummaryProps) {
    const isPositive = priceChange.amount >= 0;
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Current Price
                    </p>
                    <p className="text-2xl font-bold">
                        {formatCurrency(currentPrice)}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Predicted ({selectedPeriod} day
                        {selectedPeriod > 1 ? "s" : ""})
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                            {formatCurrency(finalPrice)}
                        </p>
                        <div
                            className={`flex items-center gap-1 ${
                                isPositive
                                    ? "text-success"
                                    : "text-destructive"
                            }`}
                        >
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                                {formatPercentage(
                                    Math.abs(
                                        priceChange.percentage,
                                    ),
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`p-4 rounded-lg border ${
                    isPositive
                        ? "bg-success/5 border-success/20"
                        : "bg-destructive/5 border-destructive/20"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        Expected Change
                    </span>
                    <div
                        className={`flex items-center gap-2 ${
                            isPositive
                                ? "text-success"
                                : "text-destructive"
                        }`}
                    >
                        <span className="font-bold">
                            {isPositive ? "+" : ""}
                            {formatCurrency(priceChange.amount)}
                        </span>
                        <span className="text-sm">
                            ({isPositive ? "+" : ""}
                            {formatPercentage(
                                priceChange.percentage,
                            )}
                            )
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
