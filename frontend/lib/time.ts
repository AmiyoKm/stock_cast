import { ChartTimeframe } from "@/types/stock"

export function getDateInString(now: Date, selectedTimeframe: ChartTimeframe): string {
    const date = new Date(now)
    switch (selectedTimeframe) {
        case "1D":
            date.setDate(date.getDate() - 1)
            break
        case "1W":
            date.setDate(date.getDate() - 7)
            break
        case "1M":
            date.setMonth(date.getMonth() - 1)
            break
        case "3M":
            date.setMonth(date.getMonth() - 3)
            break
        case "6M":
            date.setMonth(date.getMonth() - 6)
            break
        case "1Y":
            date.setFullYear(date.getFullYear() - 1)
            break
    }
    return date.toISOString().slice(0, 10)
}
