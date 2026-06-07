import Parser from 'rss-parser';

export interface CrawledItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
}

export interface CrawlResult {
  title: string;
  items: CrawledItem[];
}

export class RssCrawler {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'GeoPulse-Bot/1.0',
      }
    });
  }

  async fetch(url: string): Promise<CrawlResult> {
    try {
      const feed = await this.parser.parseURL(url);
      
      return {
        title: feed.title || 'Unknown Source',
        items: feed.items.map(item => ({
          title: item.title || 'No title',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          contentSnippet: item.contentSnippet || item.content || ''
        }))
      };
    } catch (error: any) {
      throw new Error(`Failed to crawl RSS feed: ${error.message}`);
    }
  }
}
