import type { UTCTimestamp } from "lightweight-charts"

export type Stock = {
    name: string,
    category: string,
    owned: number
}

export type StockEntry = {
    time: UTCTimestamp, 
    open: number, close: number,
    low: number, high: number
}

export type StocksResponse = Record<string, Stock & { entries: StockEntry[] }>