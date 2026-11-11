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
      <p>Envie uma sugestão ou uma mensagem. O envio abre o aplicativo de e-mail configurado no seu dispositivo.</p>
    </div>
    <div className="footer-contact-grid">
      <form className="footer-message-form" onSubmit={(event) => {
        event.preventDefault();
        const message = new FormData(event.currentTarget).get("suggestion");
        openEmail("Dica ou sugestão para o FreeUse.store", String(message || ""));
      }}>
        <label htmlFor="footer-suggestion">Envie uma dica ou sugestão</label>
        <textarea id="footer-suggestion" name="suggestion" rows="3" maxLength="3000" required placeholder="O que você gostaria de ver por aqui?" />
        <button className="button button-primary" type="submit">Enviar sugestão por e-mail</button>
      </form>
      <form className="footer-message-form" onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();
        openEmail("Mensagem para o FreeUse.store", `Nome: ${name}\nE-mail para resposta: ${email}\n\n${message}`);
      }}>
        <label htmlFor="footer-name">Envie uma mensagem</label>
        <div className="footer-contact-fields">
          <input id="footer-name" name="name" type="text" maxLength="100" autoComplete="name" placeholder="Seu nome (opcional)" />
          <input id="footer-email" name="email" type="email" maxLength="254" autoComplete="email" placeholder="Seu e-mail (opcional)" />
        </div>
        <textarea id="footer-message" name="message" rows="3" maxLength="3000" required placeholder="Escreva sua mensagem" />
        <button className="button button-secondary" type="submit">Escrever e-mail</button>
      </form>
    </div>
    <p className="footer-contact-note">As mensagens são preparadas no seu aplicativo de e-mail; o site não recebe nem armazena o conteúdo do formulário.</p>
  </section>;
}
