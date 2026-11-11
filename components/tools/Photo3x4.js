"use client";

import { useEffect, useRef, useState } from "react";
import ImageDropzone, { isSupportedImage } from "@/components/tools/ImageDropzone";

function drawCrop(context, image, width, height, zoom, horizontal, vertical) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(
    image,
    -(renderedWidth - width) * horizontal / 100,
    -(renderedHeight - height) * vertical / 100,
    renderedWidth,
    renderedHeight,
  );
}

export default function Photo3x4() {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [horizontal, setHorizontal] = useState(50);
  const [vertical, setVertical] = useState(50);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const urls = useRef(new Set());
  const previewRef = useRef(null);
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (!image?.url || !image.width || !image.height) return undefined;
    const canvas = previewRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return undefined;
    canvas.width = 600;
    canvas.height = 800;
    const source = new window.Image();
    source.onload = () => drawCrop(context, source, canvas.width, canvas.height, zoom, horizontal, vertical);
    source.src = image.url;
    return () => { source.onload = null; };
  }, [image?.url, image?.width, image?.height, zoom, horizontal, vertical]);

  function selectFile(files) {
    const file = files.find(isSupportedImage);
    if (!file) { setError("Escolha uma imagem JPG, PNG ou WebP válida."); return; }
    setError("");
    setMessage("");
    if (image?.url) { URL.revokeObjectURL(image.url); urls.current.delete(image.url); }
    const url = URL.createObjectURL(file);
    urls.current.add(url);
    setImage({ file, url, width: 0, height: 0 });
    const source = new window.Image();
    source.onload = () => {
      if (source.naturalWidth * source.naturalHeight > 40000000) {
        URL.revokeObjectURL(url);
        urls.current.delete(url);
        setError("Esta imagem tem mais de 40 megapixels e é grande demais para o navegador processar com segurança.");
        setImage(null);
        return;
      }
      setImage((current) => current?.url === url ? { ...current, width: source.naturalWidth, height: source.naturalHeight } : current);
    };
    source.onerror = () => {
      URL.revokeObjectURL(url);
      urls.current.delete(url);
      setImage(null);
      setError("Não foi possível abrir esta imagem. Tente outro arquivo.");
    };
    source.src = url;
    setZoom(1);
    setHorizontal(50);
    setVertical(50);
  }

  function exportPhoto() {
    if (!image || !image.width || !image.height) { setError("Aguarde a imagem carregar e tente novamente."); return; }
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const context = canvas.getContext("2d");
    if (!context) { setError("Este navegador não disponibilizou o canvas necessário."); return; }
    const source = new window.Image();
    source.onerror = () => setError("Não foi possível carregar a imagem para exportação.");
    source.onload = () => {
      drawCrop(context, source, canvas.width, canvas.height, zoom, horizontal, vertical);
      canvas.toBlob((blob) => {
        if (!blob) { setError("Não foi possível criar o arquivo JPG."); return; }
        const url = URL.createObjectURL(blob);
        urls.current.add(url);
        const link = document.createElement("a");
        link.href = url;
        link.download = "foto-3x4.jpg";
        link.click();
        window.setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 1000);
        setError("");
        setMessage("Foto 3x4 em JPG gerada e baixada (1200 × 1600 pixels).");
      }, "image/jpeg", 0.94);
    };
    source.src = image.url;
  }

  function clearImage() {
    if (image?.url) { URL.revokeObjectURL(image.url); urls.current.delete(image.url); }
    setImage(null);
    setError("");
    setMessage("");
  }

  return <section className="tool-workspace" aria-label="Gerador de foto 3x4">
    {!image && <ImageDropzone accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onFiles={selectFile} extensions="JPG, PNG e WebP" />}
    {image && <div className="photo-editor">
      <div className="photo-preview-column">
        <div className="photo-frame">
          <canvas ref={previewRef} className="photo-preview-canvas" aria-label="Prévia do recorte 3 por 4" />
          <span className="photo-frame-label">Proporção 3:4</span>
        </div>
        <p className="field-hint">A área visível dentro do quadro será exportada. Use os controles para ajustar o enquadramento.</p>
      </div>
      <div className="photo-controls">
        <div className="control-heading"><strong>{image.file.name}</strong><button type="button" className="quiet-button" onClick={clearImage}>Trocar foto</button></div>
        <label className="field"><span>Zoom <strong>{zoom.toFixed(1)}×</strong></span><input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
        <label className="field"><span>Posição horizontal</span><input type="range" min="0" max="100" step="1" value={horizontal} onChange={(event) => setHorizontal(Number(event.target.value))} /></label>
        <label className="field"><span>Posição vertical</span><input type="range" min="0" max="100" step="1" value={vertical} onChange={(event) => setVertical(Number(event.target.value))} /></label>
        <p className="helper-text">Imagem original: {image.width && image.height ? `${image.width} × ${image.height} px` : "carregando…"}. Exportação: 1200 × 1600 px, JPG.</p>
        <button type="button" className="button button-primary button-full" onClick={exportPhoto}>Gerar e baixar foto 3x4</button>
      </div>
    </div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="success-text" role="status">{message}</p>}
    <p className="tool-privacy-hint">A proporção 3:4 não garante conformidade com requisitos específicos de documentos oficiais. Imagens acima de 40 megapixels não são carregadas.</p>
  </section>;
}
