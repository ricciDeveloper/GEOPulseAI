import { SourceRepository, ArticleRepository } from '../../domain/repositories/repositories';
import { Crawler } from '../../domain/services/Crawler';
import { Article } from '../../domain/entities/Article';

export interface CrawlSourcesResult {
  sourcesProcessed: number;
  newArticlesSaved: number;
  failedSources: string[];
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
    const failedSources = new Set<string>();

    const crawlResults = await Promise.all(activeSources.map(async source => {
      if (!source.rssUrl) return null;
      try {
        return { source, items: (await this.crawler.fetch(source.rssUrl)).items };
      } catch (error) {
        console.error(`Error crawling source ${source.name}:`, error);
        failedSources.add(source.name);
        return null;
      }
    }));

    for (const crawlResult of crawlResults) {
      if (!crawlResult) continue;
      for (const item of crawlResult.items) {
        if (!item.link) continue;
        try {
          const existingArticle = await this.articleRepository.findByUrl(item.link);
          if (!existingArticle) {
            const article = Article.create({
              sourceId: crawlResult.source.id,
              title: item.title,
              url: item.link,
              content: item.contentSnippet || item.title,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            });

            await this.articleRepository.save(article);
            newArticlesSaved++;
          }
        } catch (error) {
          console.error(`Error saving article from source ${crawlResult.source.name}:`, error);
          failedSources.add(crawlResult.source.name);
        }
      }
    }

    return {
      sourcesProcessed: activeSources.length,
      newArticlesSaved,
      failedSources: [...failedSources]
    };
  }
}
