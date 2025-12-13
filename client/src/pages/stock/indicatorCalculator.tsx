import {
  sma, ema, dema, tema, trix, rma, mmax,
  apo, aroon, bop, cfo, cci, mi, macd, msum, psar, qstick, kdj,
  typprice, vwma, vortex, ao, cmo, ichimokuCloud,
  ppo, pvo, roc, rsi, stoch, accelerationBands, atr,
  bollingerBands, bollingerBandsWidth, chandelierExit,
  keltnerChannel, mmin, projectionOscillator, tr, ulcerIndex, ad, cmf,
  emv, fi, mfi, nvi, obv, vpt, vwap
} from "indicatorts";

export type IndicatorInputs = {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
};


export function computeIndicator(
  name: string,
  { open, high, low, close, volume }: IndicatorInputs
): number[] {
  let out: number[] = []

  switch (name) {
    case "SMA": out = sma(close, { period: 14 }); break
    case "EMA": out = ema(close, { period: 14 }); break
    case "DEMA": out = dema(close, { period: 14 }); break
    case "TEMA": out = tema(close, { period: 14 }); break
    case "TRIX": out = trix(close, { period: 14 }); break
    case "RMA": out = rma(close, { period: 14 }); break
    case "MMAX": out = mmax(close, { period: 14 }); break

    case "APO": out = apo(close, { fast: 14, slow: 30 }); break
    case "ARRON": {
      const { up } = aroon(high, low, { period: 25 })
      out = up
      break
    }
    case "BOP": out = bop(open, high, low, close); break
    case "CFO": out = cfo(close); break
    case "CCI": out = cci(high, low, close, { period: 20 }); break
    case "MI": out = mi(high, low, { emaPeriod: 9, miPeriod: 25 }); break
    case "MACD": {
      const { macdLine } = macd(close, { fast: 12, slow: 26, signal: 9 })
      out = macdLine
      break
    }
    case "MSUM": out = msum(close, { period: 14 }); break
    case "PSAR": {
      const { psarResult } = psar(high, low, close, { step: 0.02, max: 0.2 })
      out = psarResult
      break
    }
    case "QSTICK": out = qstick(open, close, { period: 14 }); break
    case "KDJ": {
      const { k } = kdj(high, low, close, { rPeriod: 9, kPeriod: 3, dPeriod: 3 })
      out = k
      break
    }

    case "TYP": out = typprice(high, low, close); break
    case "VWMA": out = vwma(close, volume, { period: 20 }); break
    case "VORTEX": {
      const { plus } = vortex(high, low, close, { period: 14 })
      out = plus
      break
    }
    case "AO": out = ao(high, low); break
    case "CMO": {
      const { cmoResult } = cmo(high, low, close, volume)
      out = cmoResult
      break
    }
    case "ICHIMOKU": {
      const { tenkan } = ichimokuCloud(high, low, close)
      out = tenkan
      break
    }
    case "PPO": {
      const { ppoResult } = ppo(close)
      out = ppoResult
      break
    }
    case "PVO": {
      const { pvoResult } = pvo(volume)
      out = pvoResult
      break
    }
    case "ROC": out = roc(close, { period: 12 }); break
    case "RSI": out = rsi(close, { period: 14 }); break
    case "STOCH": {
      const { k } = stoch(high, low, close)
      out = k
      break
    }
    case "AB": {
      const { middle } = accelerationBands(high, low, close, { period: 20 })
      out = middle
      break
    }
    case "ATR": {
      const { atrLine } = atr(high, low, close)
      out = atrLine
      break
    }
    case "BB": {
      const { middle } = bollingerBands(close)
      out = middle
      break
    }
    case "BBW": {
      const { width } = bollingerBandsWidth(bollingerBands(close))
      out = width
      break
    }
    case "CE": {
      const { long } = chandelierExit(high, low, close)
      out = long
      break
    }
    case "DC": {
      const period = 20
      const upper = mmax(high, { period })
      const lower = mmin(low, { period })
      out = upper.map((u, i) => (u + lower[i]) / 2)
      break
    }
    case "KC": {
      const { middle } = keltnerChannel(high, low, close)
      out = middle
      break
    }
    case "PO": {
      const { poResult } = projectionOscillator(high, low, close)
      out = poResult
      break
    }
    case "TR": {
      out = tr(high, low, close)
      break
    }
    case "UI": {
      out = ulcerIndex(close)
      break
    }
    case "AD": {
      out = ad(high, low, close, volume)
      break
    }
    case "CMF": {
      out = cmf(high, low, close, volume)
      break
    }
    case "EMV": {
      out = emv(high, low, volume)
      break
    }
    case "FI": {
      out = fi(close, volume)
      break
    }
    case "MFI": {
      out = mfi(high, low, close, volume, { period: 14 })
      break
    }
    case "NVI": {
      out = nvi(close, volume)
      break
    }
    case "OBV": {
      out = obv(close, volume)
      break
    }
    case "VPT": {
      out = vpt(close, volume)
      break
    }
    case "VWAP": {
      out = vwap(close, volume)
      break
    }
  }

  return out
}