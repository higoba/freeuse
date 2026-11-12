import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Contato",
  description: "Entre em contato com a equipe do FreeUse.store para dúvidas e sugestões sobre as ferramentas.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  return <section className="container page-section info-page">
    <Breadcrumbs items={[{ label: "Contato" }]} />
    <span className="eyebrow">Estamos por aqui</span>
    <h1>Contato</h1>
    <p className="lead">Encontrou um problema ou quer sugerir uma ferramenta?</p>
    <p>Use o formulário <a href="#footer-contact-title">Fale com a gente</a>, no rodapé, para enviar sua dúvida, sugestão ou relato de problema diretamente à nossa equipe.</p>
    <p>Não inclua senhas ou outras informações sensíveis na mensagem.</p>
  </section>;
}
