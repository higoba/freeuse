"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ToolIcon from "@/components/ToolIcon";
import { tools } from "@/lib/tools";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setMenuOpen(false);
  }

  // Fecha o menu automaticamente quando a rota mudar
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Fecha o menu ao pressionar Esc
  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  // Previne rolagem do fundo quando o menu mobile está aberto
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [menuOpen]);

  // Atualiza altura do cabeçalho sem distorcer quando o menu abre
  useEffect(() => {
    const bar = document.querySelector(".site-header-bar");
    if (!bar) return undefined;
    const updateHeight = () => {
      document.documentElement.style.setProperty("--site-header-height", `${bar.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`site-header${menuOpen ? " is-menu-open" : ""}`}>
      <div className="site-header-bar">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="FreeUse.store, página inicial" onClick={closeMenu}>
            <Image src="/freeuse-mark.png" alt="" width={38} height={38} priority />
            <span>freeuse<span className="brand-dot">.</span>store</span>
          </Link>
          <nav className="main-nav" aria-label="Navegação principal">
            <Link href="/sobre" className={pathname === "/sobre" ? "active" : ""}>Sobre</Link>
            <Link href="/ferramentas" className={pathname === "/ferramentas" ? "active" : ""}>Ferramentas</Link>
          </nav>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`menu-icon${menuOpen ? " menu-icon-open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="toggle-label">{menuOpen ? "Fechar" : "Menu"}</span>
          </button>
        </div>
        <nav className="tool-tabs container" aria-label="Ferramentas">
          {tools.map((tool) => (
            <Link
              href={`/ferramentas/${tool.slug}`}
              key={tool.slug}
              className={pathname === `/ferramentas/${tool.slug}` ? "active" : ""}
            >
              {tool.shortTitle}
            </Link>
          ))}
        </nav>
      </div>

      {/* Backdrop overlay que fecha ao clicar fora */}
      <div
        className={`mobile-menu-backdrop${menuOpen ? " is-visible" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Gaveta do menu mobile */}
      <div
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        id="mobile-menu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-content container">
          <div className="mobile-menu-section">
            <span className="mobile-menu-heading">Navegação</span>
            <div className="mobile-nav-links">
              <Link
                href="/"
                className={`mobile-nav-link${pathname === "/" ? " active" : ""}`}
                onClick={closeMenu}
              >
                <span className="mobile-nav-icon"><ToolIcon name="fallback" size={18} /></span>
                <span>Página inicial</span>
              </Link>
              <Link
                href="/ferramentas"
                className={`mobile-nav-link${pathname === "/ferramentas" ? " active" : ""}`}
                onClick={closeMenu}
              >
                <span className="mobile-nav-icon"><ToolIcon name="search" size={18} /></span>
                <span>Todas as ferramentas</span>
              </Link>
              <Link
                href="/sobre"
                className={`mobile-nav-link${pathname === "/sobre" ? " active" : ""}`}
                onClick={closeMenu}
              >
                <span className="mobile-nav-icon"><ToolIcon name="route" size={18} /></span>
                <span>Sobre o FreeUse</span>
              </Link>
            </div>
          </div>

          <div className="mobile-menu-section">
            <div className="mobile-menu-heading-row">
              <span className="mobile-menu-heading">Ferramentas disponíveis</span>
              <span className="mobile-tool-count">{tools.length} grátis</span>
            </div>
            <nav className="mobile-tools-grid" aria-label="Lista de ferramentas">
              {tools.map((tool) => {
                const isActive = pathname === `/ferramentas/${tool.slug}`;
                return (
                  <Link
                    href={`/ferramentas/${tool.slug}`}
                    key={tool.slug}
                    className={`mobile-tool-item${isActive ? " active" : ""}`}
                    onClick={closeMenu}
                  >
                    <span className={`mobile-tool-icon mobile-tool-icon-${tool.category}`}>
                      <ToolIcon name={tool.slug} size={20} />
                    </span>
                    <span className="mobile-tool-info">
                      <strong>{tool.shortTitle}</strong>
                      <small>{tool.description.slice(0, 52)}…</small>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mobile-menu-footer">
            <span className="privacy-pill">
              <span aria-hidden="true">◉</span> 100% privado · Processamento local
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
