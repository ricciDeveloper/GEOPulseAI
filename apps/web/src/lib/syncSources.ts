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
  const apiKey = process.env.GEMINI_API_KEY;

  // Retry descriptions that were not saved in earlier runs whenever Gemini is configured.
  const articlesToAnalyze = apiKey
    ? await prisma.article.findMany({
        where: { summaries: { none: {} }, deletedAt: null },
        orderBy: { publishedAt: 'desc' }
      })
    : crawlResult.newArticlesSaved > 0
      ? await prisma.article.findMany({
          where: { scores: { none: {} }, deletedAt: null },
          orderBy: { publishedAt: 'desc' }
        })
      : [];

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

  let articlesAnalyzed = 0;
  let analysisFailures = 0;
  for (const article of articlesToAnalyze) {
    try {
      await analyzerUseCase.execute(article.id);
      articlesAnalyzed++;
    } catch (error) {
      analysisFailures++;
      console.error('Erro ao gerar descrição para o artigo ' + article.id + ':', error);
    }
  }

  return { ...crawlResult, articlesAnalyzed, analysisFailures };
}
