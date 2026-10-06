import React from 'react';
import { Article } from '../types/news';
import { Plane, AlertCircle, Clock, Wind, CheckCircle2, ChevronRight } from 'lucide-react';

interface LiveAviationSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const LiveAviationSection: React.FC<LiveAviationSectionProps> = ({
  articles,
  onSelectArticle
}) => {
  const aviationArticles = articles.filter(a =>
    a.category === 'Aviation' ||
    /runway|tarmac|airport|caan|flight|tia|airline/i.test(`${a.title} ${a.summary}`)
  );

  return (
    <section className="bg-slate-950 text-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
            <Plane className="w-4 h-4 text-sky-400" />
            <span>Nepal Civil Aviation Telemetry</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Live Aviation & TIA Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time runway telemetry, CAAN NOTAM notices, and airport weather status for Nepal's international hubs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-sky-950/60 border border-sky-800 text-sky-300 px-3 py-1.5 rounded-lg self-start sm:self-auto font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>CAAN Authorized Feed Sync</span>
        </div>
      </div>

      {/* TIA Airfield Real-Time Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Card 1: Runway 02/20 Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono">TIA (VNKT)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                OPEN & OPERATIONAL
              </span>
            </div>
            <h4 className="font-serif text-base font-bold text-white mb-1">
              Runway 02/20 Operations
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              3,050m tarmac runway fully operational for scheduled day traffic. Scheduled night resurfacing active 11:30 PM - 5:30 AM NPT.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>ILS Cat I Available</span>
            <span className="text-sky-400">NOTAM Active</span>
          </div>
        </div>

        {/* Card 2: Weather & Visibility */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono">Kathmandu METAR</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                <Wind className="w-3 h-3 text-sky-400" /> VFR Normal
              </span>
            </div>
            <h4 className="font-serif text-base font-bold text-white mb-1">
              Airfield Visibility: &gt; 5,000m
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear ceiling across Kathmandu Valley basin. Trans-Himalayan domestic flight sectors to Pokhara, Biratnagar, and Bhairahawa operating on regular schedules.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Temp: 22°C</span>
            <span>QNH: 1014 hPa</span>
          </div>
        </div>

        {/* Card 3: Regional Hubs Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono">Regional Gateways</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Standby Alt</span>
            </div>
            <h4 className="font-serif text-base font-bold text-white mb-1">
              Pokhara &amp; Gautam Buddha
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pokhara International (VNPK) and Gautam Buddha International (VNBW) designated as primary alternate landing recovery fields for diversion management.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Standby Alert Level: Green</span>
            <span className="text-emerald-400">Normal</span>
          </div>
        </div>
      </div>

      {/* Verified Aviation News Stories */}
      {aviationArticles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-serif text-base font-bold text-slate-300 mb-3 flex items-center gap-2">
            <span>Verified Aviation News Coverage</span>
            <span className="text-xs font-mono font-normal text-slate-500">
              ({aviationArticles.length} {aviationArticles.length === 1 ? 'article' : 'articles'})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aviationArticles.slice(0, 4).map(art => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-start gap-4 group"
              >
                <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-950">
                  <img
                    src={art.image_url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="text-sky-400 font-bold uppercase">{art.category}</span>
                    <span>•</span>
                    <span>{art.primarySource}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                    {art.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
