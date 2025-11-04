import type {
	EnvelopeAllStocks,
	EnvelopeStock,
	EnvelopeStocks,
	RealTimeResponse,
} from "@/types/api";
import { PredictionRequest, StockPredictionResponse } from "@/types/prediction";
import type { Stock, StockHistoryPoint } from "@/types/stock";
import { getStartDateForTradingDays } from "@/lib/time";
import { deleteAPI, fetchAPI, fetchRealTimeAPI, postAPI } from "./utils";
import { favoriteStockType } from "@/schema/stocks";

export class StockAPI {
	static async getAllStocks(): Promise<RealTimeResponse> {
		return fetchRealTimeAPI<RealTimeResponse>("/latest");
	}

	static async getStockByTradingCode(tradingCode: string): Promise<Stock> {
		const res = await fetchAPI<EnvelopeStock>(`/stocks/${tradingCode}`);
		return res.stock;
	}

	static async getStockHistory(
		tradingCode: string,
		start?: string,
		end?: string,
	): Promise<StockHistoryPoint[]> {
		const params = new URLSearchParams();
		if (start) params.append("start", start);
		if (end) params.append("end", end);
		const query = params.toString() ? `?${params.toString()}` : "";
		const res = await fetchAPI<EnvelopeStocks>(
			`/stocks/${tradingCode}/history${query}`,
		);
		return res.stocks;
	}

	static async getTop30Stocks(): Promise<RealTimeResponse> {
		return fetchRealTimeAPI<RealTimeResponse>("/top30");
	}

	static async getDSEXData(symbol?: string): Promise<RealTimeResponse> {
		const params = symbol ? `?symbol=${symbol}` : "";
		return fetchRealTimeAPI<RealTimeResponse>(`/dsexdata${params}`);
	}
	static async getStockPrediction({
		tradingCode,
		nhead,
		model,
	}: PredictionRequest): Promise<{
		prevDays: StockHistoryPoint[];
		response: StockPredictionResponse;
	}> {
		const request: PredictionRequest = { tradingCode, nhead, model };

		const endDate = new Date();
		const startDate = getStartDateForTradingDays(endDate, nhead + 1);

		const prevDays = await StockAPI.getStockHistory(
			tradingCode,
			startDate.toISOString().slice(0, 10),
			endDate.toISOString().slice(0, 10),
		);


		const response = await postAPI<StockPredictionResponse>(
			"/predict",
			request,
		);

		return {
			prevDays,
			response,
		};
	}

	static async createFavoriteStock(
		payload: favoriteStockType,
	): Promise<void> {
		return postAPI("/stocks/favorite", payload);
	}
	static async removeFavoriteStock(
		payload: favoriteStockType,
	): Promise<void> {
		return deleteAPI("/stocks/favorite", payload);
	}
	static async getFavoriteStocks(): Promise<EnvelopeAllStocks> {
		return fetchAPI<EnvelopeAllStocks>("/stocks/favorite");
	}
}
