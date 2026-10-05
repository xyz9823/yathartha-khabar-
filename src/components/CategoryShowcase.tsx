import React from 'react';
import { Article } from '../types/news';
import { formatRelativeTime } from '../utils/dateUtils';
import { ArrowRight } from 'lucide-react';
import { createEditorialFallbackSvg } from '../utils/imageUtils';

interface CategoryShowcaseProps {
  title: string;
  category: string;
  nepaliTitle?: string;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onViewCategory: (category: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  title,
  category,
  nepaliTitle,
  articles,
  onSelectArticle,
  onViewCategory
}) => {
  const categoryArticles = articles
    .filter(a => a.category.toLowerCase() === category.toLowerCase())
    .slice(0, 4);

  if (categoryArticles.length === 0) return null;

  const lead = categoryArticles[0];
  const others = categoryArticles.slice(1, 4);

  return (
    <section className="w-full py-8 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2.5 mb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 uppercase tracking-tight">
              {title}
            </h3>
            {nepaliTitle && (
              <span className="text-xs font-nepali text-slate-500 font-semibold hidden sm:inline">
                · {nepaliTitle}
              </span>
            )}
          </div>
          <button
            onClick={() => onViewCategory(category)}
            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 transition-colors group"
          >
            <span>More in {category}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spotlight Lead */}
          <div
            onClick={() => onSelectArticle(lead)}
            className="lg:col-span-6 flex flex-col group cursor-pointer"
          >
            <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-900 mb-3">
              <img
                src={lead.image_url}
                alt={lead.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(lead.category, lead.title);
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span className="text-red-700 uppercase">{lead.category}</span>
              <span>·</span>
              <span>{formatRelativeTime(lead.published_at)}</span>
              <span>·</span>
              <span>{lead.primarySource}</span>
            </div>
            <h4 className="font-serif text-xl font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-2">
              {lead.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {lead.summary}
            </p>
          </div>

          {/* Side Articles */}
          <div className="lg:col-span-6 flex flex-col divide-y divide-slate-100 justify-between">
            {others.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="py-3 first:pt-0 last:pb-0 flex items-start gap-4 group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{formatRelativeTime(item.published_at)}</span>
                    <span>·</span>
                    <span>{item.primarySource}</span>
                  </div>
                  <h5 className="font-serif text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                    {item.summary}
                  </p>
                </div>
                <div className="w-20 aspect-square rounded overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(item.category, item.title);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
