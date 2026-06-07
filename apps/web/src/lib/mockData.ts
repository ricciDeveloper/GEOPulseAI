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
    summary: 'GEO está surgindo como substituto do SEO tradicional, focando em otimização para motores baseados em LLMs como Gemini e Perplexity. O uso de formatação estruturada, estatísticas concretas e relevância semântica aumenta em até 40% a presença de sites nas respostas dessas IAs.',
    topics: ['GEO', 'SEO', 'LLM', 'AI Search', 'Optimization'],
    eeatAnalysis: 'Excelente conformidade de E-E-A-T devido à menção de metodologias e estudos empíricos. Apresenta alta confiabilidade pelas referências técnicas.',
    citationProbability: 89,
    semanticAuthority: 'Alta autoridade semântica no tópico de IA Search, com forte densidade de palavras-chave estruturadas e termos do ecossistema de busca moderna.'
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
    summary: 'AEO (Answer Engine Optimization) prioriza respostas diretas e sucintas para consultas de voz e chat. Ferramentas de RAG em tempo real preferem explicações conceituais claras com definições explícitas de termos técnicos.',
    topics: ['AEO', 'RAG', 'Perplexity', 'Direct Answer'],
    eeatAnalysis: 'Apresenta forte autoridade técnica, originada do próprio time da Perplexity. O nível de Especialidade e Confiabilidade é máximo (10/10).',
    citationProbability: 95,
    semanticAuthority: 'Autoridade absoluta sobre o mecanismo de busca e funcionamento do RAG, com vocabulário técnico extremamente contextualizado.'
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
    summary: 'O Google lançou a atualização de Core de Maio de 2026, focando em aprimorar a detecção de experiência prática real (E-E-A-T) e punir conteúdo gerado por IA em massa de baixa qualidade.',
    topics: ['Google Update', 'EEAT', 'SEO', 'Helpful Content'],
    eeatAnalysis: 'O documento oficial do Google serve como principal referencial de autoridade (E-E-A-T) de busca. Nível máximo de confiabilidade.',
    citationProbability: 98,
    semanticAuthority: 'Alta autoridade semântica para diretrizes de busca e indexação, definindo os novos termos e padrões da web.'
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
    summary: 'Um estudo recente mostra que os resumos por IA do Google reduziram a taxa de clique externo em 25%. No entanto, sites estruturados com tabelas e autoridade de marca forte mantêm ótimas taxas de citação.',
    topics: ['AI Overviews', 'Google Search', 'CTR', 'Structured Data'],
    eeatAnalysis: 'Baseado em dados estatísticos e estudo de coorte de 10 mil buscas, o que adiciona credibilidade científica média-alta à análise.',
    citationProbability: 75,
    semanticAuthority: 'Autoridade semântica moderada. O texto é focado em comportamento de busca e análises estatísticas, com relevância técnica razoável.'
  }
];
