"use client";

const CONTACT_EMAIL = "contato@freeuse.store";

function openEmail(subject, message) {
  const query = new URLSearchParams({ subject, body: message });
  window.location.href = `mailto:${CONTACT_EMAIL}?${query.toString()}`;
}

export default function FooterContact() {
  return <section className="container footer-contact" aria-labelledby="footer-contact-title">
    <div className="footer-contact-intro">
      <span className="eyebrow">Sua ideia ajuda a melhorar</span>
      <h2 id="footer-contact-title">Fale com a gente</h2>
      <p>Uma caixa para sua dica, sugestão ou mensagem. O envio abre seu aplicativo de e-mail.</p>
      <p>Também criamos apps e ferramentas personalizadas. Se você precisa de uma solução específica, conte pra gente por aqui.</p>
    </div>
    <form className="footer-message-form" onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const type = String(formData.get("type") || "Mensagem");
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const details = [name && `Nome: ${name}`, email && `E-mail para resposta: ${email}`].filter(Boolean).join("\n");
      openEmail(`${type} para o FreeUse.store`, `${details ? `${details}\n\n` : ""}${message}`);
    }}>
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
      <textarea id="footer-message" name="message" rows="3" maxLength="3000" required placeholder="O que você gostaria de contar para a gente?" />
      <button className="button button-primary" type="submit">Enviar por e-mail</button>
    </form>
    <p className="footer-contact-note">As mensagens são preparadas no seu aplicativo de e-mail; o site não recebe nem armazena o conteúdo do formulário.</p>
  </section>;
}
