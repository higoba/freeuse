"use client";

import { useState } from "react";
import { calculateTravelCost, formatTravelNumber } from "@/lib/travel.js";

const initialValues = {
  vehicleType: "gasoline",
  make: "",
  model: "",
  year: "",
  version: "",
  consumptionSource: "manual",
  sourceDate: "",
  distanceKm: "",
  roundTrip: false,
  averageSpeedKmh: "",
  passengers: "1",
  consumptionKmPerL: "",
  fuelPricePerL: "",
  hybridFuel: "gasoline",
  gasolineKmPerL: "",
  gasolinePricePerL: "",
  ethanolKmPerL: "",
  ethanolPricePerL: "",
  electricKwhPer100Km: "",
  electricPricePerKwh: "",
  electricDistancePercent: "50",
  electricAutonomyKm: "",
  combustionKmPerL: "",
  phevFuel: "gasoline",
  autonomyKm: "",
  priceCity: "",
  priceDate: "",
  priceSource: "manual",
  electricityPriceType: "home",
};

const vehicleTypes = [
  ["gasoline", "Gasolina"],
  ["ethanol", "Etanol"],
  ["diesel", "Diesel"],
  ["flex", "Flex (gasolina e etanol)"],
  ["hev", "Híbrido convencional (HEV)"],
  ["phev", "Híbrido plug-in (PHEV)"],
  ["bev", "Elétrico (BEV)"],
];

const fuelTypes = [["gasoline", "Gasolina"], ["ethanol", "Etanol"], ["diesel", "Diesel"]];
const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const fuelLabel = (fuel) => fuel === "gasoline" ? "gasolina" : fuel === "ethanol" ? "etanol" : "diesel";

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function NumberInput({ value, onChange, min = "0", max, step = "0.01", required = false, placeholder = "Ex.: 10" }) {
  return <input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={onChange} required={required} placeholder={placeholder} />;
}

function VehicleDetails({ values, update }) {
  return <>
    <div className="field-grid">
      <Field label="Marca (opcional)"><input value={values.make} onChange={(event) => update("make", event.target.value)} maxLength={60} placeholder="Ex.: Toyota" /></Field>
      <Field label="Modelo (opcional)"><input value={values.model} onChange={(event) => update("model", event.target.value)} maxLength={80} placeholder="Ex.: Corolla" /></Field>
      <Field label="Ano (opcional)"><input type="number" inputMode="numeric" min="1950" max="2099" step="1" value={values.year} onChange={(event) => update("year", event.target.value)} placeholder="Ex.: 2024" /></Field>
      <Field label="Versão ou motor (opcional)"><input value={values.version} onChange={(event) => update("version", event.target.value)} maxLength={80} placeholder="Ex.: 2.0 híbrido" /></Field>
    </div>
    <div className="travel-source-row">
      <Field label="Origem do consumo de referência">
        <select value={values.consumptionSource} onChange={(event) => update("consumptionSource", event.target.value)}>
          <option value="manual">Informado por mim</option>
          <option value="inmetro">Consultei o PBE Veicular (Inmetro)</option>
        </select>
      </Field>
      {values.consumptionSource === "inmetro" && <Field label="Data da consulta (opcional)"><input type="date" value={values.sourceDate} onChange={(event) => update("sourceDate", event.target.value)} /></Field>}
    </div>
    <p className="travel-data-note">Esta calculadora não possui um catálogo automático de modelos: informe o consumo real ou consulte o <a href="https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular" target="_blank" rel="noreferrer">PBE Veicular do Inmetro</a> e registre a fonte acima.</p>
  </>;
}

function TravelEstimate({ result, values }) {
  const vehicleName = [values.make, values.model, values.year, values.version].filter(Boolean).join(" ");
  const best = result.best;

  return <aside className="travel-result" aria-live="polite" aria-labelledby="travel-result-title">
    <div className="travel-result-heading">
      <span className="eyebrow">Estimativa da viagem</span>
      <h2 id="travel-result-title">{vehicleName || vehicleTypes.find(([value]) => value === values.vehicleType)?.[1]}</h2>
      <p>{formatTravelNumber(result.oneWayDistanceKm)} km de ida{result.roundTrip ? ` · ${formatTravelNumber(result.distanceKm)} km no total (ida e volta)` : ""}</p>
    </div>
    {result.alternatives.length > 1 && <div className="travel-alternatives">
      <h3>Comparação do veículo flex</h3>
      <p>Estimativas com os consumos e preços informados para cada combustível.</p>
      {result.alternatives.map((alternative) => <div className={`travel-alternative${alternative.fuel === best.fuel ? " is-best" : ""}`} key={alternative.fuel}>
        <span>{fuelLabel(alternative.fuel)}{alternative.fuel === best.fuel && <strong> menor custo estimado</strong>}</span>
        <b>{money(alternative.cost)}</b>
        <small>{formatTravelNumber(alternative.liters)} L · {formatTravelNumber(alternative.consumptionKmPerL)} km/L · {money(alternative.pricePerL)}/L · {money(alternative.costPerKm)}/km</small>
      </div>)}
    </div>}
    <div className="travel-total">
      <span>{result.alternatives.length > 1 ? `Menor custo entre os valores informados (${fuelLabel(best.fuel)})` : "Custo estimado total"}</span>
      <strong>{money(best.cost)}</strong>
    </div>
    <div className="travel-result-grid">
      <div><span>Distância considerada</span><b>{formatTravelNumber(result.distanceKm)} km</b></div>
      <div><span>Custo por km</span><b>{money(best.costPerKm)}</b></div>
      <div><span>Custo por pessoa · {result.passengers} {result.passengers === 1 ? "passageiro" : "passageiros"}</span><b>{money(best.costPerPassenger)}</b></div>
      {result.timeMinutes !== null && <div><span>Tempo pela velocidade média informada</span><b>{Math.floor(result.timeMinutes / 60)}h {String(result.timeMinutes % 60).padStart(2, "0")}min</b></div>}
    </div>
    <div className="travel-consumption">
      <h3>Energia e combustível estimados</h3>
      {best.liters > 0 && <p><span>Combustível · {best.fuelLabel}</span><b>{formatTravelNumber(best.liters, 2)} L</b></p>}
      {best.energyKwh > 0 && <p><span>Energia elétrica</span><b>{formatTravelNumber(best.energyKwh, 2)} kWh</b></p>}
      {best.electricDistanceKm !== undefined && <>
        <p><span>Distância no modo elétrico</span><b>{formatTravelNumber(best.electricDistanceKm)} km</b></p>
        <p><span>Distância a combustão · {fuelLabel(values.phevFuel)}</span><b>{formatTravelNumber(best.combustionDistanceKm)} km</b></p>
        {best.electricDistanceKm > 0 && <p><span>Consumo e preço elétricos</span><b>{formatTravelNumber(best.electricConsumptionKwhPer100Km)} kWh/100 km · {money(best.electricPricePerKwh)}/kWh</b></p>}
        {best.combustionDistanceKm > 0 && <p><span>Consumo e preço de {fuelLabel(values.phevFuel)}</span><b>{formatTravelNumber(best.combustionConsumptionKmPerL)} km/L · {money(best.fuelPricePerL)}/L</b></p>}
        <p><span>Custo elétrico + combustível</span><b>{money(best.electricCost)} + {money(best.combustionCost)}</b></p>
        {best.electricAutonomyKm !== null && <p><span>Autonomia elétrica informada · não é garantia</span><b>{formatTravelNumber(best.electricAutonomyKm)} km</b></p>}
      </>}
      {best.consumptionKmPerL !== undefined && <p><span>Consumo considerado</span><b>{formatTravelNumber(best.consumptionKmPerL)} km/L · {money(best.pricePerL)}/L</b></p>}
      {best.consumptionKwhPer100Km !== undefined && <p><span>Consumo elétrico considerado</span><b>{formatTravelNumber(best.consumptionKwhPer100Km)} kWh/100 km · {money(best.pricePerKwh)}/kWh</b></p>}
      {result.autonomyKm !== null && <p><span>Autonomia informada · referência, não garantia</span><b>{formatTravelNumber(result.autonomyKm)} km</b></p>}
      {result.remainingRangeKm !== null && <p><span>Autonomia restante estimada</span><b>{formatTravelNumber(Math.max(0, result.remainingRangeKm))} km</b></p>}
    </div>
    {result.roundTrip && <div className="travel-legs">
      <h3>Estimativa por trecho</h3>
      {result.legs.map((leg) => <p key={leg.label}><span>{leg.label} · {formatTravelNumber(leg.distanceKm)} km</span><b>{money(leg.cost)}{leg.liters > 0 ? ` · ${formatTravelNumber(leg.liters, 2)} L` : ""}{leg.energyKwh > 0 ? ` · ${formatTravelNumber(leg.energyKwh, 2)} kWh` : ""}</b></p>)}
      <small>A divisão supõe o mesmo consumo e preço nos dois trechos.</small>
    </div>}
    {result.remainingRangeKm !== null && result.remainingRangeKm < 0 && <p className="travel-warning" role="status">A distância total informada supera a autonomia que você registrou. O cálculo não considera paradas ou recargas.</p>}
    {result.remainingElectricRangeKm !== null && result.remainingElectricRangeKm < 0 && <p className="travel-warning" role="status">A parte elétrica informada supera a autonomia elétrica que você registrou. A divisão de modos é uma estimativa editável.</p>}
    <p className="travel-data-note">
      Consumo: {values.consumptionSource === "inmetro" ? "valor informado após consulta ao PBEV/Inmetro" : "valor informado por você"}{values.sourceDate ? ` · consultado em ${new Date(`${values.sourceDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}.
      {" "}{values.vehicleType === "bev" ? "Preço da energia" : values.vehicleType === "phev" ? "Preço por litro do combustível" : "Preço por litro"}: {values.priceCity ? `${values.priceCity} · ` : ""}{values.priceDate ? `referência de ${new Date(`${values.priceDate}T12:00:00`).toLocaleDateString("pt-BR")} · ` : ""}{values.priceSource === "anp" ? "valor anotado após consulta à ANP" : "valor informado por você"}.
      {(values.vehicleType === "bev" || values.vehicleType === "phev") && ` Preço por kWh da ${values.electricityPriceType === "home" ? "tarifa residencial" : "recarga pública"} informado por você; a ferramenta não busca tarifas automaticamente.`}
      {values.vehicleType !== "bev" && <> A <a href="https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis" target="_blank" rel="noreferrer">pesquisa semanal de preços da ANP</a> é uma referência regional, não o preço exato de um posto; esta ferramenta ainda não consulta esses dados automaticamente.</>}
    </p>
    <p className="travel-disclaimer">Estimativa, não garantia de gasto ou autonomia. Trânsito, velocidade, relevo, carga, clima, manutenção, condução, disponibilidade de recarga e preço praticado alteram o resultado. O tempo não considera trânsito nem paradas.</p>
  </aside>;
}

export default function TravelCostCalculator() {
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
  }

  function calculate(event) {
    event.preventDefault();
    setError("");
    try {
      setResult(calculateTravelCost(values));
    } catch (calculationError) {
      setResult(null);
      setError(calculationError.message);
    }
  }

  const type = values.vehicleType;
  const isFlex = type === "flex";
  const isPhev = type === "phev";
  const isBev = type === "bev";
  const isHev = type === "hev";
  const electricShare = Number(values.electricDistancePercent || 0);

  return <section className="tool-workspace" aria-label="Calculadora de custo de viagem">
    <div className="travel-layout">
    <form className="travel-form" onSubmit={calculate}>
      <fieldset className="travel-fieldset">
        <legend>1 · Seu veículo</legend>
        <Field label="Tipo de veículo">
          <select value={type} onChange={(event) => { update("vehicleType", event.target.value); setResult(null); }}>
            {vehicleTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </Field>
        <VehicleDetails values={values} update={update} />
        {isFlex ? <div className="travel-fuel-grid">
          <div className="travel-fuel-card">
            <h3>Gasolina</h3>
            <Field label="Consumo com gasolina (km/L)"><NumberInput value={values.gasolineKmPerL} onChange={(event) => update("gasolineKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
            <Field label="Preço da gasolina (R$/L)"><NumberInput value={values.gasolinePricePerL} onChange={(event) => update("gasolinePricePerL", event.target.value)} max="10000" required /></Field>
          </div>
          <div className="travel-fuel-card">
            <h3>Etanol</h3>
            <Field label="Consumo com etanol (km/L)"><NumberInput value={values.ethanolKmPerL} onChange={(event) => update("ethanolKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
            <Field label="Preço do etanol (R$/L)"><NumberInput value={values.ethanolPricePerL} onChange={(event) => update("ethanolPricePerL", event.target.value)} max="10000" required /></Field>
          </div>
        </div> : isBev ? <div className="field-grid">
          <Field label="Consumo elétrico (kWh/100 km)"><NumberInput value={values.electricKwhPer100Km} onChange={(event) => update("electricKwhPer100Km", event.target.value)} min="0.01" max="1000" required /></Field>
          <Field label="Preço da energia (R$/kWh)"><NumberInput value={values.electricPricePerKwh} onChange={(event) => update("electricPricePerKwh", event.target.value)} max="10000" required /></Field>
          <Field label="Autonomia estimada do veículo (km, opcional)"><NumberInput value={values.autonomyKm} onChange={(event) => update("autonomyKm", event.target.value)} min="0.01" max="10000000" placeholder="Ex.: 400" /></Field>
          <Field label="Tipo de preço da energia">
            <select value={values.electricityPriceType} onChange={(event) => update("electricityPriceType", event.target.value)}>
              <option value="home">Tarifa residencial informada</option>
              <option value="public">Recarga pública informada</option>
            </select>
          </Field>
        </div> : isPhev ? <>
          <div className="field-grid">
            <Field label="Parte da distância em modo elétrico (%)"><NumberInput value={values.electricDistancePercent} onChange={(event) => update("electricDistancePercent", event.target.value)} min="0" max="100" step="1" required /></Field>
            <Field label="Combustível do motor"><select value={values.phevFuel} onChange={(event) => update("phevFuel", event.target.value)}>{fuelTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            {electricShare > 0 && <>
              <Field label="Consumo elétrico (kWh/100 km)"><NumberInput value={values.electricKwhPer100Km} onChange={(event) => update("electricKwhPer100Km", event.target.value)} min="0.01" max="1000" required /></Field>
              <Field label="Preço da energia (R$/kWh)"><NumberInput value={values.electricPricePerKwh} onChange={(event) => update("electricPricePerKwh", event.target.value)} max="10000" required /></Field>
              <Field label="Autonomia elétrica (km, opcional)"><NumberInput value={values.electricAutonomyKm} onChange={(event) => update("electricAutonomyKm", event.target.value)} min="0.01" max="10000000" placeholder="Ex.: 60" /></Field>
              <Field label="Tipo de preço da energia"><select value={values.electricityPriceType} onChange={(event) => update("electricityPriceType", event.target.value)}><option value="home">Tarifa residencial informada</option><option value="public">Recarga pública informada</option></select></Field>
            </>}
            {electricShare < 100 && <>
              <Field label="Consumo a combustão (km/L)"><NumberInput value={values.combustionKmPerL} onChange={(event) => update("combustionKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
              <Field label={`Preço ${fuelLabel(values.phevFuel)} (R$/L)`}><NumberInput value={values.fuelPricePerL} onChange={(event) => update("fuelPricePerL", event.target.value)} max="10000" required /></Field>
            </>}
          </div>
        </> : <>
          <div className="field-grid">
            <Field label={`Consumo ${isHev ? "combinado" : ""} (km/L)`}><NumberInput value={values.consumptionKmPerL} onChange={(event) => update("consumptionKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
            {isHev && <Field label="Combustível"><select value={values.hybridFuel} onChange={(event) => update("hybridFuel", event.target.value)}>{fuelTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>}
            <Field label={`Preço ${isHev ? fuelLabel(values.hybridFuel) : fuelLabel(type)} (R$/L)`}><NumberInput value={values.fuelPricePerL} onChange={(event) => update("fuelPricePerL", event.target.value)} max="10000" required /></Field>
          </div>
        </>}
      </fieldset>

      <fieldset className="travel-fieldset">
        <legend>2 · Distância e viagem</legend>
        <div className="field-grid">
          <Field label="Distância de ida (km)"><NumberInput value={values.distanceKm} onChange={(event) => update("distanceKm", event.target.value)} min="0.01" max="10000000" required /></Field>
          <Field label="Velocidade média (km/h, opcional)"><NumberInput value={values.averageSpeedKmh} onChange={(event) => update("averageSpeedKmh", event.target.value)} min="0.01" max="500" placeholder="Ex.: 80" /></Field>
          <Field label="Número de passageiros"><NumberInput value={values.passengers} onChange={(event) => update("passengers", event.target.value)} min="1" max="100" step="1" required /></Field>
          <label className="checkbox-field travel-roundtrip"><input type="checkbox" checked={values.roundTrip} onChange={(event) => update("roundTrip", event.target.checked)} /><span>Incluir ida e volta</span></label>
        </div>
        <p className="field-hint">Digite a distância de um trecho. Esta versão não calcula rotas por endereço.</p>
      </fieldset>

      <fieldset className="travel-fieldset">
        <legend>3 · Referência do preço</legend>
        <div className="field-grid">
          <Field label={isBev ? "Município/UF do preço (opcional)" : "Município/UF do combustível (opcional)"}><input value={values.priceCity} onChange={(event) => update("priceCity", event.target.value)} maxLength={100} placeholder="Ex.: Campinas - SP" /></Field>
          <Field label="Data em que consultou o preço (opcional)"><input type="date" value={values.priceDate} onChange={(event) => update("priceDate", event.target.value)} /></Field>
          {!isBev && <Field label={isPhev ? "Origem do preço por litro" : "Origem do preço informado"}><select value={values.priceSource} onChange={(event) => update("priceSource", event.target.value)}><option value="manual">Informado por mim</option><option value="anp">Consultei a pesquisa da ANP</option></select></Field>}
        </div>
        {isBev
          ? <p className="field-hint">Informe o preço por kWh da tarifa residencial ou da recarga pública que pretende usar. A ferramenta não busca tarifas automaticamente.</p>
          : isPhev
            ? <p className="field-hint">Informe o preço por litro do combustível e, separadamente, o preço por kWh da tarifa residencial ou recarga pública. A ferramenta não busca esses valores automaticamente.</p>
            : <p className="field-hint">Use um preço por litro de sua referência. As médias da ANP são regionais e não representam o valor exato de um posto.</p>}
      </fieldset>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit">Calcular custo estimado</button>
    </form>

    {result ? <TravelEstimate result={result} values={values} /> : <aside className="travel-empty">
      <span className="travel-empty-icon" aria-hidden="true">⌁</span>
      <h2>Descubra o custo estimado</h2>
      <p>Informe distância, consumo e preços. Você pode ajustar os valores para refletir melhor seu veículo e a região.</p>
    </aside>}
    </div>
    <p className="tool-privacy-hint">O cálculo é feito no navegador. Nenhuma localização ou dado do veículo é enviado ou salvo.</p>
  </section>;
}
