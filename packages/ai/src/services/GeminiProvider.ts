import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { AiProvider, ArticleAnalysis } from '@geopulse/core';

export const AnalysisSchema = z.object({
  summary: z.string(),
  topics: z.array(z.string()),
  geoScore: z.number().min(0).max(100),
  aeoScore: z.number().min(0).max(100),
  aiVisibility: z.number().min(0).max(100),
  eeatAnalysis: z.string(),
  citationProbability: z.number().min(0).max(100),
  semanticAuthority: z.string()
});

export class GeminiProvider implements AiProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required for GeminiProvider');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeArticle(content: string, modelName: string = 'gemini-2.5-flash'): Promise<ArticleAnalysis> {
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `
      Analise o seguinte texto sob a ótica de mecanismos de busca por IA (AEO), visibilidade de IA e otimização para IA (GEO).
      
      Gere um JSON contendo os seguintes campos exatamente:
      - summary: Um resumo executivo claro de até 3 frases.
      - topics: Um array de strings com tópicos/tags principais do texto (limite de 5).
      - geoScore: Uma nota de 0 a 100 indicando quão otimizado o texto está para mecanismos de busca por IA (Generative Engine Optimization).
      - aeoScore: Uma nota de 0 a 100 de otimização para resposta direta (Answer Engine Optimization).
      - aiVisibility: Uma nota de 0 a 100 de visibilidade e chance do texto ser recomendado/citado por IAs.
      - eeatAnalysis: Uma análise sucinta de 2 a 3 frases dos elementos de E-E-A-T (Experiência, Especialidade, Autoridade e Confiabilidade).
      - citationProbability: Uma nota de 0 a 100 representando a probabilidade de citação direta do texto como fonte.
      - semanticAuthority: Uma análise sucinta de 2 a 3 frases da autoridade semântica e densidade de tópicos correlatos no texto.
      
      IMPORTANTE: Retorne APENAS o JSON válido. Não use formatação markdown de código como \`\`\`json.
      
      Texto:
      ${content}
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Sanitiza caso o modelo retorne com markdown
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(cleanedText);
      return AnalysisSchema.parse(parsedData);
    } catch (error: any) {
      throw new Error(`Failed to generate article analysis: ${error.message}`);
    }
  }

  // Mantido para compatibilidade se necessário em outras partes legadas
  async summarize(content: string, modelName: string = 'gemini-2.5-flash'): Promise<{ summary: string; topics: string[]; impactScore?: number }> {
    const analysis = await this.analyzeArticle(content, modelName);
    return {
      summary: analysis.summary,
      topics: analysis.topics,
      impactScore: Math.round(analysis.geoScore / 10)
    };
  }
}
