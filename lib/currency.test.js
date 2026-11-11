import test from "node:test";
import assert from "node:assert/strict";
import { calculateConversion, chartCoordinates, summarizeHistory } from "./currency.js";
import { parseSymbols, readLatestRates, readRateHistory, validCurrencyCode } from "./currency-api.js";
import { calculateTravelRequirement, compareTravelBudget } from "./travel-requirements.js";

test("converte valores com uma cotação positiva e recusa dados inválidos", () => {
  assert.equal(calculateConversion(1000, 0.92), 920);
  assert.throws(() => calculateConversion(-1, 0.92), RangeError);
  assert.throws(() => calculateConversion(100, 0), RangeError);
});

test("resume o histórico em ordem cronológica e calcula variação e extremos", () => {
  const summary = summarizeHistory([
    { date: "2026-03-03", rate: 5.2 },
    { date: "2026-03-01", rate: 5 },
    { date: "2026-03-02", rate: 4.8 },
  ]);
  assert.equal(summary.first.date, "2026-03-01");
  assert.equal(summary.last.date, "2026-03-03");
  assert.equal(summary.low, 4.8);
  assert.equal(summary.high, 5.2);
  assert.ok(Math.abs(summary.changePercent - 4) < 1e-10);
  assert.equal(summarizeHistory([{ date: "2026-01-01", rate: Number.NaN }]), null);
});

test("gera coordenadas acessíveis sem quebrar em série plana", () => {
  assert.deepEqual(chartCoordinates([{ rate: 2 }, { rate: 2 }]), [
    { x: 12, y: 110 },
    { x: 708, y: 110 },
  ]);
  assert.deepEqual(chartCoordinates([]), []);
});

test("valida códigos e limita a lista de moedas de uma consulta", () => {
  assert.equal(validCurrencyCode("BRL"), true);
  assert.equal(validCurrencyCode("US"), false);
  assert.deepEqual(parseSymbols("usd, EUR,USD"), ["USD", "EUR"]);
  assert.equal(parseSymbols("USD,EUR,GBP,JPY,CAD,AUD,CHF,ARS,CLP,MXN,INR"), null);
});

test("calcula requisito português somente quando há regra oficial numérica", () => {
  const requirement = calculateTravelRequirement({ entryAmount: 75, dailyAmount: 40 }, 15, 2);
  assert.deepEqual(requirement, { perTraveler: 675, total: 1350, dailyPerTraveler: 40 });
  assert.equal(calculateTravelRequirement({ kind: "unconfirmed" }, 15, 2), null);
  assert.throws(() => calculateTravelRequirement({ entryAmount: 75, dailyAmount: 40 }, 0, 1), RangeError);
});

test("compara orçamento convertido sem tratar requisito desconhecido como zero", () => {
  assert.deepEqual(compareTravelBudget(1000, 0.9, { total: 800 }), {
    convertedBudget: 900,
    difference: 100,
    meets: true,
  });
  assert.equal(compareTravelBudget(1000, 0.9, null), null);
  assert.throws(() => compareTravelBudget(-1, 0.9, { total: 800 }), RangeError);
});

test("prioriza as séries de compra e venda do Banco Central no par USD/BRL", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const address = String(url);
    if (address.includes("frankfurter.dev")) {
      return Response.json({ base: "USD", date: "2026-11-09", rates: { BRL: 5.5, EUR: 0.9 } });
    }
    if (address.includes("bcdata.sgs.1/")) {
      return Response.json([{ data: "10/11/2026", valor: "5.5840" }]);
    }
    throw new Error(`URL inesperada no teste: ${address}`);
  };
  try {
    const result = await readLatestRates("USD", ["BRL", "EUR"]);
    assert.equal(result.rates.BRL, 5.584);
    assert.equal(result.dates.BRL, "2026-11-10");
    assert.match(result.sources.BRL, /Banco Central/);
    assert.equal(result.rates.EUR, 0.9);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("inverte a série de venda do Banco Central no histórico BRL/USD", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /bcdata\.sgs\.10813/);
    return Response.json([
      { data: "09/11/2026", valor: "5.5" },
      { data: "10/11/2026", valor: "5.6" },
    ]);
  };
  try {
    const history = await readRateHistory("BRL", "USD", "2026-11-01", "2026-11-11");
    assert.equal(history.points.length, 2);
    assert.equal(history.points[1].rate, 1 / 5.6);
    assert.equal(history.points[1].date, "2026-11-10");
    assert.match(history.source, /venda/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("consulta o histórico máximo do Banco Central em intervalos de até cinco anos", async () => {
  const originalFetch = globalThis.fetch;
  const ranges = [];
  globalThis.fetch = async (url) => {
    const query = new URL(String(url)).searchParams;
    const start = query.get("dataInicial");
    const end = query.get("dataFinal");
    ranges.push([start, end]);
    return Response.json([
      { data: start, valor: "5.5" },
      { data: end, valor: "5.6" },
    ]);
  };
  try {
    const history = await readRateHistory("USD", "BRL", "2000-01-01", "2011-12-31");
    assert.deepEqual(ranges, [
      ["01/01/2000", "31/12/2004"],
      ["01/01/2005", "31/12/2009"],
      ["01/01/2010", "31/12/2011"],
    ]);
    assert.equal(history.points.length, 6);
    assert.equal(history.points[0].date, "2000-01-01");
    assert.equal(history.points.at(-1).date, "2011-12-31");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
