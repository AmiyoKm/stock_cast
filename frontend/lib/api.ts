import type { Stock, StockHistoryPoint, ChartTimeframe } from "@/types/stock"
import type { RealTimeResponse, EnvelopeStock, EnvelopeStocks } from "@/types/api"

const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:8080/v1" : "/api/v1"
const REALTIME_API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:4000/v1/dse" : "/api/v1/dse"

export class StockAPI {
    private static async fetchAPI<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`)

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    private static async fetchRealTimeAPI<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${REALTIME_API_BASE_URL}${endpoint}`)
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response.json()
    }

    static async getAllStocks(): Promise<RealTimeResponse> {
        return this.fetchRealTimeAPI<RealTimeResponse>("/latest")
    }

    static async getStockByTradingCode(tradingCode: string): Promise<Stock> {
        const res = await this.fetchAPI<EnvelopeStock>(`/stocks/${tradingCode}`)
        return res.stock
    }

    static async getStockHistory(tradingCode: string, start?: string, end?: string): Promise<StockHistoryPoint[]> {
        const params = new URLSearchParams()
        if (start) params.append("start", start)
        if (end) params.append("end", end)
        const query = params.toString() ? `?${params.toString()}` : ""
        const res = await this.fetchAPI<EnvelopeStocks>(`/stocks/${tradingCode}/history${query}`)
        return res.stocks
    }

    static async getTop30Stocks(): Promise<RealTimeResponse> {
        return this.fetchRealTimeAPI<RealTimeResponse>("/top30")
    }

    static async getDSEXData(symbol?: string): Promise<RealTimeResponse> {
        const params = symbol ? `?symbol=${symbol}` : ""
        return this.fetchRealTimeAPI<RealTimeResponse>(`/dsexdata${params}`)
    }
}

export const generateMockHistory = (stock: Stock, days: number): StockHistoryPoint[] => {
    const history: StockHistoryPoint[] = []
    const basePrice = stock.ycp

    for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        // Generate realistic price movements
        const volatility = 0.02 // 2% daily volatility
        const trend = (Math.random() - 0.5) * volatility
        const prevClose = i === days ? basePrice : history[history.length - 1]?.close || basePrice

        const open = prevClose * (1 + (Math.random() - 0.5) * volatility * 0.5)
        const close = open * (1 + trend)
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.3)
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.3)
        const volume = stock.volume * (0.5 + Math.random())

        history.push({
            date: date.toISOString().split("T")[0],
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: Math.round(volume),
        })
    }

    return history
}

export const mockStockHistory = (tradingCode: string, timeframe: ChartTimeframe): StockHistoryPoint[] => {
    const stock = mockStocks.find((s) => s.tradingCode === tradingCode)
    if (!stock) return []

    const days = {
        "1D": 1,
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "1Y": 365,
    }[timeframe]

    return generateMockHistory(stock, days)
}

// Mock data for development/testing
export const mockStocks: Stock[] = [
    {
        id: 1,
        date: "2025-08-18",
        tradingCode: "SQURPHARMA",
        ltp: 245.5,
        high: 248.0,
        low: 242.1,
        openp: 243.0,
        closep: 245.5,
        ycp: 240.0,
        trade: 1250,
        value: 306875000,
        volume: 1250000,
    },
    {
        id: 2,
        date: "2025-08-18",
        tradingCode: "GRAMEENPHONE",
        ltp: 312.75,
        high: 315.2,
        low: 310.5,
        openp: 311.0,
        closep: 312.75,
        ycp: 308.9,
        trade: 2100,
        value: 656625000,
        volume: 2100000,
    },
    {
        id: 3,
        date: "2025-08-18",
        tradingCode: "BRACBANK",
        ltp: 45.8,
        high: 46.5,
        low: 45.2,
        openp: 45.3,
        closep: 45.8,
        ycp: 44.9,
        trade: 3200,
        value: 146560000,
        volume: 3200000,
    },
    {
        id: 4,
        date: "2025-08-18",
        tradingCode: "BEXIMCO",
        ltp: 18.9,
        high: 19.2,
        low: 18.7,
        openp: 18.8,
        closep: 18.9,
        ycp: 19.5,
        trade: 5600,
        value: 105840000,
        volume: 5600000,
    },
    {
        id: 5,
        date: "2025-08-18",
        tradingCode: "CITYBANK",
        ltp: 28.4,
        high: 28.9,
        low: 28.1,
        openp: 28.2,
        closep: 28.4,
        ycp: 27.8,
        trade: 1800,
        value: 51120000,
        volume: 1800000,
    },
]
