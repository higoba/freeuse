"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageDropzone, { formatFileSize, isSupportedImage } from "@/components/tools/ImageDropzone";

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível abrir esta imagem. Tente outro arquivo.")); };
    image.src = url;
  });
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("O navegador não conseguiu gerar o JPEG.")), "image/jpeg", quality);
  });
}

async function compress(file, targetBytes, maxQuality, onProgress) {
  const image = await decodeImage(file);
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 12000 || image.naturalHeight > 12000 || image.naturalWidth * image.naturalHeight > 40000000) {
    throw new Error("A imagem tem dimensões inválidas ou muito grandes para este navegador.");
  }
  const initialScale = Math.min(1, 6000 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  let scale = initialScale;
  let smallest = null;
  let bestBlob = null;
  let bestWidth = 0;
  let bestHeight = 0;

  for (let resizeAttempt = 0; resizeAttempt < 8; resizeAttempt += 1) {
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Este navegador não disponibilizou o canvas necessário para comprimir.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    let low = 0.2;
    let high = maxQuality;
    let candidate = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const quality = (low + high) / 2;
      const blob = await canvasBlob(canvas, quality);
      onProgress?.({ resizeAttempt, attempt });
      if (!smallest || blob.size < smallest.blob.size) smallest = { blob, width, height };
      if (blob.size <= targetBytes) {
        candidate = blob;
        bestWidth = width;
        bestHeight = height;
        low = quality;
      } else {
        high = quality;
      }
    }
    if (candidate) {
      bestBlob = candidate;
      break;
    }
    const ratio = Math.sqrt(targetBytes / Math.max(smallest?.blob.size || 1, 1));
    scale *= Math.max(0.45, Math.min(0.85, ratio * 0.9));
  }

  if (!bestBlob) {
    bestBlob = smallest?.blob;
    bestWidth = smallest?.width || canvas.width;
    bestHeight = smallest?.height || canvas.height;
  }
  if (!bestBlob) throw new Error("Não foi possível comprimir esta imagem.");
  return { blob: bestBlob, width: bestWidth, height: bestHeight, originalWidth: image.naturalWidth, originalHeight: image.naturalHeight };
}

export default function ImageCompressor() {
  const [images, setImages] = useState([]);
  const [targetKB, setTargetKB] = useState("200");
  const [quality, setQuality] = useState(85);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const urls = useRef(new Set());

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addFiles(files) {
    setError("");
    const accepted = files.filter(isSupportedImage);
    if (accepted.length !== files.length) setError("Alguns arquivos foram ignorados. Use JPG, PNG ou WebP.");
    setImages((current) => [...current, ...accepted.map((file) => {
      const preview = URL.createObjectURL(file);
      urls.current.add(preview);
      return { id: crypto.randomUUID(), file, preview, result: null, error: "" };
    })]);
  }

  function removeImage(id) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image?.preview) { URL.revokeObjectURL(image.preview); urls.current.delete(image.preview); }
      if (image?.result?.url) { URL.revokeObjectURL(image.result.url); urls.current.delete(image.result.url); }
      return current.filter((item) => item.id !== id);
    });
  }

  async function processImages() {
    const limit = Number(targetKB);
    if (!Number.isFinite(limit) || limit < 1 || limit > 50000) {
      setError("Informe um limite entre 1 e 50.000 KB.");
      return;
    }
    if (!images.length) { setError("Escolha ao menos uma imagem para começar."); return; }
    setError("");
    setBusy(true);
    const updated = [];
    for (let index = 0; index < images.length; index += 1) {
      const item = images[index];
      setProgress(`Comprimindo imagem ${index + 1} de ${images.length}…`);
      try {
        const output = await compress(item.file, limit * 1024, quality / 100);
        const url = URL.createObjectURL(output.blob);
        urls.current.add(url);
        if (item.result?.url) { URL.revokeObjectURL(item.result.url); urls.current.delete(item.result.url); }
        updated.push({ ...item, error: "", result: { ...output, url } });
      } catch (issue) {
        updated.push({ ...item, result: null, error: issue.message || "Falha ao comprimir esta imagem." });
      }
      setImages((current) => current.map((entry) => updated.find((done) => done.id === entry.id) || entry));
    }
    setProgress("");
    setBusy(false);
  }

  return <section className="tool-workspace" aria-label="Compressor de imagem">
    <div className="tool-controls">
      <label className="field target-field"><span>Tamanho máximo desejado</span><span className="input-suffix"><input type="number" min="1" max="50000" step="1" inputMode="numeric" value={targetKB} onChange={(event) => setTargetKB(event.target.value)} /><span>KB</span></span></label>
      <label className="field quality-field"><span>Qualidade inicial <strong>{quality}%</strong></span><input type="range" min="40" max="95" step="1" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><small>Se necessário, a qualidade poderá ser reduzida e as dimensões ajustadas.</small></label>
    </div>
    <ImageDropzone accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple onFiles={addFiles} extensions="JPG, PNG e WebP" />
    {error && <p className="form-error" role="alert">{error}</p>}
    {images.length > 0 && <div className="tool-action-row"><span>{images.length} {images.length === 1 ? "imagem selecionada" : "imagens selecionadas"}</span><button className="button button-primary" type="button" disabled={busy} onClick={processImages}>{busy ? "Processando…" : "Comprimir imagens"}</button></div>}
    {progress && <p className="processing-state" role="status" aria-live="polite"><span className="spinner" />{progress}</p>}
    {images.length > 0 && <div className="image-result-list">
      {images.map((item) => {
        const change = item.result ? (1 - item.result.blob.size / item.file.size) * 100 : null;
        const changeLabel = change === null ? "" : change >= 0 ? `Redução ${change.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : `Aumento ${Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
        return <article className="image-result" key={item.id}>
          <div className="image-result-preview"><Image src={item.result?.url || item.preview} alt={`Prévia de ${item.file.name}`} fill unoptimized sizes="90px" /></div>
          <div className="image-result-info">
            <div className="result-title-row"><strong>{item.file.name}</strong><button className="quiet-button" type="button" disabled={busy} onClick={() => removeImage(item.id)} aria-label={`Remover ${item.file.name}`}>Remover</button></div>
            <div className="image-stats"><span>Original <b>{formatFileSize(item.file.size)}</b></span>{item.result && <><span>Comprimida <b>{formatFileSize(item.result.blob.size)}</b></span><span>{changeLabel}</span><span>Dimensões <b>{item.result.width} × {item.result.height}</b></span></>}</div>
            {item.error && <p className="form-error" role="alert">{item.error}</p>}
            {item.result && <><p className={item.result.blob.size <= Number(targetKB) * 1024 ? "success-text" : "warning-text"}>{item.result.blob.size <= Number(targetKB) * 1024 ? "O limite informado foi atingido." : `Não foi possível chegar a ${targetKB} KB. Este é o menor resultado obtido nesta tentativa.`}</p><a className="button button-small button-secondary" href={item.result.url} download={`${item.file.name.replace(/\.[^.]+$/, "")}-comprimida.jpg`}>Baixar JPEG</a></>}
          </div>
        </article>;
      })}
    </div>}
    <p className="tool-privacy-hint">O processamento acontece neste dispositivo. Para imagens transparentes, as áreas sem imagem recebem fundo branco no JPEG.</p>
  </section>;
}
