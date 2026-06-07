import { SourceRepository, ArticleRepository } from '../../domain/repositories/repositories';
import { Crawler } from '../../domain/services/Crawler';
import { Article } from '../../domain/entities/Article';

export interface CrawlSourcesResult {
  sourcesProcessed: number;
  newArticlesSaved: number;
}

export class CrawlSourcesUseCase {
  constructor(
    private sourceRepository: SourceRepository,
    private articleRepository: ArticleRepository,
    private crawler: Crawler
  ) {}

  async execute(): Promise<CrawlSourcesResult> {
    const activeSources = await this.sourceRepository.listActive();
    let newArticlesSaved = 0;

    for (const source of activeSources) {
      if (!source.rssUrl) {
        continue;
      }

      try {
        const crawlResult = await this.crawler.fetch(source.rssUrl);
        for (const item of crawlResult.items) {
          if (!item.link) {
            continue;
          }

          const existingArticle = await this.articleRepository.findByUrl(item.link);
          if (!existingArticle) {
            const article = Article.create({
              sourceId: source.id,
              title: item.title,
              url: item.link,
              content: item.contentSnippet || item.title,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            });

            await this.articleRepository.save(article);
            newArticlesSaved++;
          }
        }
      } catch (error) {
        // Log error and continue to other sources in production.
        console.error(`Error crawling source ${source.name}:`, error);
      }
    }

    return {
      sourcesProcessed: activeSources.length,
      newArticlesSaved
    };
  }
}
