import { describe, it, expect } from 'vitest';
import { Source } from './Source';

describe('Source Entity', () => {
  it('should create a valid source with default active and trust score', () => {
    const source = Source.create({
      name: 'Search Engine Land',
      url: 'https://searchengineland.com',
      rssUrl: 'https://searchengineland.com/feed'
    });

    expect(source.id).toBeDefined();
    expect(source.name).toBe('Search Engine Land');
    expect(source.url).toBe('https://searchengineland.com');
    expect(source.rssUrl).toBe('https://searchengineland.com/feed');
    expect(source.isActive).toBe(true);
    expect(source.trustScore).toBe(0.0);
    expect(source.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error for invalid url', () => {
    expect(() => {
      Source.create({
        name: 'Invalid Source',
        url: 'not-a-url'
      });
    }).toThrow();
  });

  it('should throw an error for invalid rssUrl', () => {
    expect(() => {
      Source.create({
        name: 'Invalid Source',
        url: 'https://example.com',
        rssUrl: 'not-a-url'
      });
    }).toThrow();
  });

  it('should throw an error for empty name', () => {
    expect(() => {
      Source.create({
        name: '   ',
        url: 'https://example.com'
      });
    }).toThrow('Name is required');
  });
});
