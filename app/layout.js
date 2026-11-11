import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/tools";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FreeUse.store — ferramentas online grátis e privadas",
    template: "%s | FreeUse.store",
  },
  description: "Ferramentas online grátis para imagens, negócios, trabalho e viagens. Sem cadastro, com cálculos e processamento local.",
  applicationName: "FreeUse.store",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FreeUse.store",
    title: "FreeUse.store — ferramentas online grátis e privadas",
    description: "Ferramentas gratuitas para imagens, trabalho, negócios e viagens. Sem conta e sem complicação.",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          id="google-adsense"
          async
          strategy="beforeInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2521433324822656"
        />
      </head>
      <body>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
