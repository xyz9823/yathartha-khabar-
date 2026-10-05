export type CategoryType =
  | 'Latest'
  | 'Breaking News'
  | 'Nepal'
  | 'Politics'
  | 'Business'
  | 'Economy'
  | 'Technology'
  | 'Sports'
  | 'Entertainment'
  | 'Tourism'
  | 'Aviation'
  | 'Education'
  | 'Health'
  | 'Science'
  | 'Environment'
  | 'World';

export interface StorySource {
  id: string;
  name: string;
  url: string;
  reportedAt: string;
  snippet?: string;
  isPrimary?: boolean;
}

export interface StoryTimelineItem {
  time: string;
  source: string;
  update: string;
  isPinned?: boolean;
  quote?: { text: string; speaker: string; role?: string };
}

export interface FactCheckItem {
  id: string;
  claim: string;
  claimant: string;
  evidence: string;
  context: string;
  verdict: 'VERIFIED_TRUE' | 'MISLEADING' | 'FALSE' | 'UNSUBSTANTIATED';
  sources: string[];
  dateChecked: string;
}

export interface VisualExplainer {
  whatHappened: string;
  whyItMatters: string;
  whoIsInvolved: string[];
  whatHappensNext: string;
  keyStats?: { label: string; value: string }[];
}

export interface Article {
  id: string;
  title: string;
  title_ne?: string;
  slug: string;
  summary: string;
  summary_ne?: string;
  content: string;
  content_ne?: string;
  category: CategoryType | string;
  tags: string[];
  sources: StorySource[];
  primarySource: string;
  published_at: string;
  updated_at: string;
  image_url: string;
  image_source: string;
  image_photographer?: string;
  image_license: string;
  image_attribution: string;
  image_caption?: string;
  image_alt_text?: string;
  image_subject?: string;
  is_editorial_placeholder?: boolean;
  is_breaking: boolean;
  is_developing: boolean;
  is_fact_check?: boolean;
  is_live_coverage?: boolean;
  is_investigation?: boolean;
  fact_check?: FactCheckItem;
  explainer?: VisualExplainer;
  status: 'published' | 'draft' | 'needs_verification' | 'rejected';
  verification_status: 'verified' | 'unconfirmed' | 'official_source' | 'initial_report';
  ai_confidence: number;
  ai_summary_note: string;
  created_at: string;
  view_count: number;
  share_count?: number;
  read_time_minutes?: number;
  timeline: StoryTimelineItem[];
  is_demo?: boolean;
  corrections?: { date: string; note: string }[];
  audio_url?: string;
}

export interface NewsFeed {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'official_bulletin';
  url: string;
  isActive: boolean;
  category: string;
  lastChecked: string;
  fetchCount: number;
}

export type PublishingMode = 'MANUAL' | 'ASSISTED' | 'AUTOMATIC';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  publishingMode: PublishingMode;
  autoPublishConfidenceThreshold: number;
  logoUrl: string;
  emergencyBannerActive: boolean;
  emergencyBannerText: string;
  geminiModel: string;
  pollingIntervalSeconds: number;
  autoCollectorEnabled: boolean;
}

export interface SourceMonitorStats {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'official_bulletin';
  status: 'connected' | 'checking' | 'temporarily_unavailable' | 'idle';
  lastChecked: string;
  lastSuccess: string;
  failureCount: number;
  itemsDetectedCount: number;
  itemsProcessedCount: number;
  latencyMs: number;
  errorMessage?: string;
}

export interface CollectorEngineStatus {
  isRunning: boolean;
  pollingIntervalSeconds: number;
  totalSources: number;
  activeSources: number;
  storiesDetected: number;
  storiesProcessed: number;
  storiesPublished: number;
  storiesWaitingVerification: number;
  duplicatesDetected: number;
  failedRequests: number;
  lastRunTime: string;
  sources: SourceMonitorStats[];
}

export interface RealtimeNewsEvent {
  type: 'NEW_STORY' | 'UPDATE_STORY' | 'MERGE_STORY' | 'BREAKING_ALERT' | 'STATS_UPDATE';
  article?: Article;
  storyId?: string;
  message?: string;
  timestamp: string;
}

export interface WeatherCity {
  city: string;
  city_ne: string;
  temp: number;
  condition: string;
  condition_ne: string;
  high: number;
  low: number;
  humidity: number;
  windSpeedKm: number;
  isAlert?: boolean;
  alertText?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'reading';
  language: 'en' | 'ne';
  fontSize: 'normal' | 'medium' | 'large';
  density: 'comfortable' | 'compact';
  elderFriendly: boolean;
  audioSpeed: number;
  savedArticleIds: string[];
  readingHistory: { id: string; readAt: string; title: string }[];
  followedTopics: string[];
}
