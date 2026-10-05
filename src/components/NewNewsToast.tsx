import React from 'react';
import { ArrowUp, Radio } from 'lucide-react';

interface NewNewsToastProps {
  unseenCount: number;
  onViewLatest: () => void;
}

export const NewNewsToast: React.FC<NewNewsToastProps> = ({
  unseenCount,
  onViewLatest
}) => {
  if (unseenCount <= 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4 duration-300">
      <button
        onClick={onViewLatest}
        className="flex items-center gap-3 px-4 py-2.5 bg-slate-950 text-white rounded-full shadow-2xl border border-red-500/40 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="View latest news"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
        </span>
        <span className="text-xs font-bold tracking-wide uppercase">
          {unseenCount} {unseenCount === 1 ? 'NEW STORY' : 'NEW STORIES'}
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-xs font-semibold text-red-400 group-hover:text-red-300 flex items-center gap-1">
          <span>View latest</span>
          <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </button>
    </div>
  );
};
