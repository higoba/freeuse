export const CONTACT_TYPES = ["Dica ou sugestão", "Mensagem", "Problema ou teste"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Confira os dados do formulário e tente novamente." };
  }

  const { type, name, email, message, website } = payload;
  if (typeof type !== "string" || !CONTACT_TYPES.includes(type.trim())) {
    return { ok: false, error: "Escolha um tipo de mensagem válido." };
  }
  if (name != null && typeof name !== "string") {
    return { ok: false, error: "Confira o nome informado." };
  }
  if (email != null && typeof email !== "string") {
    return { ok: false, error: "Confira o e-mail informado." };
  }
  if (typeof message !== "string" || !message.trim()) {
    return { ok: false, error: "Escreva sua mensagem antes de enviar." };
  }
  if (website != null && typeof website !== "string") {
    return { ok: false, error: "Confira os dados do formulário e tente novamente." };
  }
  if (website?.trim()) {
    return { ok: false, error: "Não foi possível validar o formulário." };
  }

  const cleanName = name?.trim() || "";
  const cleanEmail = email?.trim() || "";
  const cleanMessage = message.trim();

  if (cleanName.length > 100) {
    return { ok: false, error: "O nome deve ter até 100 caracteres." };
  }
  if (cleanEmail.length > 254 || (cleanEmail && !EMAIL_PATTERN.test(cleanEmail))) {
    return { ok: false, error: "Informe um e-mail válido ou deixe o campo em branco." };
  }
  if (cleanMessage.length > 3000) {
    return { ok: false, error: "A mensagem deve ter até 3.000 caracteres." };
  }

  return {
    ok: true,
    value: {
      type: type.trim(),
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    },
  };
}

export function createContactRateLimiter({ limit = 5, windowMs = 15 * 60 * 1000, maxKeys = 10000 } = {}) {
  const attempts = new Map();

  return function checkContactRateLimit(key, now = Date.now()) {
    for (const [currentKey, entry] of attempts) {
      if (now - entry.startedAt >= windowMs) attempts.delete(currentKey);
    }

    const current = attempts.get(key);
    if (current && now - current.startedAt < windowMs) {
      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - current.startedAt)) / 1000)),
        };
      }
      current.count += 1;
      return { allowed: true, remaining: limit - current.count };
    }

    if (attempts.size >= maxKeys && !attempts.has(key)) {
      attempts.delete(attempts.keys().next().value);
    }
    attempts.set(key, { startedAt: now, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  };
}
