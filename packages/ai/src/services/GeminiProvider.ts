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
      Analise o seguinte texto (notícia ou artigo sobre atualização do mercado de busca e IA) sob a ótica de aprendizado e atualização profissional de SEO, GEO (Otimização para IA) e AEO (Resposta Direta).
      
      Gere um JSON contendo os seguintes campos exatamente:
      - summary: Um resumo didático e explicativo da novidade anunciada ou detalhada no texto (de até 3 frases).
      - topics: Um array de strings com os tópicos ou conceitos-chave envolvidos na notícia (limite de 5).
      - geoScore: Uma nota de 0 a 100 indicando a relevância desta novidade/mudança para estratégias de Otimização para IA (GEO).
      - aeoScore: Uma nota de 0 a 100 indicando a relevância desta novidade/mudança para buscas de resposta direta (AEO).
      - aiVisibility: Uma nota de 0 a 100 representando o Impacto Geral que essa notícia causa no ecossistema de buscas.
      - eeatAnalysis: Explicação clara de "O Que Mudou" (de até 3 frases) detalhando a atualização técnica ou a novidade.
      - citationProbability: Uma nota de 0 a 100 representando o "Valor Educativo" (o quão crucial é para um profissional dominar e entender esta mudança).
      - semanticAuthority: Guia prático de "Como se Adaptar" (de até 3 frases) com recomendações de ações concretas para SEOs e criadores de conteúdo.
      
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
