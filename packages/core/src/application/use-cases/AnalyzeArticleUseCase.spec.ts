import { describe, it, expect, vi } from 'vitest';
import { AnalyzeArticleUseCase } from './AnalyzeArticleUseCase';
import { Article } from '../../domain/entities/Article';
import {
  InMemoryArticleRepository,
  InMemoryScoreRepository,
  InMemorySummaryRepository
} from '../../domain/repositories/InMemoryRepositories';
import { AiProvider, ArticleAnalysis } from '../../domain/services/AiProvider';

describe('AnalyzeArticleUseCase', () => {
  it('should successfully analyze an article and save score and summary', async () => {
    // Arrange
    const articleRepository = new InMemoryArticleRepository();
    const scoreRepository = new InMemoryScoreRepository();
    const summaryRepository = new InMemorySummaryRepository();

    const article = Article.create({
      sourceId: 'source-id',
      title: 'SEO AI Article',
      url: 'https://example.com/seo-ai',
      content: 'This is the article content...',
      publishedAt: new Date()
    });
    await articleRepository.save(article);

    const mockAnalysis: ArticleAnalysis = {
      summary: 'Executive summary text.',
      topics: ['AI', 'SEO'],
      geoScore: 88,
      aeoScore: 79,
      aiVisibility: 92,
      eeatAnalysis: 'Good authority and trust.',
      citationProbability: 85,
      semanticAuthority: 'High semantic relevance.'
    };

    const mockAiProvider: AiProvider = {
      analyzeArticle: vi.fn().mockResolvedValue(mockAnalysis)
    };

    const useCase = new AnalyzeArticleUseCase(
      articleRepository,
      scoreRepository,
      summaryRepository,
      mockAiProvider
    );

    // Act
    const result = await useCase.execute(article.id);

    // Assert
    expect(result.score.articleId).toBe(article.id);
    expect(result.score.geoScore).toBe(88);
    expect(result.score.aeoScore).toBe(79);
    expect(result.score.aiVisibility).toBe(92);

    expect(result.summary.articleId).toBe(article.id);
    expect(result.summary.model).toBe('gemini-2.5-flash');

    const parsedSummary = JSON.parse(result.summary.content);
    expect(parsedSummary.summary).toBe('Executive summary text.');
    expect(parsedSummary.topics).toContain('AI');
    expect(parsedSummary.citationProbability).toBe(85);

    // Check saved in repo
    const savedScore = await scoreRepository.findByArticleId(article.id);
    expect(savedScore).toBeDefined();
    expect(savedScore?.geoScore).toBe(88);

    const savedSummary = await summaryRepository.findByArticleId(article.id);
    expect(savedSummary).toBeDefined();
  });

  it('should throw an error if article does not exist', async () => {
    // Arrange
    const articleRepository = new InMemoryArticleRepository();
    const scoreRepository = new InMemoryScoreRepository();
    const summaryRepository = new InMemorySummaryRepository();

    const mockAiProvider: AiProvider = {
      analyzeArticle: vi.fn()
    };

    const useCase = new AnalyzeArticleUseCase(
      articleRepository,
      scoreRepository,
      summaryRepository,
      mockAiProvider
    );

    // Act & Assert
    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Article not found');
  });
});
