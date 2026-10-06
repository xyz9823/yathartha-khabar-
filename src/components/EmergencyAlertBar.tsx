import React from 'react';
import { AlertTriangle, ShieldAlert, ChevronRight, X } from 'lucide-react';
import { Article } from '../types/news';

interface EmergencyAlertBarProps {
  activeEmergencyText?: string;
  emergencyArticle?: Article;
  onSelectArticle?: (article: Article) => void;
  onDismiss?: () => void;
}

export const EmergencyAlertBar: React.FC<EmergencyAlertBarProps> = ({
  activeEmergencyText,
  emergencyArticle,
  onSelectArticle,
  onDismiss
}) => {
  if (!activeEmergencyText && !emergencyArticle) return null;

  return (
    <div className="w-full bg-red-700 text-white shadow-md border-b-2 border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="shrink-0 px-2 py-0.5 rounded bg-black/40 text-amber-300 font-bold uppercase tracking-wider text-[10px] sm:text-xs flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            OFFICIAL EMERGENCY ALERT
          </span>

          <p className="truncate font-medium text-slate-50">
            {activeEmergencyText || (emergencyArticle ? `${emergencyArticle.title}: ${emergencyArticle.summary}` : '')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {emergencyArticle && onSelectArticle && (
            <button
              onClick={() => onSelectArticle(emergencyArticle)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-red-900 font-bold hover:bg-red-50 transition-colors text-xs shadow-2xs"
            >
              <span>View Directive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-white/80 hover:text-white hover:bg-red-800 rounded transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
