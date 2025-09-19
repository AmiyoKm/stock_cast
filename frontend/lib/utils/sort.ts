import type { Stock } from "@/types/stock";
import { calculatePriceChange } from "./format";

export type SortField = "tradingCode" | "ltp" | "change" | "volume" | "value";
export type SortDirection = "asc" | "desc";

/**
 * Generic sorting function for stock data
 * @param stocks Array of stock objects to sort
 * @param sortField Field to sort by
 * @param sortDirection Direction to sort (asc or desc)
 * @returns Sorted array of stocks
 */
export function sortStocks<T extends Pick<Stock, 'tradingCode' | 'ltp' | 'ycp' | 'volume' | 'value'>>(
    stocks: T[],
    sortField: SortField,
    sortDirection: SortDirection
): T[] {
    return [...stocks].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
            case "tradingCode":
                aValue = a.tradingCode;
                bValue = b.tradingCode;
                break;
            case "ltp":
                aValue = a.ltp;
                bValue = b.ltp;
                break;
            case "change":
                aValue = calculatePriceChange(a.ltp, a.ycp).change;
                bValue = calculatePriceChange(b.ltp, b.ycp).change;
                break;
            case "volume":
                aValue = a.volume;
                bValue = b.volume;
                break;
            case "value":
                aValue = a.value;
                bValue = b.value;
                break;
            default:
                aValue = a.tradingCode;
                bValue = b.tradingCode;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
    });
}
