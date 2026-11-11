import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Termos de uso",
  description: "Leia os termos para uso das ferramentas gratuitas do FreeUse.store.",
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return <section className="container page-section info-page">
    <Breadcrumbs items={[{ label: "Termos de uso" }]} />
    <span className="eyebrow">Uso responsável</span>
    <h1>Termos de uso</h1>
    <p className="muted">Última atualização: 11 de novembro de 2026</p>
    <h2>Disponibilidade</h2>
    <p>O FreeUse.store oferece ferramentas gratuitas e pode atualizar, alterar ou interromper funcionalidades para manutenção e evolução do serviço.</p>
    <h2>Resultados e limitações</h2>
    <p>Os resultados são fornecidos como apoio prático. Verifique dimensões, cálculos e arquivos antes de utilizá-los. A ferramenta de foto 3x4 não certifica o atendimento a exigências oficiais. A calculadora de jornada não interpreta legislação, contratos ou convenções coletivas.</p>
    <h2>Seus arquivos e conteúdo</h2>
    <p>Você é responsável por possuir os direitos e autorizações necessários para os arquivos selecionados. O processamento local não transfere seus arquivos ao FreeUse.store.</p>
    <h2>Uso proibido</h2>
    <p>Não use o site para atividades ilícitas, para prejudicar terceiros ou para tentar comprometer sua segurança e disponibilidade.</p>
    <h2>Contato</h2>
    <p>Para falar com a equipe, consulte a página <a href="/contato">Contato</a>.</p>
  </section>;
}
