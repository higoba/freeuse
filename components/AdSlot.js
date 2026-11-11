import GoogleAd from "@/components/GoogleAd";

export default function AdSlot({ className = "", slot }) {
  const hasSlot = /^\d{6,20}$/.test(slot || "");

  return <aside
    className={`ad-wrap ${hasSlot ? "ad-slot-active" : "ad-slot-placeholder"} ${className}`.trim()}
    aria-label={hasSlot ? "Publicidade" : "Espaço reservado para publicidade"}
  >
    {hasSlot ? <GoogleAd slot={slot} /> : <span className="ad-placeholder-label" aria-hidden="true">Espaço para anúncio</span>}
  </aside>;
}
