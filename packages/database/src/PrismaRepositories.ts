import { PrismaClient } from '@prisma/client';
import {
  SourceRepository,
  ArticleRepository,
  ScoreRepository,
  SummaryRepository,
  Source as DomainSource,
  Article as DomainArticle,
  Score as DomainScore,
  Summary as DomainSummary
} from '@geopulse/core';

// Mappers
function toDomainSource(prismaSource: any): DomainSource {
  return DomainSource.create({
    id: prismaSource.id,
    name: prismaSource.name,
    url: prismaSource.url,
    rssUrl: prismaSource.rssUrl,
    isActive: prismaSource.isActive,
    trustScore: prismaSource.trustScore,
    createdAt: prismaSource.createdAt,
    updatedAt: prismaSource.updatedAt,
    deletedAt: prismaSource.deletedAt
  });
}

function toDomainArticle(prismaArticle: any): DomainArticle {
  return DomainArticle.create({
    id: prismaArticle.id,
    sourceId: prismaArticle.sourceId,
    title: prismaArticle.title,
    url: prismaArticle.url,
    content: prismaArticle.content,
    rawHtml: prismaArticle.rawHtml,
    publishedAt: prismaArticle.publishedAt,
    createdAt: prismaArticle.createdAt,
    updatedAt: prismaArticle.updatedAt,
    deletedAt: prismaArticle.deletedAt
  });
}

function toDomainScore(prismaScore: any): DomainScore {
  return DomainScore.create({
    id: prismaScore.id,
    articleId: prismaScore.articleId,
    geoScore: prismaScore.geoScore,
    aeoScore: prismaScore.aeoScore,
    aiVisibility: prismaScore.aiVisibility,
    createdAt: prismaScore.createdAt
  });
}

function toDomainSummary(prismaSummary: any): DomainSummary {
  return DomainSummary.create({
    id: prismaSummary.id,
    articleId: prismaSummary.articleId,
    content: prismaSummary.content,
    model: prismaSummary.model,
    createdAt: prismaSummary.createdAt,
    updatedAt: prismaSummary.updatedAt
  });
}

// Repositories
export class PrismaSourceRepository implements SourceRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<DomainSource | null> {
    const source = await this.prisma.source.findUnique({ where: { id } });
    return source ? toDomainSource(source) : null;
  }

  async findByUrl(url: string): Promise<DomainSource | null> {
    const source = await this.prisma.source.findUnique({ where: { url } });
    return source ? toDomainSource(source) : null;
  }

  async listActive(): Promise<DomainSource[]> {
    const sources = await this.prisma.source.findMany({
      where: { isActive: true, deletedAt: null }
    });
    return sources.map(toDomainSource);
  }

  async save(source: DomainSource): Promise<DomainSource> {
    const data = {
      name: source.name,
      url: source.url,
      rssUrl: source.rssUrl,
      isActive: source.isActive,
      trustScore: source.trustScore,
      deletedAt: source.deletedAt
    };

    const saved = await this.prisma.source.upsert({
      where: { id: source.id },
      create: { id: source.id, ...data },
      update: data
    });

    return toDomainSource(saved);
  }
}

export class PrismaArticleRepository implements ArticleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<DomainArticle | null> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    return article ? toDomainArticle(article) : null;
  }

  async findByUrl(url: string): Promise<DomainArticle | null> {
    const article = await this.prisma.article.findUnique({ where: { url } });
    return article ? toDomainArticle(article) : null;
  }

  async save(article: DomainArticle): Promise<DomainArticle> {
    const data = {
      sourceId: article.sourceId,
      title: article.title,
      url: article.url,
      content: article.content,
      rawHtml: article.rawHtml,
      publishedAt: article.publishedAt,
      deletedAt: article.deletedAt
    };

    const saved = await this.prisma.article.upsert({
      where: { id: article.id },
      create: { id: article.id, ...data },
      update: data
    });

    return toDomainArticle(saved);
  }

  async listLatest(limit: number): Promise<DomainArticle[]> {
    const articles = await this.prisma.article.findMany({
      where: { deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: limit
    });
    return articles.map(toDomainArticle);
  }
}

export class PrismaScoreRepository implements ScoreRepository {
  constructor(private prisma: PrismaClient) {}

  async save(score: DomainScore): Promise<DomainScore> {
    const data = {
      articleId: score.articleId,
      geoScore: score.geoScore,
      aeoScore: score.aeoScore,
      aiVisibility: score.aiVisibility
    };

    const saved = await this.prisma.score.upsert({
      where: { id: score.id },
      create: { id: score.id, ...data },
      update: data
    });

    return toDomainScore(saved);
  }

  async findByArticleId(articleId: string): Promise<DomainScore | null> {
    const score = await this.prisma.score.findFirst({
      where: { articleId }
    });
    return score ? toDomainScore(score) : null;
  }
}

export class PrismaSummaryRepository implements SummaryRepository {
  constructor(private prisma: PrismaClient) {}

  async save(summary: DomainSummary): Promise<DomainSummary> {
    const data = {
      articleId: summary.articleId,
      content: summary.content,
      model: summary.model
    };

    const saved = await this.prisma.summary.upsert({
      where: { id: summary.id },
      create: { id: summary.id, ...data },
      update: data
    });

    return toDomainSummary(saved);
  }

  async findByArticleId(articleId: string): Promise<DomainSummary | null> {
    const summary = await this.prisma.summary.findFirst({
      where: { articleId }
    });
    return summary ? toDomainSummary(summary) : null;
  }
}
