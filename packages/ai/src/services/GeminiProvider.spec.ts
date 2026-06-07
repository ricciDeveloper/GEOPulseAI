import { describe, it, expect, vi } from 'vitest';
import { GeminiProvider } from './GeminiProvider';

// Mock do SDK do Google
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              summary: 'Resumo teste',
              topics: ['AI'],
              geoScore: 85,
              aeoScore: 75,
              aiVisibility: 90,
              eeatAnalysis: 'High E-E-A-T',
              citationProbability: 80,
              semanticAuthority: 'High semantic relevance'
            })
          }
        })
      })
    }))
  };
});

describe('GeminiProvider', () => {
  it('should generate a structured article analysis', async () => {
    const provider = new GeminiProvider('fake-api-key');
    
    const result = await provider.analyzeArticle('Texto longo de teste', 'gemini-2.5-flash');
    
    expect(result).toBeDefined();
    expect(result.summary).toBe('Resumo teste');
    expect(result.topics).toContain('AI');
    expect(result.geoScore).toBe(85);
    expect(result.aeoScore).toBe(75);
    expect(result.aiVisibility).toBe(90);
    expect(result.eeatAnalysis).toBe('High E-E-A-T');
    expect(result.citationProbability).toBe(80);
    expect(result.semanticAuthority).toBe('High semantic relevance');
  });

  it('should support legacy summarize method', async () => {
    const provider = new GeminiProvider('fake-api-key');
    
    const result = await provider.summarize('Texto longo de teste', 'gemini-2.5-flash');
    
    expect(result).toBeDefined();
    expect(result.summary).toBe('Resumo teste');
    expect(result.topics).toContain('AI');
    expect(result.impactScore).toBe(9); // round(85/10) = 9
  });
});
