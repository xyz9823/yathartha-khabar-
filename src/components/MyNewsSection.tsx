import React, { useState, useEffect } from 'react';
import { Article } from '../types/news';
import { UserCheck, MapPin, Plus, Check, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface MyNewsSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

const SUGGESTED_PEOPLE = ['KP Sharma Oli', 'Gagan Thapa', 'Balen Shah', 'Pushpa Kamal Dahal', 'Sher Bahadur Deuba', 'Rohit Paudel'];
const SUGGESTED_LOCATIONS = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Chitwan', 'Jhapa', 'Morang', 'Birgunj'];
const SUGGESTED_TOPICS = ['Politics', 'Economy', 'Aviation', 'Technology', 'Tourism', 'Sports', 'Health'];

export const MyNewsSection: React.FC<MyNewsSectionProps> = ({
  articles,
  onSelectArticle
}) => {
  const [followedItems, setFollowedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yathartha_followed_entities');
      return saved ? JSON.parse(saved) : ['Kathmandu', 'KP Sharma Oli', 'Aviation', 'Economy'];
    } catch {
      return ['Kathmandu', 'KP Sharma Oli', 'Aviation', 'Economy'];
    }
  });

  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'people' | 'locations' | 'topics'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('yathartha_followed_entities', JSON.stringify(followedItems));
    } catch {
      // quiet catch
    }
  }, [followedItems]);

  const toggleFollow = (item: string) => {
    if (followedItems.includes(item)) {
      setFollowedItems(followedItems.filter(i => i !== item));
    } else {
      setFollowedItems([...followedItems, item]);
    }
  };

  // Filter personalized articles matching user's followed people, locations, or topics
  const personalizedArticles = articles.filter(art => {
    if (followedItems.length === 0) return true;
    const fullText = `${art.title} ${art.summary} ${art.content} ${(art.tags || []).join(' ')} ${art.category}`.toLowerCase();
    return followedItems.some(item => fullText.includes(item.toLowerCase()));
  });

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 mb-1">
            <Sparkles className="w-4 h-4 text-red-700" />
            <span>Personalized Editorial Feed</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-950">
            My News (मेरो समाचार)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Follow key public figures, municipal locations, and beats. We curate verified reports without algorithmic noise.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-mono self-start sm:self-auto">
          <span>{followedItems.length} Followed Items</span>
        </div>
      </div>

      {/* Follow Entity Controls */}
      <div className="my-6 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
          Manage Your Topics, People &amp; Locations:
        </span>

        {/* Public Figures */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Public Figures:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PEOPLE.map(p => {
              const isFollowed = followedItems.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => toggleFollow(p)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isFollowed
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Municipal Locations */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Locations &amp; Districts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_LOCATIONS.map(loc => {
              const isFollowed = followedItems.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleFollow(loc)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isFollowed
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Beats / Topics */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            <span>Beats &amp; Topics:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TOPICS.map(topic => {
              const isFollowed = followedItems.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleFollow(topic)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isFollowed
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles Stream */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Tailored Dispatches</span>
            <span className="text-xs font-mono font-normal text-slate-500">
              ({personalizedArticles.length} {personalizedArticles.length === 1 ? 'story' : 'stories'})
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Matching your followed entities
          </span>
        </div>

        {personalizedArticles.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
            <p className="text-sm font-semibold">No active stories matching your current selections.</p>
            <p className="text-xs text-slate-400 mt-1">
              Select more figures or districts above to expand your customized wire feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {personalizedArticles.map(art => (
              <article
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={art.image_url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                    {art.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5 font-medium">
                      <span className="text-red-700 font-bold">{art.primarySource}</span>
                      <span>•</span>
                      <span>{new Date(art.published_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-2">
                      {art.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verified Dispatch</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold group-hover:text-red-700">
                      Read <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
