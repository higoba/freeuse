const icons = {
  "comprimir-imagem": <>
    <path d="M9 4H4v5M4 4l6 6M15 4h5v5m0-5-6 6M9 20H4v-5m0 5 6-6m5 6h5v-5m0 5-6-6" />
  </>,
  "foto-3x4": <>
    <rect x="5" y="2.5" width="14" height="19" />
    <circle cx="12" cy="9" r="2.5" />
    <path d="M8.5 17c.5-2.2 1.7-3.3 3.5-3.3s3 1.1 3.5 3.3" />
  </>,
  "calculadora-preco-venda": <>
    <rect x="5" y="2.5" width="14" height="19" />
    <path d="M8 6h8v3H8zM8 13h1m3 0h1m3 0h1M8 17h1m3 0h1m3 0h1" />
  </>,
  "calculadora-horas-trabalhadas": <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v6l4 2" />
  </>,
  "converter-heic-jpg": <>
    <path d="M5 3h9l5 5v8M14 3v5h5M7 13l2.5-2.5L12 13l1.5-1.5L16 14" />
    <path d="M4 18h6m-2-2 2 2-2 2m14-2h-6m2-2-2 2 2 2" />
  </>,
  "calculadora-custo-viagem": <>
    <path d="M6 3v5l6 4 6 4v5" />
    <path d="M6 3v3m0 2v3m12 5v3" />
    <rect x="3.5" y="2.5" width="5" height="5" />
    <rect x="15.5" y="16.5" width="5" height="5" />
    <path d="M10 12h4" />
  </>,
  "conversor-moedas": <>
    <circle cx="12" cy="12" r="9" />
    <path d="M7 9h10l-2.5-2.5M17 15H7l2.5 2.5" />
  </>,
  "planejador-viagem-internacional": <>
    <path d="M4 2.5h11l5 5v14H4zM15 2.5v5h5" />
    <circle cx="11.5" cy="14" r="3.5" />
    <path d="M8 14h7m-3.5-3.5c1 1 1 6 0 7m-2.5-1 5-5" />
  </>,
  imagens: <>
    <rect x="3" y="4" width="18" height="16" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="m4 18 5-5 3 3 3-4 5 6" />
  </>,
  negocios: <>
    <rect x="5" y="2.5" width="14" height="19" />
    <path d="M8 6h8v3H8zM8 13h1m3 0h1m3 0h1M8 17h1m3 0h1m3 0h1" />
  </>,
  trabalho: <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v6l4 2" />
  </>,
  viagens: <>
    <path d="M5 3v5l7 4 7 4v5" />
    <rect x="2.5" y="2.5" width="5" height="5" />
    <rect x="16.5" y="16.5" width="5" height="5" />
    <path d="M9 12h6" />
  </>,
  moedas: <>
    <circle cx="12" cy="12" r="9" />
    <path d="M7 9h10l-2.5-2.5M17 15H7l2.5 2.5" />
  </>,
  search: <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </>,
  upload: <>
    <path d="M4 16v4h16v-4M12 16V4m-4 4 4-4 4 4" />
  </>,
  swap: <>
    <path d="M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4" />
  </>,
  route: <>
    <path d="M6 4v5l6 3 6 3v5" />
    <rect x="3.5" y="2.5" width="5" height="5" />
    <rect x="15.5" y="16.5" width="5" height="5" />
    <path d="M12 12h.01" />
  </>,
  location: <>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </>,
  toll: <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
  </>,
  fallback: <>
    <rect x="4" y="4" width="6" height="6" />
    <rect x="14" y="4" width="6" height="6" />
    <rect x="4" y="14" width="6" height="6" />
    <rect x="14" y="14" width="6" height="6" />
  </>,
};

export default function ToolIcon({ name, size = 22 }) {
  return <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="square"
    strokeLinejoin="miter"
    focusable="false"
  >
    {icons[name] || icons.fallback}
  </svg>;
}
