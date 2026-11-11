import { notFound } from "next/navigation";
import Link from "next/link";
import ToolWorkspace from "@/components/tools/ToolWorkspace";
import ToolCard from "@/components/ToolCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import StructuredData from "@/components/StructuredData";
import AdSlot from "@/components/AdSlot";
import { categories, getTool, relatedTools, tools, SITE_URL } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const url = `/ferramentas/${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: { title: tool.title, description: tool.description, url, type: "website", locale: "pt_BR" },
    twitter: { card: "summary", title: tool.title, description: tool.description },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const category = categories.find((item) => item.slug === tool.category);
  const related = relatedTools(tool);
  return <article className="container page-section tool-page">
    <Breadcrumbs items={[
      { label: "Ferramentas", href: "/ferramentas" },
      ...(category ? [{ label: category.name, href: `/ferramentas?categoria=${category.slug}` }] : []),
      { label: tool.shortTitle },
    ]} />
    <header className="tool-page-header">
      <span className="eyebrow">{category?.name || "Ferramenta gratuita"}</span>
      <h1>{tool.title}</h1>
      <p>{tool.intro}</p>
      <span className="privacy-pill"><span aria-hidden="true">◉</span> Sem cadastro · {tool.privacyLabel || "processamento local"}</span>
    </header>
    <ToolWorkspace slug={tool.slug} />
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE || process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL} />
    <section className="editorial">
      <h2>Como usar {tool.shortTitle.toLocaleLowerCase("pt-BR")}</h2>
      <ol className="instruction-list">{tool.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <h2>Exemplo prático</h2>
      <p>{tool.example}</p>
      <h2>Perguntas frequentes</h2>
      <div className="faq-list">{tool.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
    </section>
    <StructuredData data={{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    }} />
    <section className="related-section">
      <div className="section-heading"><div><span className="eyebrow">Continue explorando</span><h2>Ferramentas relacionadas</h2></div><Link className="text-link" href="/ferramentas">Todas as ferramentas →</Link></div>
      <div className="tool-grid">{related.map((item, index) => <ToolCard key={item.slug} tool={item} index={index} />)}</div>
    </section>
    <p className="privacy-note">{tool.privacyNote || "Os arquivos escolhidos são processados neste navegador. O FreeUse.store não os recebe nem armazena."}</p>
    <StructuredData data={{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.shortTitle,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Qualquer navegador moderno",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      url: `${SITE_URL}/ferramentas/${tool.slug}`,
      description: tool.description,
      keywords: tool.keywords,
      inLanguage: "pt-BR",
    }} />
  </article>;
}
