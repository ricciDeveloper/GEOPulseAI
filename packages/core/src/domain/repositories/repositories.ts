import { Source } from '../entities/Source';
import { Article } from '../entities/Article';
import { Score } from '../entities/Score';
import { Summary } from '../entities/Summary';

export interface SourceRepository {
  findById(id: string): Promise<Source | null>;
  findByUrl(url: string): Promise<Source | null>;
  listActive(): Promise<Source[]>;
  save(source: Source): Promise<Source>;
}

export interface ArticleRepository {
  findById(id: string): Promise<Article | null>;
  findByUrl(url: string): Promise<Article | null>;
  save(article: Article): Promise<Article>;
  listLatest(limit: number): Promise<Article[]>;
}

export interface ScoreRepository {
  save(score: Score): Promise<Score>;
  findByArticleId(articleId: string): Promise<Score | null>;
}

export interface SummaryRepository {
  save(summary: Summary): Promise<Summary>;
  findByArticleId(articleId: string): Promise<Summary | null>;
}
