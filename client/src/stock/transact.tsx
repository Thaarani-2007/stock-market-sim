import { useState } from "react"

const Transact = (props: { price: number, balance: number, owned: number }) => {
    const [units, setUnits] = useState<number | null>(1)

    const buyPrice = () => (units ?? 0) * 1.005 * props.price
    const sellPrice = () => (units ?? 0) * 0.995 * props.price

    const handleChange = (
        ev: React.ChangeEvent<HTMLInputElement> |
            React.KeyboardEvent<HTMLInputElement>
    ) => {
        const value = ev.currentTarget.value
        if (value.length == 0) setUnits(null)
        else {
            const int_value = parseInt(value)
            setUnits(int_value <= 0 ? null : int_value)
        }
    }

    return (
        <>
            <input type="number" min={1} defaultValue={1} onChange={handleChange} onKeyUp={handleChange} />
            <div>
                <button disabled={units == null || buyPrice() > props.balance} className="mx-2">Buy: { buyPrice().toFixed(2) }</button>
                <button disabled={units == null || units > props.owned} className="mx-2">Sell: { sellPrice().toFixed(2) }</button>
            </div>
        </>
    )
}

export default Transact