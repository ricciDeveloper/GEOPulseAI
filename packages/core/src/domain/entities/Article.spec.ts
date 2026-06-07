import { describe, it, expect } from 'vitest';
import { Article } from './Article';

describe('Article Entity', () => {
  it('should create a valid article', () => {
    const article = Article.create({
      sourceId: 'source-uuid',
      title: 'Google Core Update May 2026',
      url: 'https://example.com/google-core-update-2026',
      content: 'This is the main body of the article describing the update...',
      publishedAt: new Date()
    });

    expect(article.id).toBeDefined();
    expect(article.sourceId).toBe('source-uuid');
    expect(article.title).toBe('Google Core Update May 2026');
    expect(article.url).toBe('https://example.com/google-core-update-2026');
    expect(article.content).toBe('This is the main body of the article describing the update...');
    expect(article.publishedAt).toBeInstanceOf(Date);
    expect(article.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error for invalid url', () => {
    expect(() => {
      Article.create({
        sourceId: 'source-uuid',
        title: 'Title',
        url: 'invalid-url',
        content: 'Content',
        publishedAt: new Date()
      });
    }).toThrow();
  });

  it('should throw an error for empty title', () => {
    expect(() => {
      Article.create({
        sourceId: 'source-uuid',
        title: '   ',
        url: 'https://example.com',
        content: 'Content',
        publishedAt: new Date()
      });
    }).toThrow('Title is required');
  });

  it('should throw an error for empty source ID', () => {
    expect(() => {
      Article.create({
        sourceId: '',
        title: 'Title',
        url: 'https://example.com',
        content: 'Content',
        publishedAt: new Date()
      });
    }).toThrow('Source ID is required');
  });

  it('should throw an error for empty content', () => {
    expect(() => {
      Article.create({
        sourceId: 'source-uuid',
        title: 'Title',
        url: 'https://example.com',
        content: '  ',
        publishedAt: new Date()
      });
    }).toThrow('Content is required');
  });
});
