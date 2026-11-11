export const SITE_URL = "https://freeuse.store";

export const categories = [
  { slug: "imagens", name: "Imagens", description: "Ajuste e converta imagens no seu navegador." },
  { slug: "negocios", name: "Negócios", description: "Faça contas práticas para vender melhor." },
  { slug: "trabalho", name: "Trabalho", description: "Organize horários e períodos trabalhados." },
];

export const tools = [
  {
    slug: "comprimir-imagem",
    title: "Comprimir imagem para um tamanho específico",
    shortTitle: "Comprimir imagem",
    description: "Reduza uma imagem para tentar chegar ao limite em KB que você precisa, com processamento local.",
    category: "imagens",
    keywords: ["comprimir imagem", "reduzir foto", "diminuir imagem em kb"],
    intro: "Escolha uma imagem, informe o limite em KB e compare o resultado antes de baixar. O compressor ajusta a qualidade e, se necessário, as dimensões, sem enviar sua foto para a internet.",
    steps: ["Selecione ou arraste uma imagem JPG, PNG ou WebP.", "Informe o tamanho máximo desejado em KB e a qualidade inicial.", "Confira o tamanho real obtido e baixe o JPEG."],
    example: "Para anexar uma foto com limite de 200 KB, informe 200. Se o formato e os detalhes da imagem impedirem atingir esse valor, o resultado informa o tamanho real sem dizer que a meta foi cumprida.",
    faqs: [
      { question: "A imagem sempre ficará abaixo do tamanho informado?", answer: "Não necessariamente. O resultado depende da imagem e dos limites de qualidade e dimensões. O tamanho real é sempre mostrado, inclusive quando fica acima da meta." },
      { question: "A imagem é enviada para algum servidor?", answer: "Não. A compressão acontece no navegador do seu dispositivo." },
      { question: "O arquivo baixado mantém transparência?", answer: "O resultado é JPEG. Áreas transparentes são preenchidas com branco." },
    ],
  },
  {
    slug: "foto-3x4",
    title: "Foto 3x4 online: recorte e download em JPG",
    shortTitle: "Foto 3x4",
    description: "Ajuste o enquadramento de uma foto na proporção 3:4 e exporte um JPG em alta resolução.",
    category: "imagens",
    keywords: ["foto 3x4", "fazer foto 3 por 4", "recortar foto 3x4"],
    intro: "Use o recorte 3:4 para posicionar uma fotografia e exportar um arquivo JPG de 1200 × 1600 pixels. O ajuste é feito localmente no navegador.",
    steps: ["Escolha uma fotografia do dispositivo.", "Ajuste zoom e posição horizontal e vertical.", "Gere e baixe a imagem JPG no formato 3:4."],
    example: "Uma imagem de retrato pode ser ampliada e deslocada para centralizar o rosto dentro do quadro. A ferramenta controla a proporção, mas não avalia iluminação, fundo ou regras de um documento.",
    faqs: [
      { question: "Qual é a proporção da foto 3x4?", answer: "A proporção é 3:4. O arquivo de alta resolução desta ferramenta tem 1200 × 1600 pixels." },
      { question: "A foto é aceita automaticamente em documentos oficiais?", answer: "Não. O recorte não certifica conformidade com os requisitos de nenhum documento." },
      { question: "Minha foto sai do aparelho?", answer: "Não. A imagem é recortada e exportada localmente no navegador." },
    ],
  },
  {
    slug: "calculadora-preco-venda",
    title: "Calculadora de preço de venda com margem de lucro",
    shortTitle: "Preço de venda",
    description: "Calcule preço sugerido, custos, impostos, comissão e lucro com margem sobre o preço.",
    category: "negocios",
    keywords: ["calculadora preço de venda", "calcular margem de lucro", "precificação produto"],
    intro: "Informe os custos e percentuais para estimar um preço que cubra despesas, impostos, comissão e a margem de lucro desejada. Os valores são calculados no próprio navegador.",
    steps: ["Informe custo do produto, embalagem e outros custos.", "Adicione os percentuais de imposto e comissão.", "Defina a margem de lucro desejada sobre o preço final."],
    example: "Se os custos somam R$ 50 e impostos, comissão e margem desejada somam 40% do preço, o cálculo divide R$ 50 por 0,60. Margem é lucro dividido pelo preço; markup compara preço e custo.",
    faqs: [
      { question: "Margem de lucro e markup são iguais?", answer: "Não. Margem é o lucro dividido pelo preço de venda. Markup é a relação entre preço de venda e custo." },
      { question: "A calculadora inclui taxas fixas?", answer: "Informe embalagem e outras despesas como custos em reais; impostos e comissão são percentuais do preço." },
      { question: "Os valores são enviados?", answer: "Não. O cálculo é feito no navegador e não é armazenado." },
    ],
  },
  {
    slug: "calculadora-horas-trabalhadas",
    title: "Calculadora de horas trabalhadas, pausas e saldo",
    shortTitle: "Horas trabalhadas",
    description: "Some períodos de trabalho, desconte pausas e compare o total com a jornada esperada.",
    category: "trabalho",
    keywords: ["calculadora horas trabalhadas", "calcular horas extras", "somar jornada de trabalho"],
    intro: "Adicione períodos de trabalho e pausas para somar o tempo efetivamente trabalhado. Informe uma jornada esperada opcional para ver horas excedentes ou faltantes.",
    steps: ["Preencha início e fim de cada período de trabalho.", "Adicione início e fim da pausa, se houver.", "Opcionalmente, informe a jornada esperada em horas e minutos."],
    example: "Um turno das 22:00 às 06:00 é contado como oito horas. Uma pausa das 02:00 às 02:30 é descontada do total trabalhado.",
    faqs: [
      { question: "A calculadora entende um turno que passa da meia-noite?", answer: "Sim. Um horário final anterior ao inicial é interpretado como o dia seguinte." },
      { question: "Posso informar mais de um período?", answer: "Sim. Adicione quantos períodos de trabalho precisar, cada um com sua pausa opcional." },
      { question: "O resultado calcula horas extras legais?", answer: "Não. Ele compara durações informadas e não interpreta regras trabalhistas ou acordos." },
    ],
  },
  {
    slug: "converter-heic-jpg",
    title: "Converter HEIC para JPG online no navegador",
    shortTitle: "HEIC para JPG",
    description: "Converta arquivos HEIC e HEIF para JPG em lote, diretamente no seu dispositivo.",
    category: "imagens",
    keywords: ["converter HEIC para JPG", "HEIF para JPEG", "abrir foto iPhone no Windows"],
    intro: "Selecione uma ou várias fotos HEIC/HEIF para convertê-las em JPG no navegador. Os arquivos não são enviados a um serviço externo.",
    steps: ["Selecione ou arraste arquivos HEIC ou HEIF.", "Inicie a conversão e confira cada resultado.", "Baixe cada JPG ou reúna todos em um arquivo ZIP."],
    example: "Para compartilhar várias fotos do iPhone com um programa que não abre HEIC, selecione todas e use o download em lote. O navegador pode levar mais tempo com imagens grandes.",
    faqs: [
      { question: "A conversão preserva a orientação da foto?", answer: "A biblioteca tenta respeitar a orientação, mas o suporte varia conforme os metadados e o navegador." },
      { question: "As fotos são enviadas para conversão?", answer: "Não. A conversão e a criação do ZIP ocorrem localmente no navegador." },
      { question: "Posso converter vários arquivos de uma vez?", answer: "Sim. Selecione vários arquivos e baixe os JPGs individualmente ou em um ZIP." },
    ],
  },
];

export function getTool(slug) {
  return tools.find((tool) => tool.slug === slug);
}

export function relatedTools(tool, limit = 3) {
  return tools.filter((item) => item.slug !== tool.slug && item.category === tool.category).concat(
    tools.filter((item) => item.slug !== tool.slug && item.category !== tool.category),
  ).slice(0, limit);
}
