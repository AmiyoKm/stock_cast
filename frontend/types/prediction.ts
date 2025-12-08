export interface Prediction {
	predicted_prices: number[];
	dates: string[];
	final_price: number;
}

export interface PredictionData {
	[key: string]: Prediction;
}

export interface StockPredictionResponse {
	success: boolean;
	tradingCode: string;
	predictions: PredictionData;
	data_points_used: number;
	prediction_dates: string[];
}

export interface PredictionResponse {
	prediction: {
		msg: string;
	};
}

export interface PredictionRequest {
	tradingCode: string;
	nhead: PredictionPeriod;
	model: PredictionModelType;
}

export type PredictionPeriod = 1 | 3 | 7 | 15 | 30;
export type PredictionModelType = "StockCast/seperate" | "StockCast/unified" | "StockCast/gru";
