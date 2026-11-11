import Link from "next/link";
import StructuredData from "@/components/StructuredData";

export default function Breadcrumbs({ items }) {
  const entries = [{ label: "Início", href: "/" }, ...items];
  return <>
    <nav className="breadcrumbs" aria-label="Navegação estrutural">
      <ol>{entries.map((item, index) => <li key={`${item.label}-${index}`}>
        {index < entries.length - 1 && item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === entries.length - 1 ? "page" : undefined}>{item.label}</span>}
        {index < entries.length - 1 && <span className="crumb-separator" aria-hidden="true">/</span>}
      </li>)}</ol>
    </nav>
    <StructuredData data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: entries.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(item.href ? { item: `https://freeuse.store${item.href}` } : {}),
      })),
    }} />
  </>;
}
