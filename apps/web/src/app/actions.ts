'use server';

import { prisma, sourceRepository, articleRepository } from '@geopulse/database';
import { Source, Article } from '@geopulse/core';
import { UrlValidator } from '@geopulse/crawler';
import { mockArticles, mockSources } from '../lib/mockData';
import { syncSources } from '../lib/syncSources';
import { revalidatePath } from 'next/cache';

const urlValidator = new UrlValidator();

/**
 * Server Action: validates a single URL and returns the result.
 * Used by the "Add Source" form for real-time feedback.
 */
export async function validateUrlAction(url: string) {
  if (!url || url.trim() === '') {
    return { isValid: false, statusCode: null, error: 'URL não pode estar vazia.' };
  }
  const result = await urlValidator.validateUrl(url);
  return result;
}

// Helper para semear o banco de dados se estiver vazio
async function ensureSeed() {
  try {
    const sourceCount = await prisma.source.count();
    if (sourceCount === 0) {
      console.log('Banco de dados vazio. Semeando fontes e artigos mockados...');
      
      // Semeia Fontes
      for (const ms of mockSources) {
        const src = Source.create({
          id: ms.id,
          name: ms.name,
          url: ms.url,
          rssUrl: ms.rssUrl,
          trustScore: ms.trustScore,
          isActive: ms.isActive
        });
        await sourceRepository.save(src);
      }
      
      // Semeia Artigos, Scores e Summaries
      for (const ma of mockArticles) {
        const art = Article.create({
          id: ma.id,
          sourceId: ma.sourceId,
          title: ma.title,
          url: ma.url,
          content: ma.content,
          publishedAt: new Date(ma.publishedAt)
        });
        await articleRepository.save(art);
        
        await prisma.score.create({
          data: {
            id: ma.id + '-sc',
            articleId: ma.id,
            geoScore: ma.geoScore,
            aeoScore: ma.aeoScore,
            aiVisibility: ma.aiVisibility
          }
        });
        
        await prisma.summary.create({
          data: {
            id: ma.id + '-sum',
            articleId: ma.id,
            content: JSON.stringify({
              summary: ma.summary,
              topics: ma.topics,
              eeatAnalysis: ma.eeatAnalysis,
              citationProbability: ma.citationProbability,
              semanticAuthority: ma.semanticAuthority
            }),
            model: 'gemini-2.5-flash'
          }
        });
      }
      console.log('Semeadura concluída com sucesso!');
    }
  } catch (error) {
    console.error('Erro na semeadura do banco de dados:', error);
  }
}

export async function getDashboardStats() {
  await ensureSeed();
  
  try {
    const totalArticles = await prisma.article.count();
    const totalSources = await prisma.source.count({ where: { isActive: true } });
    
    const scores = await prisma.score.aggregate({
      _avg: {
        geoScore: true,
        aeoScore: true,
        aiVisibility: true
      }
    });

    return {
      totalArticles,
      totalSources,
      avgGeoScore: Math.round(scores._avg.geoScore || 0),
      avgAeoScore: Math.round(scores._avg.aeoScore || 0),
      avgAiVisibility: Math.round(scores._avg.aiVisibility || 0)
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalArticles: 0,
      totalSources: 0,
      avgGeoScore: 0,
      avgAeoScore: 0,
      avgAiVisibility: 0
    };
  }
}

export async function getArticlesList() {
  await ensureSeed();

  try {
    const articles = await prisma.article.findMany({
      where: { deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      include: {
        source: true,
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        summaries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return articles.map((art: any) => {
      const latestScore = art.scores[0];
      const latestSummary = art.summaries[0];
      
      let parsedContent = {
        summary: 'Sem resumo disponível.',
        topics: [] as string[],
        eeatAnalysis: 'Sem análise disponível.',
        citationProbability: 0,
        semanticAuthority: 'Sem análise disponível.'
      };

      if (latestSummary) {
        try {
          parsedContent = JSON.parse(latestSummary.content);
        } catch {
          parsedContent.summary = latestSummary.content;
        }
      }

      return {
        id: art.id,
        sourceId: art.sourceId,
        sourceName: art.source.name,
        title: art.title,
        url: art.url,
        content: art.content,
        publishedAt: art.publishedAt.toISOString(),
        geoScore: latestScore?.geoScore ?? 0,
        aeoScore: latestScore?.aeoScore ?? 0,
        aiVisibility: latestScore?.aiVisibility ?? 0,
        ...parsedContent
      };
    });
  } catch (error) {
    console.error('Erro ao obter lista de artigos:', error);
    return [];
  }
}

export async function getSourcesList() {
  await ensureSeed();
  
  try {
    const sources = await prisma.source.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
    
    return sources.map((s: any) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      rssUrl: s.rssUrl || '',
      trustScore: s.trustScore,
      isActive: s.isActive
    }));
  } catch (error) {
    console.error('Erro ao obter fontes:', error);
    return [];
  }
}

export async function addSourceAction(name: string, url: string, rssUrl: string) {
  try {
    // Validate site URL — must return HTTP 200
    const siteValidation = await urlValidator.validateUrl(url);
    if (!siteValidation.isValid) {
      return {
        success: false,
        error: `URL do site inválida: ${siteValidation.error ?? `HTTP ${siteValidation.statusCode}`}. Apenas URLs que retornam status 200 são aceitas.`
      };
    }

    // Validate RSS URL if provided
    if (rssUrl && rssUrl.trim() !== '') {
      const rssValidation = await urlValidator.validateUrl(rssUrl);
      if (!rssValidation.isValid) {
        return {
          success: false,
          error: `URL do RSS inválida: ${rssValidation.error ?? `HTTP ${rssValidation.statusCode}`}. Apenas URLs que retornam status 200 são aceitas.`
        };
      }
    }

    const source = Source.create({
      name,
      url,
      rssUrl: rssUrl || null
    });
    
    await sourceRepository.save(source);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar nova fonte:', error);
    return { success: false, error: error.message };
  }
}

export async function syncSourcesAction() {
  try {
    const crawlResult = await syncSources();
    revalidatePath('/');
    return {
      success: true,
      sourcesProcessed: crawlResult.sourcesProcessed,
      newArticlesSaved: crawlResult.newArticlesSaved,
      failedSources: crawlResult.failedSources
    };
  } catch (error: any) {
    console.error('Erro na sincronização de fontes:', error);
    return { success: false, error: error.message };
  }
}
