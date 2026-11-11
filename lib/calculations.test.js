import test from "node:test";
import assert from "node:assert/strict";
import { calculateSellingPrice, calculateWorkday, durationMinutes, formatDuration } from "./calculations.js";

test("calcula preço por margem sobre a venda e distingue markup", () => {
  const result = calculateSellingPrice({ cost: 50, tax: 10, commission: 10, margin: 20 });
  assert.equal(result.price, 83.33333333333334);
  assert.equal(result.profit, 16.66666666666667);
  assert.ok(Math.abs(result.margin - 20) < 1e-10);
  assert.ok(result.markup > result.margin);
});

test("recusa margens impossíveis e valores negativos", () => {
  assert.throws(() => calculateSellingPrice({ cost: 10, tax: 80, commission: 20 }), RangeError);
  assert.throws(() => calculateSellingPrice({ cost: -1 }), RangeError);
});

test("calcula períodos, pausa e virada da meia-noite", () => {
  const result = calculateWorkday([
    { start: "22:00", end: "06:00", breakStart: "02:00", breakEnd: "02:30" },
    { start: "08:00", end: "10:00" },
  ], 9, 0);
  assert.deepEqual(result, { worked: 570, breaks: 30, expected: 540, difference: 30 });
  assert.equal(durationMinutes("22:00", "06:00"), 480);
  assert.equal(formatDuration(-90), "−1h 30min");
});

test("recusa períodos ou pausas incompletos e jornadas inválidas", () => {
  assert.throws(() => calculateWorkday([{ start: "09:00", end: "" }]), RangeError);
  assert.throws(() => calculateWorkday([{ start: "09:00", end: "09:00" }]), RangeError);
  assert.throws(() => calculateWorkday([{ start: "09:00", end: "17:00", breakStart: "12:00" }]), RangeError);
  assert.throws(() => calculateWorkday([{ start: "09:00", end: "17:00", breakStart: "18:00", breakEnd: "18:30" }]), RangeError);
  assert.throws(() => calculateWorkday([{ start: "09:00", end: "17:00" }], 8, 60), RangeError);
});
