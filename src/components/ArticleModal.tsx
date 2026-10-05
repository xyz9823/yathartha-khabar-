import React, { useState } from 'react';
import { Article } from '../types/news';
import { formatNepalTime, formatRelativeTime } from '../utils/dateUtils';
import { isEditorialPlaceholder, createEditorialFallbackSvg } from '../utils/imageUtils';
import {
  X,
  Share2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Check,
  Bookmark,
  Printer,
  Camera,
  Info
} from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  relatedArticles,
  onSelectArticle
}) => {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title} — Yathartha Khabar: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${article.title} via @YatharthaKhabar`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Sticky Header with Action Buttons */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-red-700 font-bold uppercase tracking-wider">{article.category}</span>
            <span>·</span>
            <span>{formatRelativeTime(article.published_at)}</span>
            {article.is_developing && (
              <>
                <span>·</span>
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Developing
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Copy Story Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex"
              title="Print Article"
            >
              <Printer className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
          {/* Category & Verification Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-900">{article.primarySource}</span>
              <span>·</span>
              <span>Published {formatNepalTime(article.published_at)}</span>
              {article.updated_at && article.updated_at !== article.published_at && (
                <>
                  <span>·</span>
                  <span className="text-slate-500">Updated {formatNepalTime(article.updated_at)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: {article.verification_status.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight">
            {article.title}
          </h1>

          {/* Standfirst / Lead Summary */}
          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-red-600 text-slate-800 text-base sm:text-lg leading-relaxed font-serif italic">
            {article.summary}
          </div>

          {/* Hero Image */}
          <div className="space-y-2">
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-950 shadow-sm border border-slate-200">
              <img
                src={article.image_url}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg(article.category, article.title);
                }}
                className="w-full h-full object-cover"
              />

              {/* Status Badge Overlay */}
              {isEditorialPlaceholder(article.image_url, article.is_editorial_placeholder) ? (
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                  <Info className="w-3.5 h-3.5 text-slate-950" />
                  <span>Editorial Graphic Notice</span>
                </div>
              ) : (
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Photo Documentation</span>
                </div>
              )}
            </div>

            {/* Editorial Notice Explanation or Authentic Photo Attributions */}
            {isEditorialPlaceholder(article.image_url, article.is_editorial_placeholder) ? (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Yathartha Khabar Editorial Imagery Standards</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  No verified photograph from the event location is currently authorized for publication. Under our core principles, Yathartha Khabar strictly refuses to use deceptive or generic stock photos to simulate real news events. Verified field imagery will be appended once released by official authorities.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 gap-2">
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-slate-500" />
                    <span>{article.image_attribution}</span>
                  </div>
                  {article.image_source && (
                    <div className="text-[11px] text-slate-500">
                      Archive: {article.image_source}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px] text-slate-600">
                    {article.image_license}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Source Corroboration Alert Box */}
          {article.sources && article.sources.length > 1 && (
            <div className="p-4 bg-slate-900 text-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Multi-Source Merged Story</span>
              </div>
              <p className="text-xs text-slate-300">
                This story synthesizes corroborated reporting from multiple authorized desks to provide a single, verified developing account rather than fragmented articles.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {article.sources.map((src) => (
                  <span key={src.id} className="bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-medium">
                    {src.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Developing Story Timeline */}
          {article.timeline && article.timeline.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Developing Timeline of Updates</span>
              </h3>
              <div className="space-y-3 text-xs">
                {article.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pl-2 border-l-2 border-slate-300">
                    <span className="font-mono font-bold text-slate-700 whitespace-nowrap">{item.time}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 mr-1.5">{item.source}:</span>
                      <span className="text-slate-700">{item.update}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Narrative Content */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-4">
            {article.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* AI-Assisted Transparency Disclaimer (Section 10 Requirement) */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transparency Note: </span>
              <span>
                {article.ai_summary_note || 'AI-assisted summary based on available authorized sources.'} Yathartha Khabar cross-verifies facts against primary regulatory documents and news registries prior to publication.
              </span>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Topic Tags:</span>
              {article.tags.map((tag) => (
                <span key={tag} className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Sources for this report (Section 10 Requirement) */}
          <div className="p-5 bg-slate-100 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Sources for this report
            </h3>
            <p className="text-xs text-slate-600">
              Yathartha Khabar maintains strict source attribution standards. The following authorized reports contributed to this coverage:
            </p>
            <ul className="space-y-2 text-xs">
              {article.sources.map((src) => (
                <li key={src.id} className="flex items-center justify-between p-2.5 bg-white rounded border border-slate-200">
                  <div className="truncate pr-3">
                    <span className="font-semibold text-slate-900">{src.name}</span>
                    {src.snippet && (
                      <span className="text-slate-500 block truncate text-[11px] mt-0.5">
                        "{src.snippet}"
                      </span>
                    )}
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 font-semibold text-red-700 hover:text-red-900 transition-colors"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Share Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Share this verified report
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={handleShareTwitter}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded transition-colors"
              >
                X (Twitter)
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-950">
                Related Stories in {article.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors cursor-pointer flex gap-3 group"
                  >
                    <div className="w-20 aspect-square rounded overflow-hidden shrink-0 bg-slate-100">
                      <img src={rel.image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-red-700 uppercase">{rel.category}</span>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-2 mt-0.5">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {formatRelativeTime(rel.published_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
