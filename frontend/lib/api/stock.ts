import type { EnvelopeAllStocks, EnvelopeStock, EnvelopeStocks, RealTimeResponse } from "@/types/api";
import { PredictionData, PredictionRequest, PredictionResponse } from "@/types/prediction";
import type { Stock, StockHistoryPoint } from "@/types/stock";
import { deleteAPI, fetchAPI, fetchRealTimeAPI, postAPI } from "./utils";
import { favoriteStockType } from "@/schema/stocks";

export class StockAPI {
    static async getAllStocks(): Promise<RealTimeResponse> {
        return fetchRealTimeAPI<RealTimeResponse>("/latest")
    }

    static async getStockByTradingCode(tradingCode: string): Promise<Stock> {
        const res = await fetchAPI<EnvelopeStock>(`/stocks/${tradingCode}`)
        return res.stock
    }

    static async getStockHistory(tradingCode: string, start?: string, end?: string): Promise<StockHistoryPoint[]> {
        const params = new URLSearchParams()
        if (start) params.append("start", start)
        if (end) params.append("end", end)
        const query = params.toString() ? `?${params.toString()}` : ""
        const res = await fetchAPI<EnvelopeStocks>(`/stocks/${tradingCode}/history${query}`)
        return res.stocks
    }

    static async getTop30Stocks(): Promise<RealTimeResponse> {
        return fetchRealTimeAPI<RealTimeResponse>("/top30")
    }

    static async getDSEXData(symbol?: string): Promise<RealTimeResponse> {
        const params = symbol ? `?symbol=${symbol}` : ""
        return fetchRealTimeAPI<RealTimeResponse>(`/dsexdata${params}`)
    }
    static async getStockPrediction(tradingCode: string, nhead: number): Promise<PredictionData> {
        const request: PredictionRequest = { tradingCode, nhead }
        const response = await postAPI<PredictionResponse>("/predict", request)

        return this.parsePredictionMessage(response.prediction)
    }

    static async createFavoriteStock(payload: favoriteStockType): Promise<void> {
        return postAPI("/stocks/favorite", payload)
    }
    static async removeFavoriteStock(payload: favoriteStockType): Promise<void> {
        console.log("PAYLOAD", payload);

        return deleteAPI("/stocks/favorite", payload)
    }
    static async getFavoriteStocks(): Promise<EnvelopeAllStocks> {
        return fetchAPI<EnvelopeAllStocks>("/stocks/favorite")
    }

    private static parsePredictionMessage(data: any): PredictionData {
        const result = {} as PredictionData

        if (data && data.predictions) {

            if (data.predictions["1_day"]) {
                const oneDayData = data.predictions["1_day"]
                result["1_day"] = {
                    prices: oneDayData.predicted_prices || [],
                    dates: oneDayData.dates || [],
                    final_price: oneDayData.final_price || 0
                }
            }


            if (data.predictions["3_day"]) {
                const threeDayData = data.predictions["3_day"]
                result["3_day"] = {
                    prices: threeDayData.predicted_prices || [],
                    dates: threeDayData.dates || [],
                    final_price: threeDayData.final_price || 0
                }
            }

            if (data.predictions["7_day"]) {
                const sevenDayData = data.predictions["7_day"]
                result["7_day"] = {
                    prices: sevenDayData.predicted_prices || [],
                    dates: sevenDayData.dates || [],
                    final_price: sevenDayData.final_price || 0
                }
            }

            return result
        }

        console.warn('Unexpected prediction data format:', data)
        return {
            "1_day": {
                prices: [219.02],
                dates: ["2025-08-25"],
                final_price: 219.02,
            },
            "3_day": {
                prices: [290.01, 288.03, 281.94],
                dates: ["2025-08-25", "2025-08-26", "2025-08-27"],
                final_price: 281.94,
            },
            "7_day": {
                prices: [290.01, 288.03, 281.94, 289.73, 287.84, 281.76, 281.76],
                dates: ["2025-08-25", "2025-08-26", "2025-08-27", "2025-08-28", "2025-08-29", "2025-08-30", "2025-08-31"],
                final_price: 281.76,
            },
        }
    }

}
