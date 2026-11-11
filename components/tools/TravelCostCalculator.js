"use client";

import { useState } from "react";
import { calculateTravelCost, compareTravelVehicles, formatTravelNumber } from "@/lib/travel.js";

const initialVehicle = {
  vehicleType: "gasoline",
  make: "",
  model: "",
  year: "",
  version: "",
  consumptionSource: "manual",
  sourceDate: "",
  consumptionKmPerL: "",
  hybridFuel: "gasoline",
  gasolineKmPerL: "",
  ethanolKmPerL: "",
  electricKwhPer100Km: "",
  electricDistancePercent: "50",
  electricAutonomyKm: "",
  combustionKmPerL: "",
  phevFuel: "gasoline",
  autonomyKm: "",
};

const initialTrip = {
  distanceKm: "",
  firstSegmentLabel: "Origem → destino",
  roundTrip: false,
  averageSpeedKmh: "",
  passengers: "1",
};

const initialPrices = {
  gasolinePricePerL: "",
  ethanolPricePerL: "",
  dieselPricePerL: "",
  electricPricePerKwh: "",
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
const typeLabel = (type) => vehicleTypes.find(([value]) => value === type)?.[1] || "Veículo";

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function NumberInput({ value, onChange, min = "0", max, step = "0.01", required = false, placeholder = "Ex.: 10" }) {
  return <input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={onChange} required={required} placeholder={placeholder} />;
}

function vehicleName(vehicle) {
  return [vehicle.make, vehicle.model, vehicle.year, vehicle.version].filter(Boolean).join(" ") || typeLabel(vehicle.vehicleType);
}

function VehicleIdentity({ values, update }) {
  return <div className="field-grid">
    <Field label="Marca (opcional)"><input value={values.make} onChange={(event) => update("make", event.target.value)} maxLength={60} placeholder="Ex.: Toyota" /></Field>
    <Field label="Modelo (opcional)"><input value={values.model} onChange={(event) => update("model", event.target.value)} maxLength={80} placeholder="Ex.: Corolla" /></Field>
    <Field label="Ano (opcional)"><input type="number" inputMode="numeric" min="1950" max="2099" step="1" value={values.year} onChange={(event) => update("year", event.target.value)} placeholder="Ex.: 2024" /></Field>
    <Field label="Versão ou motor (opcional)"><input value={values.version} onChange={(event) => update("version", event.target.value)} maxLength={80} placeholder="Ex.: 2.0 híbrido" /></Field>
  </div>;
}

function VehicleConsumption({ values, update, primary = false }) {
  const type = values.vehicleType;
  const electricShare = Number(values.electricDistancePercent || 0);

  return <>
    {primary && <VehicleIdentity values={values} update={update} />}
    {type === "flex" ? <div className="travel-fuel-grid">
      <div className="travel-fuel-card">
        <h3>Gasolina</h3>
        <Field label="Consumo com gasolina (km/L)"><NumberInput value={values.gasolineKmPerL} onChange={(event) => update("gasolineKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
      </div>
      <div className="travel-fuel-card">
        <h3>Etanol</h3>
        <Field label="Consumo com etanol (km/L)"><NumberInput value={values.ethanolKmPerL} onChange={(event) => update("ethanolKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
      </div>
    </div> : type === "bev" ? <div className="field-grid">
      <Field label="Consumo elétrico (kWh/100 km)"><NumberInput value={values.electricKwhPer100Km} onChange={(event) => update("electricKwhPer100Km", event.target.value)} min="0.01" max="1000" required /></Field>
      <Field label="Autonomia estimada do veículo (km, opcional)"><NumberInput value={values.autonomyKm} onChange={(event) => update("autonomyKm", event.target.value)} min="0.01" max="10000000" placeholder="Ex.: 400" /></Field>
    </div> : type === "phev" ? <>
      <div className="field-grid">
        <Field label="Parte da distância em modo elétrico (%)"><NumberInput value={values.electricDistancePercent} onChange={(event) => update("electricDistancePercent", event.target.value)} min="0" max="100" step="1" required /></Field>
        <Field label="Combustível do motor"><select value={values.phevFuel} onChange={(event) => update("phevFuel", event.target.value)}>{fuelTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
        {electricShare > 0 && <>
          <Field label="Consumo elétrico (kWh/100 km)"><NumberInput value={values.electricKwhPer100Km} onChange={(event) => update("electricKwhPer100Km", event.target.value)} min="0.01" max="1000" required /></Field>
          <Field label="Autonomia elétrica (km, opcional)"><NumberInput value={values.electricAutonomyKm} onChange={(event) => update("electricAutonomyKm", event.target.value)} min="0.01" max="10000000" placeholder="Ex.: 60" /></Field>
        </>}
        {electricShare < 100 && <Field label="Consumo a combustão (km/L)"><NumberInput value={values.combustionKmPerL} onChange={(event) => update("combustionKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>}
      </div>
    </> : <div className="field-grid">
      <Field label={`Consumo ${type === "hev" ? "combinado " : ""}(km/L)`}><NumberInput value={values.consumptionKmPerL} onChange={(event) => update("consumptionKmPerL", event.target.value)} min="0.01" max="1000" required /></Field>
      {type === "hev" && <Field label="Combustível"><select value={values.hybridFuel} onChange={(event) => update("hybridFuel", event.target.value)}>{fuelTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>}
    </div>}
    {primary && <p className="travel-data-note">Não há catálogo automático de modelos. Informe seu consumo real ou consulte o <a href="https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular" target="_blank" rel="noreferrer">PBE Veicular do Inmetro</a>.</p>}
  </>;
}

function inputForVehicle(vehicle, prices) {
  const input = { vehicleType: vehicle.vehicleType };
  if (vehicle.vehicleType === "gasoline" || vehicle.vehicleType === "ethanol" || vehicle.vehicleType === "diesel") {
    input.consumptionKmPerL = vehicle.consumptionKmPerL;
    input.fuelPricePerL = prices[`${vehicle.vehicleType}PricePerL`];
  } else if (vehicle.vehicleType === "hev") {
    input.consumptionKmPerL = vehicle.consumptionKmPerL;
    input.hybridFuel = vehicle.hybridFuel;
    input.fuelPricePerL = prices[`${vehicle.hybridFuel}PricePerL`];
  } else if (vehicle.vehicleType === "flex") {
    input.gasolineKmPerL = vehicle.gasolineKmPerL;
    input.gasolinePricePerL = prices.gasolinePricePerL;
    input.ethanolKmPerL = vehicle.ethanolKmPerL;
    input.ethanolPricePerL = prices.ethanolPricePerL;
  } else if (vehicle.vehicleType === "phev") {
    input.electricDistancePercent = vehicle.electricDistancePercent;
    input.phevFuel = vehicle.phevFuel;
    input.electricKwhPer100Km = vehicle.electricKwhPer100Km;
    input.electricPricePerKwh = prices.electricPricePerKwh;
    input.electricAutonomyKm = vehicle.electricAutonomyKm;
    input.combustionKmPerL = vehicle.combustionKmPerL;
    input.fuelPricePerL = prices[`${vehicle.phevFuel}PricePerL`];
  } else {
    input.electricKwhPer100Km = vehicle.electricKwhPer100Km;
    input.electricPricePerKwh = prices.electricPricePerKwh;
    input.autonomyKm = vehicle.autonomyKm;
  }
  return input;
}

function priceFieldsForVehicle(vehicle) {
  if (vehicle.vehicleType === "gasoline" || vehicle.vehicleType === "ethanol" || vehicle.vehicleType === "diesel") {
    return [`${vehicle.vehicleType}PricePerL`];
  }
  if (vehicle.vehicleType === "hev") return [`${vehicle.hybridFuel}PricePerL`];
  if (vehicle.vehicleType === "flex") return ["gasolinePricePerL", "ethanolPricePerL"];
  if (vehicle.vehicleType === "phev") return [
    ...(Number(vehicle.electricDistancePercent) > 0 ? ["electricPricePerKwh"] : []),
    ...(Number(vehicle.electricDistancePercent) < 100 ? [`${vehicle.phevFuel}PricePerL`] : []),
  ];
  return ["electricPricePerKwh"];
}

function TravelEstimate({ result, values, comparisons, journey, prices, onShare, shareStatus }) {
  const best = result.best;
  const routeDescription = journey.segments.map((segment) => `${segment.label}: ${formatTravelNumber(segment.distanceKm)} km`).join("; ");

  return <aside className="travel-result" aria-live="polite" aria-labelledby="travel-result-title">
    <div className="travel-result-heading">
      <span className="eyebrow">Estimativa da viagem</span>
      <h2 id="travel-result-title">{vehicleName(values)}</h2>
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
    {result.segments.length > 1 && <div className="travel-legs">
      <h3>Estimativa por trecho</h3>
      {result.segments.map((segment) => <p key={segment.label}><span>{segment.label} · {formatTravelNumber(segment.distanceKm)} km{result.roundTrip ? " · ida e volta" : ""}</span><b>{money(segment.cost)}{segment.liters > 0 ? ` · ${formatTravelNumber(segment.liters, 2)} L` : ""}{segment.energyKwh > 0 ? ` · ${formatTravelNumber(segment.energyKwh, 2)} kWh` : ""}</b></p>)}
      <small>Os custos por trecho são distribuídos proporcionalmente à distância e usam o mesmo consumo e preço médios.</small>
    </div>}
    {comparisons.length > 1 && <section className="travel-comparison-results" aria-labelledby="travel-comparison-title">
      <h3 id="travel-comparison-title">Comparador de veículos</h3>
      <p>Todos usam a mesma distância, ida e volta, passageiros e preços informados. O menor custo estimado aparece primeiro.</p>
      <ol>
        {comparisons.map((vehicle, index) => <li className={index === 0 ? "is-best" : ""} key={vehicle.id}>
          <div><strong>{vehicle.name}</strong>{index === 0 && <span>Menor custo estimado</span>}</div>
          <b>{money(vehicle.result.best.cost)}</b>
          <small>{typeLabel(vehicle.vehicleType)} · {money(vehicle.result.best.costPerKm)}/km · {money(vehicle.result.best.costPerPassenger)} por pessoa{vehicle.result.best.liters ? ` · ${formatTravelNumber(vehicle.result.best.liters, 2)} L` : ""}{vehicle.result.best.energyKwh ? ` · ${formatTravelNumber(vehicle.result.best.energyKwh, 2)} kWh` : ""}</small>
        </li>)}
      </ol>
    </section>}
    {result.roundTrip && <div className="travel-legs">
      <h3>Ida e volta</h3>
      {result.legs.map((leg) => <p key={leg.label}><span>{leg.label} · {formatTravelNumber(leg.distanceKm)} km</span><b>{money(leg.cost)}{leg.liters > 0 ? ` · ${formatTravelNumber(leg.liters, 2)} L` : ""}{leg.energyKwh > 0 ? ` · ${formatTravelNumber(leg.energyKwh, 2)} kWh` : ""}</b></p>)}
      <small>A divisão supõe o mesmo consumo e preço nos dois sentidos.</small>
    </div>}
    {result.remainingRangeKm !== null && result.remainingRangeKm < 0 && <p className="travel-warning" role="status">A distância total informada supera a autonomia que você registrou. O cálculo não considera paradas ou recargas.</p>}
    {result.remainingElectricRangeKm !== null && result.remainingElectricRangeKm < 0 && <p className="travel-warning" role="status">A parte elétrica informada supera a autonomia elétrica que você registrou. A divisão de modos é uma estimativa editável.</p>}
    <p className="travel-data-note">
      Consumo: {values.consumptionSource === "inmetro" ? "valor informado após consulta ao PBEV/Inmetro" : "valor informado por você"}{values.sourceDate ? ` · consultado em ${new Date(`${values.sourceDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}.
      {" "}{prices.priceCity ? `${prices.priceCity} · ` : ""}{prices.priceDate ? `preços consultados em ${new Date(`${prices.priceDate}T12:00:00`).toLocaleDateString("pt-BR")} · ` : ""}{prices.priceSource === "anp" ? "valores anotados após consulta à ANP" : "preços informados por você"}.
      {" "}A energia considera preço informado para {prices.electricityPriceType === "home" ? "tarifa residencial" : "recarga pública"}. A ferramenta não busca preços automaticamente; a <a href="https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis" target="_blank" rel="noreferrer">pesquisa semanal da ANP</a> é regional e não representa o preço exato de um posto.
    </p>
    <p className="travel-disclaimer">Estimativa, não garantia de gasto ou autonomia. Trânsito, velocidade, relevo, carga, clima, manutenção, condução, disponibilidade de recarga e preço praticado alteram o resultado. O tempo não considera trânsito nem paradas.</p>
    <div className="travel-share">
      <button className="button button-secondary" type="button" onClick={() => onShare(result, comparisons, journey)}>Compartilhar estimativa</button>
      {shareStatus && <span role="status">{shareStatus}</span>}
    </div>
    <span className="sr-only">{routeDescription}</span>
  </aside>;
}

export default function TravelCostCalculator() {
  const [values, setValues] = useState(initialVehicle);
  const [journey, setJourney] = useState(initialTrip);
  const [prices, setPrices] = useState(initialPrices);
  const [stops, setStops] = useState([]);
  const [comparisonVehicles, setComparisonVehicles] = useState([]);
  const [result, setResult] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  function clearResult() {
    setResult(null);
    setComparisons([]);
    setError("");
    setShareStatus("");
  }

  function updateVehicle(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    clearResult();
  }

  function updateJourney(key, value) {
    setJourney((current) => ({ ...current, [key]: value }));
    clearResult();
  }

  function updatePrices(key, value) {
    setPrices((current) => ({ ...current, [key]: value }));
    clearResult();
  }

  function updateComparison(id, key, value) {
    setComparisonVehicles((current) => current.map((vehicle) => vehicle.id === id ? { ...vehicle, [key]: value } : vehicle));
    clearResult();
  }

  function updateStop(id, key, value) {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, [key]: value } : stop));
    clearResult();
  }

  function addStop() {
    setStops((current) => current.length >= 9 ? current : [...current, {
      id: `trecho-${Date.now()}-${current.length}`,
      label: "",
      distanceKm: "",
    }]);
    clearResult();
  }

  function addComparisonVehicle() {
    setComparisonVehicles((current) => current.length >= 5 ? current : [...current, {
      ...initialVehicle,
      id: `comparador-${Date.now()}-${current.length}`,
      vehicleType: "gasoline",
      make: "",
      model: "",
    }]);
    clearResult();
  }

  function vehicleInput(vehicle) {
    return { ...inputForVehicle(vehicle, prices), make: vehicle.make, model: vehicle.model, year: vehicle.year, version: vehicle.version };
  }

  function calculate(event) {
    event.preventDefault();
    clearResult();
    try {
      const segments = [
        { label: journey.firstSegmentLabel || "Trecho 1", distanceKm: journey.distanceKm },
        ...stops.map((stop, index) => ({ label: stop.label || `Trecho ${index + 2}`, distanceKm: stop.distanceKm })),
      ];
      const trip = {
        segments,
        roundTrip: journey.roundTrip,
        averageSpeedKmh: journey.averageSpeedKmh,
        passengers: journey.passengers,
      };
      const primaryInput = vehicleInput(values);
      const primaryResult = calculateTravelCost({ ...primaryInput, ...trip });
      if (comparisonVehicles.length) {
        const vehicles = [
          { id: "principal", name: vehicleName(values), ...primaryInput },
          ...comparisonVehicles.map((vehicle, index) => ({
            id: vehicle.id,
            name: vehicleName(vehicle) === typeLabel(vehicle.vehicleType) ? `Veículo ${index + 2} · ${typeLabel(vehicle.vehicleType)}` : vehicleName(vehicle),
            ...vehicleInput(vehicle),
          })),
        ];
        setComparisons(compareTravelVehicles(vehicles, trip));
      }
      setJourney((current) => ({ ...current, segments }));
      setResult(primaryResult);
    } catch (calculationError) {
      setError(calculationError.message);
    }
  }

  async function shareEstimate(travelResult, comparedVehicles, trip) {
    const text = [
      "Estimativa de custo de viagem · FreeUse.store",
      `Distância total: ${formatTravelNumber(travelResult.distanceKm)} km${travelResult.roundTrip ? " (ida e volta)" : ""}`,
      `Trechos: ${trip.segments.map((segment) => `${segment.label}: ${formatTravelNumber(segment.distanceKm)} km`).join("; ")}`,
      `Passageiros: ${travelResult.passengers} · custo por pessoa: ${money(travelResult.best.costPerPassenger)}`,
      ...(comparedVehicles.length > 1
        ? ["Comparação:", ...comparedVehicles.map((vehicle) => `${vehicle.name}: ${money(vehicle.result.best.cost)} (${money(vehicle.result.best.costPerPassenger)} por pessoa)`)]
        : [`${vehicleName(values)}: ${money(travelResult.best.cost)} · ${money(travelResult.best.costPerKm)}/km`]),
      "Valores estimados com dados informados pelo usuário; podem diferir do custo real.",
      "https://freeuse.store/ferramentas/calculadora-custo-viagem",
    ].join("\n");
    const shareData = { title: "Estimativa de viagem · FreeUse.store", text };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Estimativa compartilhada.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus("Resumo copiado para compartilhar.");
      } else {
        window.prompt("Copie o resumo da viagem:", text);
        setShareStatus("Resumo pronto para copiar.");
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") setShareStatus("Não foi possível compartilhar agora. Tente novamente.");
    }
  }

  const type = values.vehicleType;
  const requiredPriceFields = new Set([values, ...comparisonVehicles].flatMap(priceFieldsForVehicle));

  return <section className="tool-workspace" aria-label="Calculadora de custo de viagem">
    <div className="travel-layout">
      <form className="travel-form" onSubmit={calculate}>
        <fieldset className="travel-fieldset">
          <legend>1 · Veículo principal</legend>
          <Field label="Tipo de veículo">
            <select value={type} onChange={(event) => updateVehicle("vehicleType", event.target.value)}>
              {vehicleTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </Field>
          <div className="travel-source-row">
            <Field label="Origem do consumo de referência">
              <select value={values.consumptionSource} onChange={(event) => updateVehicle("consumptionSource", event.target.value)}>
                <option value="manual">Informado por mim</option>
                <option value="inmetro">Consultei o PBE Veicular (Inmetro)</option>
              </select>
            </Field>
            {values.consumptionSource === "inmetro" && <Field label="Data da consulta (opcional)"><input type="date" value={values.sourceDate} onChange={(event) => updateVehicle("sourceDate", event.target.value)} /></Field>}
          </div>
          <VehicleConsumption values={values} update={updateVehicle} primary />
        </fieldset>

        <fieldset className="travel-fieldset">
          <legend>2 · Distância, paradas e passageiros</legend>
          <div className="field-grid">
            <Field label="Nome do trecho inicial"><input value={journey.firstSegmentLabel} onChange={(event) => updateJourney("firstSegmentLabel", event.target.value)} maxLength={100} placeholder="Ex.: São Paulo → Campinas" /></Field>
            <Field label="Distância do trecho inicial (km)"><NumberInput value={journey.distanceKm} onChange={(event) => updateJourney("distanceKm", event.target.value)} min="0.01" max="10000000" required /></Field>
            <Field label="Velocidade média (km/h, opcional)"><NumberInput value={journey.averageSpeedKmh} onChange={(event) => updateJourney("averageSpeedKmh", event.target.value)} min="0.01" max="500" placeholder="Ex.: 80" /></Field>
            <Field label="Passageiros para dividir o custo"><NumberInput value={journey.passengers} onChange={(event) => updateJourney("passengers", event.target.value)} min="1" max="100" step="1" required /></Field>
            <label className="checkbox-field travel-roundtrip"><input type="checkbox" checked={journey.roundTrip} onChange={(event) => updateJourney("roundTrip", event.target.checked)} /><span>Incluir ida e volta</span></label>
          </div>
          {stops.map((stop, index) => <div className="travel-stop-row" key={stop.id}>
            <Field label={`Trecho ${index + 2} · nome ou parada`}><input value={stop.label} onChange={(event) => updateStop(stop.id, "label", event.target.value)} maxLength={100} placeholder="Ex.: Campinas → São Paulo" /></Field>
            <Field label="Distância desde a etapa anterior (km)"><NumberInput value={stop.distanceKm} onChange={(event) => updateStop(stop.id, "distanceKm", event.target.value)} min="0.01" max="10000000" required /></Field>
            <button className="button button-secondary travel-remove-button" type="button" onClick={() => { setStops((current) => current.filter(({ id }) => id !== stop.id)); clearResult(); }} aria-label={`Remover trecho ${index + 2}`}>Remover trecho</button>
          </div>)}
          <button className="button button-secondary" type="button" onClick={addStop} disabled={stops.length >= 9}>Adicionar parada ou trecho</button>
          <p className="field-hint">Cada distância é medida desde a etapa anterior. Até 10 trechos; o cálculo por endereço e o mapa ainda não estão disponíveis.</p>
        </fieldset>

        <fieldset className="travel-fieldset">
          <legend>3 · Preços compartilhados da viagem</legend>
          <p className="field-hint">Use as mesmas referências para todos os veículos comparados. Preços regionais são editáveis e não são consultados automaticamente.</p>
          <div className="field-grid">
            {fuelTypes.map(([fuel, label]) => <Field label={`Preço da ${label} (R$/L)`} key={fuel}>
              <NumberInput value={prices[`${fuel}PricePerL`]} onChange={(event) => updatePrices(`${fuel}PricePerL`, event.target.value)} max="10000" required={requiredPriceFields.has(`${fuel}PricePerL`)} />
            </Field>)}
            <Field label="Preço da energia (R$/kWh)"><NumberInput value={prices.electricPricePerKwh} onChange={(event) => updatePrices("electricPricePerKwh", event.target.value)} max="10000" required={requiredPriceFields.has("electricPricePerKwh")} /></Field>
            <Field label="Município/UF de referência (opcional)"><input value={prices.priceCity} onChange={(event) => updatePrices("priceCity", event.target.value)} maxLength={100} placeholder="Ex.: Campinas - SP" /></Field>
            <Field label="Data da consulta (opcional)"><input type="date" value={prices.priceDate} onChange={(event) => updatePrices("priceDate", event.target.value)} /></Field>
            <Field label="Fonte dos preços"><select value={prices.priceSource} onChange={(event) => updatePrices("priceSource", event.target.value)}><option value="manual">Informados por mim</option><option value="anp">Consultei a pesquisa da ANP</option></select></Field>
            <Field label="Referência do preço de energia"><select value={prices.electricityPriceType} onChange={(event) => updatePrices("electricityPriceType", event.target.value)}><option value="home">Tarifa residencial</option><option value="public">Recarga pública</option></select></Field>
          </div>
        </fieldset>

        <fieldset className="travel-fieldset">
          <legend>4 · Comparar veículos (opcional)</legend>
          <p className="field-hint">Compare de 2 a 6 veículos na mesma rota. Informe o consumo de cada um; preços e condições da viagem são compartilhados.</p>
          {comparisonVehicles.map((vehicle, index) => <div className="travel-comparison-editor" key={vehicle.id}>
            <div className="travel-comparison-editor-heading"><h3>Veículo {index + 2}</h3><button className="button button-secondary" type="button" onClick={() => { setComparisonVehicles((current) => current.filter(({ id }) => id !== vehicle.id)); clearResult(); }}>Remover</button></div>
            <Field label="Tipo de veículo"><select value={vehicle.vehicleType} onChange={(event) => updateComparison(vehicle.id, "vehicleType", event.target.value)}>{vehicleTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            <VehicleIdentity values={vehicle} update={(key, value) => updateComparison(vehicle.id, key, value)} />
            <VehicleConsumption values={vehicle} update={(key, value) => updateComparison(vehicle.id, key, value)} />
          </div>)}
          <button className="button button-secondary" type="button" onClick={addComparisonVehicle} disabled={comparisonVehicles.length >= 5}>Adicionar veículo para comparar</button>
        </fieldset>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Calcular custo estimado</button>
      </form>

      {result ? <TravelEstimate result={result} values={values} comparisons={comparisons} journey={journey} prices={prices} onShare={shareEstimate} shareStatus={shareStatus} /> : <aside className="travel-empty">
        <span className="travel-empty-icon" aria-hidden="true">⌁</span>
        <h2>Descubra o custo estimado</h2>
        <p>Informe distância, consumo e preços. Adicione trechos e compare veículos usando as mesmas condições.</p>
      </aside>}
    </div>
    <p className="tool-privacy-hint">O cálculo é feito no navegador. Nenhuma localização ou dado do veículo é enviado ou salvo. O compartilhamento só acontece quando você escolhe fazê-lo.</p>
  </section>;
}
