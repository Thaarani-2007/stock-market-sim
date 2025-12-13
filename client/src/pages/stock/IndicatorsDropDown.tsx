import { useState, useRef, useEffect } from "react";

const indicators = [
  "SMA", "EMA", "DEMA", "TEMA", "RMA", "TRIX", "MMAX",
  "APO", "ARRON", "BOP", "CCI", "MI", "MACD", "PSAR",
  "QSTICK", "KDJ", "TYP", "VWMA",
  "VORTEX", "AO", "CMO", "ICHIMOKU", "PPO", "PVO",
  "ROC", "RSI", "STOCH", "AB", "ATR", "BB", "BBW", "CE",
  "DC", "KC", "PO", "TR", "UI",
  "AD", "CMF", "EMV", "FI", "MFI", "NVI", "OBV", "VPT", "VWAP",
];

type Props = {
  onSelect: (indicator: string | null) => void;
};

const IndicatorsDropdown = ({ onSelect }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectHandler = (indicator: string) => {
    setSelected(indicator);
    setIsOpen(false);
    onSelect(indicator);
  };

  const clearHandler = () => {
    setSelected(null);
    setIsOpen(false);
    onSelect(null); 
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = indicators.filter(ind =>
    ind.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      ref={dropdownRef}
      className="relative bg-gray-900/60 border border-gray-700 p-2 rounded-md w-60"
    >
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full bg-gray-800 py-2 text-sm text-white rounded-md border border-gray-500"
      >
        {selected ?? "Select Indicator"}
      </button>

      {isOpen && (
        <div className="mt-1 bg-gray-800 border border-gray-600 rounded-md max-h-60 overflow-y-auto absolute z-50 w-60">
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-900 text-white text-sm px-2 py-1 rounded outline-none"
            />
          </div>

          <div
            onClick={clearHandler}
            className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
          >
            None (no indicator)
          </div>

          {filtered.map(ind => (
            <div
              key={ind}
              onClick={() => selectHandler(ind)}
              className="px-3 py-2 text-sm text-white border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
            >
              {ind}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndicatorsDropdown;