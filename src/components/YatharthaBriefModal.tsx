import React, { useState } from 'react';
import { Article } from '../types/news';
import { X, Volume2, VolumeX, BookOpen, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface YatharthaBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const YatharthaBriefModal: React.FC<YatharthaBriefModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  // Curate 5 core category dispatches for the briefing
  const nepalStory = articles.find(a => a.category === 'Nepal' || a.category === 'National') || articles[0];
  const worldStory = articles.find(a => a.category === 'World') || articles[1];
  const businessStory = articles.find(a => a.category === 'Economy' || a.category === 'Business') || articles[2];
  const sportsStory = articles.find(a => a.category === 'Sports') || articles[3];
  const techStory = articles.find(a => a.category === 'Technology' || a.category === 'Aviation') || articles[4];

  const briefItems = [
    { label: 'Nepal Major Development', story: nepalStory },
    { label: 'International & World', story: worldStory },
    { label: 'Business & Economy', story: businessStory },
    { label: 'National Sports', story: sportsStory },
    { label: 'Technology & Infrastructure', story: techStory }
  ].filter(item => Boolean(item.story));

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `Welcome to Yathartha Brief. Here are today's 5 key verified developments in Nepal and worldwide. ${briefItems
        .map((item, idx) => `Item ${idx + 1}: ${item.label}. ${item.story?.title}. ${item.story?.summary}`)
        .join('. ')}`;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Yathartha Brief (यथार्थ संक्षेप)</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Today's 5-Minute News Digest
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated verified briefing across key national and international beats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Briefing</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Brief</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (isPlayingAudio) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Briefing List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          {briefItems.map((item, index) => {
            if (!item.story) return null;
            return (
              <div
                key={item.story.id || index}
                onClick={() => {
                  if (isPlayingAudio) window.speechSynthesis.cancel();
                  onClose();
                  onSelectArticle(item.story!);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-slate-50/80 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Source: {item.story.primarySource}
                  </span>
                </div>

                <h4 className="font-serif text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug mb-1">
                  {item.story.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.story.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Yathartha Khabar Editorial Standards</span>
          <button
            onClick={() => {
              if (isPlayingAudio) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Digest
          </button>
        </div>
      </div>
    </div>
  );
};
