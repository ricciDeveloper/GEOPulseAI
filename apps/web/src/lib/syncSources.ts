import {
  prisma,
  sourceRepository,
  articleRepository,
  scoreRepository,
  summaryRepository
} from '@geopulse/database';
import { AnalyzeArticleUseCase, CrawlSourcesUseCase } from '@geopulse/core';
import { RssCrawler } from '@geopulse/crawler';
import { GeminiProvider } from '@geopulse/ai';

export async function syncSources() {
  const crawlerUseCase = new CrawlSourcesUseCase(
    sourceRepository,
    articleRepository,
    new RssCrawler()
  );
  const crawlResult = await crawlerUseCase.execute();

  if (crawlResult.newArticlesSaved > 0) {
    const latestArticles = await prisma.article.findMany({
      where: { scores: { none: {} }, deletedAt: null }
    });
    const apiKey = process.env.GEMINI_API_KEY;
    const aiProvider = apiKey
      ? new GeminiProvider(apiKey)
      : {
          analyzeArticle: async () => {
            const randomScore = (min: number, max: number) =>
              Math.floor(Math.random() * (max - min + 1)) + min;
            const geo = randomScore(65, 95);
            const aeo = randomScore(60, 92);

            return {
              summary: 'Análise simulada da notícia e dos principais pontos observados.',
              topics: ['Aprendizado', 'SEO', 'Atualização'],
              geoScore: geo,
              aeoScore: aeo,
              aiVisibility: Math.round(geo * 0.6 + aeo * 0.4),
              eeatAnalysis: 'Análise simulada de relevância e confiabilidade.',
              citationProbability: randomScore(70, 95),
              semanticAuthority: 'Análise semântica simulada.'
            };
          }
        };

    const analyzerUseCase = new AnalyzeArticleUseCase(
      articleRepository,
      scoreRepository,
      summaryRepository,
      aiProvider
    );

    for (const article of latestArticles) {
      await analyzerUseCase.execute(article.id);
    }
  }

  return crawlResult;
}