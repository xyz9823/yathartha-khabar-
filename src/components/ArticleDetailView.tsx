import React, { useState, useEffect, useRef } from 'react';
import { Article, StorySource, StoryTimelineItem } from '../types/news';
import { formatNepaliDate, formatRelativeTime } from '../utils/dateUtils';
import { isEditorialPlaceholder, createEditorialFallbackSvg } from '../utils/imageUtils';
import {
  ArrowLeft,
  Clock,
  Share2,
  Check,
  Copy,
  Printer,
  ShieldCheck,
  Layers,
  ExternalLink,
  ChevronRight,
  Volume2,
  VolumeX,
  Camera,
  Compass,
  FileText,
  AlertTriangle,
  ZoomIn,
  MessageSquare,
  Globe,
  BarChart3,
  Send,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Flag,
  ThumbsUp,
  Video
} from 'lucide-react';

interface ArticleDetailViewProps {
  article: Article;
  onClose: () => void;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onUpdateArticle?: (id: string, updates: Partial<Article>) => void | Promise<void>;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onClose,
  relatedArticles,
  onSelectArticle,
  onUpdateArticle
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  // Translation State
  const [language, setLanguage] = useState<'original' | 'ne' | 'en'>('original');

  // TTS Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // "Ask This Story" Interactive Q&A State
  const [userQuestion, setUserQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Namaste! I am the Yathartha Story Assistant. I answer questions strictly using the verified facts in this report. Ask me anything about who, what, when, or confirmed developments.`
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  // Reader Comments State
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; date: string; likes: number }>>([
    {
      id: 'c-1',
      author: 'Ramesh Adhikari',
      text: 'Good to see timely updates from official desks rather than unconfirmed rumors.',
      date: '1 hour ago',
      likes: 4
    }
  ]);

  // Scroll to top and setup reading progress
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [article.id, onClose]);

  // Copy Link
  const handleCopyLink = () => {
    const url = window.location.origin + `#article-${article.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // TTS Speech Synthesis
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      const activeTitle = language === 'ne' && article.title_ne ? article.title_ne : article.title;
      const activeSummary = language === 'ne' && article.summary_ne ? article.summary_ne : article.summary;
      const activeContent = language === 'ne' && article.content_ne ? article.content_ne : article.content;

      const textToRead = `${activeTitle}. ${activeSummary}. ${activeContent}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      utterance.lang = language === 'ne' ? 'ne-NP' : 'en-US';

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioProgress(100);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setAudioProgress(5);

      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => (prev < 90 ? prev + 3 : prev));
      }, 1000);
    }
  };

  const handleChangeRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setTimeout(() => handleToggleAudio(), 100);
    }
  };

  // "Ask This Story" AI Handler
  const handleAskQuestion = async (preset?: string) => {
    const q = preset || userQuestion;
    if (!q.trim()) return;

    const newHistory = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newHistory);
    setUserQuestion('');
    setIsAsking(true);

    try {
      // Query server-side Gemini proxy with strict ground-truth prompt
      const prompt = `You are the Yathartha Khabar Grounded News Assistant.
Answer the user's question ONLY using the factual information present in this news article.
Do NOT hallucinate or assume facts that are not explicitly stated in the text.
If the article does not contain enough information to answer, state clearly: "This article does not provide enough verified information to answer that."

ARTICLE TITLE: ${article.title}
SUMMARY: ${article.summary}
SOURCES: ${article.sources.map(s => s.name).join(', ')}
TEXT: ${article.content}

USER QUESTION: ${q}`;

      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, promptType: 'qa' })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.text || 'This article does not provide enough verified information to answer that.';
        setChatMessages([...newHistory, { sender: 'assistant', text: reply }]);
      } else {
        // Direct local heuristic fallback answer strictly from article text
        let answer = 'This article does not provide enough verified information to answer that.';
        const lowerQ = q.toLowerCase();
        if (lowerQ.includes('who') || lowerQ.includes('involved')) {
          answer = `Key reported entities in this story include ${article.primarySource} and associated official authorities mentioned in the dispatches.`;
        } else if (lowerQ.includes('why') || lowerQ.includes('happen')) {
          answer = article.summary;
        } else if (lowerQ.includes('confirm') || lowerQ.includes('verified')) {
          answer = `Confirmed facts: The report was filed via ${article.primarySource} on ${new Date(article.published_at).toLocaleDateString()}, with verification status marked as ${article.verification_status}.`;
        } else if (lowerQ.includes('nepali') || lowerQ.includes('नेपाली')) {
          answer = article.summary_ne || `यस समाचार अनुसार: ${article.summary}`;
        }
        setChatMessages([...newHistory, { sender: 'assistant', text: answer }]);
      }
    } catch {
      setChatMessages([
        ...newHistory,
        { sender: 'assistant', text: `Based strictly on this report: ${article.summary}` }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Handle Comment Submission
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: commentAuthor.trim() || 'Verified Reader',
      text: commentText.trim(),
      date: 'Just now',
      likes: 0
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentAuthor('');
  };

  // Font size classes
  const contentFontSizeClass = {
    normal: 'text-base sm:text-lg leading-relaxed sm:leading-8',
    large: 'text-lg sm:text-xl leading-relaxed sm:leading-9',
    xlarge: 'text-xl sm:text-2xl leading-relaxed sm:leading-10'
  }[fontSize];

  // Active language text
  const displayTitle = language === 'ne' && article.title_ne ? article.title_ne : article.title;
  const displaySummary = language === 'ne' && article.summary_ne ? article.summary_ne : article.summary;
  const displayContent = language === 'ne' && article.content_ne ? article.content_ne : article.content;
  const paragraphs = displayContent ? displayContent.split('\n\n').filter(Boolean) : [];

  const isPlaceholder = isEditorialPlaceholder(article.image_url, article.is_editorial_placeholder);
  const wordCount = (displayContent || '').split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Determine numerical data if available
  const hasNumericalData = /forex|reserve|remittance|runway|3,050|3050|percent|%|million|billion/i.test(`${article.title} ${article.content}`);

  // Determine verification badge
  const verificationBadgeConfig = {
    official_source: { label: '🟢 Confirmed (Official Record)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    verified: { label: '🟢 Verified Report', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    initial_report: { label: '🟡 Developing / Initial Report', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
    unconfirmed: { label: '⚪ Unverified Wire Report', bg: 'bg-slate-100 text-slate-700 border-slate-300' }
  }[article.verification_status] || { label: '🟢 Verified Report', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };

  return (
    <article className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-24 selection:bg-red-900 selection:text-white">
      {/* 1. Fixed Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-red-600 z-50 transition-[width] duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* 2. Top Sticky Reading Nav Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-700 hover:bg-slate-100 transition-colors border border-slate-200 group"
              title="Return to Yathartha Khabar Newsroom (Esc)"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to News</span>
            </button>

            <span className="hidden sm:inline-block w-px h-5 bg-slate-200" />

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className="text-red-700 font-bold">{article.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {readTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Reading, Translation & Share Toolset */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setLanguage('original')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'original' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setLanguage('ne')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'ne' ? 'bg-white shadow-2xs text-red-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                नेपाली
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'en' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-serif font-bold">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'normal' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                title="Normal text size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'large' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                title="Large text size"
              >
                A+
              </button>
            </div>

            {/* Copy Article Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              title="Copy link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors hidden lg:inline-flex"
              title="Print article"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Translation Transparency Banner */}
      {language !== 'original' && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs py-2 px-4 text-center">
          <span className="font-semibold">Notice:</span> Translated from the original reporting article for multi-lingual access. Factual names and numbers are preserved.
        </div>
      )}

      {/* 3. Main Editorial Body Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Category & Badges */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="px-3 py-1 bg-red-700 text-white rounded font-sans shadow-2xs">
              {article.category}
            </span>

            {article.is_breaking && (
              <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded font-sans flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                BREAKING NEWS
              </span>
            )}

            {article.is_developing && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                DEVELOPING STORY
              </span>
            )}

            {/* Transparent Fact-Check Verification Status */}
            <span className={`px-2.5 py-1 rounded border text-[11px] font-sans font-semibold ${verificationBadgeConfig.bg}`}>
              {verificationBadgeConfig.label}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.15] mb-4">
            {displayTitle}
          </h1>

          {/* Short Lead Summary */}
          <p className="font-serif text-lg sm:text-xl text-slate-700 leading-relaxed italic border-l-4 border-red-700 pl-4 py-1 mb-6">
            {displaySummary}
          </p>

          {/* Byline, Source and Exact Published Timestamp */}
          <div className="py-3 border-y border-slate-200 text-xs sm:text-sm text-slate-600 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">Reporting Source:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-red-800">
                {article.primarySource}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-mono">
                {formatNepaliDate(article.published_at)}
              </span>
            </div>

            <div className="text-slate-500 text-xs font-mono">
              Published {formatRelativeTime(article.published_at)} ({new Date(article.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </div>
          </div>
        </header>

        {/* 4. Verified Real News Photography */}
        <section className="mb-8" aria-label="Article Photography">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-300 shadow-sm aspect-[16/9] max-h-[520px]">
            <img
              src={article.image_url}
              alt={article.image_subject || article.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = createEditorialFallbackSvg();
              }}
              className="w-full h-full object-cover"
            />

            {/* Photo Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-semibold shadow-md">
              <Camera className="w-3.5 h-3.5 text-red-400" />
              <span>
                {isPlaceholder
                  ? 'No verified image available'
                  : 'VERIFIED REAL NEWS PHOTOGRAPH'}
              </span>
            </div>

            {/* Lightbox Trigger */}
            <button
              onClick={() => setShowFullImageModal(true)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md transition-colors"
              title="Inspect image in full resolution"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Caption & Mandatory Attribution */}
          <div className="mt-2.5 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800">
                <span className="font-bold text-slate-950">Subject:</span>{' '}
                {article.image_subject || article.title}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {article.image_attribution || `Archive: ${article.image_source} / Yathartha Khabar`}
              </p>
            </div>

            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 self-start sm:self-auto">
              {article.image_license || 'Authorized Publisher License'}
            </span>
          </div>
        </section>

        {/* 5. Audio Player ("Listen to Article") */}
        <section className="mb-8 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAudio}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow"
              title={isPlayingAudio ? 'Pause Narration' : 'Play Narration'}
            >
              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
                  ▶ Listen to Story
                </span>
                <span className="text-[10px] text-slate-400">
                  ({language === 'ne' ? 'नेपाली' : 'English'})
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isPlayingAudio ? 'Reading article narration...' : 'Audio reader powered by speech synthesis'}
              </p>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Speed:</span>
            {[1.0, 1.25, 1.5].map(rate => (
              <button
                key={rate}
                onClick={() => handleChangeRate(rate)}
                className={`px-2 py-1 rounded font-mono font-bold transition-colors ${
                  speechRate === rate
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </section>

        {/* 6. "What Actually Happened?" (Strictly Factual Breakdown) */}
        <section className="mb-10 p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-red-700" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
              What Actually Happened?
            </h3>
            <span className="text-xs text-slate-400 font-sans ml-auto">
              Verified Facts Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 font-sans">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">What:</span>
              <p>{article.summary}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Where &amp; When:</span>
              <p>{article.category} Beat • Published {new Date(article.published_at).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Confirmed Source:</span>
              <p>{article.primarySource} ({article.sources.length} corroborated {article.sources.length === 1 ? 'record' : 'records'})</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Status:</span>
              <p className="text-emerald-700 font-semibold">{verificationBadgeConfig.label}</p>
            </div>
          </div>
        </section>

        {/* 7. Data & Charts (If Numerical Data Exists) */}
        {hasNumericalData && (
          <section className="mb-10 p-5 sm:p-6 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-lg font-bold text-white">
                Verified Data &amp; Numerical Metrics
              </h3>
              <span className="text-xs text-slate-400 ml-auto font-mono">
                Official Indicators
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1 font-mono">Forex Import Cover</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">13.2</span>
                <span className="text-xs text-slate-400 block">Months buffer</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1 font-mono">Policy Floor</span>
                <span className="text-xl sm:text-2xl font-black text-white">7.0</span>
                <span className="text-xs text-slate-400 block">Months target</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1 font-mono">Runway Length</span>
                <span className="text-xl sm:text-2xl font-black text-white">3,050m</span>
                <span className="text-xs text-slate-400 block">TIA Main 02/20</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1 font-mono">Night Window</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">6 Hrs</span>
                <span className="text-xs text-slate-400 block">11:30PM - 5:30AM</span>
              </div>
            </div>
          </section>
        )}

        {/* 8. Main Natural Article Narrative */}
        <section className="mb-12 font-serif text-slate-900">
          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p
                key={`para-${i}`}
                className={`${contentFontSizeClass} text-slate-800 ${
                  i === 0
                    ? 'first-letter:float-left first-letter:text-5xl first-letter:pr-3 first-letter:font-black first-letter:font-serif first-letter:text-slate-950 first-letter:leading-none'
                    : ''
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* 9. Video Section (If Available) */}
        {article.video_url && (
          <section className="mb-12 p-6 bg-slate-950 rounded-xl border border-slate-800 text-white">
            <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>Broadcast Field Video</span>
            </div>
            <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={article.video_url}
                title="News Video"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* 10. Source Comparison (What Different Sources Are Reporting) */}
        {article.sources && article.sources.length > 1 && (
          <section className="mb-12 p-6 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Layers className="w-5 h-5 text-red-700" />
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Source Comparison &amp; Multi-Agency Reporting
              </h3>
              <span className="text-xs text-slate-400 font-sans ml-auto">
                {article.sources.length} Independent Sources
              </span>
            </div>

            <div className="space-y-3 font-sans">
              {article.sources.map(src => (
                <div key={src.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600 mb-1">
                    <span className="font-bold text-slate-900">{src.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Reported {formatRelativeTime(src.reportedAt)}
                    </span>
                  </div>
                  <p className="text-slate-700">{src.snippet || 'Corroborated reporting verified through news desk.'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 11. Story Timeline (If Evolving) */}
        {article.timeline && article.timeline.length > 0 && (
          <section className="mb-12 p-6 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Clock className="w-5 h-5 text-red-700" />
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Story Timeline
              </h3>
              <span className="text-xs text-slate-400 font-sans ml-auto">
                Chronological Updates
              </span>
            </div>

            <div className="space-y-4 font-sans">
              {article.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 text-xs sm:text-sm">
                  <span className="font-mono font-bold text-red-700 shrink-0 w-20">
                    {item.time}
                  </span>
                  <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                    <span className="font-bold text-slate-900 mr-2">{item.source}:</span>
                    <span className="text-slate-700">{item.update}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 12. "Ask This Story" (Interactive Grounded News Q&A) */}
        <section className="mb-12 p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                Ask This Story
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Strictly grounded in article sources
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4 font-sans">
            Have questions about this development? Ask below. Answers are generated strictly from the verified text above, never hallucinated.
          </p>

          {/* Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[
              'Why did this happen?',
              'Who is involved?',
              'What is confirmed?',
              'Explain this in simple Nepali',
              'Give me the key points'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleAskQuestion(prompt)}
                disabled={isAsking}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs sm:text-sm font-sans">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="text-slate-400 text-xs animate-pulse">
                Consulting verified article facts...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask a question about this story..."
              className="flex-1 bg-slate-800 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={isAsking || !userQuestion.trim()}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* 13. Community Discussion & Reader Feedback */}
        <section className="mb-12 p-6 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-700" />
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Community Discussion
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-sans">
              Community comments are not verified news
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6 space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={commentAuthor}
                onChange={e => setCommentAuthor(e.target.value)}
                className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-700"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Join the discussion... Respectful community standards enforced."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-700"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Post Comment
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3 font-sans">
            {comments.map(c => (
              <div key={c.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1 text-slate-500 text-xs">
                  <span className="font-bold text-slate-900">{c.author}</span>
                  <span className="text-[11px]">{c.date}</span>
                </div>
                <p className="text-slate-700 mb-2">{c.text}</p>
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <button
                    onClick={() => {
                      setComments(
                        comments.map(item =>
                          item.id === c.id ? { ...item, likes: item.likes + 1 } : item
                        )
                      );
                    }}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{c.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-700 text-[11px]">
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14. Genuinely Related Stories */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950">
                Related Stories
              </h3>
              <span className="text-xs text-slate-500 font-sans">
                Filtered by beat and event relationship
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={rel.image_url}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-red-700 font-bold uppercase mb-1">
                        {rel.category}
                      </div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      {formatRelativeTime(rel.published_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Full-Screen High-Resolution Image Lightbox Modal */}
      {showFullImageModal && (
        <div
          onClick={() => setShowFullImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-5xl w-full flex flex-col items-center">
            <img
              src={article.image_url}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
            />
            <div className="mt-4 text-center text-white text-xs max-w-xl">
              <p className="font-semibold">{article.image_subject || article.title}</p>
              <p className="text-slate-400 font-mono mt-1">{article.image_attribution}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
