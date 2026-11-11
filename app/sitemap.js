import { SITE_URL, tools } from "@/lib/tools";

export default function sitemap() {
  const pages = ["", "/ferramentas", "/sobre", "/privacidade", "/termos", "/contato"];
  const now = new Date();
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "weekly", priority: path ? 0.7 : 1 })),
    ...tools.map((tool) => ({ url: `${SITE_URL}/ferramentas/${tool.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 })),
  ];
}
