import { Stock, StockHistoryPoint } from "./stock"
import { TokenType } from "./token"
import { User } from "./users"

export type EnvelopeStocks = { stocks: StockHistoryPoint[] }
export type EnvelopeStock = { stock: Stock }
export type EnvelopeAllStocks = { stocks: Stock[] }


export type RealTimeResponse = {
    data: Stock[]
    message: string
    success: boolean
}

export type EnvelopeRegisterUser = {
    user: User,
    token: TokenType
}

export type EnvelopeLoginUser = {
    authentication_token: string
}
