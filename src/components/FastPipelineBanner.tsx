import React from 'react';
import { Layers, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface FastPipelineBannerProps {
  onOpenAdmin: () => void;
  onTriggerSimulate: () => void;
  isSimulating: boolean;
}

export const FastPipelineBanner: React.FC<FastPipelineBannerProps> = ({
  onOpenAdmin,
  onTriggerSimulate,
  isSimulating
}) => {
  return (
    <div className="w-full bg-[#111827] text-white py-6 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Feature 1: Fast Detection & Merging */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-lg shrink-0 border border-red-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Fast News Updates</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated continuous ingestion from authorized Nepal media and official emergency registries.
              </p>
            </div>
          </div>

          {/* Feature 2: Multi-Source Story Merging */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Multi-Source Story Merging</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When Onlinekhabar, Ratopati, and CAAN report an event, they are merged into one evolving story.
              </p>
            </div>
          </div>

          {/* Feature 3: Transparent Attribution */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Factual Integrity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                No automatic copying of entire articles. Original AI-assisted synthesis with direct outbound source links.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
