import React from 'react';
import { Article } from '../types/news';
import { formatRelativeTime } from '../utils/dateUtils';
import { ShieldCheck, Sparkles, RefreshCw, Layers, Radio, Camera } from 'lucide-react';
import { isEditorialPlaceholder, createEditorialFallbackSvg } from '../utils/imageUtils';

interface LatestNewsFeedProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onTriggerCollector: () => void;
  onSimulateBreaking?: () => void;
  isSimulating: boolean;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const LatestNewsFeed: React.FC<LatestNewsFeedProps> = ({
  articles,
  onSelectArticle,
  onTriggerCollector,
  onSimulateBreaking,
  isSimulating,
  activeFilter = 'All',
  onFilterChange
}) => {
  const filterCategories = ['All', 'Nepal', 'Politics', 'Business', 'Aviation', 'Technology', 'Tourism', 'Sports'];

  const filteredArticles = activeFilter === 'All'
    ? articles
    : articles.filter(a => a.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header with Live Stream Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase">
              Latest News
            </h2>
            <span className="text-xs font-nepali text-slate-500 font-semibold hidden md:inline">
              · द्रुत अपडेटहरू (Live)
            </span>
          </div>

          {/* Quick Simulation & Live Intake Triggers (Section 17) */}
          <div className="flex items-center gap-2">
            {onSimulateBreaking && (
              <button
                onClick={onSimulateBreaking}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
                title="Simulate immediate breaking news alert into the live stream"
              >
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Simulate New Breaking News</span>
              </button>
            )}

            <button
              onClick={onTriggerCollector}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              title="Trigger news collector to poll all 8 authorized media feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Polling Feeds...' : 'Poll News Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Buttons (Interactive Tab controls) */}
        {onFilterChange && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-4 mb-4 text-xs">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  activeFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic News Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => {
            const isVeryRecent = index === 0;

            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className={`flex flex-col bg-white rounded-lg border border-slate-200/90 overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
                  isVeryRecent ? 'ring-1 ring-red-500/30' : ''
                }`}
              >
                {/* 1. Article Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(article.category, article.title);
                    }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  {article.is_breaking && (
                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Breaking</span>
                    </div>
                  )}
                  {article.is_developing && (
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>Developing</span>
                    </div>
                  )}

                  {/* Editorial Notice vs Real Photo Credit */}
                  {isEditorialPlaceholder(article.image_url, article.is_editorial_placeholder) ? (
                    <div className="absolute bottom-2 left-2 bg-amber-400 text-amber-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                      Editorial Graphic
                    </div>
                  ) : article.image_attribution ? (
                    <div className="absolute bottom-1.5 right-1.5 max-w-[85%] truncate text-[9px] text-white/90 bg-black/70 backdrop-blur-2xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <span className="truncate">{article.image_attribution}</span>
                    </div>
                  ) : null}
                </div>

                {/* 2. Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clean unboxed metadata with typographic separators (Section 9) */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                      <span className="text-red-700 uppercase tracking-wider font-bold">
                        {article.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-600 font-medium">
                        {formatRelativeTime(article.published_at)}
                      </span>
                      {article.verification_status === 'official_source' && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-emerald-700 flex items-center gap-0.5 text-[11px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Official
                          </span>
                        </>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h3>

                    {/* Short Summary */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {article.summary}
                    </p>
                  </div>

                  {/* Footer metadata: Source & AI Disclosure */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="truncate font-medium text-slate-700">
                      Source: {article.primarySource}
                      {article.sources && article.sources.length > 1 && (
                        <span className="text-slate-500 font-normal"> (+{article.sources.length - 1} more)</span>
                      )}
                    </div>
                    {article.ai_confidence > 0 && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0" title={article.ai_summary_note}>
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>AI Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
