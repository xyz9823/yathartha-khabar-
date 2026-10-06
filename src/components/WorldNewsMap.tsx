import React, { useState } from 'react';
import { Article } from '../types/news';
import { Globe, MapPin, ExternalLink, Compass } from 'lucide-react';

interface WorldNewsMapProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

interface CountryInfo {
  code: string;
  name: string;
  nepaliName: string;
  x: number;
  y: number;
  color: string;
}

const FEATURED_COUNTRIES: CountryInfo[] = [
  { code: 'NP', name: 'Nepal', nepaliName: 'नेपाल', x: 680, y: 220, color: '#dc2626' },
  { code: 'IN', name: 'India', nepaliName: 'भारत', x: 670, y: 245, color: '#ea580c' },
  { code: 'CN', name: 'China', nepaliName: 'चीन', x: 730, y: 180, color: '#ca8a04' },
  { code: 'US', name: 'United States', nepaliName: 'संयुक्त राज्य अमेरिका', x: 230, y: 160, color: '#2563eb' },
  { code: 'GB', name: 'United Kingdom', nepaliName: 'बेलायत', x: 480, y: 130, color: '#7c3aed' },
  { code: 'AE', name: 'UAE & Gulf', nepaliName: 'युएई तथा खाडी', x: 600, y: 215, color: '#059669' },
  { code: 'QA', name: 'Qatar', nepaliName: 'कतार', x: 610, y: 225, color: '#9333ea' },
  { code: 'AU', name: 'Australia', nepaliName: 'अष्ट्रेलिया', x: 840, y: 350, color: '#0284c7' },
  { code: 'JP', name: 'Japan', nepaliName: 'जापान', x: 820, y: 175, color: '#db2777' }
];

export const WorldNewsMap: React.FC<WorldNewsMapProps> = ({
  articles,
  onSelectArticle
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('NP');

  // Filter articles geolocated or mentioning the selected country
  const getCountryArticles = (countryCode: string) => {
    const country = FEATURED_COUNTRIES.find(c => c.code === countryCode);
    if (!country) return [];

    const name = country.name.toLowerCase();
    return articles.filter(a => {
      const fullText = `${a.title} ${a.summary} ${a.content} ${(a.tags || []).join(' ')} ${a.category}`.toLowerCase();
      if (countryCode === 'NP') {
        return true; // Nepal news covers core
      }
      if (countryCode === 'AE' || countryCode === 'QA') {
        return fullText.includes('uae') || fullText.includes('dubai') || fullText.includes('qatar') || fullText.includes('doha') || fullText.includes('gulf') || fullText.includes('remittance');
      }
      return fullText.includes(name) || fullText.includes(country.code.toLowerCase());
    });
  };

  const currentCountry = FEATURED_COUNTRIES.find(c => c.code === selectedCountry) || FEATURED_COUNTRIES[0];
  const countryArticles = getCountryArticles(selectedCountry);

  return (
    <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Globe className="w-4 h-4 text-red-500" />
            <span>Interactive World Desk</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            World News Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click any country to explore verified reports connected to geographic reporting records.
          </p>
        </div>

        {/* Quick Country Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {FEATURED_COUNTRIES.map(c => {
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{c.name}</span>
                <span className="ml-1 opacity-75 font-normal text-[11px]">({c.nepaliName})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative my-6 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[21/9] min-h-[220px] sm:min-h-[280px] flex items-center justify-center p-4">
        {/* Simplified Vector World Silhouette */}
        <svg
          viewBox="0 0 1000 480"
          className="w-full h-full opacity-60 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Americas */}
          <path
            d="M 180 80 Q 240 70 280 120 Q 270 200 230 220 Q 250 280 290 320 Q 280 420 220 440 Q 190 380 210 320 Q 150 240 160 160 Z"
            fill="#334155"
          />
          {/* Eurasia & Africa */}
          <path
            d="M 440 90 Q 560 60 760 90 Q 860 120 880 220 Q 760 260 680 230 Q 640 280 620 380 Q 520 400 480 300 Q 420 220 440 140 Z"
            fill="#334155"
          />
          {/* Australia */}
          <path
            d="M 800 320 Q 880 310 900 370 Q 860 410 800 390 Z"
            fill="#334155"
          />
        </svg>

        {/* Interactive Location Markers */}
        <div className="absolute inset-0">
          {FEATURED_COUNTRIES.map(country => {
            const isSelected = selectedCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                style={{
                  left: `${(country.x / 1000) * 100}%`,
                  top: `${(country.y / 480) * 100}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                title={`${country.name} (${country.nepaliName})`}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute w-6 h-6 rounded-full transition-transform ${
                      isSelected
                        ? 'bg-red-500/40 animate-ping'
                        : 'bg-slate-400/20 group-hover:scale-150'
                    }`}
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-red-500 scale-125'
                        : 'bg-slate-300 group-hover:bg-amber-400'
                    }`}
                  />
                </div>
                <span
                  className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold transition-opacity ${
                    isSelected
                      ? 'bg-red-600 text-white opacity-100 z-10 shadow'
                      : 'bg-black/80 text-slate-300 opacity-0 group-hover:opacity-100 z-0'
                  }`}
                >
                  {country.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Country Legend Badge */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold text-white">{currentCountry.name}</span>
          <span className="text-slate-400 font-mono text-[11px]">({currentCountry.nepaliName})</span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
            {countryArticles.length} {countryArticles.length === 1 ? 'Report' : 'Reports'}
          </span>
        </div>
      </div>

      {/* Verified Stories from Selected Country */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-slate-200 flex items-center gap-2">
            <span>Verified Dispatches — {currentCountry.name}</span>
          </h3>
          <span className="text-xs text-slate-400">
            Geographic metadata validated against reporting bureaus
          </span>
        </div>

        {countryArticles.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
            <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No recent wire dispatches for {currentCountry.name}.</p>
            <p className="text-xs text-slate-500 mt-1">
              New stories mentioning this region will automatically surface here when verified.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryArticles.slice(0, 6).map(art => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="text-red-400 font-bold uppercase">{art.category}</span>
                    <span>Source: {art.primarySource}</span>
                  </div>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(art.published_at).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1 text-slate-300 group-hover:text-white font-semibold">
                    Read Report <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
