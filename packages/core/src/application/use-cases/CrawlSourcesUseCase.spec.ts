import { describe, it, expect, vi } from 'vitest';
import { CrawlSourcesUseCase } from './CrawlSourcesUseCase';
import { Source } from '../../domain/entities/Source';
import {
  InMemorySourceRepository,
  InMemoryArticleRepository
} from '../../domain/repositories/InMemoryRepositories';
import { Crawler } from '../../domain/services/Crawler';

describe('CrawlSourcesUseCase', () => {
  it('should crawl active sources and save new articles', async () => {
    // Arrange
    const sourceRepository = new InMemorySourceRepository();
    const articleRepository = new InMemoryArticleRepository();

    const activeSource = Source.create({
      name: 'SEO Blog',
      url: 'https://seoblog.com',
      rssUrl: 'https://seoblog.com/rss'
    });
    await sourceRepository.save(activeSource);

    const mockCrawler: Crawler = {
      fetch: vi.fn().mockResolvedValue({
        title: 'SEO Blog Feed',
        items: [
          {
            title: 'New SEO Trend',
            link: 'https://seoblog.com/new-trend',
            pubDate: new Date().toISOString(),
            contentSnippet: 'This is content'
          }
        ]
      })
    };

    const useCase = new CrawlSourcesUseCase(sourceRepository, articleRepository, mockCrawler);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.sourcesProcessed).toBe(1);
    expect(result.newArticlesSaved).toBe(1);

    const savedArticle = await articleRepository.findByUrl('https://seoblog.com/new-trend');
    expect(savedArticle).toBeDefined();
    expect(savedArticle?.title).toBe('New SEO Trend');
  });

  it('should not save duplicate articles', async () => {
    // Arrange
    const sourceRepository = new InMemorySourceRepository();
    const articleRepository = new InMemoryArticleRepository();

    const activeSource = Source.create({
      name: 'SEO Blog',
      url: 'https://seoblog.com',
      rssUrl: 'https://seoblog.com/rss'
    });
    await sourceRepository.save(activeSource);

    const mockCrawler: Crawler = {
      fetch: vi.fn().mockResolvedValue({
        title: 'SEO Blog Feed',
        items: [
          {
            title: 'New SEO Trend',
            link: 'https://seoblog.com/new-trend',
            pubDate: new Date().toISOString(),
            contentSnippet: 'This is content'
          }
        ]
      })
    };

    const useCase = new CrawlSourcesUseCase(sourceRepository, articleRepository, mockCrawler);

    // Run first crawl
    await useCase.execute();

    // Run second crawl
    const result = await useCase.execute();

    // Assert
    expect(result.newArticlesSaved).toBe(0);
  });

  it('should continue crawling other sources if one fails', async () => {
    // Arrange
    const sourceRepository = new InMemorySourceRepository();
    const articleRepository = new InMemoryArticleRepository();

    const failingSource = Source.create({
      name: 'Failing Blog',
      url: 'https://fail.com',
      rssUrl: 'https://fail.com/rss'
    });
    const workingSource = Source.create({
      name: 'Working Blog',
      url: 'https://work.com',
      rssUrl: 'https://work.com/rss'
    });
    await sourceRepository.save(failingSource);
    await sourceRepository.save(workingSource);

    const mockCrawler: Crawler = {
      fetch: vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('fail.com')) {
          throw new Error('Network failure');
        }
        return {
          title: 'Working Feed',
          items: [
            {
              title: 'Work Article',
              link: 'https://work.com/article1',
              pubDate: new Date().toISOString()
            }
          ]
        };
      })
    };

    const useCase = new CrawlSourcesUseCase(sourceRepository, articleRepository, mockCrawler);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.sourcesProcessed).toBe(2);
    expect(result.newArticlesSaved).toBe(1);
    
    const saved = await articleRepository.findByUrl('https://work.com/article1');
    expect(saved).toBeDefined();
  });
});
