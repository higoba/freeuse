"use client";

import { useEffect, useState } from "react";

function installInstructions() {
  const userAgent = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAppleMobile) {
    return "No menu Compartilhar do navegador, escolha “Adicionar à Tela de Início” para criar o acesso do FreeUse.";
  }
  if (/Android/i.test(userAgent)) {
    return "Abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.";
  }
  return "No Chrome ou Edge, use o ícone de instalação ao lado do endereço ou escolha “Instalar FreeUse” no menu do navegador.";
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const syncInstalled = () => setInstalled(standaloneQuery.matches || window.navigator.standalone === true);
    const captureInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setNotice("Pronto! O FreeUse foi instalado. Abra pelo ícone criado no seu aparelho.");
    };

    syncInstalled();
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standaloneQuery.addEventListener?.("change", syncInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standaloneQuery.removeEventListener?.("change", syncInstalled);
    };
  }, []);

  async function addAccess() {
    setNotice("");
    if (installed) {
      setNotice("O FreeUse já está instalado neste aparelho. Procure o ícone na tela inicial ou na lista de aplicativos.");
      return;
    }

    if (!installPrompt) {
      setNotice(installInstructions());
      return;
    }

    const prompt = installPrompt;
    setInstallPrompt(null);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setNotice(choice.outcome === "accepted"
        ? "Confirme a instalação na janela do navegador para criar o acesso do FreeUse."
        : "A instalação não foi concluída. Você pode tentar novamente pelo menu do navegador.");
    } catch {
      setNotice(`A instalação automática não abriu. ${installInstructions()}`);
    }
  }

  return (
    <div className="install-cta">
      <button className="button button-primary button-full" type="button" onClick={addAccess}>
        {installed ? "FreeUse já instalado" : installPrompt ? "Instalar FreeUse" : "Criar acesso no dispositivo"}
      </button>
      {notice && <p className="install-notice" role="status">{notice}</p>}
    </div>
  );
}
