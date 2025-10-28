import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { StockAPI } from '@/lib/api/stock';
import type { PredictionPeriod, StockPredictionResponse } from '@/types/prediction';

export function useStockPrediction(tradingCode: string, currentPrice: number) {
    const [selectedPeriod, setSelectedPeriod] = useState<PredictionPeriod>(7);
    const [allPredictions, setAllPredictions] = useState<StockPredictionResponse | null>(null);

    const predictionMutation = useMutation({
        mutationFn: async (period: PredictionPeriod) => {
            return await StockAPI.getStockPrediction(tradingCode, period);
        },
        onSuccess: (data) => {
            setAllPredictions(data);
        },
    });

    useEffect(() => {
        if (tradingCode) {
            predictionMutation.mutate(selectedPeriod);
        }
    }, [tradingCode]);

    const handlePeriodChange = (period: PredictionPeriod) => {
        setSelectedPeriod(period);
        predictionMutation.mutate(period);
    };

    const loading = predictionMutation.isPending;
    const error = predictionMutation.error
        ? predictionMutation.error instanceof Error
            ? predictionMutation.error.message
            : "Failed to fetch predictions"
        : null;

    const getPredictionData = () => {
        if (!allPredictions) return null;
        const key = `${selectedPeriod}_day`;
        return allPredictions.predictions[key];
    };

    const predictionData = getPredictionData();

    const chartData = predictionData
        ? predictionData.predicted_prices.map((price: number, index: number) => ({
              date: predictionData.dates[index],
              price: price,
              day: index + 1,
          }))
        : [];

    const priceChange = predictionData
        ? {
              amount: predictionData.final_price - currentPrice,
              percentage: ((predictionData.final_price - currentPrice) / currentPrice) * 100,
          }
        : { amount: 0, percentage: 0 };

    return {
        selectedPeriod,
        allPredictions,
        predictionData,
        chartData,
        priceChange,
        loading,
        error,
        handlePeriodChange,
        retry: () => predictionMutation.mutate(selectedPeriod),
    };
}
