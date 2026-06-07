import { describe, it, expect, vi } from 'vitest';
import { RssCrawler } from './RssCrawler';

describe('RssCrawler Service', () => {
  it('should fetch and parse an RSS feed', async () => {
    // Arrange
    const crawler = new RssCrawler();
    
    // Act
    const result = await crawler.fetch('https://news.google.com/rss');
    
    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should throw an error for invalid RSS feed', async () => {
    const crawler = new RssCrawler();
    
    await expect(crawler.fetch('https://example.com/invalid-rss'))
      .rejects.toThrow();
  });
});
