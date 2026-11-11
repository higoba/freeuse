const API_ROOT = "https://api.frankfurter.dev/v1";
const BCB_ROOT = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
// O SGS pode recusar períodos longos; blocos menores deixam o histórico máximo consultável.
const MAX_BCB_HISTORY_YEARS = 5;
export const FRANKFURTER_SOURCE = "Frankfurter, com taxas de referência do Banco Central Europeu";
const BCB_SOURCES = {
  buy: "Banco Central do Brasil · dólar comercial (compra, SGS 1)",
  sell: "Banco Central do Brasil · dólar comercial (venda, SGS 10813)",
};

export function validCurrencyCode(value) {
  return CURRENCY_PATTERN.test(value || "");
}

export function parseSymbols(value, limit = 10) {
  const symbols = [...new Set((value || "").split(",").map((code) => code.trim().toUpperCase()).filter(Boolean))];
  return symbols.length > 0 && symbols.length <= limit && symbols.every(validCurrencyCode) ? symbols : null;
}

async function fetchProvider(url, revalidate, provider = "Frankfurter") {
  let response;
  try {
    response = await fetch(url, { next: { revalidate } });
  } catch (error) {
    console.error(`[cambio] Não foi possível consultar a fonte ${provider}.`, error);
    throw new Error("A fonte de câmbio está indisponível no momento.");
  }

  if (!response.ok) {
    console.error(`[cambio] A fonte ${provider} respondeu HTTP ${response.status}.`);
    throw new Error("A fonte de câmbio não conseguiu atender à consulta.");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error(`[cambio] A resposta da fonte ${provider} não contém JSON válido.`, error);
    throw new Error("A fonte de câmbio retornou uma resposta inválida.");
  }
  return data;
}

function validBcbPoint(point) {
  if (!point || typeof point.data !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(point.data)) return false;
  const rate = Number(point.valor);
  return Number.isFinite(rate) && rate > 0;
}

function bcbDate(date) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

function bcbDateRange(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

async function readBcbLatest(series, provider) {
  const data = await fetchProvider(`${BCB_ROOT}.${series}/dados/ultimos/10?formato=json`, 21600, "Banco Central do Brasil");
  if (!Array.isArray(data)) throw new Error("O Banco Central retornou uma resposta inválida.");
  const point = [...data].reverse().find(validBcbPoint);
  if (!point) throw new Error("Não há cotação recente disponível no Banco Central.");
  return { rate: Number(point.valor), date: bcbDate(point.data), source: provider };
}

async function readBcbHistory(series, source, start, end, invert = false) {
  const last = new Date(`${end}T00:00:00.000Z`);
  const points = [];
  let cursor = new Date(`${start}T00:00:00.000Z`);

  while (cursor <= last) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setUTCFullYear(chunkEnd.getUTCFullYear() + MAX_BCB_HISTORY_YEARS);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() - 1);
    if (chunkEnd > last) chunkEnd.setTime(last.getTime());

    const query = new URLSearchParams({
      formato: "json",
      dataInicial: bcbDateRange(cursor.toISOString().slice(0, 10)),
      dataFinal: bcbDateRange(chunkEnd.toISOString().slice(0, 10)),
    });
    const data = await fetchProvider(`${BCB_ROOT}.${series}/dados?${query}`, 86400, "Banco Central do Brasil");
    if (!Array.isArray(data)) throw new Error("O Banco Central retornou um histórico inválido.");
    points.push(...data
      .filter(validBcbPoint)
      .map((point) => ({
        date: bcbDate(point.data),
        rate: invert ? 1 / Number(point.valor) : Number(point.valor),
      })));

    cursor = new Date(chunkEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  points.sort((left, right) => left.date.localeCompare(right.date));
  if (!points.length) throw new Error("Não há cotações históricas disponíveis para o período escolhido.");
  return points;
}

export async function readCurrencyList() {
  const data = await fetchProvider(`${API_ROOT}/currencies`, 86400);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("A fonte de câmbio retornou uma lista inválida.");
  }
  return data;
}

export async function readLatestRates(base, symbols) {
  const query = new URLSearchParams({ base, symbols: symbols.join(",") });
  const data = await fetchProvider(`${API_ROOT}/latest?${query}`, 21600);
  if (data?.base !== base || !data.date || !symbols.every((symbol) => Number.isFinite(Number(data.rates?.[symbol])))) {
    throw new Error("A fonte de câmbio não retornou todas as cotações solicitadas.");
  }
  const rates = { ...data.rates };
  const dates = Object.fromEntries(symbols.map((symbol) => [symbol, data.date]));
  const sources = Object.fromEntries(symbols.map((symbol) => [symbol, FRANKFURTER_SOURCE]));
  const warnings = [];

  if (base === "USD" && symbols.includes("BRL")) {
    try {
      const quote = await readBcbLatest(1, BCB_SOURCES.buy);
      rates.BRL = quote.rate;
      dates.BRL = quote.date;
      sources.BRL = quote.source;
    } catch (error) {
      warnings.push(`Não foi possível consultar o Banco Central para USD/BRL; o valor exibido usa a referência Frankfurter/BCE. ${error.message}`);
    }
  } else if (base === "BRL" && symbols.includes("USD")) {
    try {
      const quote = await readBcbLatest(10813, BCB_SOURCES.sell);
      rates.USD = 1 / quote.rate;
      dates.USD = quote.date;
      sources.USD = quote.source;
    } catch (error) {
      warnings.push(`Não foi possível consultar o Banco Central para BRL/USD; o valor exibido usa a referência Frankfurter/BCE. ${error.message}`);
    }
  }

  return { ...data, rates, dates, sources, warnings };
}

export async function readRateHistory(base, symbol, start, end) {
  if (base === "USD" && symbol === "BRL") {
    return {
      base,
      symbol,
      points: await readBcbHistory(1, BCB_SOURCES.buy, start, end),
      source: BCB_SOURCES.buy,
    };
  }
  if (base === "BRL" && symbol === "USD") {
    return {
      base,
      symbol,
      points: await readBcbHistory(10813, BCB_SOURCES.sell, start, end, true),
      source: BCB_SOURCES.sell,
    };
  }

  const data = await fetchProvider(`${API_ROOT}/${start}..${end}?${new URLSearchParams({ base, symbols: symbol })}`, 86400);
  const rates = data?.rates;
  if (data?.base !== base || !rates || typeof rates !== "object") {
    throw new Error("A fonte de câmbio retornou um histórico inválido.");
  }
  const points = Object.entries(rates)
    .map(([date, dailyRates]) => ({ date, rate: Number(dailyRates?.[symbol]) }))
    .filter((point) => /^\d{4}-\d{2}-\d{2}$/.test(point.date) && Number.isFinite(point.rate) && point.rate > 0)
    .sort((left, right) => left.date.localeCompare(right.date));
  if (!points.length) throw new Error("Não há cotações históricas disponíveis para o período escolhido.");
  return { base, symbol, points, source: FRANKFURTER_SOURCE };
}
