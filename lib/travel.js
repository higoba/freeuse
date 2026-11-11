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
  const oneWayDistanceKm = number(input.distanceKm, "a distância em quilômetros", { min: Number.EPSILON, max: 10_000_000 });
  const distanceKm = oneWayDistanceKm * (input.roundTrip ? 2 : 1);
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

  const results = alternatives.map((estimate) => ({
    ...estimate,
    costPerPassenger: estimate.cost / passengers,
  }));
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
    cost: best.cost / legCount,
  }));

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
    alternatives: results,
    best,
    legs,
  };
}

export function formatTravelNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value);
}
