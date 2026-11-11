import { NextResponse } from "next/server";
import { readRateHistory, validCurrencyCode } from "@/lib/currency-api.js";

const DAYS = new Set(["7", "30", "90", "180", "365", "max"]);

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const base = (params.get("base") || "").toUpperCase();
  const symbol = (params.get("symbol") || "").toUpperCase();
  const period = params.get("period") || "30";
  if (!validCurrencyCode(base) || !validCurrencyCode(symbol) || base === symbol || !DAYS.has(period)) {
    return NextResponse.json({ error: "Par de moedas ou período inválido." }, { status: 400 });
  }

  const end = new Date();
  const start = new Date(end);
  if (period === "max") start.setUTCFullYear(1999, 0, 4);
  else start.setUTCDate(start.getUTCDate() - Number(period));

  try {
    const history = await readRateHistory(base, symbol, dateOnly(start), dateOnly(end));
    return NextResponse.json({
      ...history,
      period,
      kind: "histórico diário; dias sem publicação podem não aparecer",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
