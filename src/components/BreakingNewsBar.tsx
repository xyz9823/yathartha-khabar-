import React from 'react';
import { Article } from '../types/news';
import { formatNepalTime } from '../utils/dateUtils';
import { ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

interface BreakingNewsBarProps {
  breakingArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({
  breakingArticles,
  onSelectArticle
}) => {
  if (!breakingArticles || breakingArticles.length === 0) return null;

  const current = breakingArticles[0];

  return (
    <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-md relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Breaking indicator badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded text-xs font-black tracking-wider uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
            </span>
            <span>BREAKING</span>
          </div>
          <span className="text-red-100 text-xs font-mono font-medium hidden sm:inline">
            {formatNepalTime(current.updated_at || current.published_at)}
          </span>
        </div>

        {/* Center: Headline & Source context */}
        <div
          onClick={() => onSelectArticle(current)}
          className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer group"
        >
          <p className="text-sm md:text-base font-semibold text-white tracking-tight truncate group-hover:underline">
            {current.title}
          </p>
          {current.is_developing && (
            <span className="shrink-0 text-[11px] bg-red-900/60 text-red-100 font-bold px-2 py-0.5 rounded border border-red-400/30">
              DEVELOPING
            </span>
          )}
        </div>

        {/* Right: Verification Status & Source info */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="hidden lg:flex items-center gap-1 text-red-100 bg-red-800/40 px-2 py-1 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="capitalize">{current.verification_status.replace('_', ' ')}</span>
            <span className="text-red-300">·</span>
            <span className="font-medium text-white">{current.primarySource}</span>
          </div>

          <button
            onClick={() => onSelectArticle(current)}
            className="flex items-center gap-1 font-semibold text-xs text-white hover:text-red-100 transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded"
          >
            <span>Read Story</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
