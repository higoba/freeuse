import Link from "next/link";

const icons = { imagens: "▧", negocios: "↗", trabalho: "◷" };
const categoryNames = { imagens: "Imagens", negocios: "Negócios", trabalho: "Trabalho" };

export default function ToolCard({ tool, index = 0 }) {
  return <Link className="tool-card" href={`/ferramentas/${tool.slug}`}>
    <span className={`tool-icon tool-icon-${tool.category}`} aria-hidden="true">{icons[tool.category] || "✳"}</span>
    <span className="tool-card-content">
      <span className="tool-card-category">{categoryNames[tool.category] || "Ferramenta"}</span>
      <strong>{tool.shortTitle}</strong>
      <span className="tool-card-description">{tool.description}</span>
      <span className="tool-card-link">{index < 3 ? "Conhecer ferramenta" : "Usar ferramenta"} <span aria-hidden="true">↗</span></span>
    </span>
  </Link>;
}
