import { ArticleRepository, ScoreRepository, SummaryRepository } from '../../domain/repositories/repositories';
import { AiProvider } from '../../domain/services/AiProvider';
import { Score } from '../../domain/entities/Score';
import { Summary } from '../../domain/entities/Summary';

export class AnalyzeArticleUseCase {
  constructor(
    private articleRepository: ArticleRepository,
    private scoreRepository: ScoreRepository,
    private summaryRepository: SummaryRepository,
    private aiProvider: AiProvider
  ) {}

  async execute(articleId: string): Promise<{ score: Score; summary: Summary }> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Obter análise da IA
    const analysis = await this.aiProvider.analyzeArticle(article.content);

    // Criar e salvar a pontuação (Score)
    const score = Score.create({
      articleId: article.id,
      geoScore: analysis.geoScore,
      aeoScore: analysis.aeoScore,
      aiVisibility: analysis.aiVisibility
    });
    await this.scoreRepository.save(score);

    // Criar e salvar o resumo executivo estruturado (Summary)
    const summary = Summary.create({
      articleId: article.id,
      content: JSON.stringify({
        summary: analysis.summary,
        topics: analysis.topics,
        eeatAnalysis: analysis.eeatAnalysis,
        citationProbability: analysis.citationProbability,
        semanticAuthority: analysis.semanticAuthority
      }),
      model: 'gemini-2.5-flash'
    });
    await this.summaryRepository.save(summary);

    return { score, summary };
  }
}
