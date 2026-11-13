"use client";

import { useState } from "react";
import ToolIcon from "@/components/ToolIcon";
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
  origin: "",
  destination: "",
  distanceKm: "",
  tollCost: "",
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
      <p>Estimativas com os consumos e preços informados para cada combustível (incluindo pedágios).</p>
      {result.alternatives.map((alternative) => <div className={`travel-alternative${alternative.fuel === best.fuel ? " is-best" : ""}`} key={alternative.fuel}>
        <span>{fuelLabel(alternative.fuel)}{alternative.fuel === best.fuel && <strong> menor custo estimado</strong>}</span>
        <b>{money(alternative.cost)}</b>
        <small>Combustível: {money(alternative.fuelCost)} ({formatTravelNumber(alternative.liters)} L a {money(alternative.pricePerL)}/L) {result.tollCost > 0 ? `· Pedágios: ${money(result.tollCost)}` : ""}</small>
      </div>)}
    </div>}

    <div className="travel-total">
      <span>{result.alternatives.length > 1 ? `Menor custo total (${fuelLabel(best.fuel)})` : "Custo total estimado da viagem"}</span>
      <strong>{money(best.cost)}</strong>
    </div>

    {/* Discriminação detalhada: Combustível vs Pedágios */}
    <div className="travel-breakdown-card">
      <div className="breakdown-item">
        <span className="breakdown-label">
          <ToolIcon name="route" size={16} />
          <span>Combustível / Energia</span>
        </span>
        <b className="breakdown-value">{money(best.fuelCost)}</b>
      </div>
      <div className="breakdown-item">
        <span className="breakdown-label">
          <ToolIcon name="toll" size={16} />
          <span>Pedágios {result.roundTrip ? "(ida e volta)" : ""}</span>
        </span>
        <b className="breakdown-value">{result.tollCost > 0 ? money(result.tollCost) : "R$ 0,00"}</b>
      </div>
    </div>

    <div className="travel-result-grid">
      <div><span>Distância considerada</span><b>{formatTravelNumber(result.distanceKm)} km</b></div>
      <div><span>Custo por km (total)</span><b>{money(best.costPerKm)}/km</b></div>
      <div><span>Custo por pessoa · {result.passengers} {result.passengers === 1 ? "passageiro" : "passageiros"}</span><b>{money(best.costPerPassenger)}</b></div>
      {result.timeMinutes !== null && <div><span>Tempo estimado</span><b>{Math.floor(result.timeMinutes / 60)}h {String(result.timeMinutes % 60).padStart(2, "0")}min</b></div>}
    </div>

    <div className="travel-consumption">
      <h3>Energia e combustível estimados</h3>
      {best.liters > 0 && <p><span>Combustível · {best.fuelLabel}</span><b>{formatTravelNumber(best.liters, 2)} L ({money(best.fuelCost)})</b></p>}
      {best.energyKwh > 0 && <p><span>Energia elétrica</span><b>{formatTravelNumber(best.energyKwh, 2)} kWh ({money(best.fuelCost)})</b></p>}
      {result.tollCost > 0 && <p><span>Pedágios totais</span><b>{money(result.tollCost)}</b></p>}
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
      {result.segments.map((segment) => <p key={segment.label}><span>{segment.label} · {formatTravelNumber(segment.distanceKm)} km{result.roundTrip ? " · ida e volta" : ""}</span><b>{money(segment.cost)}{segment.tollCost > 0 ? ` (pedágio: ${money(segment.tollCost)})` : ""}{segment.liters > 0 ? ` · ${formatTravelNumber(segment.liters, 2)} L` : ""}</b></p>)}
      <small>Os custos por trecho incluem a proporção de combustível e pedágios.</small>
    </div>}

    {comparisons.length > 1 && <section className="travel-comparison-results" aria-labelledby="travel-comparison-title">
      <h3 id="travel-comparison-title">Comparador de veículos</h3>
      <p>Todos usam a mesma rota, ida e volta, passageiros, pedágios e preços informados. O menor custo total aparece primeiro.</p>
      <ol>
        {comparisons.map((vehicle, index) => <li className={index === 0 ? "is-best" : ""} key={vehicle.id}>
          <div><strong>{vehicle.name}</strong>{index === 0 && <span>Menor custo estimado</span>}</div>
          <b>{money(vehicle.result.best.cost)}</b>
          <small>{typeLabel(vehicle.vehicleType)} · Total: {money(vehicle.result.best.cost)} (combustível: {money(vehicle.result.best.fuelCost)}{result.tollCost > 0 ? ` + pedágio: ${money(result.tollCost)}` : ""}) · {money(vehicle.result.best.costPerPassenger)}/pessoa</small>
        </li>)}
      </ol>
    </section>}

    {result.roundTrip && <div className="travel-legs">
      <h3>Ida e volta</h3>
      {result.legs.map((leg) => <p key={leg.label}><span>{leg.label} · {formatTravelNumber(leg.distanceKm)} km</span><b>{money(leg.cost)}{leg.tollCost > 0 ? ` (pedágio: ${money(leg.tollCost)})` : ""}{leg.liters > 0 ? ` · ${formatTravelNumber(leg.liters, 2)} L` : ""}</b></p>)}
      <small>A divisão divide combustível e pedágios igualmente nos dois sentidos.</small>
    </div>}

    {result.remainingRangeKm !== null && result.remainingRangeKm < 0 && <p className="travel-warning" role="status">A distância total informada supera a autonomia que você registrou. O cálculo não considera paradas ou recargas.</p>}
    {result.remainingElectricRangeKm !== null && result.remainingElectricRangeKm < 0 && <p className="travel-warning" role="status">A parte elétrica informada supera a autonomia elétrica que você registrou. A divisão de modos é uma estimativa editável.</p>}

    <p className="travel-data-note">
      Consumo: {values.consumptionSource === "inmetro" ? "valor informado após consulta ao PBEV/Inmetro" : "valor informado por você"}{values.sourceDate ? ` · consultado em ${new Date(`${values.sourceDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}.
      {" "}{prices.priceCity ? `${prices.priceCity} · ` : ""}{prices.priceDate ? `preços consultados em ${new Date(`${prices.priceDate}T12:00:00`).toLocaleDateString("pt-BR")} · ` : ""}{prices.priceSource === "anp" ? "valores anotados após consulta à ANP" : "preços informados por você"}.
      {" "}A energia considera preço informado para {prices.electricityPriceType === "home" ? "tarifa residencial" : "recarga pública"}.
    </p>
    <p className="travel-disclaimer">Estimativa, não garantia de gasto ou autonomia. Trânsito, velocidade, relevo, carga, clima, manutenção, condução, paradas e tarifas de pedágio vigentes alteram o resultado real.</p>
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

  // Estados para geolocalização e cálculo automático de rota
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");
  const [routeWarning, setRouteWarning] = useState("");

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
      origin: "",
      destination: "",
      label: "",
      distanceKm: "",
      tollCost: "",
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

  // Pede permissão de geolocalização ao navegador e preenche a Origem
  function handleUseCurrentLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoMessage("Seu navegador não oferece suporte à geolocalização.");
      return;
    }
    setGeoLoading(true);
    setGeoMessage("Solicitando permissão para acessar sua localização...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(`/api/rota?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          const address = data.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setJourney((current) => {
            const next = {
              ...current,
              origin: address,
              firstSegmentLabel: current.destination ? `${address} → ${current.destination}` : `${address} → Destino`,
            };
            // Se já tem destino, calcula automaticamente
            if (current.destination) {
              fetchAutoRoute(address, current.destination);
            }
            return next;
          });
          setGeoMessage(`Localização detectada: ${address}`);
        } catch {
          setGeoMessage("Localização obtida, mas não foi possível converter em endereço.");
        } finally {
          setGeoLoading(false);
        }
      },
      (geoError) => {
        setGeoLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGeoMessage("Permissão de localização não concedida. Você pode digitar a cidade ou endereço manualmente.");
        } else {
          setGeoMessage("Não foi possível obter sua localização atual.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Consulta rota, distância e pedágios na API (Google Maps / Routes API com fallback)
  async function fetchAutoRoute(origin, destination) {
    const o = (origin || "").trim();
    const d = (destination || "").trim();
    if (!o || !d) {
      setRouteWarning("Informe a origem e o destino para calcular a rota automaticamente.");
      return;
    }
    setRouteLoading(true);
    setRouteMessage("Consultando rota, distância e pedágios...");
    setRouteWarning("");
    try {
      const res = await fetch(`/api/rota?origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível calcular a rota.");

      setJourney((current) => ({
        ...current,
        origin: o,
        destination: d,
        distanceKm: String(data.distanceKm),
        averageSpeedKmh: data.averageSpeedKmh ? String(data.averageSpeedKmh) : current.averageSpeedKmh,
        tollCost: data.tollCost > 0 ? String(data.tollCost) : current.tollCost,
        firstSegmentLabel: `${o} → ${d}`,
      }));

      const tollInfo = data.hasTolls
        ? ` · Pedágio estimado: ${money(data.tollCost)}`
        : data.source === "google" ? " · Sem pedágios na rota" : "";
      setRouteMessage(`Rota calculada: ${formatTravelNumber(data.distanceKm)} km (${data.durationMinutes} min)${tollInfo}`);

      if (data.warning) setRouteWarning(data.warning);
      else if (data.notice) setRouteWarning(data.notice);
      else setRouteWarning("");
      clearResult();
    } catch (err) {
      setRouteMessage("");
      setRouteWarning(err.message || "Erro ao consultar rota.");
    } finally {
      setRouteLoading(false);
    }
  }

  // Consulta de trecho adicional (parada)
  async function fetchStopRoute(stopId, origin, destination) {
    const o = (origin || "").trim();
    const d = (destination || "").trim();
    if (!o || !d) return;
    try {
      const res = await fetch(`/api/rota?origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStops((current) => current.map((stop) => stop.id === stopId ? {
        ...stop,
        origin: o,
        destination: d,
        distanceKm: String(data.distanceKm),
        tollCost: data.tollCost > 0 ? String(data.tollCost) : stop.tollCost,
        label: `${o} → ${d}`,
      } : stop));
      clearResult();
    } catch {
      // Deixa o usuário preencher manualmente se falhar
    }
  }

  function vehicleInput(vehicle) {
    return { ...inputForVehicle(vehicle, prices), make: vehicle.make, model: vehicle.model, year: vehicle.year, version: vehicle.version };
  }

  function calculate(event) {
    event.preventDefault();
    clearResult();
    try {
      const segments = [
        {
          label: journey.firstSegmentLabel || (journey.origin && journey.destination ? `${journey.origin} → ${journey.destination}` : "Trecho 1"),
          distanceKm: journey.distanceKm,
          tollCost: journey.tollCost || 0,
        },
        ...stops.map((stop, index) => ({
          label: stop.label || (stop.origin && stop.destination ? `${stop.origin} → ${stop.destination}` : `Trecho ${index + 2}`),
          distanceKm: stop.distanceKm,
          tollCost: stop.tollCost || 0,
        })),
      ];
      const trip = {
        segments,
        roundTrip: journey.roundTrip,
        averageSpeedKmh: journey.averageSpeedKmh,
        passengers: journey.passengers,
        tollCost: journey.tollCost,
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
      `Combustível / Energia: ${money(travelResult.best.fuelCost)}`,
      ...(travelResult.tollCost > 0 ? [`Pedágios: ${money(travelResult.tollCost)}${travelResult.roundTrip ? " (ida e volta)" : ""}`] : []),
      `Custo total estimado: ${money(travelResult.best.cost)} (${money(travelResult.best.costPerKm)}/km)`,
      ...(comparedVehicles.length > 1
        ? ["Comparação:", ...comparedVehicles.map((vehicle) => `${vehicle.name}: ${money(vehicle.result.best.cost)} (combustível: ${money(vehicle.result.best.fuelCost)})`)]
        : [`${vehicleName(values)}: ${money(travelResult.best.cost)}`]),
      "Valores estimados com dados de rota e preços informados; podem diferir do custo real.",
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
          <legend>2 · Rota, distância e pedágios</legend>
          <p className="field-hint">Informe sua origem e destino para calcular a distância e os pedágios automaticamente, ou use sua localização atual.</p>

          <div className="travel-route-box">
            <div className="field-grid">
              <div className="field">
                <div className="field-label-row">
                  <span>Origem</span>
                  <button
                    type="button"
                    className="travel-location-btn"
                    onClick={handleUseCurrentLocation}
                    disabled={geoLoading}
                    title="Pedir permissão e usar minha localização atual"
                  >
                    <ToolIcon name="location" size={14} />
                    <span>{geoLoading ? "Localizando…" : "Usar minha localização"}</span>
                  </button>
                </div>
                <input
                  value={journey.origin || ""}
                  onChange={(event) => updateJourney("origin", event.target.value)}
                  placeholder="Ex.: São Paulo, SP ou seu endereço"
                  maxLength={150}
                />
              </div>

              <div className="field">
                <span>Destino</span>
                <input
                  value={journey.destination || ""}
                  onChange={(event) => updateJourney("destination", event.target.value)}
                  placeholder="Ex.: Campinas, SP ou Santos, SP"
                  maxLength={150}
                />
              </div>
            </div>

            <div className="travel-route-actions">
              <button
                type="button"
                className="button button-small button-secondary"
                onClick={() => fetchAutoRoute(journey.origin, journey.destination)}
                disabled={routeLoading || !journey.origin?.trim() || !journey.destination?.trim()}
              >
                <ToolIcon name="route" size={16} />
                <span>{routeLoading ? "Calculando distância e pedágios…" : "Calcular distância e pedágios"}</span>
              </button>
            </div>

            {geoMessage && <p className="travel-route-status is-notice" role="status">{geoMessage}</p>}
            {routeMessage && <p className="travel-route-status is-success" role="status">{routeMessage}</p>}
            {routeWarning && <p className="travel-route-status is-notice" role="status">{routeWarning}</p>}
          </div>

          <div className="field-grid" style={{ marginTop: "16px" }}>
            <Field label="Nome do trecho inicial">
              <input value={journey.firstSegmentLabel} onChange={(event) => updateJourney("firstSegmentLabel", event.target.value)} maxLength={100} placeholder="Ex.: São Paulo → Campinas" />
            </Field>
            <Field label="Distância do trecho inicial (km)" hint="Calculada automaticamente ou editável manualmente">
              <NumberInput value={journey.distanceKm} onChange={(event) => updateJourney("distanceKm", event.target.value)} min="0.01" max="10000000" required />
            </Field>
            <Field label="Pedágio estimado do trecho (R$, opcional)" hint="Calculado via Google Maps ou editável">
              <span className="input-suffix">
                <NumberInput value={journey.tollCost} onChange={(event) => updateJourney("tollCost", event.target.value)} min="0" max="100000" placeholder="0,00" />
                <span>R$</span>
              </span>
            </Field>
            <Field label="Velocidade média (km/h, opcional)">
              <NumberInput value={journey.averageSpeedKmh} onChange={(event) => updateJourney("averageSpeedKmh", event.target.value)} min="0.01" max="500" placeholder="Ex.: 80" />
            </Field>
            <Field label="Passageiros para dividir o custo">
              <NumberInput value={journey.passengers} onChange={(event) => updateJourney("passengers", event.target.value)} min="1" max="100" step="1" required />
            </Field>
            <label className="checkbox-field travel-roundtrip">
              <input type="checkbox" checked={journey.roundTrip} onChange={(event) => updateJourney("roundTrip", event.target.checked)} />
              <span>Incluir ida e volta (dobra distância e pedágios)</span>
            </label>
          </div>

          {stops.map((stop, index) => <div className="travel-stop-row" key={stop.id}>
            <div className="field-grid" style={{ width: "100%", margin: 0 }}>
              <Field label={`Trecho ${index + 2} · Origem`}>
                <input value={stop.origin || ""} onChange={(e) => updateStop(stop.id, "origin", e.target.value)} placeholder="Origem" maxLength={100} />
              </Field>
              <Field label={`Trecho ${index + 2} · Destino`}>
                <input value={stop.destination || ""} onChange={(e) => updateStop(stop.id, "destination", e.target.value)} placeholder="Destino" maxLength={100} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
              <button
                type="button"
                className="button button-small button-outline"
                onClick={() => fetchStopRoute(stop.id, stop.origin, stop.destination)}
                disabled={!stop.origin || !stop.destination}
              >
                Calcular trecho
              </button>
            </div>
            <div className="field-grid" style={{ width: "100%", margin: 0 }}>
              <Field label="Distância (km)">
                <NumberInput value={stop.distanceKm} onChange={(event) => updateStop(stop.id, "distanceKm", event.target.value)} min="0.01" max="10000000" required />
              </Field>
              <Field label="Pedágio (R$, opcional)">
                <span className="input-suffix">
                  <NumberInput value={stop.tollCost} onChange={(event) => updateStop(stop.id, "tollCost", event.target.value)} min="0" max="100000" placeholder="0,00" />
                  <span>R$</span>
                </span>
              </Field>
            </div>
            <button className="button button-secondary travel-remove-button" type="button" onClick={() => { setStops((current) => current.filter(({ id }) => id !== stop.id)); clearResult(); }} aria-label={`Remover trecho ${index + 2}`}>Remover trecho</button>
          </div>)}

          <button className="button button-secondary" type="button" onClick={addStop} disabled={stops.length >= 9}>Adicionar parada ou trecho</button>
          <p className="field-hint">Adicione paradas extras e calcule a rota entre cada trecho. Até 10 trechos.</p>
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
          <p className="field-hint">Compare de 2 a 6 veículos na mesma rota. Todos compartilham a mesma distância e os mesmos pedágios.</p>
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
        <span className="travel-empty-icon"><ToolIcon name="route" size={24} /></span>
        <h2>Descubra o custo estimado</h2>
        <p>Informe distância ou origem e destino, consumo, preços e pedágios. Adicione trechos e compare veículos usando as mesmas condições.</p>
      </aside>}
    </div>
    <p className="tool-privacy-hint">O cálculo é feito no navegador. Sua localização é consultada apenas se você permitir e serve unicamente para preencher a origem. O compartilhamento só acontece quando você escolhe fazê-lo.</p>
  </section>;
}
