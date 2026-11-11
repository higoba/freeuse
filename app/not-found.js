import Link from "next/link";

export default function NotFound() {
  return <section className="container page-section info-page">
    <span className="eyebrow">Página não encontrada</span>
    <h1>Esse caminho não existe.</h1>
    <p>Confira o endereço ou volte para explorar as ferramentas gratuitas.</p>
    <Link className="button button-primary" href="/ferramentas">Ver ferramentas</Link>
  </section>;
}
