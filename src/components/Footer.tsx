import React from 'react';
import { Logo } from './Logo';
import { CategoryType } from '../types/news';
import { ShieldCheck, Info, SlidersHorizontal } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenAbout: () => void;
  onOpenAdmin: () => void;
  customLogoUrl?: string;
}

const CATEGORIES: CategoryType[] = [
  'Latest',
  'Nepal',
  'Politics',
  'Business',
  'Economy',
  'Technology',
  'Sports',
  'Entertainment',
  'Tourism',
  'Aviation',
  'Education',
  'Health',
  'World'
];

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAbout,
  onOpenAdmin,
  customLogoUrl
}) => {
  return (
    <footer className="w-full bg-[#0F172A] text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Top: Brand Masthead & Editorial Transparency Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/5 p-3 rounded-lg inline-block border border-slate-800">
              <Logo variant="footer" customLogoUrl={customLogoUrl} />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Yathartha Khabar is a fast, trustworthy, modern Nepal-focused digital news platform. Engineered for real-time multi-source story merging, automated duplicate detection, and transparent editorial attribution.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent Aggregation & Corroborated Verification</span>
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              News Desks
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left text-slate-400 hover:text-white hover:underline transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Editorial Links & Policy */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Governance & Operations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About Yathartha Khabar</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Newsroom Studio & Feeds</span>
                </button>
              </li>
            </ul>

            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">AI Summary Disclosure:</span>
              <p>
                Summaries are synthesized from verified news feeds. Original source reporting is credited and linked on every story.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Clean Disclaimers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Yathartha Khabar (यथार्थ खबर). All rights reserved.
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Kathmandu, Nepal · Fast News Network
          </div>
        </div>
      </div>
    </footer>
  );
};
