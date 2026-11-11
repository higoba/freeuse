export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function calculateSellingPrice({ cost, packaging = 0, additional = 0, tax = 0, commission = 0, margin = 0 }) {
  const amounts = [cost, packaging, additional, tax, commission, margin].map(Number);
  if (amounts.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError("Informe valores e percentuais iguais ou maiores que zero.");
  }
  const [baseCost, packageCost, otherCost, taxRate, commissionRate, marginRate] = amounts;
  const totalCost = baseCost + packageCost + otherCost;
  const remainder = 1 - (taxRate + commissionRate + marginRate) / 100;
  if (remainder <= 0) {
    throw new RangeError("Impostos, comissão e margem desejada precisam somar menos de 100%.");
  }
  const price = totalCost / remainder;
  const taxes = price * taxRate / 100;
  const fees = price * commissionRate / 100;
  const profit = price - totalCost - taxes - fees;
  return {
    totalCost,
    price,
    taxes,
    fees,
    profit,
    margin: price === 0 ? 0 : profit / price * 100,
    markup: totalCost === 0 ? 0 : (price - totalCost) / totalCost * 100,
  };
}

function parseClock(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function durationMinutes(start, end) {
  const from = parseClock(start);
  const to = parseClock(end);
  if (from === null || to === null) return null;
  return (to - from + 1440) % 1440;
}

export function calculateWorkday(periods, expectedHours = 0, expectedMinutes = 0) {
  let worked = 0;
  let breaks = 0;
  for (const period of periods) {
    const duration = durationMinutes(period.start, period.end);
    if (duration === null || duration === 0) throw new RangeError("Preencha início e fim diferentes para cada período de trabalho.");
    if (period.breakStart || period.breakEnd) {
      if (!period.breakStart || !period.breakEnd) throw new RangeError("Preencha o início e o fim da pausa.");
      const breakDuration = durationMinutes(period.breakStart, period.breakEnd);
      if (breakDuration === null || breakDuration === 0 || breakDuration > duration) throw new RangeError("A pausa precisa caber dentro do período de trabalho.");
      const elapsedToBreak = (parseClock(period.breakStart) - parseClock(period.start) + 1440) % 1440;
      if (elapsedToBreak + breakDuration > duration) throw new RangeError("A pausa precisa estar dentro do período de trabalho.");
      breaks += breakDuration;
      worked += duration - breakDuration;
    } else {
      worked += duration;
    }
  }
  const expected = Number(expectedHours || 0) * 60 + Number(expectedMinutes || 0);
  if (!Number.isInteger(expected) || expected < 0 || expected > 1440 || Number(expectedHours) > 24 || Number(expectedMinutes) > 59 || Number(expectedHours) < 0 || Number(expectedMinutes) < 0) {
    throw new RangeError("Informe uma jornada esperada válida (0 a 24 horas e 0 a 59 minutos).");
  }
  return { worked, breaks, expected, difference: worked - expected };
}

export function formatDuration(totalMinutes) {
  const absolute = Math.abs(Math.trunc(totalMinutes));
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${totalMinutes < 0 ? "−" : ""}${hours}h ${String(minutes).padStart(2, "0")}min`;
}
