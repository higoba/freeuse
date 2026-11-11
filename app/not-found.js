import Link from "next/link";
import AdSlot from "@/components/AdSlot";

export default function NotFound() {
  return <section className="container page-section info-page">
    <span className="eyebrow">Página não encontrada</span>
    <h1>Esse caminho não existe.</h1>
    <p>Confira o endereço ou volte para explorar as ferramentas gratuitas.</p>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE} />
    <Link className="button button-primary" href="/ferramentas">Ver ferramentas</Link>
  </section>;
}
