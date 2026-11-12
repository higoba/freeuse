import Link from "next/link";
import Image from "next/image";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
import ToolSearch from "@/components/ToolSearch";
import PwaInstallButton from "@/components/PwaInstallButton";
import StructuredData from "@/components/StructuredData";
import { categories, tools, SITE_URL } from "@/lib/tools";

export default function HomePage() {
  const featured = tools.slice(0, 3);
  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FreeUse.store",
        url: SITE_URL,
        inLanguage: "pt-BR",
        description: "Ferramentas online gratuitas, úteis e privadas.",
      }} />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="status-dot" /> Seu FreeUse, sempre à mão</span>
            <h1>Suas ferramentas a um toque de distância.</h1>
            <p>Adicione o FreeUse à tela inicial do celular ou do computador e abra em um clique, como um aplicativo. Sem baixar pela loja.</p>
          </div>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true"><Image src="/freeuse-mark.png" alt="" width={42} height={42} /></span>
            <p>Crie seu acesso direto.<br /><strong>Instale o FreeUse no seu aparelho.</strong></p>
            <PwaInstallButton />
            <span className="note-caption">No iPhone ou iPad, use Compartilhar e “Adicionar à Tela de Início”.</span>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="busca-title">
        <div className="section-heading">
          <div><span className="eyebrow">Encontre o que precisa</span><h2 id="busca-title">Qual tarefa vamos resolver?</h2></div>
        </div>
        <ToolSearch tools={tools} />
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">Comece por aqui</span><h2>Ferramentas em destaque</h2></div>
            <Link className="text-link" href="/ferramentas">Ver todas <span aria-hidden="true">→</span></Link>
          </div>
          <div className="tool-grid">{featured.map((tool, index) => <ToolCard key={tool.slug} tool={tool} index={index} />)}</div>
        </div>
      </section>
      <section className="container"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE || process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} /></section>

      <section className="section container">
        <div className="section-heading"><div><span className="eyebrow">Organizadas para você</span><h2>Explore por categoria</h2></div></div>
        <div className="category-grid">
          {categories.map((category) => {
            const count = tools.filter((tool) => tool.category === category.slug).length;
            return <Link className="category-card" href={`/ferramentas?categoria=${category.slug}`} key={category.slug}>
              <span className="category-icon" aria-hidden="true">{category.slug === "imagens" ? "▧" : category.slug === "negocios" ? "↗" : category.slug === "trabalho" ? "◷" : category.slug === "moedas" ? "⇄" : "⌁"}</span>
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
              <span className="category-count">{count} {count === 1 ? "ferramenta" : "ferramentas"}</span>
            </Link>;
          })}
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">Novidades</span><h2>Adicionadas recentemente</h2></div></div>
          <div className="tool-grid">{tools.slice(-2).reverse().map((tool, index) => <ToolCard key={tool.slug} tool={tool} index={index + 3} />)}</div>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "Ferramentas online grátis: imagens, cálculos, viagens e moedas",
  description: "Use ferramentas grátis para comprimir imagens, calcular preços, jornadas e viagens, converter moedas e comparar requisitos financeiros internacionais. Sem cadastro.",
  keywords: [
    ...new Set([
      "ferramentas online grátis",
      "ferramentas gratuitas sem cadastro",
      "consumo de combustível por viagem",
      "calculadora de custo de viagem",
      ...tools.flatMap((tool) => tool.keywords),
    ]),
  ],
  alternates: { canonical: "/" },
};
