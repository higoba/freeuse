"use client";

import { useMemo, useState } from "react";
import { calculateSellingPrice, formatBRL } from "@/lib/calculations.js";

const initial = { cost: "", packaging: "", additional: "", tax: "", commission: "", margin: "20" };
const moneyFields = [
  ["cost", "Custo de aquisição ou produção (R$)", true],
  ["packaging", "Embalagem (R$)"],
  ["additional", "Outros custos (R$)"],
];
const percentFields = [["tax", "Impostos (%)"], ["commission", "Comissão de venda (%)"], ["margin", "Margem de lucro desejada (%)"]];

function parseInput(value) {
  if (value === "") return 0;
  return Number(String(value).trim().replace(",", "."));
}

export default function PriceCalculator() {
  const [values, setValues] = useState(initial);
  const result = useMemo(() => {
    try {
      if (!values.cost && !values.packaging && !values.additional) return { result: null, error: "" };
      return { result: calculateSellingPrice(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseInput(value)]))), error: "" };
    } catch (error) {
      return { result: null, error: error.message };
    }
  }, [values]);
  function update(key, value) {
    const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
    const [whole, ...fraction] = normalized.split(".");
    setValues((current) => ({ ...current, [key]: fraction.length ? `${whole}.${fraction.join("")}` : whole }));
  }
  const totalCost = result.result?.totalCost ?? ["cost", "packaging", "additional"].reduce((sum, key) => sum + (parseInput(values[key]) || 0), 0);

  return <section className="tool-workspace" aria-label="Calculadora de preço de venda">
    <div className="calculator-layout">
      <div className="calculator-inputs">
        <h2>Seus custos e percentuais</h2>
        <p className="field-hint">Preencha os valores para estimar um preço de venda.</p>
        <div className="field-grid">
          {[...moneyFields, ...percentFields].map(([key, label, required]) => <label className="field" key={key}>
            <span>{label}{required && <span aria-label="obrigatório"> *</span>}</span>
            <span className="input-suffix"><input type="number" min="0" step="0.01" inputMode="decimal" value={values[key]} onChange={(event) => update(key, event.target.value)} placeholder="0,00" /><span>{key === "cost" || key === "packaging" || key === "additional" ? "R$" : "%"}</span></span>
          </label>)}
        </div>
        <p className="helper-text">A margem é calculada sobre o preço de venda, não somada diretamente ao custo.</p>
      </div>
      <aside className="result-panel" aria-live="polite">
        <span className="eyebrow">Preço sugerido</span>
        {result.error ? <p className="form-error" role="alert">{result.error}</p> : result.result ? <>
          <strong className="price-result">{formatBRL(result.result.price)}</strong>
          <div className="result-lines">
            <span>Custo total <b>{formatBRL(totalCost)}</b></span>
            <span>Impostos <b>{formatBRL(result.result.taxes)}</b></span>
            <span>Comissão <b>{formatBRL(result.result.fees)}</b></span>
            <span>Lucro estimado <b>{formatBRL(result.result.profit)}</b></span>
            <span>Margem de lucro <b>{result.result.margin.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</b></span>
            <span>Markup sobre custo <b>{result.result.markup.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</b></span>
          </div>
        </> : <p className="result-empty">Informe seus custos para ver a estimativa.</p>}
        <small>Estimativa para ajudar na precificação. Considere custos e regras específicos do seu negócio.</small>
      </aside>
    </div>
  </section>;
}
