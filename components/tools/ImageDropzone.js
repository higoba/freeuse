"use client";

import { useRef, useState } from "react";
import ToolIcon from "@/components/ToolIcon";

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isSupportedImage(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return IMAGE_TYPES.has(file.type) || ["jpg", "jpeg", "png", "webp"].includes(extension);
}

export default function ImageDropzone({ accept, multiple = false, onFiles, title, detail, extensions, maxBytes = MAX_IMAGE_BYTES }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function receive(list) {
    setError("");
    const files = Array.from(list || []);
    if (!files.length) return;
    const valid = files.filter((file) => file.size <= maxBytes);
    if (valid.length !== files.length) setError(`Cada arquivo deve ter até ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
    if (valid.length) onFiles(multiple ? valid : [valid[0]]);
  }

  return <div>
    <div
      className={`dropzone ${dragging ? "dropzone-active" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); receive(event.dataTransfer.files); }}
    >
      <input ref={inputRef} className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => { receive(event.target.files); event.target.value = ""; }} />
      <span className="dropzone-icon"><ToolIcon name="upload" size={22} /></span>
      <strong>{title || "Arraste seus arquivos para cá"}</strong>
      <span>{detail || "ou escolha no seu dispositivo"}</span>
      <button className="button button-secondary" type="button" onClick={() => inputRef.current?.click()}>{multiple ? "Escolher arquivos" : "Escolher arquivo"}</button>
      {extensions && <small>Formatos: {extensions}</small>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`;
}
