export interface MockSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  trustScore: number;
  isActive: boolean;
}

export interface MockArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  content: string;
  publishedAt: string;
  geoScore: number;
  aeoScore: number;
  aiVisibility: number;
  summary: string;
  topics: string[];
  eeatAnalysis: string;
  citationProbability: number;
  semanticAuthority: string;
}

export const mockSources: MockSource[] = [
  {
    id: 'src-1',
    name: 'Google Search Central',
    url: 'https://developers.google.com/search/blog',
    rssUrl: 'https://developers.google.com/search/blog/feed.xml',
    trustScore: 9.8,
    isActive: true
  },
  {
    id: 'src-2',
    name: 'Search Engine Land',
    url: 'https://searchengineland.com',
    rssUrl: 'https://searchengineland.com/feed',
    trustScore: 8.9,
    isActive: true
  },
  {
    id: 'src-3',
    name: 'Perplexity Blog',
    url: 'https://perplexity.ai/blog',
    rssUrl: 'https://perplexity.ai/blog/feed.xml',
    trustScore: 8.5,
    isActive: true
  },
  {
    id: 'src-4',
    name: 'SEO & Generative Engine Watch',
    url: 'https://geowatch.ai',
    rssUrl: 'https://geowatch.ai/rss',
    trustScore: 7.8,
    isActive: true
  }
];

export const mockArticles: MockArticle[] = [
  {
    id: 'art-1',
    sourceId: 'src-2',
    sourceName: 'Search Engine Land',
    title: 'Generative Engine Optimization (GEO): A New Frontier for SEO Specialists',
    url: 'https://searchengineland.com/generative-engine-optimization-geo-new-frontier-seo',
    content: 'Generative Engine Optimization (GEO) is rapidly overtaking traditional SEO as users shift to search engines powered by LLMs like Perplexity and Gemini. Research shows that citation probability changes based on the formatting, tone, and semantic density of the content. Using statistics, structured tables, and bolded terms can boost your GEO Score and visibility by up to 40% in AI-generated answers.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
    geoScore: 88,
    aeoScore: 82,
    aiVisibility: 91,
    summary: 'Este artigo serve como um guia didático para GEO, explicando como os novos motores de busca baseados em IA (como Gemini e Perplexity) indexam e citam informações.',
    topics: ['GEO', 'SEO', 'LLM', 'AI Search', 'Optimization'],
    eeatAnalysis: 'Os motores de busca baseados em IA usam RAG para buscar informações em tempo real e priorizam conteúdos que contenham dados estatísticos, tabelas organizadas e termos científicos claros.',
    citationProbability: 90,
    semanticAuthority: 'Profissionais de SEO devem estruturar o conteúdo com tabelas comparativas de dados, citar fontes primárias confiáveis e destacar conclusões logo no início dos parágrafos.'
  },
  {
    id: 'art-2',
    sourceId: 'src-3',
    sourceName: 'Perplexity Blog',
    title: 'How Answer Engines Select Sources: Key AEO Metrics Revealed',
    url: 'https://perplexity.ai/blog/how-answer-engines-select-sources-aeo',
    content: 'Answer Engine Optimization (AEO) focuses on making your content the definitive, direct response to voice and chat queries. AI answer engines perform real-time retrieval-augmented generation (RAG) and prioritize sources that contain high factual density, explicit definitions, and answers to follow-up questions. We analyze why single-sentence clear explanations are prioritized over long paragraphs.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18h ago
    geoScore: 74,
    aeoScore: 95,
    aiVisibility: 86,
    summary: 'Estudo detalhado sobre Answer Engine Optimization (AEO), analisando como motores de resposta selecionam fontes de informação diretas em interfaces de chat ou voz.',
    topics: ['AEO', 'RAG', 'Perplexity', 'Direct Answer'],
    eeatAnalysis: 'As interfaces conversacionais dão preferência a parágrafos curtos, definições conceituais claras de termos técnicos e estruturas do tipo pergunta-resposta (Q&A).',
    citationProbability: 85,
    semanticAuthority: 'Implemente FAQs estruturadas nas páginas de produtos, escreva definições diretas no formato "O que é..." e responda de forma assertiva antes de aprofundar no conteúdo.'
  },
  {
    id: 'art-3',
    sourceId: 'src-1',
    sourceName: 'Google Search Central',
    title: 'Google Core Update May 2026: Enhancing EEAT and Helpful Content Signals',
    url: 'https://developers.google.com/search/blog/2026/05/core-update-helpful-content',
    content: 'In our May 2026 Core Update, we have further refined our ranking algorithms to value helpful content created by humans for humans. Our AI models are now better at identifying real-world experience (the first E in E-E-A-T) and filtering out low-effort, mass-generated AI content. Websites with high citation probabilities across multiple independent entities are seeing positive visibility bumps.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36h ago
    geoScore: 92,
    aeoScore: 78,
    aiVisibility: 95,
    summary: 'Análise da atualização Core de Maio de 2026 do Google, que reforçou os critérios de conteúdo útil e a detecção de experiência de autoria (E-E-A-T).',
    topics: ['Google Update', 'EEAT', 'SEO', 'Helpful Content'],
    eeatAnalysis: 'O algoritmo do Google está priorizando relatos em primeira pessoa, avaliações reais de produtos e depoimentos autênticos, penalizando conteúdos gerados por IA genéricos.',
    citationProbability: 95,
    semanticAuthority: 'Escreva artigos baseados em experiências próprias, inclua fotos ou vídeos originais demonstrando o uso de produtos e evite repetir conteúdos genéricos da web.'
  },
  {
    id: 'art-4',
    sourceId: 'src-4',
    sourceName: 'SEO & Generative Engine Watch',
    title: 'AI Overviews: Analyzing the Factors Behind Citation Loss in Google Search',
    url: 'https://geowatch.ai/analyzing-citation-loss-in-google-search-ai-overviews',
    content: 'A recent cohort study analyzing 10,000 queries shows that Google AI Overviews are decreasing external click-through rates by 25%. However, websites that establish strong brand authority and contain structured table schemas receive a disproportionate share of the remaining citations. We outline three optimization steps to recover visibility.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    geoScore: 82,
    aeoScore: 68,
    aiVisibility: 79,
    summary: 'Estudo prático sobre a queda de cliques orgânicos devido aos resumos gerados por IA (AI Overviews) nas páginas de resultados do Google.',
    topics: ['AI Overviews', 'Google Search', 'CTR', 'Structured Data'],
    eeatAnalysis: 'A exibição de respostas automáticas no topo da busca reduz a necessidade de cliques externos. Apenas marcas de forte autoridade ou sites com ricas tabelas de dados são linkados como fontes.',
    citationProbability: 80,
    semanticAuthority: 'Adapte sua estratégia para cobrir dúvidas complexas que a IA não consegue responder de forma satisfatória e use marcação de dados estruturados Schema.org para tabelas.'
  }
];
