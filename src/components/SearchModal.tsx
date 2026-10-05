import React, { useState, useMemo } from 'react';
import { Article } from '../types/news';
import { formatRelativeTime } from '../utils/dateUtils';
import { Search, X, Calendar, Filter, Layers, Clock } from 'lucide-react';
import { createEditorialFallbackSvg } from '../utils/imageUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');

  // Extract unique categories and sources from existing articles
  const categories = useMemo(() => {
    const set = new Set(articles.map(a => a.category));
    return ['All', ...Array.from(set)];
  }, [articles]);

  const sources = useMemo(() => {
    const set = new Set(articles.map(a => a.primarySource));
    return ['All', ...Array.from(set)];
  }, [articles]);

  const results = useMemo(() => {
    return articles.filter(a => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.primarySource.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All' ||
        a.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSource =
        selectedSource === 'All' ||
        a.primarySource.toLowerCase() === selectedSource.toLowerCase();

      return matchesQuery && matchesCat && matchesSource;
    });
  }, [articles, query, selectedCategory, selectedSource]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by headline, keyword, entity, or source..."
            autoFocus
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-base focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/80 rounded"
          >
            ESC
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-medium focus:outline-hidden"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500">Source:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-medium focus:outline-hidden"
            >
              {sources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-slate-400 text-xs">
            {results.length} stories found
          </span>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No reports matched your query.</p>
              <p className="text-xs text-slate-400">Try broader terms like "Kathmandu", "Airport", or "Economy".</p>
            </div>
          ) : (
            results.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex gap-4 transition-colors group"
              >
                <div className="w-24 sm:w-28 aspect-[16/10] rounded overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(article.category, article.title);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1">
                    <span className="text-red-700 uppercase">{article.category}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(article.published_at)}</span>
                    <span>·</span>
                    <span className="text-slate-600">{article.primarySource}</span>
                  </div>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                    {article.summary}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
