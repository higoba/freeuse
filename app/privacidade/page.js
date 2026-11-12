import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";

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
    <p className="muted">Última atualização: 12 de novembro de 2026</p>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE} />
    <h2>Arquivos usados nas ferramentas</h2>
    <p>Na versão atual, a compressão de imagens, o recorte 3x4 e a conversão de HEIC são feitos localmente no navegador. Os arquivos selecionados não são enviados ao FreeUse.store e não são guardados pelo site. Os resultados permanecem no dispositivo até que você os baixe ou feche a página.</p>
    <h2>Dados de navegação</h2>
    <p>O site não solicita cadastro e não mantém uma conta de usuário. Valores, nacionalidade, duração e quantidade de viajantes informados no Planejador Internacional ficam no navegador. Para obter câmbio, o site consulta o servidor apenas com os códigos das moedas necessários; o valor digitado e os demais dados da viagem não são enviados nessa consulta. O servidor consulta o Banco Central do Brasil para as séries USD/BRL e a Frankfurter, que distribui referências do Banco Central Europeu, para outros pares. A hospedagem pode registrar informações técnicas da requisição para operação e segurança.</p>
    <p>Ao enviar uma mensagem pelo formulário, o nome e o texto informado, além do e-mail opcional para resposta, são transmitidos ao FreeUse.store e enviados por SMTP para a caixa de contato da equipe. O site não mantém uma cópia da mensagem; ela fica sujeita às regras de retenção do provedor de e-mail que a recebe. O endereço IP é usado temporariamente para limitar envios abusivos. A hospedagem também pode registrar informações técnicas de acesso, como endereço IP, data, hora e agente do navegador, para operação e segurança.</p>
    <h2>Cookies e publicidade</h2>
    <p>O FreeUse.store exibe anúncios fornecidos pelo Google AdSense. O Google e seus parceiros podem usar cookies, identificadores ou tecnologias semelhantes para exibir, limitar e medir anúncios, inclusive anúncios personalizados conforme as configurações e o consentimento aplicáveis. O FreeUse.store não usa as ferramentas para coletar nem enviar os arquivos escolhidos ao Google.</p>
    <p>Você pode consultar como o Google usa informações de sites e aplicativos em <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">Como o Google usa informações de sites ou apps parceiros</a> e gerenciar a personalização de anúncios nas <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Configurações de anúncios do Google</a>. A disponibilidade e o controle de cookies também dependem das configurações do navegador. Quando necessário, especialmente para visitantes do Espaço Econômico Europeu, Reino Unido ou Suíça, a publicidade deve ser configurada com a plataforma de consentimento certificada exigida pelo Google.</p>
    <p>O site não cria cookies próprios para publicidade. A presença de cookies de terceiros pode variar conforme o anúncio, o navegador e as escolhas de consentimento do visitante.</p>
    <h2>Links externos</h2>
    <p>Links para outros sites seguem as políticas dos respectivos serviços. O FreeUse.store não controla as práticas de privacidade de terceiros.</p>
    <p>As páginas de requisitos de viagem apontam para fontes governamentais. Ao acessá-las, você passa a estar sujeito às práticas de privacidade do órgão responsável por cada site.</p>
    <h2>Seus direitos e contato</h2>
    <p>Para solicitar informações sobre dados técnicos relacionados a uma interação, pedir correção ou exercer direitos previstos na legislação aplicável, use o <a href="/contato#footer-contact-title">formulário de contato</a> e informe os dados necessários para entendermos a solicitação. Como o site não mantém contas, pode não ter meios de localizar informações que não tenham sido fornecidas no próprio contato.</p>
    <h2>Contato</h2>
    <p>Para dúvidas sobre esta política, acesse a página <a href="/contato">Contato</a>.</p>
  </section>;
}
