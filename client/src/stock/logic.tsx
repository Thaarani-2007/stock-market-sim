import type { Stock, StockEntry, StocksResponse } from "../types"



export const fetch_stocks = async () => {
    const res = await fetch('http://localhost:8000/stocks', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    return (await res.json()) as StocksResponse
}

export const parse_entry = (stocks: StocksResponse) => {
    const info: Record<string, Stock> = {}
    const data: Record<string, StockEntry[]> = {}

    Object.keys(stocks).forEach((stock_id) => {
        data[stock_id] = stocks[stock_id].entries
        info[stock_id] = { ...stocks[stock_id] }
    })

    return {info, data}
}