import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/tools";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FreeUse.store — ferramentas online grátis e privadas",
    template: "%s | FreeUse.store",
  },
  description: "Ferramentas online gratuitas para imagens, negócios e trabalho. Simples, sem cadastro e com processamento local.",
  applicationName: "FreeUse.store",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FreeUse.store",
    title: "FreeUse.store — ferramentas online grátis e privadas",
    description: "Utilidades gratuitas que respeitam sua privacidade. Sem conta, sem complicação.",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
