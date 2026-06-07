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

export interface Crawler {
  fetch(url: string): Promise<CrawlResult>;
}
