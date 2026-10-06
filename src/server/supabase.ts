import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://urvdiimpezhjyfugxatp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydmRpaW1wZXpoanlmdWd4YXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDE3NTQsImV4cCI6MjEwNjc3Nzc1NH0.kK82z3XmxIWUWb3CXKArzse9FvwP3pvyBD8nMXSkZrk';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- YATHARTHA KHABAR (यथार्थ खबर) - PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase Dashboard: SQL Editor > New query > Run
-- =========================================================================

-- 1. FEEDS / SOURCES TABLE (Section 1 & 15: News Sources Registry)
CREATE TABLE IF NOT EXISTS feeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'rss' CHECK (type IN ('rss', 'api', 'official_bulletin')),
  category TEXT NOT NULL DEFAULT 'Nepal',
  is_active BOOLEAN NOT NULL DEFAULT true,
  polling_interval_seconds INT NOT NULL DEFAULT 60,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  last_success_at TIMESTAMPTZ DEFAULT now(),
  failure_count INT NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. STORIES / ARTICLES TABLE (Section 14 & 15: Core News Stories)
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Nepal',
  tags JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  primary_source TEXT DEFAULT 'Yathartha Khabar Newsroom',
  canonical_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_url TEXT,
  image_source TEXT,
  image_photographer TEXT,
  image_license TEXT,
  image_attribution TEXT,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  is_developing BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'needs_verification', 'rejected')),
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'unconfirmed', 'official_source', 'initial_report')),
  ai_confidence INT NOT NULL DEFAULT 90,
  ai_summary_note TEXT,
  view_count INT NOT NULL DEFAULT 1,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backward compatibility view/table alias for existing articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Nepal',
  tags JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  primary_source TEXT DEFAULT 'Yathartha Khabar Newsroom',
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  image_url TEXT,
  image_source TEXT,
  image_photographer TEXT,
  image_license TEXT,
  image_attribution TEXT,
  is_breaking BOOLEAN DEFAULT false,
  is_developing BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  verification_status TEXT DEFAULT 'verified',
  ai_confidence INT DEFAULT 90,
  ai_summary_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  view_count INT DEFAULT 1,
  timeline JSONB DEFAULT '[]'::jsonb
);

-- 3. STORY UPDATES TABLE (Section 6 & 15: Multi-Source Developing Story Timeline)
CREATE TABLE IF NOT EXISTS story_updates (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  update_text TEXT NOT NULL,
  update_time_npt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. IMAGES TABLE (Section 7 & 15: Legal Editorial Image Archive)
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Nepal',
  caption TEXT,
  source_desk TEXT NOT NULL,
  photographer TEXT,
  license_type TEXT NOT NULL DEFAULT 'Editorial License',
  attribution_text TEXT NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- PERFORMANCE INDEXES (Section 15 & 20)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_updated_at ON stories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_is_breaking ON stories(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_canonical ON stories(canonical_url) WHERE canonical_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

CREATE INDEX IF NOT EXISTS idx_story_updates_story_id ON story_updates(story_id);
CREATE INDEX IF NOT EXISTS idx_story_updates_created_at ON story_updates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_feeds_is_active ON feeds(is_active);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON stories;
CREATE POLICY "Public stories are viewable by everyone" ON stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon all operations on stories" ON stories;
CREATE POLICY "Allow anon all operations on stories" ON stories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
CREATE POLICY "Public articles are viewable by everyone" ON articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon all operations on articles" ON articles;
CREATE POLICY "Allow anon all operations on articles" ON articles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public story updates are viewable by everyone" ON story_updates;
CREATE POLICY "Public story updates are viewable by everyone" ON story_updates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon all operations on story_updates" ON story_updates;
CREATE POLICY "Allow anon all operations on story_updates" ON story_updates FOR ALL USING (true);

DROP POLICY IF EXISTS "Public feeds are viewable by everyone" ON feeds;
CREATE POLICY "Public feeds are viewable by everyone" ON feeds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon all operations on feeds" ON feeds;
CREATE POLICY "Allow anon all operations on feeds" ON feeds FOR ALL USING (true);

DROP POLICY IF EXISTS "Public images are viewable by everyone" ON images;
CREATE POLICY "Public images are viewable by everyone" ON images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon all operations on images" ON images;
CREATE POLICY "Allow anon all operations on images" ON images FOR ALL USING (true);
`;


export interface SupabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: any;
  sources: any;
  primary_source: string;
  published_at: string;
  updated_at: string;
  image_url: string;
  image_source: string;
  image_photographer?: string;
  image_credit?: string;
  image_license: string;
  image_attribution: string;
  original_image_url?: string;
  image_subject?: string;
  is_editorial_placeholder?: boolean;
  context_expansion?: any;
  is_breaking: boolean;
  is_developing: boolean;
  status: string;
  verification_status: string;
  ai_confidence: number;
  ai_summary_note: string;
  created_at: string;
  view_count: number;
  timeline: any;
}

export function formatArticleFromRow(row: SupabaseArticleRow): any {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || '',
    content: row.content || '',
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
    sources: Array.isArray(row.sources) ? row.sources : (typeof row.sources === 'string' ? JSON.parse(row.sources) : []),
    primarySource: row.primary_source || 'Yathartha Khabar',
    published_at: row.published_at,
    updated_at: row.updated_at,
    image_url: row.image_url,
    image_source: row.image_source,
    image_photographer: row.image_photographer,
    image_credit: row.image_credit || row.image_attribution,
    image_license: row.image_license,
    image_attribution: row.image_attribution,
    original_image_url: row.original_image_url || row.image_url,
    image_subject: row.image_subject,
    is_editorial_placeholder: Boolean(row.is_editorial_placeholder),
    context_expansion: row.context_expansion ? (typeof row.context_expansion === 'string' ? JSON.parse(row.context_expansion) : row.context_expansion) : undefined,
    is_breaking: Boolean(row.is_breaking),
    is_developing: Boolean(row.is_developing),
    status: row.status,
    verification_status: row.verification_status,
    ai_confidence: row.ai_confidence || 90,
    ai_summary_note: row.ai_summary_note || '',
    created_at: row.created_at,
    view_count: row.view_count || 1,
    timeline: Array.isArray(row.timeline) ? row.timeline : (typeof row.timeline === 'string' ? JSON.parse(row.timeline) : [])
  };
}

export function formatRowFromArticle(article: any): SupabaseArticleRow {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    category: article.category,
    tags: article.tags,
    sources: article.sources,
    primary_source: article.primarySource || article.primary_source || 'Yathartha Khabar',
    published_at: article.published_at,
    updated_at: article.updated_at,
    image_url: article.image_url,
    image_source: article.image_source,
    image_photographer: article.image_photographer,
    image_credit: article.image_credit || article.image_attribution,
    image_license: article.image_license,
    image_attribution: article.image_attribution,
    original_image_url: article.original_image_url || article.image_url,
    image_subject: article.image_subject,
    is_editorial_placeholder: Boolean(article.is_editorial_placeholder),
    context_expansion: article.context_expansion,
    is_breaking: Boolean(article.is_breaking),
    is_developing: Boolean(article.is_developing),
    status: article.status,
    verification_status: article.verification_status,
    ai_confidence: article.ai_confidence,
    ai_summary_note: article.ai_summary_note,
    created_at: article.created_at,
    view_count: article.view_count,
    timeline: article.timeline
  };
}
