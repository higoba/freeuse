"use client";

import { useState } from "react";

export default function FooterContact() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  async function sendMessage(event) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: result.error || "Não foi possível enviar sua mensagem." });
        return;
      }

      form.reset();
      setStatus({ type: "success", message: result.message });
    } catch {
      setStatus({ type: "error", message: "Não foi possível enviar sua mensagem agora. Tente novamente mais tarde." });
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="container footer-contact" aria-labelledby="footer-contact-title">
    <div className="footer-contact-intro">
      <span className="eyebrow">Sua ideia ajuda a melhorar</span>
      <h2 id="footer-contact-title">Fale com a gente</h2>
      <p>Uma caixa para sua dica, sugestão ou mensagem.</p>
      <p>Também criamos apps e ferramentas personalizadas. Se você precisa de uma solução específica, conte pra gente por aqui.</p>
    </div>
    <form className="footer-message-form" onSubmit={sendMessage}>
      <label htmlFor="footer-message">Envie uma dica, sugestão ou mensagem</label>
      <select id="footer-type" name="type" defaultValue="Dica ou sugestão">
        <option>Dica ou sugestão</option>
        <option>Mensagem</option>
        <option>Problema ou teste</option>
      </select>
      <div className="footer-contact-fields">
        <input id="footer-name" name="name" type="text" maxLength="100" autoComplete="name" placeholder="Seu nome (opcional)" />
        <input id="footer-email" name="email" type="email" maxLength="254" autoComplete="email" placeholder="Seu e-mail (opcional)" />
      </div>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="footer-website">Não preencha este campo</label>
        <input id="footer-website" name="website" type="text" tabIndex="-1" autoComplete="off" />
      </div>
      <textarea id="footer-message" name="message" rows="3" maxLength="3000" required placeholder="O que você gostaria de contar para a gente?" />
      <button className="button button-primary" type="submit" disabled={submitting}>
        {submitting ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
    {status && <p className={`footer-form-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p>}
  </section>;
}
