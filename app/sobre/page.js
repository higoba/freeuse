import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";

export const metadata = {
  title: "Sobre o FreeUse.store",
  description: "Conheça a proposta do FreeUse.store: ferramentas online gratuitas, úteis, simples e com respeito à sua privacidade.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return <section className="container page-section info-page">
    <Breadcrumbs items={[{ label: "Sobre" }]} />
    <span className="eyebrow">Nossa proposta</span>
    <h1>O útil, sem complicação.</h1>
    <p className="lead">O FreeUse.store reúne ferramentas digitais gratuitas para tarefas comuns do dia a dia.</p>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE} />
    <h2>Grátis para usar, sem cadastro</h2>
    <p>Você pode acessar as ferramentas sem criar uma conta. A ideia é resolver uma tarefa com uma interface clara, sem etapas desnecessárias.</p>
    <h2>Privacidade desde o começo</h2>
    <p>As ferramentas de imagem desta versão processam os arquivos diretamente no navegador. Eles não são enviados nem armazenados pelo FreeUse.store. Os cálculos também acontecem no dispositivo.</p>
    <h2>Uma plataforma que cresce com utilidade</h2>
    <p>Novas ferramentas podem ser organizadas por categoria. Cada página explica o que a ferramenta faz, como usar e quais são suas limitações.</p>
  </section>;
}
