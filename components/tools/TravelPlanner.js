"use client";

import { useEffect, useMemo, useState } from "react";
import { COMMON_CURRENCY_CODES, CURRENCY_NAMES_PT } from "@/lib/currency.js";
import { calculateTravelRequirement, compareTravelBudget, PASSPORT_COUNTRIES, TRAVEL_DESTINATIONS } from "@/lib/travel-requirements.js";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível consultar a cotação.");
  return data;
}

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function TravelPlanner() {
  const [nationality, setNationality] = useState("Brasil");
  const [otherNationality, setOtherNationality] = useState("");
  const [budget, setBudget] = useState("10000");
  const [budgetCurrency, setBudgetCurrency] = useState("BRL");
  const [days, setDays] = useState("15");
  const [travelers, setTravelers] = useState("1");
  const [selectedCodes, setSelectedCodes] = useState(["PT", "GB"]);
  const [portugalApplicability, setPortugalApplicability] = useState("unknown");
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState("");
  const [rateDates, setRateDates] = useState({});
  const [rateSources, setRateSources] = useState({});
  const [rateWarnings, setRateWarnings] = useState([]);
  const [rateError, setRateError] = useState("");
  const [rateLoading, setRateLoading] = useState(false);

  const destinationCurrencies = useMemo(() => [...new Set(
    selectedCodes.map((code) => TRAVEL_DESTINATIONS.find((item) => item.code === code)?.currency).filter(Boolean),
  )].filter((code) => code !== budgetCurrency).sort().join(","), [selectedCodes, budgetCurrency]);
  const selectedDestinations = selectedCodes
    .map((code) => TRAVEL_DESTINATIONS.find((item) => item.code === code))
    .filter(Boolean);

  useEffect(() => {
    if (!destinationCurrencies) {
      setRates({ [budgetCurrency]: 1 });
      setRateDate("");
      setRateDates({});
      setRateSources({});
      setRateWarnings([]);
      setRateError("");
      return undefined;
    }
    const controller = new AbortController();
    setRateLoading(true);
    setRateError("");
    getJson(`/api/moedas?base=${encodeURIComponent(budgetCurrency)}&symbols=${encodeURIComponent(destinationCurrencies)}`, controller.signal)
      .then((data) => {
        setRates({ ...data.rates, [budgetCurrency]: 1 });
        setRateDate(data.date);
        setRateDates(data.dates || {});
        setRateSources(data.sources || {});
        setRateWarnings(data.warnings || []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRates({ [budgetCurrency]: 1 });
          setRateDates({});
          setRateSources({});
          setRateWarnings([]);
          setRateError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRateLoading(false);
      });
    return () => controller.abort();
  }, [budgetCurrency, destinationCurrencies]);

  function toggleDestination(code) {
    setSelectedCodes((current) => current.includes(code)
      ? current.filter((item) => item !== code)
      : current.length < TRAVEL_DESTINATIONS.length ? [...current, code] : current);
  }

  function destinationResult(destination) {
    const rule = destination.rule;
    const conditionalApplies = rule.kind !== "conditional-fixed" || portugalApplicability === "yes";
    const validDays = days.trim() !== "" && Number.isInteger(Number(days)) && Number(days) >= 1 && Number(days) <= 3650;
    const validTravelers = travelers.trim() !== "" && Number.isInteger(Number(travelers)) && Number(travelers) >= 1 && Number(travelers) <= 100;
    const validBudget = budget.trim() !== "" && Number.isFinite(Number(budget)) && Number(budget) >= 0;
    const requirement = conditionalApplies && rule.kind === "conditional-fixed" && validDays && validTravelers
      ? calculateTravelRequirement(rule, days, travelers)
      : null;
    const exchangeRate = rates[destination.currency];
    const convertedBudget = Number.isFinite(exchangeRate) && exchangeRate > 0 && validBudget
      ? Number(budget) * exchangeRate
      : null;
    const comparison = requirement && convertedBudget !== null && validTravelers
      ? compareTravelBudget(budget, exchangeRate, requirement)
      : null;
    const budgetPerTraveler = validBudget && validTravelers ? Number(budget) / Number(travelers) : null;
    return { rule, requirement, exchangeRate, convertedBudget, comparison, budgetPerTraveler, validDays, validTravelers };
  }

  const nationalityLabel = nationality === "Outra nacionalidade" ? otherNationality.trim() : nationality;

  return <section className="tool-workspace planner-workspace" aria-label="Planejador de requisitos financeiros de viagem">
    <div className="planner-heading">
      <div><span className="eyebrow">Planejamento financeiro internacional</span><h2>Compare o orçamento com referências oficiais</h2></div>
      <p>Esta ferramenta não estima custo de vida nem garante entrada em nenhum país.</p>
    </div>

    <div className="planner-layout">
      <div className="planner-inputs">
        <fieldset className="planner-fieldset">
          <legend>Dados da viagem</legend>
          <Field label="Nacionalidade / país emissor do passaporte" hint="As regras podem variar pela nacionalidade. Se ela não estiver na lista, selecione “Outra”.">
            <select value={nationality} onChange={(event) => setNationality(event.target.value)} required>
              {PASSPORT_COUNTRIES.map((country) => <option value={country} key={country}>{country}</option>)}
            </select>
          </Field>
          {nationality === "Outra nacionalidade" && <Field label="País que emitiu o passaporte">
            <input value={otherNationality} onChange={(event) => setOtherNationality(event.target.value)} maxLength={70} placeholder="Digite o país" required />
          </Field>}
          <div className="planner-field-grid">
            <Field label="Orçamento total">
              <input type="number" min="0" step="0.01" inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value)} />
            </Field>
            <Field label="Moeda do orçamento">
              <select value={budgetCurrency} onChange={(event) => setBudgetCurrency(event.target.value)}>
                {COMMON_CURRENCY_CODES.map((code) => <option key={code} value={code}>{code} — {CURRENCY_NAMES_PT[code] || code}</option>)}
              </select>
            </Field>
            <Field label="Duração (dias)">
              <input type="number" min="1" max="3650" step="1" value={days} onChange={(event) => setDays(event.target.value)} />
            </Field>
            <Field label="Quantidade de viajantes">
              <input type="number" min="1" max="100" step="1" value={travelers} onChange={(event) => setTravelers(event.target.value)} />
            </Field>
          </div>
          <div className="planner-budget-summary">
            <span>Orçamento total</span>            <strong>{budget.trim() !== "" && Number.isFinite(Number(budget)) && Number(budget) >= 0 ? formatMoney(Number(budget), budgetCurrency) : "—"}</strong>
            <span>Por viajante · por dia</span><b>{budget.trim() !== "" && days.trim() !== "" && travelers.trim() !== "" && Number.isFinite(Number(budget)) && Number(budget) >= 0 && Number.isInteger(Number(days)) && Number(days) > 0 && Number.isInteger(Number(travelers)) && Number(travelers) > 0 ? formatMoney(Number(budget) / Number(days) / Number(travelers), budgetCurrency) : "—"}</b>
          </div>
        </fieldset>

        <fieldset className="planner-fieldset">
          <legend>Países para comparar</legend>
          <p className="planner-hint">Selecione até {TRAVEL_DESTINATIONS.length} destinos. Países sem regra numérica confirmada aparecem como informação insuficiente, não como requisito zero.</p>
          <div className="planner-destinations">
            {TRAVEL_DESTINATIONS.map((destination) => <label key={destination.code} className="planner-destination-option">
              <input type="checkbox" checked={selectedCodes.includes(destination.code)} onChange={() => toggleDestination(destination.code)} />
              <span><strong>{destination.name}</strong><small>{destination.currency}</small></span>
            </label>)}
          </div>
          {selectedCodes.includes("PT") && <Field label="A referência portuguesa para titulares de visto Schengen aplica-se à sua viagem?">
            <select value={portugalApplicability} onChange={(event) => setPortugalApplicability(event.target.value)}>
              <option value="unknown">Não sei / ainda vou confirmar</option>
              <option value="yes">Sim, aplica-se</option>
              <option value="no">Não se aplica</option>
            </select>
          </Field>}
        </fieldset>
      </div>

      <section className="planner-results" aria-live="polite">
        <div className="planner-results-heading"><span className="eyebrow">Comparação indicativa</span><h3>Seu orçamento por destino</h3><p>Passaporte informado: {nationalityLabel || "preencha o país emissor"} · {days || "—"} dias · {travelers || "—"} viajante(s)</p></div>
        {selectedDestinations.length === 0 ? <p className="planner-no-results">Escolha ao menos um destino para comparar.</p> : selectedDestinations.map((destination) => {
          const result = destinationResult(destination);
          const { rule } = result;
          return <article className="planner-destination-result" key={destination.code}>
            <header><div><h4>{destination.name}</h4><span>Moeda local: {destination.currency}</span></div>
              <span className={`planner-status ${result.comparison ? result.comparison.meets ? "status-meets" : "status-short" : "status-unknown"}`}>
                {result.comparison ? result.comparison.meets ? "Acima da referência" : "Abaixo da referência" : "Sem valor confirmado"}
              </span>
            </header>
            {result.convertedBudget !== null && <div className="planner-budget-destination"><span>Orçamento convertido</span><strong>{formatMoney(result.convertedBudget, destination.currency)}</strong>{result.budgetPerTraveler !== null && result.validDays && <small>{formatMoney(result.budgetPerTraveler * result.exchangeRate, destination.currency)} por viajante · {formatMoney(result.budgetPerTraveler * result.exchangeRate / Number(days), destination.currency)} por dia</small>}</div>}
            {rule.kind === "conditional-fixed" ? <>
              <div className="planner-requirement-amounts">
                <div><span>Por viajante, para a duração informada</span><strong>{result.requirement ? formatMoney(result.requirement.perTraveler, rule.currency) : result.validDays ? formatMoney(rule.entryAmount + rule.dailyAmount * Number(days), rule.currency) : "Informe a duração"}</strong></div>
                <div><span>Total para {travelers || "—"} viajante(s)</span><strong>{result.requirement ? formatMoney(result.requirement.total, rule.currency) : "Não comparado"}</strong></div>
              </div>
              {result.comparison && <p className={`planner-difference ${result.comparison.meets ? "is-positive" : "is-negative"}`}>
                Diferença após conversão: {formatMoney(Math.abs(result.comparison.difference), destination.currency)} {result.comparison.meets ? "acima" : "abaixo"} da referência.
              </p>}
              <p className="planner-condition">{rule.condition}</p>
            </> : rule.kind === "no-universal-minimum" ? <p className="planner-rule-copy">{rule.summary}</p>
              : <p className="planner-rule-copy">Requisito financeiro não confirmado para este destino, nacionalidade e duração. Nenhum valor foi presumido.</p>}
            {rule.kind === "unconfirmed" && <p className="planner-condition">A consulta oficial abaixo é necessária para confirmar os documentos e as condições aplicáveis ao seu caso.</p>}
            <footer className="planner-source"><span>{rule.sourceName}<br />Fonte consultada em {rule.checkedAt}{rateDates[destination.currency] && ` · câmbio de ${rateDates[destination.currency]}`}{rateSources[destination.currency] && <><br />{rateSources[destination.currency]}</>}</span><a href={rule.sourceUrl} target="_blank" rel="noreferrer">Ver fonte oficial</a></footer>
          </article>;
        })}
        {rateLoading && <p className="planner-hint" role="status">Atualizando conversão cambial…</p>}
        {rateError && <p className="form-error" role="alert">{rateError} Os valores em moeda local não serão estimados sem uma cotação disponível.</p>}
        {rateWarnings.map((warning) => <p className="planner-hint" role="status" key={warning}>{warning}</p>)}
      </section>
    </div>

    <div className="planner-disclaimer">
      <strong>Importante:</strong> atender a uma referência financeira não garante visto nem autorização de entrada. Regras dependem da nacionalidade, do tipo de viagem, da hospedagem, de patrocínio e da avaliação da autoridade. Confirme a informação na fonte oficial antes de viajar.
    </div>
    <p className="currency-source">A conversão usa taxas diárias do Banco Central para USD/BRL e da Frankfurter / Banco Central Europeu para outros pares; não representa câmbio turismo ou remessas. Apenas códigos de moeda são consultados; orçamento, nacionalidade, duração e viajantes ficam no navegador. Atualização mais recente: {rateDate || "consulta atual"}.</p>
  </section>;
}
