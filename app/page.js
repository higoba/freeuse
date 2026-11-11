import Link from "next/link";
import ToolSearch from "@/components/ToolSearch";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
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
            <span className="eyebrow"><span className="status-dot" /> Ferramentas grátis. Sem cadastro.</span>
            <h1>O útil, sem complicação.</h1>
            <p>Ferramentas online grátis para imagens, trabalho, negócios e viagens. Resolva tarefas do dia a dia com seus arquivos processados no próprio dispositivo.</p>
          </div>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">✳</span>
            <p>Útil de verdade.<br /><strong>Grátis para usar.</strong></p>
            <span className="note-caption">Sem conta. Sem enviar seus arquivos.</span>
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

      <section className="section container">
        <div className="section-heading"><div><span className="eyebrow">Organizadas para você</span><h2>Explore por categoria</h2></div></div>
        <div className="category-grid">
          {categories.map((category) => {
            const count = tools.filter((tool) => tool.category === category.slug).length;
            return <Link className="category-card" href={`/ferramentas?categoria=${category.slug}`} key={category.slug}>
              <span className="category-icon" aria-hidden="true">{category.slug === "imagens" ? "▧" : category.slug === "negocios" ? "↗" : category.slug === "trabalho" ? "◷" : "⌁"}</span>
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
      <section className="container"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} /></section>
    </>
  );
}

export const metadata = {
  title: "Ferramentas online grátis: imagens, trabalho e viagens",
  description: "Comprima imagens, faça foto 3x4, calcule preço de venda, horas trabalhadas e consumo de combustível por viagem. Grátis, sem cadastro e com processamento local.",
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
