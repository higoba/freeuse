"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";

export default function ToolSearch({ tools }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return [];
    return tools.filter((tool) => `${tool.title} ${tool.description} ${tool.keywords.join(" ")}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [query, tools]);

  return <div className="tool-search-wrap">
    <label className="search-field">
      <span className="search-icon"><ToolIcon name="search" size={21} /></span>
      <span className="sr-only">Buscar ferramenta</span>
      <input id="tool-search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: comprimir imagem, horas extras, consumo de combustível..." type="search" autoComplete="off" />
      {query && <button className="search-clear" type="button" onClick={() => setQuery("")} aria-label="Limpar busca">×</button>}
    </label>
    {query && <div className="search-results" role="status" aria-live="polite">
      {results.length ? results.map((tool) => <Link key={tool.slug} href={`/ferramentas/${tool.slug}`}><strong>{tool.shortTitle}</strong><span>{tool.description}</span></Link>) : <p>Nenhuma ferramenta encontrada. Tente outro termo.</p>}
    </div>}
  </div>;
}
