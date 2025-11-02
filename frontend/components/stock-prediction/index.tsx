"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar } from "lucide-react";
import WittyLoading from "@/components/witty-loading";
import { useStockPrediction } from "./use-stock-prediction";
import { StockPredictionSelector } from "./stock-prediction-selector";
import { StockPredictionSummary } from "./stock-prediction-summary";
import { StockPredictionChart } from "./stock-prediction-chart";
import { StockPredictionDisclaimer } from "./stock-prediction-disclaimer";

interface StockPredictionProps {
	tradingCode: string;
	currentPrice: number;
}

export function StockPrediction({
	tradingCode,
	currentPrice,
}: StockPredictionProps) {
	const {
		nhead,
		predictionData,
		chartData,
		priceChange,
		loading,
		error,
		handlePeriodChange,
		model,
		handleModelChange,
		retry,
	} = useStockPrediction(tradingCode, currentPrice);

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
				<StockPredictionSelector
					selectedPeriod={nhead}
					handlePeriodChange={handlePeriodChange}
					loading={loading}
					selectedModel={model}
					handleModelChange={handleModelChange}
				/>

				{loading && <WittyLoading />}

				{error && (
					<div className="text-center py-8">
						<p className="text-destructive mb-4">{error}</p>
						<Button variant="outline" onClick={retry}>
							Retry
						</Button>
					</div>
				)}

				{predictionData && !loading && !error && (
					<>
						<StockPredictionSummary
							currentPrice={currentPrice}
							finalPrice={predictionData.final_price}
							selectedPeriod={nhead}
							priceChange={priceChange}
						/>
						<StockPredictionChart
							chartData={chartData}
							currentPrice={currentPrice}
						/>
						<StockPredictionDisclaimer />
					</>
				)}
			</CardContent>
		</Card>
	);
}
