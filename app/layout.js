import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSenseScript from "@/components/AdSenseScript";
import AdSlot from "@/components/AdSlot";
import RouteScrollReset from "@/components/RouteScrollReset";
import { SITE_URL } from "@/lib/tools";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FreeUse.store — ferramentas online grátis e privadas",
    template: "%s | FreeUse.store",
  },
  description: "Ferramentas online grátis para imagens, negócios, trabalho, viagens e moedas. Sem cadastro; valores e arquivos pessoais ficam no navegador.",
  applicationName: "FreeUse.store",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FreeUse.store",
    title: "FreeUse.store — ferramentas online grátis e privadas",
    description: "Ferramentas gratuitas para imagens, trabalho, negócios, viagens e câmbio. Sem conta e sem complicação.",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AdSenseScript />
        <Header />
        <RouteScrollReset />
        <main id="conteudo">
          <div className="container site-ad-placement site-ad-top"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} /></div>
          {children}
          <div className="container site-ad-placement site-ad-bottom"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} /></div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
