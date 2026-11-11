import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";

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
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE} />
    <h2>Disponibilidade</h2>
    <p>O FreeUse.store oferece ferramentas gratuitas e pode atualizar, alterar ou interromper funcionalidades para manutenção e evolução do serviço.</p>
    <h2>Resultados e limitações</h2>
    <p>Os resultados são fornecidos como apoio prático e podem conter limitações de fontes, arredondamento ou disponibilidade. Verifique cálculos, dimensões, arquivos e dados de origem antes de utilizá-los. A ferramenta de foto 3x4 não certifica o atendimento a exigências oficiais. A calculadora de jornada não interpreta legislação, contratos ou convenções coletivas.</p>
    <p>As cotações do Conversor de Moedas e do Planejador Internacional são taxas diárias de referência — USD/BRL usa séries do Banco Central do Brasil e outros pares usam Frankfurter/BCE —, não câmbio em tempo real, turismo ou remessa. Tarifas, impostos e spreads não são incluídos. As regras financeiras de viagem são apresentadas com as condições e fontes disponíveis; a falta de valor confirmado não significa que não exista requisito. Consulte as autoridades oficiais para verificar regras de visto, meios de subsistência, documentos e entrada aplicáveis à sua nacionalidade.</p>
    <p>Uma comparação acima de um valor de referência não garante visto, admissão ou autorização de entrada. O FreeUse.store não substitui orientação de autoridades migratórias nem presta aconselhamento jurídico ou financeiro.</p>
    <h2>Seus arquivos e conteúdo</h2>
    <p>Você é responsável por possuir os direitos e autorizações necessários para os arquivos selecionados. O processamento local não transfere seus arquivos ao FreeUse.store.</p>
    <h2>Publicidade</h2>
    <p>O site pode exibir anúncios do Google AdSense. Anúncios são identificados como publicidade e podem ser fornecidos por terceiros, sujeitos às respectivas políticas e configurações de privacidade. Não clique em anúncios para apoiar o site; interaja com eles somente se forem relevantes para você.</p>
    <h2>Uso proibido</h2>
    <p>Não use o site para atividades ilícitas, para prejudicar terceiros ou para tentar comprometer sua segurança e disponibilidade.</p>
    <h2>Contato</h2>
    <p>Para falar com a equipe, consulte a página <a href="/contato">Contato</a>.</p>
  </section>;
}
