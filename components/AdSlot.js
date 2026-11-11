import GoogleAd from "@/components/GoogleAd";

export default function AdSlot({ className = "", slot }) {
  if (!/^\d{6,20}$/.test(slot || "")) return null;

  return <aside className={`ad-wrap ${className}`.trim()} aria-label="Publicidade">
    <GoogleAd slot={slot} />
  </aside>;
}
