import { Stock } from "@/types/stock"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SortField } from "./utils/sort"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function transformRawStock(raw: any): Stock {
    return {
        id: Number(raw["#"] ?? 0),
        date: new Date().toISOString().slice(0, 10),
        tradingCode: raw["TRADING CODE"] ?? "",
        ltp: Number(raw["LTP*"] ?? raw.LTP ?? 0),
        high: Number(raw.HIGH ?? 0),
        low: Number(raw.LOW ?? 0),
        openp: Number(raw["OPENP*"] ?? raw.OPENP ?? raw.HIGH ?? 0),
        closep: Number(raw["CLOSEP*"] ?? raw.CLOSEP ?? raw.LTP ?? 0),
        ycp: Number(raw["YCP*"] ?? raw.YCP ?? 0),
        trade: Number(raw.TRADE ?? 0),
        value: Number(raw["VALUE (mn)"] ?? raw.VALUE ?? 0),
        volume: Number(
            (raw.VOLUME ?? "0").replace(/,/g, "")
        ),
    }
}


