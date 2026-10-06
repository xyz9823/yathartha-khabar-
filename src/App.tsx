import React, { useState, useEffect } from 'react';
import { Article, CategoryType, NewsFeed, SiteSettings, StorySource } from './types/news';
import { Header } from './components/Header';
import { BreakingNewsBar } from './components/BreakingNewsBar';
import { TopStories } from './components/TopStories';
import { LatestNewsFeed } from './components/LatestNewsFeed';
import { CategoryShowcase } from './components/CategoryShowcase';
import { FastPipelineBanner } from './components/FastPipelineBanner';
import { ArticleDetailView } from './components/ArticleDetailView';
import { SearchModal } from './components/SearchModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { NewNewsToast } from './components/NewNewsToast';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [feeds, setFeeds] = useState<NewsFeed[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Yathartha Khabar',
    tagline: "Nepal's Modern Digital Newsroom",
    publishingMode: 'ASSISTED',
    autoPublishConfidenceThreshold: 85,
    logoUrl: '',
    emergencyBannerActive: false,
    emergencyBannerText: '',
    geminiModel: 'gemini-3.8-flash',
    pollingIntervalSeconds: 60,
    autoCollectorEnabled: true
  });

  const [activeCategory, setActiveCategory] = useState<string>('Latest');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [unseenStoriesCount, setUnseenStoriesCount] = useState<number>(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Load initial settings and saved logo from localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('yathartha_khabar_logo');
    if (savedLogo) {
      setSettings(prev => ({ ...prev, logoUrl: savedLogo }));
    }

    fetchNews();
    fetchFeeds();
    fetchSettings();
  }, []);

  // Section 9: Real-time Server-Sent Events (SSE) Stream Integration
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/stream');

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'NEW_STORY' && payload.article) {
            const newStory = payload.article;
            setArticles((prev) => {
              if (prev.some((a) => a.id === newStory.id)) return prev;
              return [newStory, ...prev];
            });

            // Section 10: If user is reading down the page, show "New News" Indicator
            if (window.scrollY > 250) {
              setUnseenStoriesCount((count) => count + 1);
            } else {
              setUnseenStoriesCount(0);
            }
          } else if (payload.type === 'MERGE_STORY' && payload.article) {
            const merged = payload.article;
            setArticles((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
            showNotification(
              `Developing Story: Multi-source report merged for "${merged.title.slice(0, 42)}..."`,
              'info'
            );
          } else if (payload.type === 'UPDATE_STORY' && payload.article) {
            const updated = payload.article;
            setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          }
        } catch (err) {
          console.warn('Real-time event parse warning:', err);
        }
      };

      es.onerror = () => {
        // SSE reconnects automatically
      };
    } catch (err) {
      console.warn('SSE connection warning:', err);
    }

    return () => {
      es?.close();
    };
  }, []);

  // Clear unseen counter when user scrolls back to the very top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 120 && unseenStoriesCount > 0) {
        setUnseenStoriesCount(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [unseenStoriesCount]);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync URL hash for direct links and browser back/forward navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article-')) {
        const id = hash.replace('#article-', '');
        const found = articles.find((a) => a.id === id || a.slug === id);
        if (found) {
          setSelectedArticle(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [articles]);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setArticles(data.data);
      }
    } catch (err) {
      console.warn('Backend fetch failed, utilizing fallback store:', err);
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/collector/feeds');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFeeds(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch feeds:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.warn('Failed to fetch settings:', err);
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Section 10: Clicking "View latest" scrolls up smoothly and shows new stories
  const handleViewLatest = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUnseenStoriesCount(0);
  };

  // Trigger manual news collector poll
  const handleTriggerCollector = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/collector/run', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        await fetchNews();
        showNotification(
          `News collector cycle finished. ${data.result.newStoriesCount} new stories, ${data.result.mergedCount} merged.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Collector poll failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Section 17: Interactive Breaking News Simulation
  const handleSimulateBreaking = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/collector/simulate-breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBreaking: true })
      });
      const data = await res.json();
      if (data.success && data.data) {
        showNotification(
          `🔴 BREAKING ALERT: "${data.data.title.slice(0, 45)}..." processed and pushed live.`,
          'alert'
        );
      }
    } catch (err) {
      console.error('Simulate breaking error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUpdateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.map((a) => (a.id === id ? data.data : a)));
        showNotification('Article updated successfully.');
      }
    } catch (err) {
      console.error('Error updating article:', err);
    }
  };

  const handleCreateArticle = async (newArticleData: Partial<Article>) => {
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticleData)
      });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => [data.data, ...prev]);
        showNotification('Story published successfully to Yathartha Khabar.');
      }
    } catch (err) {
      console.error('Error creating article:', err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showNotification('Story removed from active feed.', 'info');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const handleMergeStories = async (targetId: string, sourceIds: string[], note: string) => {
    try {
      const res = await fetch('/api/news/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetArticleId: targetId, sourceArticleIds: sourceIds, newDevelopmentNote: note })
      });
      const data = await res.json();
      if (data.success) {
        await fetchNews();
        showNotification('Stories merged successfully with multi-source attribution.', 'success');
      }
    } catch (err) {
      console.error('Error merging stories:', err);
    }
  };

  const handleUpdateSettings = async (newSettingsData: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettingsData)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showNotification(`Publishing policy set to ${data.data.publishingMode}.`);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handleSaveLogo = (logoDataUrl: string) => {
    if (logoDataUrl) {
      localStorage.setItem('yathartha_khabar_logo', logoDataUrl);
      setSettings((prev) => ({ ...prev, logoUrl: logoDataUrl }));
      showNotification('Official Yathartha Khabar logo updated across headers & footer.');
    } else {
      localStorage.removeItem('yathartha_khabar_logo');
      setSettings((prev) => ({ ...prev, logoUrl: '' }));
      showNotification('Logo reset to default typographic masthead.', 'info');
    }
  };

  // Filter articles based on active category
  const breakingArticles = articles.filter((a) => a.is_breaking && a.status === 'published');

  const displayedArticles =
    activeCategory === 'Latest' || activeCategory === 'All'
      ? articles.filter((a) => a.status === 'published')
      : activeCategory === 'Breaking News'
      ? breakingArticles
      : articles.filter((a) => a.status === 'published' && a.category.toLowerCase() === activeCategory.toLowerCase());

  // Related articles for modal view
  const relatedArticles = selectedArticle
    ? articles.filter((a) => a.id !== selectedArticle.id && a.category === selectedArticle.category)
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col font-sans relative">
      {/* Section 10: "New News" Indicator Toast */}
      <NewNewsToast
        unseenCount={unseenStoriesCount}
        onViewLatest={handleViewLatest}
      />

      {/* Floating System Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2.5 text-white ${
              notification.type === 'alert'
                ? 'bg-red-600'
                : notification.type === 'info'
                ? 'bg-blue-600'
                : 'bg-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        breakingCount={breakingArticles.length}
        liveCount={articles.length}
        customLogoUrl={settings.logoUrl}
      />

      {/* Main Editorial Content or Full-Page Article Detail View */}
      {selectedArticle ? (
        <ArticleDetailView
          article={selectedArticle}
          onClose={() => {
            setSelectedArticle(null);
            if (window.location.hash.startsWith('#article-')) {
              history.pushState(null, '', window.location.pathname + window.location.search);
            }
          }}
          relatedArticles={relatedArticles}
          onSelectArticle={(art) => {
            setSelectedArticle(art);
            window.location.hash = `#article-${art.id}`;
          }}
          onUpdateArticle={handleUpdateArticle}
        />
      ) : (
        <>
          {/* Breaking News Dedicated Alert Bar (Section 6 & 11) */}
          <BreakingNewsBar
            breakingArticles={breakingArticles}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              window.location.hash = `#article-${art.id}`;
            }}
          />

          <main className="flex-1">
            {activeCategory === 'Latest' ? (
              <>
                {/* Top Stories Showcase */}
                <TopStories
                  articles={displayedArticles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.location.hash = `#article-${art.id}`;
                  }}
                />

                {/* Fast News Pipeline Explainer Banner */}
                <FastPipelineBanner
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onTriggerSimulate={handleTriggerCollector}
                  isSimulating={isSimulating}
                />

                {/* Dynamic Latest News Feed (Section 9 & 17) */}
                <LatestNewsFeed
                  articles={displayedArticles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.location.hash = `#article-${art.id}`;
                  }}
                  onTriggerCollector={handleTriggerCollector}
                  onSimulateBreaking={handleSimulateBreaking}
                  isSimulating={isSimulating}
                  activeFilter="All"
                />

                {/* Curated Category Showcases */}
                <CategoryShowcase
                  title="Aviation & Infrastructure"
                  category="Aviation"
                  nepaliTitle="हवाई तथा पूर्वाधार"
                  articles={articles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.location.hash = `#article-${art.id}`;
                  }}
                  onViewCategory={(cat) => setActiveCategory(cat)}
                />

                <CategoryShowcase
                  title="Economy & Finance"
                  category="Economy"
                  nepaliTitle="अर्थतन्त्र तथा बैंकिङ"
                  articles={articles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.location.hash = `#article-${art.id}`;
                  }}
                  onViewCategory={(cat) => setActiveCategory(cat)}
                />

                <CategoryShowcase
                  title="Himalayan Tourism & Expeditions"
                  category="Tourism"
                  nepaliTitle="पर्यटन तथा पदयात्रा"
                  articles={articles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.location.hash = `#article-${art.id}`;
                  }}
                  onViewCategory={(cat) => setActiveCategory(cat)}
                />
              </>
            ) : (
              /* Filtered Category View */
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Category Archive
                    </span>
                    <h2 className="font-serif text-3xl font-black text-slate-950 mt-1">
                      {activeCategory}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveCategory('Latest')}
                    className="text-xs font-semibold text-slate-600 hover:text-black underline"
                  >
                    ← Back to All News
                  </button>
                </div>

                {displayedArticles.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <p className="text-base font-semibold">No stories in {activeCategory} right now.</p>
                    <p className="text-xs text-slate-400">
                      New reports from authorized feeds will be categorized here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedArticles.map((art) => (
                      <article
                        key={art.id}
                        onClick={() => {
                          setSelectedArticle(art);
                          window.location.hash = `#article-${art.id}`;
                        }}
                        className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          <img
                            src={art.image_url}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
                              <span className="text-red-700 uppercase">{art.category}</span>
                              <span>·</span>
                              <span>Source: {art.primarySource}</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-2">
                              {art.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
                              {art.summary}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-3">
                            Published {new Date(art.published_at).toLocaleDateString()}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* Fast Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      {/* About Yathartha Khabar Modal (Strict Placeholders as requested) */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        customLogoUrl={settings.logoUrl}
      />

      {/* Editorial Admin Newsroom Studio */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        articles={articles}
        feeds={feeds}
        settings={settings}
        onUpdateArticle={handleUpdateArticle}
        onCreateArticle={handleCreateArticle}
        onDeleteArticle={handleDeleteArticle}
        onMergeStories={handleMergeStories}
        onTriggerCollector={handleTriggerCollector}
        onSimulateBreaking={handleSimulateBreaking}
        onUpdateSettings={handleUpdateSettings}
        onSaveLogo={handleSaveLogo}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        customLogoUrl={settings.logoUrl}
      />
    </div>
  );
}
