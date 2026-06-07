import React from 'react';
import Dashboard from '../components/Dashboard';
import { getDashboardStats, getArticlesList, getSourcesList } from './actions';

export const revalidate = 0; // Desabilita cache estático para dados sempre novos

export default async function Home() {
  // Chamadas de API/Database em paralelo
  const [stats, articles, sources] = await Promise.all([
    getDashboardStats(),
    getArticlesList(),
    getSourcesList()
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col bg-zinc-950">
        {/* Marcador de acessibilidade e estrutura semântica para acessibilidade */}
        <h2 className="sr-only">Dashboard de Inteligência e SEO Generativo</h2>
        
        {/* Renderiza o painel interativo principal */}
        <Dashboard stats={stats} articles={articles} sources={sources} />
      </main>

      {/* Footer minimalista de alto nível */}
      <footer className="w-full py-6 bg-black/60 border-t border-zinc-900 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GeoPulse AI. Plataforma Inteligente de Monitoramento e Otimização para Motores Generativos.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/joaoriccideveloper/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
              Linkedin João Ricci
            </a>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-500">Desenvolvido com Clean Architecture & TDD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
