import test from "node:test";
import assert from "node:assert/strict";
import { calculateTravelCost, compareTravelVehicles } from "./travel.js";

test("estima combustível para uma viagem e calcula tempo e custo por km", () => {
  const result = calculateTravelCost({
    vehicleType: "gasoline",
    distanceKm: 350,
    consumptionKmPerL: 10,
    fuelPricePerL: 6,
    averageSpeedKmh: 70,
    passengers: 2,
  });
  assert.equal(result.best.liters, 35);
  assert.equal(result.best.cost, 210);
  assert.equal(result.best.costPerKm, 0.6);
  assert.equal(result.best.costPerPassenger, 105);
  assert.equal(result.timeMinutes, 300);
});

test("compara gasolina e etanol para um veículo flex", () => {
  const result = calculateTravelCost({
    vehicleType: "flex",
    distanceKm: 350,
    gasolineKmPerL: 10,
    gasolinePricePerL: 6,
    ethanolKmPerL: 7,
    ethanolPricePerL: 4.2,
  });
  assert.equal(result.alternatives.length, 2);
  assert.equal(result.alternatives[0].cost, 210);
  assert.equal(result.alternatives[1].liters, 50);
  assert.equal(result.alternatives[1].cost, 210);
  assert.equal(result.best.fuel, "gasoline");
});

test("calcula energia de veículo elétrico e alcance restante apenas como estimativa", () => {
  const result = calculateTravelCost({
    vehicleType: "bev",
    distanceKm: 350,
    electricKwhPer100Km: 18,
    electricPricePerKwh: 0.9,
    autonomyKm: 420,
  });
  assert.equal(result.best.energyKwh, 63);
  assert.equal(result.best.cost, 56.7);
  assert.equal(result.remainingRangeKm, 70);
});

test("calcula separadamente energia e combustível de um híbrido plug-in", () => {
  const result = calculateTravelCost({
    vehicleType: "phev",
    distanceKm: 350,
    electricDistancePercent: 50,
    electricKwhPer100Km: 18,
    electricPricePerKwh: 0.9,
    combustionKmPerL: 10,
    fuelPricePerL: 6,
    phevFuel: "gasoline",
  });
  assert.equal(result.best.electricDistanceKm, 175);
  assert.equal(result.best.combustionDistanceKm, 175);
  assert.equal(result.best.energyKwh, 31.5);
  assert.equal(result.best.liters, 17.5);
  assert.equal(result.best.electricCost, 28.35);
  assert.equal(result.best.combustionCost, 105);
  assert.equal(result.best.cost, 133.35);
});

test("ida e volta duplicam a distância e dividem o custo por passageiro", () => {
  const result = calculateTravelCost({
    vehicleType: "diesel",
    distanceKm: 200,
    roundTrip: true,
    passengers: 4,
    consumptionKmPerL: 10,
    fuelPricePerL: 6,
  });
  assert.equal(result.distanceKm, 400);
  assert.equal(result.best.liters, 40);
  assert.equal(result.best.cost, 240);
  assert.equal(result.best.costPerPassenger, 60);
  assert.deepEqual(result.legs.map(({ label, distanceKm, liters, cost }) => ({ label, distanceKm, liters, cost })), [
    { label: "Ida", distanceKm: 200, liters: 20, cost: 120 },
    { label: "Volta", distanceKm: 200, liters: 20, cost: 120 },
  ]);
});

test("soma trechos com paradas e distribui custo proporcionalmente", () => {
  const result = calculateTravelCost({
    vehicleType: "gasoline",
    segments: [
      { label: "São Paulo → Campinas", distanceKm: 100 },
      { label: "Campinas → Ribeirão Preto", distanceKm: 200 },
    ],
    roundTrip: true,
    consumptionKmPerL: 10,
    fuelPricePerL: 6,
  });
  assert.equal(result.oneWayDistanceKm, 300);
  assert.equal(result.distanceKm, 600);
  assert.equal(result.best.cost, 360);
  assert.deepEqual(result.segments.map(({ label, distanceKm, cost }) => ({ label, distanceKm, cost })), [
    { label: "São Paulo → Campinas", distanceKm: 100, cost: 120 },
    { label: "Campinas → Ribeirão Preto", distanceKm: 200, cost: 240 },
  ]);
});

test("compara veículos com os mesmos trechos, ida e volta e divisão por passageiro", () => {
  const comparison = compareTravelVehicles([
    { id: "flex", name: "Flex", vehicleType: "flex", gasolineKmPerL: 10, gasolinePricePerL: 6, ethanolKmPerL: 7, ethanolPricePerL: 4 },
    { id: "eletrico", name: "Elétrico", vehicleType: "bev", electricKwhPer100Km: 18, electricPricePerKwh: 1 },
  ], {
    segments: [{ label: "Trecho 1", distanceKm: 100 }, { label: "Trecho 2", distanceKm: 50 }],
    roundTrip: true,
    passengers: 3,
  });
  assert.equal(comparison[0].id, "eletrico");
  assert.equal(comparison[0].result.distanceKm, 300);
  assert.equal(comparison[0].result.best.cost, 54);
  assert.equal(comparison[0].result.best.costPerPassenger, 18);
  assert.equal(comparison[1].result.distanceKm, 300);
  assert.ok(Math.abs(comparison[1].result.best.cost - 171.42857142857142) < 1e-10);
});

test("recusa comparação fora da quantidade permitida e trecho inválido", () => {
  assert.throws(() => compareTravelVehicles([], {}), RangeError);
  assert.throws(() => compareTravelVehicles([{ vehicleType: "gasoline" }], {}), RangeError);
  assert.throws(() => calculateTravelCost({
    vehicleType: "gasoline",
    segments: Array.from({ length: 11 }, () => ({ distanceKm: 1 })),
    consumptionKmPerL: 10,
    fuelPricePerL: 5,
  }), RangeError);
  assert.throws(() => calculateTravelCost({
    vehicleType: "gasoline",
    segments: [{ label: "Trecho", distanceKm: 0 }],
    consumptionKmPerL: 10,
    fuelPricePerL: 5,
  }), RangeError);
});

test("PHEV não exige dados da fonte de energia que não será usada", () => {
  const electricOnly = calculateTravelCost({
    vehicleType: "phev",
    distanceKm: 100,
    electricDistancePercent: 100,
    electricKwhPer100Km: 20,
    electricPricePerKwh: 1,
  });
  assert.equal(electricOnly.best.energyKwh, 20);
  assert.equal(electricOnly.best.liters, 0);

  const combustionOnly = calculateTravelCost({
    vehicleType: "phev",
    distanceKm: 100,
    electricDistancePercent: 0,
    combustionKmPerL: 10,
    fuelPricePerL: 6,
  });
  assert.equal(combustionOnly.best.energyKwh, 0);
  assert.equal(combustionOnly.best.liters, 10);
  assert.equal(combustionOnly.best.cost, 60);
});

test("recusa distância, consumo, preços e percentuais inválidos", () => {
  assert.throws(() => calculateTravelCost({ vehicleType: "gasoline", distanceKm: 0 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "gasoline", distanceKm: 10, consumptionKmPerL: 0, fuelPricePerL: 5 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "gasoline", distanceKm: 10_000_001, consumptionKmPerL: 10, fuelPricePerL: 5 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "gasoline", distanceKm: 10, consumptionKmPerL: 10, fuelPricePerL: 10_001 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "hev", distanceKm: 10, hybridFuel: "electricity", consumptionKmPerL: 10, fuelPricePerL: 5 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "bev", distanceKm: 10, electricKwhPer100Km: 15, electricPricePerKwh: -1 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "phev", distanceKm: 10, electricDistancePercent: 101 }), RangeError);
  assert.throws(() => calculateTravelCost({ vehicleType: "flex", distanceKm: 10, gasolineKmPerL: 10, gasolinePricePerL: 5, ethanolKmPerL: 7, ethanolPricePerL: Number.NaN }), RangeError);
});

test("calcula custo com pedágios e divide corretamente por passageiros", () => {
  const result = calculateTravelCost({
    vehicleType: "gasoline",
    distanceKm: 100,
    consumptionKmPerL: 10,
    fuelPricePerL: 6,
    tollCost: 30,
    passengers: 2,
    roundTrip: false,
  });
  assert.equal(result.best.fuelCost, 60);
  assert.equal(result.tollCost, 30);
  assert.equal(result.best.cost, 90);
  assert.equal(result.best.costPerPassenger, 45);
  assert.equal(result.best.costPerKm, 0.9);
});

test("duplica pedágio na ida e volta quando configurado", () => {
  const result = calculateTravelCost({
    vehicleType: "gasoline",
    distanceKm: 100,
    consumptionKmPerL: 10,
    fuelPricePerL: 6,
    tollCost: 25,
    passengers: 1,
    roundTrip: true,
  });
  assert.equal(result.best.fuelCost, 120);
  assert.equal(result.tollCost, 50);
  assert.equal(result.best.cost, 170);
  assert.equal(result.legs[0].tollCost, 25);
  assert.equal(result.legs[1].tollCost, 25);
});

