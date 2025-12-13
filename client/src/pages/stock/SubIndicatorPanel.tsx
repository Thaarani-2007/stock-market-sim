import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  type UTCTimestamp,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

type Props = {
  data: { time: UTCTimestamp; value: number }[];
  height?: number;
};

const PANEL_STYLE = {
  autoSize: true,
  layout: { background: { color: "#000" }, textColor: "#e0e0e0" },
  grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
};

export default function SubIndicatorPanel({ data, height = 180 }: Props) {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    const container = document.getElementById("sub-panel");
    if (!container) return;

    if (!chartRef.current) {
      const chart = createChart(container, PANEL_STYLE);
      seriesRef.current = chart.addSeries(LineSeries, {
        lineWidth: 2,
        color: "#FFD54F",
      });
      chartRef.current = chart;
    }

    seriesRef.current?.setData(data);
  }, [data]);

  return <div id="sub-panel" style={{ height }} className="w-full" />;
}