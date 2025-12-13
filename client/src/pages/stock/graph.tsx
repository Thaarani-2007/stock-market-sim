import { useState, useEffect, useRef } from "react";
import {
  AreaSeries, LineSeries, CandlestickSeries,
  createChart,
  type UTCTimestamp, type AreaSeriesOptions,
  type CandlestickSeriesOptions, type ChartOptions,
  type DeepPartial, type IChartApi, type ISeriesApi,
} from "lightweight-charts";

import IndicatorsDropdown from "./IndicatorsDropDown";
import { computeIndicator } from "./indicatorCalculator";
import SubIndicatorPanel from "./SubIndicatorPanel";
import { ON_CHART_INDICATORS, BELOW_CHART_INDICATORS } from "../../indicatorTypes";

type StockEntry = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type GraphProps = {
  data: StockEntry[];
  curr: string;
  indicatorData: { name: string; values: number[] } | null;
};

const INDICATOR_STYLE = {
  lineWidth: 2,
  color: "#ffd54f",
  priceLineVisible: false,
  lastValueVisible: false,
};

const Graph = ({ data, curr, indicatorData }: GraphProps) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [subPanelData, setSubPanelData] = useState<any[]>([]);

  const finChartRef = useRef<IChartApi | null>(null);
  const lineChartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLineRef = useRef<ISeriesApi<"Area"> | null>(null);
  const candleOverlayRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lineOverlayRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [showCandle, setShowCandle] = useState(true);

  // Sync indicator set externally
  useEffect(() => {
    if (indicatorData) setSelectedIndicator(indicatorData.name);
  }, [indicatorData]);

  // MAIN CHART INIT
  useEffect(() => {
    if (data.length === 0) return;

    // CANDLE chart
    if (!finChartRef.current) {
      const fin = createChart(document.getElementById("candle-chart")!, CHART_MAIN);
      candleSeriesRef.current = fin.addSeries(CandlestickSeries, CANDLE_STYLE);
      finChartRef.current = fin;
    }
    candleSeriesRef.current?.setData(data);

    // LINE chart
    if (!lineChartRef.current) {
      const line = createChart(document.getElementById("line-chart")!, CHART_MAIN);
      priceLineRef.current = line.addSeries(AreaSeries, PRICE_STYLE);
      lineChartRef.current = line;
    }
    priceLineRef.current?.setData(data.map(d => ({ time: d.time, value: d.close })));

  }, [data]);

  // INDICATOR LOGIC
  useEffect(() => {
    if (!selectedIndicator || !data.length) {
      setSubPanelData([]);
      candleOverlayRef.current?.setData([]);
      lineOverlayRef.current?.setData([]);
      return;
    }

    const close = data.map(v => v.close);
    const open = data.map(v => v.open);
    const high = data.map(v => v.high);
    const low = data.map(v => v.low);
    const volume = data.map(v => v.volume || 1000);
    const t = data.map(v => v.time);

    const out = computeIndicator(selectedIndicator, {
      open, high, low, close, volume,
    });

    const formatted = out
      .map((v, i) =>
        isNaN(v) || !isFinite(v) ? null : { time: t[i], value: v }
      )
      .filter((x): x is { time: UTCTimestamp; value: number } => x !== null);

    const isOnChart = ON_CHART_INDICATORS.includes(selectedIndicator);
    const isBelowChart = BELOW_CHART_INDICATORS.includes(selectedIndicator);

    // ON-CHART INDICATOR
    if (isOnChart) {
      candleOverlayRef.current ??= finChartRef.current?.addSeries(LineSeries, INDICATOR_STYLE);
      lineOverlayRef.current ??= lineChartRef.current?.addSeries(LineSeries, INDICATOR_STYLE);

      candleOverlayRef.current?.setData(formatted);
      lineOverlayRef.current?.setData(formatted);

      setSubPanelData([]);
    }

    // BELOW-CHART INDICATOR
    if (isBelowChart) {
      setSubPanelData(formatted);

      candleOverlayRef.current?.setData([]);
      lineOverlayRef.current?.setData([]);
    }

  }, [selectedIndicator, data]);

  return (
    <div className="relative text-white w-full">
      {/* TOP UI BAR */}
      <div className="absolute top-3 left-4 z-50 flex gap-4 bg-[#0f0f0f]/80 px-4 py-2 rounded-xl border border-gray-700 backdrop-blur-md shadow-lg">
        <div className="flex bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-600">
          <button
            onClick={() => setShowCandle(true)}
            className={`px-3 py-1 ${showCandle ? "bg-blue-600" : ""}`}
          >
            Candle
          </button>
          <button
            onClick={() => setShowCandle(false)}
            className={`px-3 py-1 ${!showCandle ? "bg-blue-600" : ""}`}
          >
            Line
          </button>
        </div>

        <IndicatorsDropdown onSelect={x => setSelectedIndicator(x)} />
      </div>

      {/* MAIN CHART — AUTO RESIZE */}
      <div
        id="candle-chart"
        className={`w-full ${showCandle ? "" : "hidden"}`}
        style={{
          height: subPanelData.length > 0 ? "60vh" : "80vh",
        }}
      />

      <div
        id="line-chart"
        className={`w-full ${!showCandle ? "" : "hidden"}`}
        style={{
          height: subPanelData.length > 0 ? "60vh" : "80vh",
        }}
      />

      {/* BELOW-CHART PANEL */}
      {subPanelData.length > 0 && (
        <SubIndicatorPanel data={subPanelData} height={200} />
      )}
    </div>
  );
};

// CHART STYLES
const CHART_MAIN: DeepPartial<ChartOptions> = {
  autoSize: true,
  layout: { background: { color: "#000" }, textColor: "#e0e0e0" },
  grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
};

const CANDLE_STYLE: DeepPartial<CandlestickSeriesOptions> = {
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderVisible: false,
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
  lastValueVisible: false,
  priceLineVisible: false,
};

const PRICE_STYLE: DeepPartial<AreaSeriesOptions> = {
  lineColor: "#4F9BFF",
  topColor: "#4F9BFF88",
  bottomColor: "#4F9BFF11",
  lineWidth: 2,
  lastValueVisible: false,
  priceLineVisible: false,
};

export default Graph;