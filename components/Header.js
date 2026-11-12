"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { tools } from "@/lib/tools";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return undefined;
    const updateHeight = () => document.documentElement.style.setProperty("--site-header-height", `${header.offsetHeight}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [menuOpen]);

  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand" aria-label="FreeUse.store, página inicial" onClick={closeMenu}>
        <Image src="/freeuse-mark.png" alt="" width={40} height={40} />
        <span>freeuse<span className="brand-dot">.</span>store</span>
      </Link>
      <nav className="main-nav" aria-label="Navegação principal">
        <Link href="/sobre">Sobre</Link>
        <Link href="/ferramentas">Ferramentas</Link>
      </nav>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className={`menu-icon${menuOpen ? " menu-icon-open" : ""}`} aria-hidden="true"><span /><span /><span /></span>
        <span>{menuOpen ? "Fechar" : "Menu"}</span>
      </button>
    </div>
    <nav className="tool-tabs container" aria-label="Ferramentas">
      {tools.map((tool) => <Link href={`/ferramentas/${tool.slug}`} key={tool.slug}>{tool.shortTitle}</Link>)}
    </nav>
    <div className="mobile-menu container" id="mobile-menu" hidden={!menuOpen}>
      <nav aria-label="Menu para celular">
        <Link href="/sobre" onClick={closeMenu}>Sobre</Link>
        <Link href="/ferramentas" onClick={closeMenu}>Todas as ferramentas</Link>
        <span className="mobile-menu-heading">Ferramentas</span>
        {tools.map((tool) => <Link href={`/ferramentas/${tool.slug}`} key={tool.slug} onClick={closeMenu}>{tool.shortTitle}</Link>)}
      </nav>
    </div>
  </header>;
}
