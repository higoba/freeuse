# FreeUse.store

Ferramentas online gratuitas, úteis e privadas. A plataforma é independente: os cinco utilitários processam imagens e cálculos diretamente no navegador, sem conta e sem enviar arquivos para um servidor.

## Requisitos

- Node.js 20.9 ou superior
- npm

## Instalação e desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para validar antes de publicar:

```bash
npm test
npm run lint
npm run build
```

## Arquitetura

- `app/`: rotas App Router, metadados, sitemap e páginas informativas.
- `components/`: navegação, componentes reutilizáveis e interfaces interativas.
- `components/tools/`: uma implementação isolada por ferramenta.
- `lib/tools.js`: registro central de ferramentas, categorias e conteúdo editorial/SEO.
- `lib/`: cálculos e utilitários puros, testados com `node:test`.

As páginas e o conteúdo editorial são Server Components por padrão. Apenas controles interativos e processamento de arquivos usam Client Components. Bibliotecas para HEIC e ZIP são importadas somente quando a pessoa inicia uma conversão.

## Como adicionar uma ferramenta

1. Adicione a ferramenta, descrição pt-BR, categoria, perguntas frequentes e links relacionados em `lib/tools.js`.
2. Crie um componente isolado em `components/tools/` e adicione o `slug` ao seletor de ferramentas em `components/tools/ToolWorkspace.js`.
3. Use a rota dinâmica `/ferramentas/[slug]`; metadados, canonical, breadcrumb e sitemap são derivados do registro.
4. Adicione testes para a lógica pura em arquivos `*.test.js` e execute os três comandos de validação.

## Privacidade e configuração

Não há autenticação nem banco de dados. A URL canônica padrão é `https://freeuse.store`; se o domínio mudar, atualize `metadataBase` em `app/layout.js`. Compressão, recorte 3x4 e conversão HEIC acontecem localmente. Objetos temporários são liberados ao remover arquivos ou sair da página.

## Google AdSense

- O script do editor AdSense é carregado no `<head>` global usando o publisher ID `ca-pub-2521433324822656`.
- `public/ads.txt` declara o vendedor autorizado. O arquivo deve ficar acessível em `https://freeuse.store/ads.txt` depois do deploy.
- Os espaços de anúncio aparecem somente quando configurados com um ID de unidade criado no painel do AdSense. Copie `.env.example`, preencha os IDs e disponibilize as variáveis `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_TOOLS` e `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` no ambiente de build do deploy. Não invente IDs de unidade; sem configuração, os espaços permanecem desligados.
- Publique a política de privacidade, os termos e o contato com informações verdadeiras, configure o site no painel do AdSense e verifique propriedade, ads.txt, consentimento e requisitos de conteúdo. A inclusão do código ou o cumprimento de boas práticas não garante aprovação. Se houver público no Espaço Econômico Europeu, Reino Unido ou Suíça, configure uma plataforma de consentimento certificada pelo Google antes de exibir anúncios nessas regiões.
- Os campos de sugestão no rodapé preparam uma mensagem para `contato@freeuse.store` no aplicativo de e-mail do visitante. Eles não enviam nem armazenam mensagens no servidor; a pessoa precisa confirmar o envio no próprio aplicativo.

## GitHub Actions

O workflow em `.github/workflows/ci.yml` instala dependências com `npm ci` e executa testes, lint e build em cada push e pull request para `main`.

## Limitações conhecidas do navegador

- A compressão entrega JPEG e usa fundo branco para imagens transparentes.
- A conversão HEIC depende de WebAssembly/canvas suportados pelo navegador e da memória disponível; arquivos muito grandes podem não ser processados em celulares com pouca memória.
- A foto 3x4 gera uma imagem com proporção 3:4; isso não certifica conformidade com requisitos específicos de documentos.
