import React from 'react';
import { Article } from '../types/news';
import { formatRelativeTime } from '../utils/dateUtils';
import { ShieldCheck, Layers, Clock, Camera } from 'lucide-react';
import { isEditorialPlaceholder, createEditorialFallbackSvg } from '../utils/imageUtils';

interface TopStoriesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const TopStories: React.FC<TopStoriesProps> = ({
  articles,
  onSelectArticle
}) => {
  if (!articles || articles.length === 0) return null;

  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 4);

  return (
    <section className="w-full py-8 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase">
              Top Stories
            </h2>
            <span className="text-xs font-nepali text-slate-500 font-semibold hidden sm:inline">
              · मुख्य समाचार
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Curated Reports
          </span>
        </div>

        {/* Editorial Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEAD STORY: 7 Columns */}
          <div
            onClick={() => onSelectArticle(leadStory)}
            className="lg:col-span-7 flex flex-col group cursor-pointer"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-slate-900 mb-4">
              <img
                src={leadStory.image_url}
                alt={leadStory.title}
                loading="eager"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(leadStory.category, leadStory.title);
                }}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Developing / Multi-source badge overlay */}
              {leadStory.is_developing && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Developing Story</span>
                </div>
              )}

              {/* Editorial Placeholder vs Authentic Real Photo Indicator */}
              {isEditorialPlaceholder(leadStory.image_url, leadStory.is_editorial_placeholder) ? (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-900 bg-amber-400 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <span>Editorial Graphic</span>
                </span>
              ) : (
                <span className="absolute bottom-2 right-2 text-[10px] text-white/90 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Camera className="w-3 h-3 text-slate-300" />
                  <span>{leadStory.image_attribution}</span>
                </span>
              )}
            </div>

            {/* Zero-Pill Clean Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
              <span className="text-red-700 uppercase tracking-wider">{leadStory.category}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(leadStory.published_at)}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize">{leadStory.verification_status.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Headline */}
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight mb-3 group-hover:text-red-800 transition-colors">
              {leadStory.title}
            </h3>

            {/* Summary */}
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 font-normal">
              {leadStory.summary}
            </p>

            {/* Multi-source corroboration indicator */}
            {leadStory.sources && leadStory.sources.length > 1 && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Corroborated across {leadStory.sources.length} sources: </span>
                  <span>{leadStory.sources.map(s => s.name).join(' · ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECONDARY STORIES: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-200">
            {secondaryStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onSelectArticle(story)}
                className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                    <span className="text-red-700 font-bold uppercase tracking-wider">
                      {story.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{formatRelativeTime(story.published_at)}</span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-1.5">
                    {story.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {story.summary}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">Source:</span>
                    <span>{story.primarySource}</span>
                  </div>
                </div>

                {/* Thumbnail Image */}
                <div className="w-24 sm:w-28 aspect-[4/3] rounded overflow-hidden shrink-0 bg-slate-900 relative">
                  <img
                    src={story.image_url}
                    alt={story.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(story.category, story.title);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {isEditorialPlaceholder(story.image_url, story.is_editorial_placeholder) && (
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold text-amber-900 bg-amber-400 px-1 py-0.2 rounded">
                      Editorial
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
