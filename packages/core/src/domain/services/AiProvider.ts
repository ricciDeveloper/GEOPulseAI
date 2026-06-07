export interface ArticleAnalysis {
  summary: string;
  topics: string[];
  geoScore: number;
  aeoScore: number;
  aiVisibility: number;
  eeatAnalysis: string;
  citationProbability: number;
  semanticAuthority: string;
}

export interface AiProvider {
  analyzeArticle(content: string): Promise<ArticleAnalysis>;
}
