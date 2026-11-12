export default function manifest() {
  return {
    id: "/",
    name: "FreeUse.store — ferramentas online grátis",
    short_name: "FreeUse",
    description: "Ferramentas úteis e gratuitas, a um toque de distância.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8fbff",
    theme_color: "#0b3473",
    lang: "pt-BR",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/freeuse-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/freeuse-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
