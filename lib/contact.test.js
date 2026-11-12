import test from "node:test";
import assert from "node:assert/strict";
import { createContactRateLimiter, validateContactPayload } from "./contact.js";

test("valida e normaliza uma mensagem de contato", () => {
  const result = validateContactPayload({
    type: " Mensagem ",
    name: " Ana ",
    email: "ana@example.com ",
    message: "  Olá, equipe!  ",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      type: "Mensagem",
      name: "Ana",
      email: "ana@example.com",
      message: "Olá, equipe!",
    },
  });
});

test("recusa tipo inválido, mensagem vazia, e-mail incorreto e campos longos", () => {
  assert.equal(validateContactPayload({ type: "Outro", message: "Oi" }).ok, false);
  assert.equal(validateContactPayload({ type: "Mensagem", message: "  " }).ok, false);
  assert.equal(validateContactPayload({ type: "Mensagem", email: "sem-arroba", message: "Oi" }).ok, false);
  assert.equal(validateContactPayload({ type: "Mensagem", name: "n".repeat(101), message: "Oi" }).ok, false);
  assert.equal(validateContactPayload({ type: "Mensagem", message: "m".repeat(3001) }).ok, false);
});

test("recusa formulários preenchidos no campo-armadilha", () => {
  assert.equal(validateContactPayload({
    type: "Mensagem",
    message: "Oi",
    website: "spam.example",
  }).ok, false);
});

test("limita envios por janela e libera novamente quando ela expira", () => {
  const check = createContactRateLimiter({ limit: 2, windowMs: 1000 });

  assert.deepEqual(check("ip-a", 100), { allowed: true, remaining: 1 });
  assert.deepEqual(check("ip-a", 200), { allowed: true, remaining: 0 });
  assert.deepEqual(check("ip-a", 300), { allowed: false, retryAfterSeconds: 1 });
  assert.deepEqual(check("ip-a", 1100), { allowed: true, remaining: 1 });
  assert.deepEqual(check("ip-b", 300), { allowed: true, remaining: 1 });
});
