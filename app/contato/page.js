import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";

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
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE} />
    <p>Envie uma mensagem para <a href="mailto:contato@freeuse.store">contato@freeuse.store</a> ou use o formulário único no rodapé para mandar uma dica, sugestão ou relatar um problema. Ele abre seu aplicativo de e-mail com a mensagem preparada; é necessário confirmar o envio nesse aplicativo.</p>
    <p>Não inclua arquivos pessoais, senhas ou outras informações sensíveis no e-mail.</p>
  </section>;
}
