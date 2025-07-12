import { useState, useEffect } from "react"
import type { Stock as StockType, StockEntry } from "../types"

import { fetch_stocks, parse_entry } from "./logic"
import Stock from "./stock"

const Page = () => {
    const [stocks, setStocks] = useState<Record<string, StockType>>()
    const [entries, setEntries] = useState<Record<string, StockEntry[]>>()
    const [curr, setCurr] = useState("")

    useEffect(() => {
        fetch_stocks().then((data) => parse_entry(data))
            .then((data) => {
                setEntries(data.data)
                setStocks(data.info)
                console.log(data.info)
                setCurr(Object.keys(data.info)[0])
            })
        
        const socket = new WebSocket("ws://localhost:8000/stocks")
        socket.onmessage = (ev: MessageEvent) => setEntries(prev => {
            const update: Record<string, StockEntry> = JSON.parse(ev.data)
            const res = JSON.parse(JSON.stringify(prev))
    
            Object.keys(update).forEach((stock_id) => {
                const last_idx = res[stock_id].length - 1
                if (res[stock_id][last_idx].time === update[stock_id].time)
                    res[stock_id][last_idx] = update[stock_id]
                else
                    res[stock_id].push(update[stock_id])
            })
            return res
        })

        socket.onclose = () => { alert("Connection interuppted! Please refresh!") }
        return () => { if (socket.readyState == WebSocket.OPEN) socket.close() }
    }, [])

    return (
        stocks == undefined || entries == undefined ? <></> :
        <Stock balance={10000} stocks={stocks} entries={entries} curr={curr}>
            <select className='my-3' onChange={(ev) => setCurr(ev.currentTarget.value)} >
                {Object.keys(stocks).map((key, idx) =>
                    <option key={idx} value={key}>{stocks[key].name}</option>    
                )}
            </select>
        </Stock>
    )
}

export default Page