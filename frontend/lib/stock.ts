import { PredictionPeriod, StockPredictionResponse } from "@/types/prediction";

export const getPredictionData = (
	nhead: PredictionPeriod,
	allPredictions: StockPredictionResponse | null,
) => {
	if (!allPredictions) return null;
	const key = `${nhead}_day`;
	const data = allPredictions.predictions[key];
	if (!data || data.dates.length === 0) return null;

	const openMarketDates: string[] = [];
	const currentDate = new Date(data.dates[0].replace(/-/g, "/"));

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	while (openMarketDates.length < data.dates.length) {
		const dayOfWeek = currentDate.getDay();
		if (dayOfWeek !== 5 && dayOfWeek !== 6) {
			// Not Friday or Saturday
			openMarketDates.push(formatDate(currentDate));
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return {
		...data,
		dates: openMarketDates,
	};
};
