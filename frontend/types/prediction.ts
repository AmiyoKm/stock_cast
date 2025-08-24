export interface PredictionData {
    "1_day": {
        prices: number[]
        dates: string[]
        final_price: number
    }
    "3_day": {
        prices: number[]
        dates: string[]
        final_price: number
    }
    "7_day": {
        prices: number[]
        dates: string[]
        final_price: number
    }
}

export interface PredictionResponse {
    prediction: {
        msg: string
    }
}

export interface PredictionRequest {
    tradingCode: string
    nhead: number
}

export type PredictionPeriod = 1 | 3 | 7
