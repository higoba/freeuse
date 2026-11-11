"use client";

import dynamic from "next/dynamic";

const LoadingTool = () => <div className="tool-workspace" role="status">Preparando ferramenta…</div>;

const workspaces = {
  "comprimir-imagem": dynamic(() => import("@/components/tools/ImageCompressor"), { loading: LoadingTool }),
  "foto-3x4": dynamic(() => import("@/components/tools/Photo3x4"), { loading: LoadingTool }),
  "calculadora-preco-venda": dynamic(() => import("@/components/tools/PriceCalculator"), { loading: LoadingTool }),
  "calculadora-horas-trabalhadas": dynamic(() => import("@/components/tools/WorkHoursCalculator"), { loading: LoadingTool }),
  "converter-heic-jpg": dynamic(() => import("@/components/tools/HeicConverter"), { loading: LoadingTool }),
};

export default function ToolWorkspace({ slug }) {
  const Workspace = workspaces[slug];
  return Workspace ? <Workspace /> : null;
}
