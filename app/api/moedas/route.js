import { NextResponse } from "next/server";
import { FRANKFURTER_SOURCE, parseSymbols, readCurrencyList, readLatestRates, validCurrencyCode } from "@/lib/currency-api.js";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  if (params.get("lista") === "1") {
    try {
      return NextResponse.json({ currencies: await readCurrencyList(), source: FRANKFURTER_SOURCE });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
  }

  const base = (params.get("base") || "").toUpperCase();
  const symbols = parseSymbols(params.get("symbols"));
  if (!validCurrencyCode(base) || !symbols || symbols.includes(base)) {
    return NextResponse.json({ error: "Informe moedas válidas e diferentes para a consulta." }, { status: 400 });
  }

  try {
    return NextResponse.json({
      ...(await readLatestRates(base, symbols)),
      source: FRANKFURTER_SOURCE,
      sourceNote: "USD/BRL usa a série diária de compra do BCB; BRL/USD usa a série diária de venda do BCB. Os demais pares usam a referência Frankfurter/BCE.",
      kind: "referência diária, não é cotação em tempo real nem câmbio turismo",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
