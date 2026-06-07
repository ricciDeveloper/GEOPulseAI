import { describe, it, expect } from 'vitest';
import { Score } from './Score';

describe('Score Entity', () => {
  it('should create a valid score', () => {
    const score = Score.create({
      articleId: 'article-uuid',
      geoScore: 85,
      aeoScore: 72,
      aiVisibility: 90
    });

    expect(score.id).toBeDefined();
    expect(score.articleId).toBe('article-uuid');
    expect(score.geoScore).toBe(85);
    expect(score.aeoScore).toBe(72);
    expect(score.aiVisibility).toBe(90);
    expect(score.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error for empty article ID', () => {
    expect(() => {
      Score.create({
        articleId: '',
        geoScore: 50,
        aeoScore: 50,
        aiVisibility: 50
      });
    }).toThrow('Article ID is required');
  });

  it('should throw an error for score bounds', () => {
    expect(() => {
      Score.create({
        articleId: 'article-uuid',
        geoScore: -5,
        aeoScore: 50,
        aiVisibility: 50
      });
    }).toThrow('GEO Score must be between 0 and 100');

    expect(() => {
      Score.create({
        articleId: 'article-uuid',
        geoScore: 50,
        aeoScore: 105,
        aiVisibility: 50
      });
    }).toThrow('AEO Score must be between 0 and 100');

    expect(() => {
      Score.create({
        articleId: 'article-uuid',
        geoScore: 50,
        aeoScore: 50,
        aiVisibility: 150
      });
    }).toThrow('AI Visibility Score must be between 0 and 100');
  });
});
