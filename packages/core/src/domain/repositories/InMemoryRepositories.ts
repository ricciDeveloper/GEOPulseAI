import { Source } from '../entities/Source';
import { Article } from '../entities/Article';
import { Score } from '../entities/Score';
import { Summary } from '../entities/Summary';
import {
  SourceRepository,
  ArticleRepository,
  ScoreRepository,
  SummaryRepository
} from './repositories';

export class InMemorySourceRepository implements SourceRepository {
  private sources: Source[] = [];

  async findById(id: string): Promise<Source | null> {
    return this.sources.find(s => s.id === id) || null;
  }

  async findByUrl(url: string): Promise<Source | null> {
    return this.sources.find(s => s.url === url) || null;
  }

  async listActive(): Promise<Source[]> {
    return this.sources.filter(s => s.isActive && !s.deletedAt);
  }

  async save(source: Source): Promise<Source> {
    const index = this.sources.findIndex(s => s.id === source.id);
    if (index >= 0) {
      this.sources[index] = source;
    } else {
      this.sources.push(source);
    }
    return source;
  }
}

export class InMemoryArticleRepository implements ArticleRepository {
  private articles: Article[] = [];

  async findById(id: string): Promise<Article | null> {
    return this.articles.find(a => a.id === id) || null;
  }

  async findByUrl(url: string): Promise<Article | null> {
    return this.articles.find(a => a.url === url) || null;
  }

  async save(article: Article): Promise<Article> {
    const index = this.articles.findIndex(a => a.id === article.id);
    if (index >= 0) {
      this.articles[index] = article;
    } else {
      this.articles.push(article);
    }
    return article;
  }

  async listLatest(limit: number): Promise<Article[]> {
    return [...this.articles]
      .filter(a => !a.deletedAt)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }
}

export class InMemoryScoreRepository implements ScoreRepository {
  private scores: Score[] = [];

  async save(score: Score): Promise<Score> {
    const index = this.scores.findIndex(s => s.id === score.id);
    if (index >= 0) {
      this.scores[index] = score;
    } else {
      this.scores.push(score);
    }
    return score;
  }

  async findByArticleId(articleId: string): Promise<Score | null> {
    return this.scores.find(s => s.articleId === articleId) || null;
  }
}

export class InMemorySummaryRepository implements SummaryRepository {
  private summaries: Summary[] = [];

  async save(summary: Summary): Promise<Summary> {
    const index = this.summaries.findIndex(s => s.id === summary.id);
    if (index >= 0) {
      this.summaries[index] = summary;
    } else {
      this.summaries.push(summary);
    }
    return summary;
  }

  async findByArticleId(articleId: string): Promise<Summary | null> {
    return this.summaries.find(s => s.articleId === articleId) || null;
  }
}
