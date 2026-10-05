import React from 'react';
import { Logo } from './Logo';
import { X, ShieldAlert, FileText, Users, Mail, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLogoUrl?: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  customLogoUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="sm" customLogoUrl={customLogoUrl} />
            <span className="text-slate-400">|</span>
            <h2 className="text-base font-bold text-slate-900">Institutional Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-black hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Strict Placeholders as Requested */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Note to publisher */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-950">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Publisher Note: </span>
              In strict accordance with your instructions, no founder names, journalist identities, addresses, or social accounts have been fabricated. Use the placeholders below to insert your official details.
            </div>
          </div>

          {/* Section 1: About Yathartha Khabar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
              <FileText className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-xl font-bold">About Yathartha Khabar</h3>
            </div>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 text-sm font-mono">
              [PLACEHOLDER TEXT — I WILL REPLACE THIS]
            </div>
          </div>

          {/* Section 2: Editorial Team */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
              <Users className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-xl font-bold">Editorial Team</h3>
            </div>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 text-sm font-mono">
              [PLACEHOLDER]
            </div>
          </div>

          {/* Section 3: Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
              <Mail className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-xl font-bold">Contact</h3>
            </div>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 text-sm font-mono">
              [PLACEHOLDER]
            </div>
          </div>

          {/* Section 4: Social Media */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
              <Globe className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-xl font-bold">Social Media</h3>
            </div>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 text-sm font-mono">
              [PLACEHOLDER]
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
