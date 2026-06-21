'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { 
  RotateCw, PlusCircle, Search, Calendar, ExternalLink, 
  CheckCircle, AlertCircle, Award, Compass,
  TrendingUp, BookOpen, Layers, ShieldCheck, X, Globe, Link, Sparkles,
  Eye, EyeOff, Trash2, Loader2, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addSourceAction, syncSourcesAction, validateUrlAction } from '../app/actions';
import { useViewedPosts } from '../hooks/useViewedPosts';

interface SourceData {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  trustScore: number;
  isActive: boolean;
}

interface ArticleData {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  content: string;
  publishedAt: string;
  geoScore: number;
  aeoScore: number;
  aiVisibility: number;
  summary: string;
  topics: string[];
  eeatAnalysis: string;
  citationProbability: number;
  semanticAuthority: string;
}

interface DashboardProps {
  stats: {
    totalArticles: number;
    totalSources: number;
    avgGeoScore: number;
    avgAeoScore: number;
    avgAiVisibility: number;
  };
  articles: ArticleData[];
  sources: SourceData[];
}

type UrlValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

interface UrlFieldState {
  status: UrlValidationState;
  message?: string;
}

export default function Dashboard({ stats, articles: initialArticles, sources: initialSources }: DashboardProps) {
  const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
  const [sources, setSources] = useState<SourceData[]>(initialSources);
  const [statsData, setStatsData] = useState(stats);

  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceRssUrl, setNewSourceRssUrl] = useState('');
  const [addSourceError, setAddSourceError] = useState('');
  const [urlFieldState, setUrlFieldState] = useState<UrlFieldState>({ status: 'idle' });
  const [rssFieldState, setRssFieldState] = useState<UrlFieldState>({ status: 'idle' });

  const [isPending, startTransition] = useTransition();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Viewed posts hook
  const { isViewed, markAsViewed, viewedCount, clearViewed, isHydrated } = useViewedPosts();

  // Debounce refs for URL validation
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rssDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtered articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.sourceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag ? art.topics.includes(selectedTag) : true;
    const matchesReadFilter = showUnreadOnly ? (isHydrated ? !isViewed(art.id) : true) : true;
    
    return matchesSearch && matchesTag && matchesReadFilter;
  });

  const allTags = Array.from(
    new Set(articles.flatMap(art => art.topics))
  ).slice(0, 15);

  const unreadCount = isHydrated ? articles.filter(art => !isViewed(art.id)).length : articles.length;

  // Real-time URL validation with debounce
  const validateUrlField = (
    url: string,
    setFieldState: React.Dispatch<React.SetStateAction<UrlFieldState>>,
    debounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!url || url.trim() === '') {
      setFieldState({ status: 'idle' });
      return;
    }

    // Basic format check before hitting server
    try { new URL(url); } catch {
      setFieldState({ status: 'invalid', message: 'Formato de URL inválido.' });
      return;
    }

    setFieldState({ status: 'validating' });

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await validateUrlAction(url);
        if (result.isValid) {
          setFieldState({ status: 'valid', message: 'URL acessível (HTTP 200).' });
        } else {
          setFieldState({ 
            status: 'invalid', 
            message: result.error ?? `HTTP ${result.statusCode} — URL deve retornar 200.` 
          });
        }
      } catch {
        setFieldState({ status: 'invalid', message: 'Erro ao validar URL.' });
      }
    }, 800);
  };

  const handleUrlChange = (url: string) => {
    setNewSourceUrl(url);
    validateUrlField(url, setUrlFieldState, urlDebounceRef);
  };

  const handleRssUrlChange = (url: string) => {
    setNewSourceRssUrl(url);
    if (url.trim()) {
      validateUrlField(url, setRssFieldState, rssDebounceRef);
    } else {
      setRssFieldState({ status: 'idle' });
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSourceError('');
    
    if (!newSourceName || !newSourceUrl) {
      setAddSourceError('Nome e URL são obrigatórios');
      return;
    }

    if (urlFieldState.status === 'invalid') {
      setAddSourceError(urlFieldState.message ?? 'URL do site é inválida.');
      return;
    }

    if (rssFieldState.status === 'invalid') {
      setAddSourceError(rssFieldState.message ?? 'URL do RSS é inválida.');
      return;
    }

    const res = await addSourceAction(newSourceName, newSourceUrl, newSourceRssUrl);
    
    if (res.success) {
      const newSrc: SourceData = {
        id: Math.random().toString(),
        name: newSourceName,
        url: newSourceUrl,
        rssUrl: newSourceRssUrl,
        trustScore: 5.0,
        isActive: true
      };
      setSources([newSrc, ...sources]);
      setStatsData(prev => ({ ...prev, totalSources: prev.totalSources + 1 }));
      setNewSourceName('');
      setNewSourceUrl('');
      setNewSourceRssUrl('');
      setUrlFieldState({ status: 'idle' });
      setRssFieldState({ status: 'idle' });
      setIsAddSourceOpen(false);
    } else {
      setAddSourceError(res.error || 'Erro desconhecido ao adicionar fonte');
    }
  };

  const handleSync = () => {
    setSyncStatus('Validando URLs e sincronizando fontes...');
    setSyncSuccess(false);
    startTransition(async () => {
      const res = await syncSourcesAction();
      if (res.success) {
        const skippedMsg = res.skippedSources && res.skippedSources.length > 0
          ? ` | ${res.skippedSources.length} fonte(s) pulada(s) por URL inválida: ${res.skippedSources.join(', ')}.`
          : '';
        setSyncSuccess(true);
        setSyncStatus(
          `Fontes processadas: ${res.sourcesProcessed}. Novos artigos: ${res.newArticlesSaved}.${skippedMsg}`
        );
        setTimeout(() => window.location.reload(), 2500);
      } else {
        setSyncStatus(`Erro na sincronização: ${res.error}`);
        setTimeout(() => setSyncStatus(null), 5000);
      }
    });
  };

  const handleArticleClick = (art: ArticleData) => {
    setSelectedArticle(art);
    markAsViewed(art.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 60) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const renderUrlStatus = (state: UrlFieldState, isOptional = false) => {
    if (isOptional && state.status === 'idle') return null;
    if (state.status === 'idle') return null;
    if (state.status === 'validating') return (
      <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1">
        <Loader2 size={10} className="animate-spin" /> Validando URL...
      </span>
    );
    if (state.status === 'valid') return (
      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
        <CheckCircle size={10} /> {state.message}
      </span>
    );
    if (state.status === 'invalid') return (
      <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
        <AlertCircle size={10} /> {state.message}
      </span>
    );
    return null;
  };

  const isSubmitDisabled = 
    urlFieldState.status === 'validating' ||
    urlFieldState.status === 'invalid' ||
    rssFieldState.status === 'validating' ||
    rssFieldState.status === 'invalid';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-8 mb-8 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-violet-500 animate-pulse glow-purple" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">GeoPulse AI Analytics</span>
          </div>
          <h1 id="dashboard-title" className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
            GEO &amp; Search Updates Hub
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Plataforma didática de monitoramento de SEO Generativo, Answer Engine Optimization e aprendizado contínuo sobre IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-source"
            onClick={() => setIsAddSourceOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors text-sm font-semibold text-zinc-200"
          >
            <PlusCircle size={16} className="text-violet-400" />
            Adicionar Fonte
          </button>
          
          <button
            id="btn-sync-sources"
            disabled={isPending}
            onClick={handleSync}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all font-semibold text-sm text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <RotateCw size={16} className={`text-white ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Sincronizando...' : 'Sincronizar Fontes'}
          </button>
        </div>
      </header>

      {/* Sync Status Banner */}
      <AnimatePresence>
        {syncStatus && (
          <motion.div
            id="sync-status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
              syncSuccess
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200'
            }`}
          >
            {syncSuccess
              ? <CheckCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              : <Sparkles size={16} className="text-indigo-400 animate-pulse shrink-0 mt-0.5" />
            }
            <span>{syncStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-10" aria-label="Estatísticas do Dashboard">
        {/* Total Artigos */}
        <div className="glass-panel rounded-2xl p-6 glow-purple">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-400">Total Artigos</span>
            <BookOpen size={20} className="text-violet-400" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">{statsData.totalArticles}</span>
          <p className="text-xs text-zinc-500 mt-2">Artigos rastreados de feeds RSS</p>
        </div>

        {/* Fontes Ativas */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-400">Fontes Ativas</span>
            <Globe size={20} className="text-cyan-400" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">{statsData.totalSources}</span>
          <p className="text-xs text-zinc-500 mt-2">Canais monitorados em tempo real</p>
        </div>

        {/* GEO Score */}
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Relevância GEO</span>
            <div className="text-3xl font-bold tracking-tight text-white mt-1">{statsData.avgGeoScore}%</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Importância para IA</span>
          </div>
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="circle-progress-bg" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" className="circle-progress-val stroke-violet-500" strokeWidth="4" strokeDasharray="150.7" strokeDashoffset={150.7 - (150.7 * statsData.avgGeoScore) / 100} />
            </svg>
            <span className="absolute text-xs font-bold text-violet-300">{statsData.avgGeoScore}</span>
          </div>
        </div>

        {/* AEO Score */}
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Relevância AEO</span>
            <div className="text-3xl font-bold tracking-tight text-white mt-1">{statsData.avgAeoScore}%</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Respostas Diretas</span>
          </div>
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="circle-progress-bg" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" className="circle-progress-val stroke-cyan-400" strokeWidth="4" strokeDasharray="150.7" strokeDashoffset={150.7 - (150.7 * statsData.avgAeoScore) / 100} />
            </svg>
            <span className="absolute text-xs font-bold text-cyan-300">{statsData.avgAeoScore}</span>
          </div>
        </div>

        {/* AI Visibility */}
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">Impacto Geral</span>
            <div className="text-3xl font-bold tracking-tight text-white mt-1">{statsData.avgAiVisibility}%</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Peso no Ecossistema</span>
          </div>
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="circle-progress-bg" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" className="circle-progress-val stroke-rose-400" strokeWidth="4" strokeDasharray="150.7" strokeDashoffset={150.7 - (150.7 * statsData.avgAiVisibility) / 100} />
            </svg>
            <span className="absolute text-xs font-bold text-rose-300">{statsData.avgAiVisibility}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-6" aria-label="Filtros e Fontes">
          {/* Search */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <Search size={16} className="text-violet-400" />
              Buscar Artigos
            </h2>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="Título, termo, fonte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 pl-9 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
            </div>
          </div>

          {/* Read Filter */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <Eye size={16} className="text-indigo-400" />
              Histórico de Leitura
            </h2>
            <div className="flex flex-col gap-3">
              {/* Progress bar */}
              {isHydrated && (
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                    <span>{viewedCount} lidos</span>
                    <span>{unreadCount} não lidos</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                      style={{ width: articles.length > 0 ? `${(viewedCount / articles.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              )}

              {/* Toggle: unread only */}
              <button
                id="btn-filter-unread"
                onClick={() => setShowUnreadOnly(v => !v)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  showUnreadOnly
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {showUnreadOnly ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showUnreadOnly ? 'Mostrando não lidos' : 'Mostrar apenas não lidos'}
                </span>
                {showUnreadOnly && (
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Clear history */}
              {isHydrated && viewedCount > 0 && (
                <button
                  id="btn-clear-viewed"
                  onClick={clearViewed}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-zinc-800/60 text-xs text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                >
                  <Trash2 size={12} />
                  Limpar histórico ({viewedCount})
                </button>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Compass size={16} className="text-cyan-400" />
                Tópicos Populares
              </h2>
              {selectedTag && (
                <button 
                  onClick={() => setSelectedTag(null)} 
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    selectedTag === tag
                      ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-semibold'
                      : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sources List Panel */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <Layers size={16} className="text-rose-400" />
              Fontes Monitoradas
            </h2>
            <div className="flex flex-col gap-3">
              {sources.map(src => (
                <div key={src.id} className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block truncate max-w-[150px]">{src.name}</span>
                    <a 
                      href={src.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-zinc-500 hover:text-zinc-400 flex items-center gap-1 mt-0.5"
                    >
                      Acessar <ExternalLink size={8} />
                    </a>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {src.trustScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Articles Feed */}
        <main className="lg:col-span-3 flex flex-col gap-5" aria-label="Feed de Artigos">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-zinc-200">
              {filteredArticles.length} Artigos
              {showUnreadOnly && <span className="text-indigo-400 ml-1.5 text-sm font-medium">não lidos</span>}
            </h2>
            <span className="text-xs text-zinc-400">Ordem: Mais Recentes</span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <BookOpen size={48} className="text-zinc-600 mb-4" />
              <h3 className="text-base font-semibold text-zinc-300">Nenhum artigo encontrado</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {showUnreadOnly ? 'Todos os artigos foram lidos! Sincronize para novos conteúdos.' : 'Experimente buscar por outros termos ou sincronizar as fontes.'}
              </p>
            </div>
          ) : (
            filteredArticles.map(art => {
              const viewed = isHydrated && isViewed(art.id);
              return (
                <motion.article
                  key={art.id}
                  layout
                  onClick={() => handleArticleClick(art)}
                  className={`glass-card rounded-2xl p-6 cursor-pointer flex flex-col md:flex-row gap-6 items-start justify-between transition-all duration-300 ${
                    viewed ? 'opacity-60 border border-zinc-800/40' : 'border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {art.sourceName}
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(art.publishedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {/* Viewed badge */}
                      {viewed && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 bg-zinc-800/60 text-zinc-400 border border-zinc-700/50">
                          <CheckCircle size={9} className="text-emerald-500" />
                          Lido
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-2 hover:text-violet-300 transition-colors line-clamp-2 ${
                      viewed ? 'text-zinc-400' : 'text-zinc-100'
                    }`}>
                      {art.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {art.topics.map(topic => (
                        <span key={topic} className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score indicators */}
                  <div className="flex md:flex-col gap-3 shrink-0 self-end md:self-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 w-8">GEO</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreBgColor(art.geoScore)}`}>
                        {art.geoScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 w-8">AEO</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreBgColor(art.aeoScore)}`}>
                        {art.aeoScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 w-8">IMPACT</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreBgColor(art.aiVisibility)}`}>
                        {art.aiVisibility}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </main>
      </div>

      {/* Details Side-Drawer */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto p-6 md:p-8 flex flex-col"
              id="details-drawer"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-400" />
                  <h3 className="text-sm font-bold text-zinc-300">Análise de Impacto &amp; Aprendizado</h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* Viewed indicator in drawer */}
                  {isHydrated && isViewed(selectedArticle.id) && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCheck size={10} />
                      Lido
                    </span>
                  )}
                  <button
                    id="btn-close-drawer"
                    onClick={() => setSelectedArticle(null)}
                    className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Title & Link */}
              <div className="mb-6">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block mb-1">
                  {selectedArticle.sourceName}
                </span>
                <h2 className="text-2xl font-bold text-white leading-snug mb-3">
                  {selectedArticle.title}
                </h2>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Link size={12} /> Acessar artigo original
                </a>
              </div>

              {/* Radial Metrics Row */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-900/80 mb-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-semibold mb-2">Relevância GEO</span>
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${getScoreBgColor(selectedArticle.geoScore)}`}>
                    {selectedArticle.geoScore}%
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-semibold mb-2">Relevância AEO</span>
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${getScoreBgColor(selectedArticle.aeoScore)}`}>
                    {selectedArticle.aeoScore}%
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-semibold mb-2">Impacto Geral</span>
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${getScoreBgColor(selectedArticle.aiVisibility)}`}>
                    {selectedArticle.aiVisibility}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-violet-400" /> Resumo da Novidade
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-900/20 p-4 rounded-xl border border-zinc-900/50">
                    {selectedArticle.summary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-rose-400" /> Valor Educativo
                    </h4>
                    <span className="text-sm font-bold text-rose-400">{selectedArticle.citationProbability}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${selectedArticle.citationProbability}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">Grau de importância para o profissional de marketing/SEO aprender e aplicar esta mudança em sua rotina.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={16} /> O Que Mudou?
                  </h4>
                  <p className="text-xs text-emerald-300/80 leading-relaxed">{selectedArticle.eeatAnalysis}</p>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Award size={16} /> Como se Adaptar?
                  </h4>
                  <p className="text-xs text-cyan-300/80 leading-relaxed">{selectedArticle.semanticAuthority}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Source Modal */}
      <AnimatePresence>
        {isAddSourceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddSourceOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
                <h3 className="text-base font-bold text-white">Cadastrar Nova Fonte RSS</h3>
                <button onClick={() => setIsAddSourceOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Notice about URL validation */}
              <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-start gap-2">
                <ShieldCheck size={13} className="shrink-0 mt-0.5" />
                <span>As URLs são validadas em tempo real. Apenas fontes que retornam <strong>HTTP 200</strong> são aceitas para evitar alucinações do modelo de IA.</span>
              </div>

              <form onSubmit={handleAddSource} className="space-y-4">
                {addSourceError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{addSourceError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="source-name-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nome da Fonte</label>
                  <input
                    id="source-name-input"
                    type="text"
                    placeholder="Ex: Search Engine Watch"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="source-url-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL do Site</label>
                  <div className={`relative rounded-xl border transition-colors ${
                    urlFieldState.status === 'valid' ? 'border-emerald-500/60' :
                    urlFieldState.status === 'invalid' ? 'border-rose-500/60' :
                    urlFieldState.status === 'validating' ? 'border-indigo-500/40' :
                    'border-zinc-800'
                  }`}>
                    <input
                      id="source-url-input"
                      type="url"
                      placeholder="Ex: https://searchenginewatch.com"
                      value={newSourceUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full bg-zinc-900 rounded-xl py-2 px-3 pr-9 text-sm text-zinc-200 focus:outline-none border-0"
                      required
                    />
                    <div className="absolute right-3 top-2.5">
                      {urlFieldState.status === 'validating' && <Loader2 size={14} className="animate-spin text-indigo-400" />}
                      {urlFieldState.status === 'valid' && <CheckCircle size={14} className="text-emerald-400" />}
                      {urlFieldState.status === 'invalid' && <AlertCircle size={14} className="text-rose-400" />}
                    </div>
                  </div>
                  {renderUrlStatus(urlFieldState)}
                </div>

                <div>
                  <label htmlFor="source-rss-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL do Feed RSS <span className="text-zinc-600 normal-case font-normal">(opcional)</span></label>
                  <div className={`relative rounded-xl border transition-colors ${
                    rssFieldState.status === 'valid' ? 'border-emerald-500/60' :
                    rssFieldState.status === 'invalid' ? 'border-rose-500/60' :
                    rssFieldState.status === 'validating' ? 'border-indigo-500/40' :
                    'border-zinc-800'
                  }`}>
                    <input
                      id="source-rss-input"
                      type="url"
                      placeholder="Ex: https://searchenginewatch.com/feed"
                      value={newSourceRssUrl}
                      onChange={(e) => handleRssUrlChange(e.target.value)}
                      className="w-full bg-zinc-900 rounded-xl py-2 px-3 pr-9 text-sm text-zinc-200 focus:outline-none border-0"
                    />
                    <div className="absolute right-3 top-2.5">
                      {rssFieldState.status === 'validating' && <Loader2 size={14} className="animate-spin text-indigo-400" />}
                      {rssFieldState.status === 'valid' && <CheckCircle size={14} className="text-emerald-400" />}
                      {rssFieldState.status === 'invalid' && <AlertCircle size={14} className="text-rose-400" />}
                    </div>
                  </div>
                  {renderUrlStatus(rssFieldState, true)}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSourceOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 text-sm font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-source"
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(urlFieldState.status === 'validating' || rssFieldState.status === 'validating') && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    Salvar Fonte
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
