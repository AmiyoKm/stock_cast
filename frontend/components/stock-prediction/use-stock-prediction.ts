import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { StockAPI } from "@/lib/api/stock";
import type {
	PredictionModelType,
	PredictionPeriod,
	StockPredictionResponse,
} from "@/types/prediction";

export function useStockPrediction(tradingCode: string, currentPrice: number) {
	const [nhead, setNhead] = useState<PredictionPeriod>(7);
	const [allPredictions, setAllPredictions] =
		useState<StockPredictionResponse | null>(null);

	const [model, setModel] =
		useState<PredictionModelType>("StockCast/seperate");

	const predictionMutation = useMutation({
		mutationFn: StockAPI.getStockPrediction,
		onSuccess: (data) => {
			setAllPredictions(data);
		},
	});

	useEffect(() => {
		predictionMutation.mutate({
			tradingCode,
			nhead,
			model,
		});
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

	const getPredictionData = () => {
		if (!allPredictions) return null;
		const key = `${nhead}_day`;
		return allPredictions.predictions[key];
	};

	const predictionData = getPredictionData();

	const chartData = predictionData
		? predictionData.predicted_prices.map(
				(price: number, index: number) => ({
					date: predictionData.dates[index],
					price: price,
					day: index + 1,
				}),
			)
		: [];

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
