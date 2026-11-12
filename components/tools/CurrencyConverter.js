"use client";

import { useEffect, useMemo, useState } from "react";
import ToolIcon from "@/components/ToolIcon";
import { calculateConversion, COMMON_CURRENCY_CODES, CURRENCY_NAMES_PT, chartCoordinates, summarizeHistory } from "@/lib/currency.js";

const periods = [
  ["7", "7 dias"],
  ["30", "30 dias"],
  ["90", "90 dias"],
  ["180", "6 meses"],
  ["365", "1 ano"],
  ["max", "Máximo"],
];

function currencyName(code, available) {
  return CURRENCY_NAMES_PT[code] || available[code] || code;
}

function money(value, currency) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível consultar a cotação.");
  return data;
}

function CurrencySelect({ label, value, onChange, available }) {
  const codes = Object.keys(available).length ? Object.keys(available) : COMMON_CURRENCY_CODES;
  return <label className="field">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {codes.map((code) => <option key={code} value={code}>{code} — {currencyName(code, available)}</option>)}
    </select>
  </label>;
}

function RateChart({ points, base, quote }) {
  const coordinates = chartCoordinates(points);
  if (!coordinates.length) return null;
  const path = coordinates.map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return <svg className="currency-chart" viewBox="0 0 720 220" role="img" aria-labelledby="rate-chart-title">
    <title id="rate-chart-title">Histórico da cotação de {quote} em {base}</title>
    {[0, 1, 2, 3].map((row) => <line key={row} x1="12" x2="708" y1={12 + row * 65} y2={12 + row * 65} className="currency-chart-grid" />)}
    <path d={path} className="currency-chart-line" />
  </svg>;
}

export default function CurrencyConverter() {
  const [base, setBase] = useState("BRL");
  const [quote, setQuote] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [available, setAvailable] = useState({});
  const [listError, setListError] = useState("");
  const [compareCodes, setCompareCodes] = useState(["USD", "EUR", "GBP", "JPY", "CAD"]);
  const [addCode, setAddCode] = useState("AUD");
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState("");
  const [rateSources, setRateSources] = useState({});
  const [rateDates, setRateDates] = useState({});
  const [rateWarnings, setRateWarnings] = useState([]);
  const [rateError, setRateError] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [period, setPeriod] = useState("30");
  const [history, setHistory] = useState([]);
  const [historySource, setHistorySource] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const symbols = useMemo(() => [...new Set([quote, ...compareCodes])].filter((code) => code !== base).sort().join(","), [base, quote, compareCodes]);
  const conversionRate = base === quote ? 1 : rates[quote];
  const validAmount = amount.trim() !== "" && Number.isFinite(Number(amount)) && Number(amount) >= 0;
  const convertedAmount = Number.isFinite(conversionRate) && validAmount
    ? calculateConversion(amount, conversionRate)
    : null;

  useEffect(() => {
    const controller = new AbortController();
    getJson("/api/moedas?lista=1", controller.signal)
      .then((data) => setAvailable(data.currencies))
      .catch((error) => {
        if (error.name !== "AbortError") setListError("Não foi possível carregar a lista internacional. As moedas mais usadas continuam disponíveis.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!symbols) {
      setRates({});
      setRateDate(new Date().toISOString().slice(0, 10));
      setRateSources({});
      setRateDates({});
      setRateWarnings([]);
      setRateError("");
      return undefined;
    }
    const controller = new AbortController();
    setRateLoading(true);
    setRateError("");
    getJson(`/api/moedas?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`, controller.signal)
      .then((data) => {
        setRates({ ...data.rates, [base]: 1 });
        setRateDate(data.date);
        setRateSources(data.sources || {});
        setRateDates(data.dates || {});
        setRateWarnings(data.warnings || []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRates({});
          setRateSources({});
          setRateDates({});
          setRateWarnings([]);
          setRateError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRateLoading(false);
      });
    return () => controller.abort();
  }, [base, symbols]);

  useEffect(() => {
    if (base === quote) {
      setHistory([]);
      setHistorySource("");
      setHistoryError("");
      return undefined;
    }
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistorySource("");
    setHistoryError("");
    getJson(`/api/moedas/historico?base=${encodeURIComponent(base)}&symbol=${encodeURIComponent(quote)}&period=${period}`, controller.signal)
      .then((data) => {
        setHistory(data.points);
        setHistorySource(data.source);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setHistory([]);
          setHistorySource("");
          setHistoryError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [base, quote, period]);

  const historySummary = useMemo(() => summarizeHistory(history), [history]);
  const addableCodes = (Object.keys(available).length ? Object.keys(available) : COMMON_CURRENCY_CODES)
    .filter((code) => code !== base && !compareCodes.includes(code));

  function addComparison() {
    if (compareCodes.length >= 8 || !addableCodes.includes(addCode)) return;
    setCompareCodes((current) => [...current, addCode]);
    setAddCode(addableCodes.find((code) => code !== addCode) || addableCodes[0] || "");
  }

  function swapCurrencies() {
    setBase(quote);
    setQuote(base);
  }

  return <section className="tool-workspace currency-workspace" aria-label="Conversor de moedas">
    <div className="currency-heading">
      <div><span className="eyebrow">Câmbio de referência</span><h2>Converta e acompanhe moedas</h2></div>
      <p>Taxas diárias de referência — não são cotações em tempo real.</p>
    </div>

    <div className="currency-converter">
      <div className="currency-controls">
        <label className="field">
          <span>Valor</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <CurrencySelect label="De" value={base} onChange={setBase} available={available} />
        <button className="button button-outline currency-swap" type="button" onClick={swapCurrencies} aria-label="Inverter moedas"><ToolIcon name="swap" size={19} /></button>
        <CurrencySelect label="Para" value={quote} onChange={setQuote} available={available} />
      </div>
      <div className="currency-result" aria-live="polite">
        <span>{amount || "0"} {base} equivale a</span>
        <strong>{convertedAmount === null ? "—" : money(convertedAmount, quote)}</strong>
        <small>{conversionRate ? `1 ${base} = ${conversionRate.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} ${quote}` : "A cotação ainda não está disponível."}</small>
      </div>
      {(rateError || listError) && <p className="form-error" role="alert">{rateError || listError}</p>}
      <p className="currency-source">Fonte: {rateSources[quote] || "Frankfurter, com taxas de referência do Banco Central Europeu"}. Atualização da cotação: {rateLoading ? "consultando…" : rateDates[quote] || rateDate || "indisponível"}. São taxas diárias, não cotações em tempo real; câmbio turismo e tarifas de remessa não estão incluídos.</p>
      {rateWarnings.map((warning) => <p className="planner-hint" role="status" key={warning}>{warning}</p>)}
    </div>

    <section className="currency-section" aria-labelledby="compare-currencies">
      <div className="currency-section-heading"><div><span className="eyebrow">Uma quantia, vários destinos</span><h3 id="compare-currencies">Comparar moedas</h3></div><span>{compareCodes.length}/8 moedas</span></div>
      <div className="currency-add-row">
        <label className="field">
          <span>Adicionar moeda</span>
          <select value={addCode} onChange={(event) => setAddCode(event.target.value)} disabled={!addableCodes.length || compareCodes.length >= 8}>
            {addableCodes.map((code) => <option key={code} value={code}>{code} — {currencyName(code, available)}</option>)}
          </select>
        </label>
        <button className="button button-secondary" type="button" onClick={addComparison} disabled={!addableCodes.length || compareCodes.length >= 8}>Adicionar</button>
      </div>
      <ul className="currency-comparison">
        {compareCodes.map((code) => {
          const value = !validAmount ? null : code === base ? Number(amount) : Number.isFinite(rates[code]) && rates[code] > 0 ? calculateConversion(amount, rates[code]) : null;
          return <li key={code}>
            <div><strong>{code}</strong><span>{currencyName(code, available)}</span></div>
            <b>{value === null ? "—" : money(value, code)}</b>
            <small>{rateSources[code] || (code === base ? "Moeda de origem" : "Cotação indisponível")}{rateDates[code] ? ` · ${rateDates[code]}` : ""}</small>
            <button type="button" className="currency-remove" aria-label={`Remover ${code} da comparação`} onClick={() => setCompareCodes((current) => current.filter((item) => item !== code))}>×</button>
          </li>;
        })}
      </ul>
      <p className="currency-source">A comparação usa a mesma quantia, moeda de origem e data de referência.</p>
    </section>

    <section className="currency-section" aria-labelledby="history-currencies">
      <div className="currency-section-heading"><div><span className="eyebrow">Série diária</span><h3 id="history-currencies">Histórico de {base} para {quote}</h3></div>
        <label className="field currency-period"><span>Período</span><select value={period} onChange={(event) => setPeriod(event.target.value)}>{periods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      {base === quote ? <p className="currency-empty">Escolha moedas diferentes para consultar o histórico.</p> : historyLoading ? <p className="currency-empty" role="status">Consultando o histórico…</p> : historyError ? <p className="form-error" role="alert">{historyError}</p> : historySummary && <>
        <div className="currency-history-stats">
          <div><span>Cotação mais recente</span><strong>{historySummary.last.rate.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} {quote}</strong></div>
          <div><span>Primeira → última</span><strong>{historySummary.first.rate.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} → {historySummary.last.rate.toLocaleString("pt-BR", { maximumFractionDigits: 6 })}</strong></div>
          <div><span>Variação no período</span><strong className={historySummary.changePercent >= 0 ? "currency-up" : "currency-down"}>{historySummary.changePercent >= 0 ? "+" : ""}{historySummary.changePercent.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</strong></div>
          <div><span>Mínima / máxima</span><strong>{historySummary.low.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} / {historySummary.high.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</strong></div>
        </div>
        <RateChart points={history} base={base} quote={quote} />
        <div className="currency-chart-labels"><span>{historySummary.first.date}</span><span>{historySummary.count} cotações disponíveis</span><span>{historySummary.last.date}</span></div>
      </>}
      <p className="currency-source">Fonte do histórico: {historySource || "aguardando consulta"}. Dados diários; fins de semana e feriados podem não ter cotação.</p>
    </section>
  </section>;
}
