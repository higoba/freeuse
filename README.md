# FreeUse.store

Ferramentas online gratuitas, úteis e privadas. A plataforma é independente: ferramentas de imagem e cálculos pessoais funcionam no navegador; consultas de câmbio usam fontes públicas e não recebem valores de orçamento ou viagem.

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
- `lib/travel.js`: estimativas de custo por tipo de propulsão, separadas da interface e de futuras integrações de dados.
- `lib/currency-api.js` e `app/api/moedas/`: camada de cotação e histórico. USD/BRL usa séries diárias de compra e venda do Banco Central do Brasil; demais pares usam Frankfurter, com referências do BCE.
- `lib/travel-requirements.js`: requisitos de viagem vinculados a fontes oficiais, com resultados explicitamente não confirmados quando não há valor confiável.

As páginas e o conteúdo editorial são Server Components por padrão. Apenas controles interativos e processamento de arquivos usam Client Components. Bibliotecas para HEIC e ZIP são importadas somente quando a pessoa inicia uma conversão.

## Como adicionar uma ferramenta

1. Adicione a ferramenta, descrição pt-BR, categoria, perguntas frequentes e links relacionados em `lib/tools.js`.
2. Crie um componente isolado em `components/tools/` e adicione o `slug` ao seletor de ferramentas em `components/tools/ToolWorkspace.js`.
3. Use a rota dinâmica `/ferramentas/[slug]`; metadados, canonical, breadcrumb e sitemap são derivados do registro.
4. Adicione testes para a lógica pura em arquivos `*.test.js` e execute os três comandos de validação.

## SEO das ferramentas

Cada ferramenta declara no registro central seu título, descrição, termos relacionados à intenção de busca, instruções, exemplo e perguntas frequentes. A rota dinâmica usa esses dados em metadados próprios, canonical, Open Graph e dados estruturados; o sitemap e as ligações internas também vêm do registro. Escreva conteúdo útil e específico, sem repetir palavras-chave artificialmente. Metadados ajudam a descrever as páginas, mas não garantem posições nos resultados de busca.

## Calculadora de custo de viagem

A calculadora aceita distância informada, consumo e preços digitados pelo usuário para veículos a gasolina, etanol, diesel, flex, híbridos convencionais, híbridos plug-in e elétricos. Permite ida e volta, percursos divididos em até dez trechos, divisão estimada por passageiro e comparação de até seis veículos com as mesmas distâncias e referências de preço. O resultado pode ser compartilhado pelo menu nativo do dispositivo ou copiado para a área de transferência; a viagem não é armazenada. Nesta versão não há catálogo automático de veículos, consulta automática de preços, roteamento ou mapa: os valores devem ser conferidos pelo usuário. As fontes oficiais são [PBE Veicular do Inmetro](https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular) e [pesquisa de preços da ANP](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis); a ferramenta não apresenta preços ou consumos inventados como referência automática.

## Privacidade e configuração

Não há autenticação nem banco de dados. A URL canônica padrão é `https://freeuse.store`; se o domínio mudar, atualize `metadataBase` em `app/layout.js`. Compressão, recorte 3x4, conversão HEIC, cálculos e orçamento de viagem acontecem localmente. Nas consultas cambiais, só os códigos de moedas são enviados ao servidor; valores e dados da viagem ficam no navegador.

## Google AdSense

- O script do editor AdSense é carregado no `<head>` global usando o publisher ID `ca-pub-2521433324822656`.
- `public/ads.txt` declara o vendedor autorizado. O arquivo deve ficar acessível em `https://freeuse.store/ads.txt` depois do deploy.
- Há três posições por página: topo, meio do conteúdo e fim. Sem um ID real, a posição fica reservada e nenhum anúncio é solicitado. Copie `.env.example` e configure `NEXT_PUBLIC_ADSENSE_SLOT_TOP`, `NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE` e `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` com IDs criados no painel do AdSense. Não invente IDs.
- Publique a política de privacidade, os termos e o contato com informações verdadeiras, configure o site no painel do AdSense e verifique propriedade, ads.txt, consentimento e requisitos de conteúdo. A inclusão do código ou o cumprimento de boas práticas não garante aprovação. Se houver público no Espaço Econômico Europeu, Reino Unido ou Suíça, configure uma plataforma de consentimento certificada pelo Google antes de exibir anúncios nessas regiões.
- O formulário do rodapé envia dicas, sugestões e mensagens pelo endpoint `app/api/contato/route.js`, usando SMTP no servidor. As mensagens seguem para `CONTACT_TO`; o endereço de quem escreveu, quando informado, é usado como `Reply-To`. O site não mantém cópia persistente das mensagens.

## SMTP de contato na Hostinger

1. No hPanel da Hostinger, crie a caixa `contato@freeuse.store` (ou confirme que ela já existe) e consulte **Configuração manual / Configuração de e-mail** para ver o servidor SMTP e as portas da sua conta.
2. No Coolify, abra a aplicação FreeUse e adicione estas variáveis em **Environment Variables**:

   ```text
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=contato@freeuse.store
   SMTP_PASSWORD=<senha da caixa de e-mail>
   CONTACT_TO=contato@freeuse.store
   ```

   Use os valores de servidor e porta informados no hPanel. A porta `465` usa SSL; a `587` usa STARTTLS e também é aceita. `SMTP_USER` deve ser o endereço completo da caixa, e `SMTP_PASSWORD` é a senha dessa caixa.
3. Não use o prefixo `NEXT_PUBLIC_` e não coloque a senha no código, no `.env.example` ou em commits. Cadastre a senha somente como variável secreta no Coolify.
4. Salve as variáveis e faça **redeploy/rebuild** da aplicação para o processo Next.js recebê-las.
5. Teste o formulário do rodapé e confira a caixa de entrada e o spam. Se o envio falhar, consulte os logs da aplicação no Coolify; a rota não registra o conteúdo da mensagem nem as credenciais. A VPS precisa permitir conexões de saída TCP na porta SMTP escolhida.

## GitHub Actions

O workflow em `.github/workflows/ci.yml` instala dependências com `npm ci` e executa testes, lint e build em cada push e pull request para `main`.

## Limitações conhecidas do navegador

- A compressão entrega JPEG e usa fundo branco para imagens transparentes.
- A conversão HEIC depende de WebAssembly/canvas suportados pelo navegador e da memória disponível; arquivos muito grandes podem não ser processados em celulares com pouca memória.
- A foto 3x4 gera uma imagem com proporção 3:4; isso não certifica conformidade com requisitos específicos de documentos.
- A calculadora de viagem estima valores a partir de dados informados; consumo real, preços, trânsito, recarga e autonomia podem ser diferentes. Rotas, mapas, catálogo PBEV integrado e preços regionais automáticos ainda não estão conectados.
