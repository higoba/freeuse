import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import ToolSearch from "@/components/ToolSearch";
import Breadcrumbs from "@/components/Breadcrumbs";
import { categories, tools } from "@/lib/tools";

export const metadata = {
  title: "Todas as ferramentas online grátis",
  description: "Encontre ferramentas gratuitas para imagens, negócios e jornada de trabalho. Sem cadastro e com processamento privado.",
  alternates: { canonical: "/ferramentas" },
};

export default async function ToolsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.categoria;
  const visible = category ? tools.filter((tool) => tool.category === category) : tools;
  const selected = categories.find((item) => item.slug === category);
  return <section className="container page-section">
    <Breadcrumbs items={[{ label: "Ferramentas" }]} />
    <div className="page-intro">
      <span className="eyebrow">Grátis e sem cadastro</span>
      <h1>{selected ? selected.name : "Todas as ferramentas"}</h1>
      <p>{selected ? selected.description : "Utilidades online para resolver tarefas do dia a dia. Seus arquivos permanecem no seu dispositivo."}</p>
    </div>
    <ToolSearch tools={visible} />
    <nav className="filter-row" aria-label="Categorias">
      <Link className={`filter-chip ${!category ? "active" : ""}`} href="/ferramentas">Todas</Link>
      {categories.map((item) => <Link className={`filter-chip ${category === item.slug ? "active" : ""}`} key={item.slug} href={`/ferramentas?categoria=${item.slug}`}>{item.name}</Link>)}
    </nav>
    <div className="tool-grid tool-grid-all">{visible.map((tool, index) => <ToolCard key={tool.slug} tool={tool} index={index} />)}</div>
    {visible.length === 0 && <p className="empty-state">Nenhuma ferramenta nesta categoria.</p>}
  </section>;
}
