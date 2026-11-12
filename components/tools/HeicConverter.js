"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/components/tools/ImageDropzone";

const MAX_HEIC_BYTES = 30 * 1024 * 1024;
function isHeic(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["heic", "heif"].includes(extension) || ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(file.type);
}
function safeName(name) {
  return name.replace(/\.(heic|heif)$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_") || "imagem";
}

export default function HeicConverter() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const urls = useRef(new Set());
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addFiles(selected) {
    setError("");
    const accepted = selected.filter(isHeic);
    if (accepted.length !== selected.length) setError("Foram ignorados arquivos que não são HEIC ou HEIF.");
    const tooLarge = accepted.filter((file) => file.size > MAX_HEIC_BYTES);
    if (tooLarge.length) setError("Cada imagem deve ter até 30 MB para evitar falta de memória no dispositivo.");
    setFiles((current) => [...current, ...accepted.filter((file) => file.size <= MAX_HEIC_BYTES).map((file) => ({ id: crypto.randomUUID(), file, result: null, error: "" }))]);
  }

  async function convertAll() {
    if (!files.length) { setError("Selecione ao menos uma imagem HEIC ou HEIF."); return; }
    setBusy(true);
    setError("");
    const results = [];
    for (let index = 0; index < files.length; index += 1) {
      const item = files[index];
      setProgress(`Convertendo ${index + 1} de ${files.length}…`);
      try {
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({ blob: item.file, toType: "image/jpeg", quality: 0.92 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        if (!(blob instanceof Blob) || !blob.size) throw new Error("A conversão não gerou uma imagem válida.");
        const url = URL.createObjectURL(blob);
        urls.current.add(url);
        if (item.result?.url) { URL.revokeObjectURL(item.result.url); urls.current.delete(item.result.url); }
        results.push({ ...item, error: "", result: { blob, url, name: `${safeName(item.file.name)}.jpg` } });
      } catch (issue) {
        results.push({ ...item, result: null, error: "Não foi possível converter este arquivo. Ele pode estar corrompido, protegido ou usar um recurso não suportado." });
      }
      setFiles((current) => current.map((entry) => results.find((result) => result.id === entry.id) || entry));
    }
    setProgress("");
    setBusy(false);
  }

  function downloadZip() {
    const converted = files.filter((item) => item.result);
    if (!converted.length) { setError("Converta ao menos uma imagem antes de criar o ZIP."); return; }
    setBusy(true);
    setError("");
    import("jszip").then(({ default: JSZip }) => {
      const archive = new JSZip();
      const usedNames = new Set();
      converted.forEach((item) => {
        const base = item.result.name.replace(/\.jpg$/i, "");
        let name = item.result.name;
        let suffix = 2;
        while (usedNames.has(name.toLocaleLowerCase("pt-BR"))) {
          name = `${base} (${suffix}).jpg`;
          suffix += 1;
        }
        usedNames.add(name.toLocaleLowerCase("pt-BR"));
        archive.file(name, item.result.blob);
      });
      return archive.generateAsync({ type: "blob" });
    }).then((blob) => {
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = "imagens-jpg.zip";
      link.click();
      window.setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 1000);
    }).catch(() => setError("Não foi possível criar o arquivo ZIP neste navegador. Baixe as imagens individualmente."))
      .finally(() => setBusy(false));
  }

  function remove(id) {
    setFiles((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item?.result?.url) { URL.revokeObjectURL(item.result.url); urls.current.delete(item.result.url); }
      return current.filter((entry) => entry.id !== id);
    });
  }

  return <section className="tool-workspace" aria-label="Conversor HEIC para JPG">
    <ImageDropzone accept=".heic,.heif,image/heic,image/heif" multiple maxBytes={MAX_HEIC_BYTES} onFiles={addFiles} title="Arraste fotos HEIC ou HEIF para cá" detail="ou selecione arquivos no seu dispositivo" extensions="HEIC e HEIF · até 30 MB por arquivo" />
    {error && <p className="form-error" role="alert">{error}</p>}
    {files.length > 0 && <div className="tool-action-row"><span>{files.length} {files.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}</span><div className="action-group"><button className="button button-primary" type="button" disabled={busy} onClick={convertAll}>{busy ? "Processando…" : "Converter para JPG"}</button><button className="button button-secondary" type="button" disabled={busy || !files.some((item) => item.result)} onClick={downloadZip}>Baixar convertidos em ZIP</button></div></div>}
    {progress && <p className="processing-state" role="status" aria-live="polite"><span className="spinner" />{progress}</p>}
    <div className="heic-list">{files.map((item) => <article className="image-result" key={item.id}>
      <div className="image-result-preview">{item.result ? <Image src={item.result.url} alt={`Prévia convertida de ${item.result.name}`} width={90} height={90} unoptimized sizes="90px" /> : <span className="file-type-mark">HEIC</span>}</div>
      <div className="image-result-info"><div className="result-title-row"><strong>{item.file.name}</strong><button className="quiet-button" type="button" disabled={busy} onClick={() => remove(item.id)}>Remover</button></div>
        <div className="image-stats"><span>Original <b>{formatFileSize(item.file.size)}</b></span>{item.result && <span>JPG <b>{formatFileSize(item.result.blob.size)}</b></span>}</div>
        {item.error && <p className="form-error" role="alert">{item.error}</p>}
        {item.result && <a className="button button-small button-secondary" href={item.result.url} download={item.result.name}>Baixar JPG</a>}
      </div>
    </article>)}</div>
    <p className="tool-privacy-hint">A conversão e o ZIP são feitos neste navegador. Fotos grandes podem exigir bastante memória do dispositivo.</p>
  </section>;
}
