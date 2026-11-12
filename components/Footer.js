import Image from "next/image";
import Link from "next/link";
import FooterContact from "@/components/FooterContact";

export default function Footer() {
  return <footer className="site-footer">
    <FooterContact />
    <div className="container footer-main">
      <div>
        <Link href="/" className="brand footer-brand">
          <Image src="/freeuse-mark.png" alt="" width={40} height={40} />
          <span>freeuse<span className="brand-dot">.</span>store</span>
        </Link>
        <p>Ferramentas úteis, gratuitas e sem complicação.</p>
      </div>
      <nav className="footer-links" aria-label="Links institucionais">
        <Link href="/ferramentas">Ferramentas</Link><Link href="/sobre">Sobre</Link>
        <Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link><Link href="/contato">Contato</Link>
      </nav>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} FreeUse.store</span><span>Grátis para usar. Feito para ser útil.</span></div>
  </footer>;
}
