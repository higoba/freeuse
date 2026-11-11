import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Política de privacidade",
  description: "Saiba como o FreeUse.store trata dados de navegação e arquivos processados pelas ferramentas.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return <section className="container page-section info-page">
    <Breadcrumbs items={[{ label: "Privacidade" }]} />
    <span className="eyebrow">Seus dados são seus</span>
    <h1>Política de privacidade</h1>
    <p className="muted">Última atualização: 11 de novembro de 2026</p>
    <h2>Arquivos usados nas ferramentas</h2>
    <p>Na versão atual, a compressão de imagens, o recorte 3x4 e a conversão de HEIC são feitos localmente no navegador. Os arquivos selecionados não são enviados ao FreeUse.store e não são guardados pelo site. Os resultados permanecem no dispositivo até que você os baixe ou feche a página.</p>
    <h2>Dados de navegação</h2>
    <p>O site não solicita cadastro e não mantém uma conta de usuário. A hospedagem pode registrar informações técnicas de acesso, como endereço IP, data, hora e agente do navegador, para operação e segurança. A configuração efetiva de registros depende do provedor de hospedagem.</p>
    <h2>Cookies e publicidade</h2>
    <p>Esta versão não integra publicidade nem cookies de rastreamento próprios. Se serviços de análise ou publicidade forem adicionados futuramente, esta política será atualizada e os controles de consentimento necessários serão implementados antes da ativação.</p>
    <h2>Links externos</h2>
    <p>Links para outros sites seguem as políticas dos respectivos serviços. O FreeUse.store não controla as práticas de privacidade de terceiros.</p>
    <h2>Contato</h2>
    <p>Para dúvidas sobre esta política, acesse a página <a href="/contato">Contato</a>.</p>
  </section>;
}
