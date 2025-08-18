export interface Stock {
    id: number
    date: string // ISO date string, e.g. "2025-08-18"
    tradingCode: string
    ltp: number // Last Traded Price
    high: number
    low: number
    openp: number // Opening Price
    closep: number // Closing Price
    ycp: number // Yesterday's Closing Price
    trade: number
    value: number
    volume: number
}

export interface StockHistoryPoint {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface StockHistory {
    tradingCode: string
    history: StockHistoryPoint[]
}

export interface StockNotification {
    id: string
    type: "price_alert" | "volume_spike" | "news" | "earnings" | "dividend"
    tradingCode: string
    title: string
    message: string
    timestamp: string
    isRead: boolean
    priority: "low" | "medium" | "high"
    data?: {
        currentPrice?: number
        targetPrice?: number
        volumeIncrease?: number
        newsUrl?: string
    }
}

export interface UserFavorite {
    tradingCode: string
    addedAt: string
    alertPrice?: number
    notes?: string
}

export type ChartTimeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
