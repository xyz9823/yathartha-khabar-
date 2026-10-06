import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { getCurrentNepalHeaderDate } from '../utils/dateUtils';
import {
  Search,
  SlidersHorizontal,
  Menu,
  X,
  Radio,
  Info,
  ChevronDown,
  Sparkles,
  Flame,
  Globe,
  Compass,
  Bookmark
} from 'lucide-react';

interface HeaderProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
  onOpenBrief?: () => void;
  breakingCount?: number;
  liveCount?: number;
  customLogoUrl?: string;
}

const CATEGORIES: string[] = [
  'Latest',
  'Breaking News',
  'Trending',
  'Nepal Live',
  'World Map',
  'Aviation',
  'Politics',
  'Economy',
  'Technology',
  'Sports',
  'Tourism',
  'Health',
  'World',
  'My News'
];

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAdmin,
  onOpenAbout,
  onOpenBrief,
  breakingCount = 1,
  liveCount = 8,
  customLogoUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateTime, setDateTime] = useState(getCurrentNepalHeaderDate());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getCurrentNepalHeaderDate());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. Top Utility Micro-Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date & Time in Kathmandu */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-200">{dateTime.gregorian}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-nepali">{dateTime.bs}</span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-amber-400 font-mono hidden md:inline">{dateTime.time}</span>
          </div>

          {/* Right: Fast Live Status, About & Admin Switch */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>FAST UPDATES · {liveCount} LIVE</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-cyan-300 font-mono" title="Supabase Database Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SUPABASE LIVE</span>
            </div>

            <span className="text-slate-700">|</span>

            <button
              onClick={onOpenAbout}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={onOpenAdmin}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-0.5 rounded transition-colors flex items-center gap-1.5 font-medium border border-slate-700"
            >
              <SlidersHorizontal className="w-3 h-3 text-red-400" />
              <span>Newsroom Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-6">
        {/* Left: Mobile hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-black hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Center: The Official Yathartha Khabar Logo (or exact masthead) */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Logo
            variant="lg"
            customLogoUrl={customLogoUrl}
            onClick={() => onSelectCategory('Latest')}
          />
        </div>

        {/* Right: Quick Fast News Search & Briefing & Breaking Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenBrief && (
            <button
              onClick={onOpenBrief}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs"
              title="Open Yathartha Brief 5-minute digest"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Daily Brief</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/80 group"
            title="Search news"
          >
            <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            <span className="hidden sm:inline font-medium">Search stories...</span>
            <kbd className="hidden md:inline text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-300">
              ⌘K
            </kbd>
          </button>

          {breakingCount > 0 && (
            <button
              onClick={() => onSelectCategory('Breaking News')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors animate-pulse"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Breaking ({breakingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Primary Category Navigation Bar (Clean Typography, Anti-Slop) */}
      <nav className={`w-full bg-[#1E293B] text-slate-200 shadow-sm transition-all duration-200 ${isScrolled ? 'sticky top-0 z-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1">
            <ul className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm font-semibold tracking-normal py-1">
              {CATEGORIES.map((category, idx) => {
                const isActive = activeCategory.toLowerCase() === category.toLowerCase();
                const isBreaking = category === 'Breaking News';

                return (
                  <li key={`${category}-${idx}`}>
                    <button
                      onClick={() => {
                        onSelectCategory(category);
                        setMobileMenuOpen(false);
                      }}
                      className={`relative px-3 py-2 rounded transition-colors text-[13px] sm:text-sm font-medium ${
                        isBreaking
                          ? isActive
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-red-400 hover:text-red-300 font-bold'
                          : isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {isBreaking && (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-ping" />
                      )}
                      {category}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Quick Live Toggle Indicator */}
            <div className="hidden xl:flex items-center gap-2 pl-4 text-xs text-slate-400 border-l border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Fast Wire Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <Logo variant="sm" customLogoUrl={customLogoUrl} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Nepal's fast, trustworthy digital news platform.
              </p>
            </div>

            <div className="p-4 space-y-1 flex-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                News Categories
              </span>
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={`${cat}-${idx}`}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    activeCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  {cat === 'Breaking News' && (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                      LIVE
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={() => {
                  onOpenAbout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:text-black font-medium flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-slate-500" />
                <span>About Yathartha Khabar</span>
              </button>
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-700 hover:text-red-900 font-bold flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Editorial Admin Studio</span>
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
