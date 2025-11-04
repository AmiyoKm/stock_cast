import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { StockAPI } from "@/lib/api/stock";
import type {
	PredictionModelType,
	PredictionPeriod,
	StockPredictionResponse,
} from "@/types/prediction";
import { getPredictionData } from "@/lib/stock";
import { StockHistoryPoint } from "@/types/stock";

export function useStockPrediction(tradingCode: string, currentPrice: number) {
	const [nhead, setNhead] = useState<PredictionPeriod>(7);
	const [allPredictions, setAllPredictions] =
		useState<StockPredictionResponse | null>(null);
	const [prevDaysStock, setPrevDaysStock] = useState<StockHistoryPoint[]>([]);

	const [model, setModel] =
		useState<PredictionModelType>("StockCast/seperate");

	const predictionMutation = useMutation({
		mutationFn: StockAPI.getStockPrediction,
		onSuccess: (data) => {
			setAllPredictions(data.response);
			setPrevDaysStock(data.prevDays);
		},
	});

	useEffect(() => {
		predictionMutation.mutate({
			tradingCode,
			nhead,
			model,
		});
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nhead, model]);

	const handlePeriodChange = (nhead: PredictionPeriod) => {
		setNhead(nhead);
		predictionMutation.mutate({
			tradingCode,
			nhead,
			model,
		});
	};

	const handleModelChange = (model: PredictionModelType) => {
		setModel(model);
		predictionMutation.mutate({
			tradingCode,
			nhead,
			model,
		});
	};

	const loading = predictionMutation.isPending;
	const error = predictionMutation.error
		? predictionMutation.error instanceof Error
			? predictionMutation.error.message
			: "Failed to fetch predictions"
		: null;

	const predictionData = getPredictionData(nhead, allPredictions);

	const chartData: { date: string; history?: number; prediction?: number }[] =
		prevDaysStock.map((p) => ({
			date: p.date.slice(0, 10),
			history: p.closep,
		}));

	if (chartData.length > 0) {
		const lastPoint = chartData[chartData.length - 1];
		lastPoint.prediction = lastPoint.history;
	}

	if (predictionData) {
		const predictionPoints = predictionData.predicted_prices.map(
			(price, index) => ({
				date: predictionData.dates[index],
				prediction: price,
			}),
		);
		chartData.push(...predictionPoints);
	}

	const priceChange = predictionData
		? {
				amount: predictionData.final_price - currentPrice,
				percentage:
					((predictionData.final_price - currentPrice) /
						currentPrice) *
					100,
			}
		: { amount: 0, percentage: 0 };

	return {
		nhead,
		allPredictions,
		predictionData,
		chartData,
		priceChange,
		loading,
		error,
		handlePeriodChange,
		model,
		handleModelChange,
		retry: () =>
			predictionMutation.mutate({
				tradingCode,
				nhead: nhead,
				model,
			}),
	};
}
