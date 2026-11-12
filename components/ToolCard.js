import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";

const categoryNames = { imagens: "Imagens", negocios: "Negócios", trabalho: "Trabalho", viagens: "Viagens", moedas: "Moedas" };

export default function ToolCard({ tool, index = 0 }) {
  return <Link className="tool-card" href={`/ferramentas/${tool.slug}`}>
    <span className={`tool-icon tool-icon-${tool.category}`}><ToolIcon name={tool.slug} /></span>
    <span className="tool-card-content">
      <span className="tool-card-category">{categoryNames[tool.category] || "Ferramenta"}</span>
      <strong>{tool.shortTitle}</strong>
    </span>
    <span className="tool-card-description">{tool.description}</span>
    <span className="tool-card-link">{index < 3 ? "Conhecer ferramenta" : "Usar ferramenta"} <span aria-hidden="true">↗</span></span>
  </Link>;
}
