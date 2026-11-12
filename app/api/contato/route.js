import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { createContactRateLimiter, validateContactPayload } from "@/lib/contact.js";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const checkRateLimit = createContactRateLimiter();

function jsonResponse(body, status, headers = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function hasSameOrigin(request) {
  const originHeader = request.headers.get("origin");
  const hostHeader = request.headers.get("host");
  if (!originHeader || !hostHeader) return false;

  try {
    const origin = new URL(originHeader);
    return ["http:", "https:"].includes(origin.protocol)
      && origin.host.toLowerCase() === hostHeader.toLowerCase();
  } catch {
    return false;
  }
}

function clientKey(request) {
  const ip = request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  return ip.slice(0, 128);
}

function smtpConfiguration() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.CONTACT_TO?.trim();

  if (!host || !Number.isInteger(port) || ![465, 587].includes(port) || !user || !password || !recipient) {
    return null;
  }

  return { host, port, user, password, recipient };
}

export async function POST(request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Não foi possível validar a origem do envio." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return jsonResponse({ error: "Formato de envio inválido." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "A mensagem excede o limite permitido." }, 413);
  }

  const rate = checkRateLimit(clientKey(request));
  if (!rate.allowed) {
    return jsonResponse(
      { error: "Muitas mensagens foram enviadas. Aguarde alguns minutos e tente novamente." },
      429,
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ error: "Não foi possível ler o formulário. Tente novamente." }, 400);
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return jsonResponse({ error: "A mensagem excede o limite permitido." }, 413);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Formato de envio inválido." }, 400);
  }

  const validated = validateContactPayload(payload);
  if (!validated.ok) return jsonResponse({ error: validated.error }, 400);

  const smtp = smtpConfiguration();
  if (!smtp) {
    console.error("[contato] SMTP não configurado ou inválido.");
    return jsonResponse({ error: "O envio está temporariamente indisponível. Tente novamente mais tarde." }, 503);
  }

  const { type, name, email, message } = validated.value;
  const text = [
    `Tipo: ${type}`,
    `Nome: ${name || "Não informado"}`,
    `E-mail para resposta: ${email || "Não informado"}`,
    "",
    message,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      requireTLS: smtp.port === 587,
      auth: { user: smtp.user, pass: smtp.password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: { name: "FreeUse.store", address: smtp.user },
      to: smtp.recipient,
      ...(email ? { replyTo: email } : {}),
      subject: `${type} — FreeUse.store`,
      text,
    });

    return jsonResponse({ message: "Mensagem enviada. Obrigado por falar com a gente!" }, 200);
  } catch (error) {
    console.error(`[contato] Falha no envio SMTP (${error?.code || error?.name || "erro desconhecido"}).`);
    return jsonResponse({ error: "Não foi possível enviar sua mensagem agora. Tente novamente mais tarde." }, 502);
  }
}
