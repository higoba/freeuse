const FUEL_LABELS = {
  gasoline: "gasolina",
  ethanol: "etanol",
  diesel: "diesel",
};

function number(value, label, { min = 0, max = Infinity, integer = false, optional = false } = {}) {
  if (optional && (value === "" || value === null || value === undefined)) return null;
  if (value === "" || value === null || value === undefined) throw new RangeError(`Informe ${label}.`);
  const parsed = Number(String(value).trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw new RangeError(`Informe ${label} ${integer ? "como um número inteiro" : "com um valor válido"}.`);
  }
  return parsed;
}

function combustionEstimate(distanceKm, consumptionKmPerL, pricePerL, fuel) {
  const liters = distanceKm / consumptionKmPerL;
  const cost = liters * pricePerL;
  return {
    fuel,
    fuelLabel: FUEL_LABELS[fuel],
    consumptionKmPerL,
    pricePerL,
    liters,
    energyKwh: 0,
    cost,
    costPerKm: cost / distanceKm,
  };
}

function electricEstimate(distanceKm, consumptionKwhPer100Km, pricePerKwh) {
  const energyKwh = distanceKm * consumptionKwhPer100Km / 100;
  const cost = energyKwh * pricePerKwh;
  return {
    fuel: "electricity",
    fuelLabel: "energia elétrica",
    consumptionKwhPer100Km,
    pricePerKwh,
    liters: 0,
    energyKwh,
    cost,
    costPerKm: cost / distanceKm,
  };
}

export function calculateTravelCost(input) {
  const validTypes = ["gasoline", "ethanol", "diesel", "flex", "hev", "phev", "bev"];
  if (!validTypes.includes(input.vehicleType)) throw new RangeError("Escolha uma tecnologia de veículo válida.");
  const segments = Array.isArray(input.segments) && input.segments.length
    ? input.segments.map((segment, index) => {
      const label = String(segment.label || `Trecho ${index + 1}`).trim();
      if (label.length > 100) throw new RangeError("Use nomes de trecho com até 100 caracteres.");
      return {
        label: label || `Trecho ${index + 1}`,
        distanceKm: number(segment.distanceKm, `a distância do trecho ${index + 1} em quilômetros`, { min: Number.EPSILON, max: 10_000_000 }),
        tollCost: number(segment.tollCost, `o pedágio do trecho ${index + 1}`, { min: 0, max: 1_000_000, optional: true }) || 0,
      };
    })
    : [{
      label: "Trecho",
      distanceKm: number(input.distanceKm, "a distância em quilômetros", { min: Number.EPSILON, max: 10_000_000 }),
      tollCost: number(input.tollCost, "o valor do pedágio", { min: 0, max: 1_000_000, optional: true }) || 0,
    }];
  if (segments.length > 10) throw new RangeError("A viagem pode ter no máximo 10 trechos.");
  const oneWayDistanceKm = segments.reduce((total, segment) => total + segment.distanceKm, 0);
  if (!Number.isFinite(oneWayDistanceKm) || oneWayDistanceKm > 10_000_000) {
    throw new RangeError("A distância total da viagem deve ser menor que 10.000.000 km.");
  }
  const roundTripMultiplier = input.roundTrip ? 2 : 1;
  const distanceKm = oneWayDistanceKm * roundTripMultiplier;

  // Cálculo de pedágios: soma dos trechos mais o pedágio global se informado
  const segmentsOneWayTolls = segments.reduce((sum, s) => sum + (s.tollCost || 0), 0);
  const globalOneWayTolls = (number(input.tollCost, "o valor do pedágio", { min: 0, max: 1_000_000, optional: true }) || 0);
  // Se os trechos já somam pedágio, usa a soma dos trechos; caso contrário, usa o global
  const oneWayTollCost = segmentsOneWayTolls > 0 ? segmentsOneWayTolls : globalOneWayTolls;
  const totalTollCost = oneWayTollCost * roundTripMultiplier;

  const passengers = number(input.passengers ?? 1, "a quantidade de passageiros", { min: 1, max: 100, integer: true });
  const averageSpeedKmh = number(input.averageSpeedKmh, "a velocidade média", { min: Number.EPSILON, max: 500, optional: true });
  const timeMinutes = averageSpeedKmh ? Math.round(distanceKm / averageSpeedKmh * 60) : null;
  let alternatives;
  let autonomyKm = null;
  let electricAutonomyKm = null;

  if (input.vehicleType === "gasoline" || input.vehicleType === "ethanol" || input.vehicleType === "diesel" || input.vehicleType === "hev") {
    const fuel = input.vehicleType === "hev" ? input.hybridFuel || "gasoline" : input.vehicleType;
    if (!FUEL_LABELS[fuel]) throw new RangeError("Escolha um combustível válido.");
    alternatives = [combustionEstimate(
      distanceKm,
      number(input.consumptionKmPerL, "o consumo em km/L", { min: Number.EPSILON, max: 1000 }),
      number(input.fuelPricePerL, "o preço por litro", { max: 10_000 }),
      fuel,
    )];
  } else if (input.vehicleType === "flex") {
    alternatives = [
      combustionEstimate(distanceKm, number(input.gasolineKmPerL, "o consumo com gasolina em km/L", { min: Number.EPSILON, max: 1000 }), number(input.gasolinePricePerL, "o preço da gasolina por litro", { max: 10_000 }), "gasoline"),
      combustionEstimate(distanceKm, number(input.ethanolKmPerL, "o consumo com etanol em km/L", { min: Number.EPSILON, max: 1000 }), number(input.ethanolPricePerL, "o preço do etanol por litro", { max: 10_000 }), "ethanol"),
    ];
  } else if (input.vehicleType === "phev") {
    if (!FUEL_LABELS[input.phevFuel || "gasoline"]) throw new RangeError("Escolha um combustível válido para o híbrido plug-in.");
    const electricShare = number(input.electricDistancePercent, "a parcela elétrica da distância", { max: 100 });
    const electricDistanceKm = distanceKm * electricShare / 100;
    const combustionDistanceKm = distanceKm - electricDistanceKm;
    electricAutonomyKm = electricDistanceKm > 0
      ? number(input.electricAutonomyKm, "a autonomia elétrica", { min: Number.EPSILON, max: 10_000_000, optional: true })
      : null;
    const energy = electricDistanceKm > 0
      ? electricEstimate(electricDistanceKm, number(input.electricKwhPer100Km, "o consumo elétrico em kWh/100 km", { min: Number.EPSILON, max: 1000 }), number(input.electricPricePerKwh, "o preço por kWh", { max: 10_000 }))
      : { energyKwh: 0, cost: 0, costPerKm: 0 };
    const fuel = input.phevFuel || "gasoline";
    const combustion = combustionDistanceKm > 0
      ? combustionEstimate(combustionDistanceKm, number(input.combustionKmPerL, "o consumo a combustão em km/L", { min: Number.EPSILON, max: 1000 }), number(input.fuelPricePerL, "o preço por litro", { max: 10_000 }), fuel)
      : { liters: 0, cost: 0, costPerKm: 0, fuelLabel: FUEL_LABELS[fuel] };
    const cost = energy.cost + combustion.cost;
    alternatives = [{
      fuelLabel: "parte elétrica + parte a combustão",
      liters: combustion.liters,
      energyKwh: energy.energyKwh,
      electricDistanceKm,
      combustionDistanceKm,
      electricAutonomyKm,
      electricConsumptionKwhPer100Km: energy.consumptionKwhPer100Km ?? null,
      electricPricePerKwh: energy.pricePerKwh ?? null,
      combustionConsumptionKmPerL: combustion.consumptionKmPerL ?? null,
      fuelPricePerL: combustion.pricePerL ?? null,
      electricCost: energy.cost,
      combustionCost: combustion.cost,
      cost,
      costPerKm: cost / distanceKm,
    }];
  } else if (input.vehicleType === "bev") {
    alternatives = [electricEstimate(
      distanceKm,
      number(input.electricKwhPer100Km, "o consumo em kWh/100 km", { min: Number.EPSILON, max: 1000 }),
      number(input.electricPricePerKwh, "o preço por kWh", { max: 10_000 }),
    )];
    autonomyKm = number(input.autonomyKm, "a autonomia em quilômetros", { min: Number.EPSILON, max: 10_000_000, optional: true });
  } else {
    throw new RangeError("Escolha uma tecnologia de veículo válida.");
  }

  // Agrega custo de combustível/energia com o custo de pedágios
  const results = alternatives.map((estimate) => {
    const fuelCost = estimate.cost;
    const totalCost = fuelCost + totalTollCost;
    return {
      ...estimate,
      fuelCost,
      tollCost: totalTollCost,
      cost: totalCost,
      costPerKm: totalCost / distanceKm,
      costPerPassenger: totalCost / passengers,
    };
  });

  if (results.some((estimate) => !Number.isFinite(estimate.cost) || !Number.isFinite(estimate.costPerKm) || !Number.isFinite(estimate.costPerPassenger))) {
    throw new RangeError("Os valores informados são altos demais para gerar uma estimativa.");
  }
  const best = results.length > 1 ? results.reduce((lower, item) => item.cost < lower.cost ? item : lower) : results[0];
  const legCount = input.roundTrip ? 2 : 1;
  const legs = Array.from({ length: legCount }, (_, index) => ({
    label: input.roundTrip ? index === 0 ? "Ida" : "Volta" : "Trecho",
    distanceKm: oneWayDistanceKm,
    liters: best.liters / legCount,
    energyKwh: best.energyKwh / legCount,
    fuelCost: best.fuelCost / legCount,
    tollCost: totalTollCost / legCount,
    cost: best.cost / legCount,
  }));
  const segmentResults = segments.map((segment) => {
    const segToll = segment.tollCost ? segment.tollCost * roundTripMultiplier : (totalTollCost * segment.distanceKm / oneWayDistanceKm);
    const segFuelCost = best.fuelCost * segment.distanceKm / oneWayDistanceKm;
    return {
      ...segment,
      liters: best.liters * segment.distanceKm / oneWayDistanceKm,
      energyKwh: best.energyKwh * segment.distanceKm / oneWayDistanceKm,
      fuelCost: segFuelCost,
      tollCost: segToll,
      cost: segFuelCost + segToll,
    };
  });

  return {
    oneWayDistanceKm,
    distanceKm,
    roundTrip: Boolean(input.roundTrip),
    passengers,
    averageSpeedKmh,
    timeMinutes,
    autonomyKm,
    remainingRangeKm: autonomyKm === null ? null : autonomyKm - distanceKm,
    electricAutonomyKm,
    remainingElectricRangeKm: electricAutonomyKm === null ? null : electricAutonomyKm - alternatives[0].electricDistanceKm,
    tollCost: totalTollCost,
    oneWayTollCost,
    alternatives: results,
    best,
    legs,
    segments: segmentResults,
  };
}

export function compareTravelVehicles(vehicles, trip) {
  if (!Array.isArray(vehicles) || vehicles.length < 2 || vehicles.length > 6) {
    throw new RangeError("Compare de 2 a 6 veículos.");
  }
  return vehicles.map((vehicle, index) => {
    const { id = `veiculo-${index + 1}`, name, ...vehicleInput } = vehicle;
    const result = calculateTravelCost({
      ...vehicleInput,
      ...trip,
      vehicleType: vehicleInput.vehicleType,
    });
    return {
      id,
      name: String(name || "").trim() || `Veículo ${index + 1}`,
      vehicleType: vehicleInput.vehicleType,
      result,
    };
  }).sort((left, right) => left.result.best.cost - right.result.best.cost);
}

export function formatTravelNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value);
}
