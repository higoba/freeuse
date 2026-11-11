import Link from "next/link";

export default function Header() {
  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand" aria-label="FreeUse.store, página inicial"><span className="brand-mark">f</span><span>freeuse<span className="brand-dot">.</span>store</span></Link>
      <nav className="main-nav" aria-label="Navegação principal">
        <Link href="/ferramentas">Ferramentas</Link>
        <Link href="/sobre">Sobre</Link>
      </nav>
      <Link href="/ferramentas" className="button button-small button-outline">Explorar ferramentas <span aria-hidden="true">→</span></Link>
    </div>
  </header>;
}
