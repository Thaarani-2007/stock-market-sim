
import Graph from "./graph"
import Transact from "./transact"
import type { Stock as StockType, StockEntry } from "../types"


const Stock = (props: {
    balance: number, stocks: Record<string, StockType>,
    curr: string, entries: Record<string, StockEntry[]>, children: React.ReactNode
}) => {

    const last_entry = props.entries[props.curr].length - 1

    return (
        <section className='flex flex-col md:flex-row'>
            <div className="w-full md:w-2/3">
                <Graph data={props.entries[props.curr]} curr={props.curr}  />
            </div>
            <div className="w-full md:w-1/3 flex flex-col flex-wrap justify-center content-center">
                {props.children}
                
                <hr className='my-5' />

                <Transact balance={10000} owned={0} price={props.entries[props.curr][last_entry].close} />
            </div>
        </section>
    )
}

export default Stock