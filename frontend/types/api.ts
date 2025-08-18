import { Stock, StockHistoryPoint } from "./stock"

export type EnvelopeStocks = { stocks: StockHistoryPoint[] }
export type EnvelopeStock = { stock: Stock }
export type EnvelopeAllStocks = { stocks: Stock[] }


export type RealTimeResponse = {
    data: Stock[]
    message: string
    success: boolean
}
