export const COMMON_CURRENCY_CODES = ["BRL", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "ARS", "CLP", "MXN"];

export const CURRENCY_NAMES_PT = {
  ARS: "Peso argentino",
  AUD: "Dólar australiano",
  BRL: "Real brasileiro",
  CAD: "Dólar canadense",
  CHF: "Franco suíço",
  CLP: "Peso chileno",
  EUR: "Euro",
  GBP: "Libra esterlina",
  JPY: "Iene japonês",
  MXN: "Peso mexicano",
  USD: "Dólar americano",
};

export function calculateConversion(amount, rate) {
  const numericAmount = Number(amount);
  const numericRate = Number(rate);
  if (!Number.isFinite(numericAmount) || numericAmount < 0 || !Number.isFinite(numericRate) || numericRate <= 0) {
    throw new RangeError("Informe um valor e uma cotação válidos.");
  }
  return numericAmount * numericRate;
}

export function summarizeHistory(points) {
  const valid = points
    .filter((point) => Number.isFinite(Number(point.rate)) && Number(point.rate) > 0)
    .toSorted((left, right) => left.date.localeCompare(right.date));
  if (!valid.length) return null;

  const first = valid[0];
  const last = valid.at(-1);
  const rates = valid.map((point) => Number(point.rate));
  return {
    first,
    last,
    low: Math.min(...rates),
    high: Math.max(...rates),
    changePercent: ((Number(last.rate) / Number(first.rate)) - 1) * 100,
    count: valid.length,
  };
}

export function chartCoordinates(points, width = 720, height = 220, padding = 12) {
  const rates = points.map((point) => Number(point.rate)).filter(Number.isFinite);
  if (!rates.length || width <= padding * 2 || height <= padding * 2) return [];
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;
  const isFlat = max === min;
  const divisor = Math.max(points.length - 1, 1);
  return points.map((point, index) => ({
    x: padding + (index / divisor) * (width - padding * 2),
    y: isFlat ? height / 2 : height - padding - ((Number(point.rate) - min) / range) * (height - padding * 2),
  }));
}
