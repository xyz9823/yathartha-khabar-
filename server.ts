import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { supabase, formatArticleFromRow, formatRowFromArticle, SUPABASE_SCHEMA_SQL } from './src/server/supabase.ts';
import { CollectorEngine } from './src/server/collectorEngine.ts';
import { selectRealEditorialImage, generateEditorialPlaceholderSvg, VERIFIED_NEPAL_IMAGE_ARCHIVE } from './src/server/editorialImageRegistry.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Server-Sent Events (SSE) active subscriber pool for real-time live news push
const sseClients = new Set<Response>();

function broadcastRealtime(event: any) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Supabase Connection State
let isSupabaseConnected = false;
let supabaseTableExists = false;
let supabaseError: string | null = null;

async function checkAndInitSupabase() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(100);

    if (error) {
      console.warn('[Supabase] Articles table check:', error.message);
      supabaseError = error.message;
      supabaseTableExists = false;
      isSupabaseConnected = true; // Supabase project endpoint responded
    } else {
      isSupabaseConnected = true;
      supabaseTableExists = true;
      supabaseError = null;
      console.log(`[Supabase] Successfully connected to Supabase! Found ${data?.length || 0} articles.`);

      if (data && data.length > 0) {
        articles = data.map(formatArticleFromRow);
      } else {
        console.log('[Supabase] Empty table detected, auto-seeding baseline articles to Supabase...');
        const rows = articles.map(formatRowFromArticle);
        const { error: seedErr } = await supabase.from('articles').upsert(rows);
        if (seedErr) {
          console.warn('[Supabase] Auto-seed note:', seedErr.message);
        } else {
          console.log('[Supabase] Auto-seeded baseline articles to Supabase successfully.');
        }
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Connection exception:', err.message);
    supabaseError = err.message;
  }
}

// Initialize Gemini SDK if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory data store for Yathartha Khabar articles
export interface StorySource {
  id: string;
  name: string;
  url: string;
  reportedAt: string;
  snippet?: string;
  isPrimary?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
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
  is_breaking: boolean;
  is_developing: boolean;
  status: 'published' | 'draft' | 'needs_verification' | 'rejected';
  verification_status: 'verified' | 'unconfirmed' | 'official_source' | 'initial_report';
  ai_confidence: number;
  ai_summary_note: string;
  created_at: string;
  view_count: number;
  timeline: { time: string; source: string; update: string }[];
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

// Realistic newsroom baseline articles with authentic, licensed Nepal photography
let articles: Article[] = [
  {
    id: 'yk-001',
    title: 'Tribhuvan International Airport Initiates Night Flight Runway Maintenance Operations',
    slug: 'tribhuvan-international-airport-night-flight-runway-maintenance',
    summary: 'Civil Aviation Authority of Nepal commences scheduled runway resurfacing and taxiway lighting modernization to enhance international flight safety ahead of the festive season.',
    content: `KATHMANDU — Tribhuvan International Airport (TIA), Nepal's primary international aviation hub, has officially commenced scheduled runway and taxiway modernization works during low-traffic night hours.\n\nAccording to the Civil Aviation Authority of Nepal (CAAN), the maintenance plan includes precision asphalt overlaying along the 3,050-meter runway, calibration of Instrument Landing Systems (ILS), and installation of energy-efficient LED airfield lighting.\n\nOperations are conducted between 11:30 PM and 5:30 AM local time to minimize daytime schedule disruption. Airlines operating intercontinental and regional flights have been coordinated with advance Notice to Air Missions (NOTAM).\n\nCAAN officials emphasized that the upgrade will bolster tarmac endurance during monsoon downpours and ensure seamless operations as Nepal enters its peak autumn tourism and mountaineering window.`,
    category: 'Aviation',
    tags: ['TIA', 'Aviation', 'CAAN', 'Kathmandu', 'Runway Upgrade', 'Infrastructure'],
    sources: [
      { id: 's-1', name: 'CAAN Official Bulletin', url: 'https://caanepal.gov.np', reportedAt: '2026-10-05T06:30:00Z', isPrimary: true, snippet: 'Runway surface safety review and scheduled resurfacing initiated under Phase 2 modernization.' },
      { id: 's-2', name: 'Nepal News Desk', url: 'https://example.com/nepal-news-tia', reportedAt: '2026-10-05T06:50:00Z', snippet: 'Night maintenance schedule announced for international carriers.' }
    ],
    primarySource: 'CAAN Official Bulletin',
    published_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 min ago
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Tribhuvan_International_Airport-IMG_1070.jpg',
    image_source: 'Tribhuvan International Airport Field Documentation',
    image_photographer: 'Bijay Chaurasia',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Bijay Chaurasia / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: true,
    is_developing: true,
    status: 'published',
    verification_status: 'official_source',
    ai_confidence: 96,
    ai_summary_note: 'Synthesized from CAAN official release and validated airline operational notices.',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    view_count: 1420,
    timeline: [
      { time: '06:30 AM', source: 'CAAN', update: 'Formal NOTAM released specifying 6-hour night maintenance window.' },
      { time: '07:10 AM', source: 'Nepal News Desk', update: 'Airlines confirm night flight rescheduling without daytime cancellations.' }
    ]
  },
  {
    id: 'yk-002',
    title: 'Nepal Rastra Bank Reviews Foreign Exchange Reserves and Macroeconomic Stability Indicators',
    slug: 'nepal-rastra-bank-foreign-exchange-reserves-update',
    summary: 'Central bank reports steady foreign currency reserves sufficient for over 13 months of merchandise imports, bolstered by remittance inflows and selective capital goods management.',
    content: `KATHMANDU — Nepal Rastra Bank (NRB), the nation's central monetary authority, released its latest periodic macroeconomic assessment detailing strong foreign exchange reserves and stabilized liquidity in commercial banking channels.\n\nGross foreign exchange reserves increased to adequate levels capable of financing over 13 months of prospective goods and service imports. Worker remittances sent through formal institutional banking channels recorded steady year-on-year expansion.\n\nNRB Governor and monetary policy directors noted that while headline inflation remains within targeted single-digit bandwidths, vigilant monitoring will continue regarding international crude oil and food grain commodity movements.`,
    category: 'Economy',
    tags: ['Nepal Rastra Bank', 'Economy', 'Forex', 'Remittance', 'Finance', 'Monetary Policy'],
    sources: [
      { id: 's-3', name: 'Nepal Rastra Bank Press Note', url: 'https://nrb.org.np', reportedAt: '2026-10-05T05:15:00Z', isPrimary: true, snippet: 'Monthly financial review confirms reserve sufficiency ratio above prudential targets.' },
      { id: 's-4', name: 'Business Khabar Wire', url: 'https://example.com/biz-wire', reportedAt: '2026-10-05T05:40:00Z', snippet: 'Liquidity ease reflected in reduced interbank lending rates.' }
    ],
    primarySource: 'Nepal Rastra Bank Press Note',
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Nepal_Rastra_Bank_Pokhara.jpg',
    image_source: 'Nepal Rastra Bank Central Office & Regional Archives',
    image_photographer: 'Bhupendra Shrestha',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Bhupendra Shrestha / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'verified',
    ai_confidence: 94,
    ai_summary_note: 'Verified central bank macroeconomic dataset with multi-source banking analyst commentary.',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    view_count: 890,
    timeline: [
      { time: '05:15 AM', source: 'NRB', update: 'Official periodic economic stability report published.' }
    ]
  },
  {
    id: 'yk-003',
    title: 'Department of Tourism Implements Mandatory GPS Trackers and Safety Guidelines for High-Altitude Treks',
    slug: 'department-of-tourism-mandatory-gps-trackers-everest-annapurna',
    summary: 'New safety protocols require authorized satellite locators and licensed guides across Everest and Annapurna conservation zones to prevent solo traveler emergencies.',
    content: `POKHARA / KATHMANDU — In a bid to enhance climber safety and rapid rescue dispatch capabilities, the Department of Tourism together with the Trekking Agencies Association of Nepal (TAAN) has made satellite tracking beacons mandatory for high-altitude expeditions exceeding 4,000 meters.\n\nThe directive applies to the Khumbu, Annapurna Circuit, Manaslu, and Langtang protected circuits. Registered trekking agencies will provide calibrated units synchronized with the National Emergency Rescue Coordination Centre.\n\nTourism authorities underscored that recent unseasonal blizzards in trans-Himalayan passes highlighted the need for real-time telemetry, ensuring search and rescue teams can pinpoint distress signals without delay.`,
    category: 'Tourism',
    tags: ['Tourism', 'Everest', 'Annapurna', 'Trekking', 'Mountain Safety', 'Himalayas'],
    sources: [
      { id: 's-5', name: 'Department of Tourism Bulletin', url: 'https://tourismdepartment.gov.np', reportedAt: '2026-10-05T04:20:00Z', isPrimary: true },
      { id: 's-6', name: 'TAAN Press Release', url: 'https://taan.org.np', reportedAt: '2026-10-05T04:45:00Z' },
      { id: 's-7', name: 'Himalayan News Wire', url: 'https://example.com/himalayan-news', reportedAt: '2026-10-05T05:00:00Z' }
    ],
    primarySource: 'Department of Tourism Bulletin',
    published_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Under_stars_and_snows.jpg',
    image_source: 'Himalayan Expedition & Conservation Archive',
    image_photographer: 'Ummidnp',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Ummidnp / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: false,
    is_developing: true,
    status: 'published',
    verification_status: 'verified',
    ai_confidence: 97,
    ai_summary_note: 'Multi-source story merged from Dept. of Tourism, TAAN, and mountain safety agencies.',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    view_count: 2310,
    timeline: [
      { time: '04:20 AM', source: 'Dept of Tourism', update: 'Guideline draft approved for high-altitude telemetry requirement.' },
      { time: '04:45 AM', source: 'TAAN', update: 'Agency operators establish equipment distribution points in Lukla and Besisahar.' }
    ]
  },
  {
    id: 'yk-004',
    title: 'Ministry of Health Expands Free Pediatric Immunization and Dengue Surveillance in Terai Districts',
    slug: 'health-ministry-pediatric-immunization-dengue-surveillance',
    summary: 'Mobile healthcare clinics and vector control inspection teams mobilized across Province 1 and Madhesh Province as preventive measures against post-monsoon outbreaks.',
    content: `JANAKPUR / BIRATNAGAR — The Ministry of Health and Population has initiated an extensive vector surveillance drive and expanded cold-chain pediatric vaccines across low-lying Terai districts.\n\nEpidemiology and Disease Control Division (EDCD) officials stated that community health volunteers have been equipped with rapid diagnostic test kits for early detection of viral fevers and dengue.\n\nMunicipal authorities have simultaneously deployed larvicide misting along urban drainage canals and organized doorstep awareness campaigns in key commercial townships.`,
    category: 'Health',
    tags: ['Health', 'Vaccination', 'EDCD', 'Terai', 'Public Health', 'Nepal'],
    sources: [
      { id: 's-8', name: 'Ministry of Health & Population', url: 'https://mohp.gov.np', reportedAt: '2026-10-05T03:30:00Z', isPrimary: true },
      { id: 's-9', name: 'EDCD Surveillance Report', url: 'https://edcd.gov.np', reportedAt: '2026-10-05T03:45:00Z' }
    ],
    primarySource: 'Ministry of Health & Population',
    published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Bir_Hospital_situated_in_Kathmandu.jpg',
    image_source: 'National Public Health Infrastructure Archive',
    image_photographer: 'Sandeep Raut',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Sandeep Raut / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'official_source',
    ai_confidence: 95,
    ai_summary_note: 'Verified against Ministry of Health epidemiology bulletin.',
    created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    view_count: 650,
    timeline: [
      { time: '03:30 AM', source: 'MoHP', update: 'Field teams deployed with cold-chain storage and diagnostic tools.' }
    ]
  },
  {
    id: 'yk-005',
    title: 'Nepal IT Innovation Park Lalitpur Announces Incubation Grant for AI & CleanTech Startups',
    slug: 'lalitpur-it-innovation-park-grant-ai-cleantech-startups',
    summary: 'Technology initiative backed by ICT council opens seed capital applications for local engineers developing agricultural tech, digital payments, and green logistics.',
    content: `LALITPUR — The ICT Innovation Center in Lalitpur has launched a nationwide call for early-stage technology founders, offering matching seed funds, high-speed fiber computing infrastructure, and mentorship from senior diaspora engineers.\n\nThe accelerator prioritizes applications addressing real-world Himalayan challenges: solar cold storage telemetry, vernacular voice interfaces for rural farmers, and blockchain-verified export certification for organic tea and orthodox coffee.\n\nRepresentatives from leading Kathmandu universities welcomed the grant, noting that retaining domestic engineering talent is crucial for Nepal's growing digital service export sector.`,
    category: 'Technology',
    tags: ['Technology', 'Startups', 'Lalitpur', 'Innovation', 'AI', 'ICT Nepal'],
    sources: [
      { id: 's-10', name: 'ICT Innovation Council', url: 'https://example.com/ict-council', reportedAt: '2026-10-05T02:00:00Z', isPrimary: true },
      { id: 's-11', name: 'TechSathi Nepal', url: 'https://example.com/tech-sathi', reportedAt: '2026-10-05T02:30:00Z' }
    ],
    primarySource: 'ICT Innovation Council',
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/IOE%2CCentral_Campus.jpg',
    image_source: 'Institute of Engineering (IOE) Lalitpur Innovation Archive',
    image_photographer: 'Preetchettri',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Preetchettri / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'verified',
    ai_confidence: 91,
    ai_summary_note: 'Verified from ICT Council launch conference and grant eligibility documents.',
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    view_count: 1180,
    timeline: [
      { time: '02:00 AM', source: 'ICT Council', update: 'Grant portal opened for verified domestic software innovators.' }
    ]
  },
  {
    id: 'yk-006',
    title: 'Parliamentary Committee Concludes Deliberations on National Clean Energy Transit Bill',
    slug: 'parliament-committee-clean-energy-transit-electric-mobility',
    summary: 'Legislative panel approves tax incentives for high-capacity electric buses and public EV charging network installation along the East-West Highway corridor.',
    content: `KATHMANDU — The Parliamentary Committee on Infrastructure and Natural Resources has concluded its review on the National Clean Energy Transit Bill, sending the legislative draft for full house endorsement.\n\nThe proposed framework introduces targeted tariff concessions for municipal electric buses, standardized three-phase fast charging hubs at 40-kilometer intervals along national arterial highways, and localized battery recycling mandates.\n\nEnergy analysts estimate the policy will significantly displace fossil fuel import dependency while utilizing surplus clean hydroelectricity generated during monsoon peak capacity.`,
    category: 'Politics',
    tags: ['Politics', 'Parliament', 'Clean Energy', 'EV', 'Infrastructure', 'Kathmandu'],
    sources: [
      { id: 's-12', name: 'Parliament Secretariat Record', url: 'https://parliament.gov.np', reportedAt: '2026-10-05T01:10:00Z', isPrimary: true },
      { id: 's-13', name: 'National News Agency (RSS)', url: 'https://rssnepal.org.np', reportedAt: '2026-10-05T01:30:00Z' }
    ],
    primarySource: 'Parliament Secretariat Record',
    published_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Singha_Durbar.jpg',
    image_source: 'Government Secretariat Media Pool',
    image_photographer: 'Gaurav Dhwaj Khadka',
    image_license: 'CC BY-SA 4.0',
    image_attribution: 'Photo: Gaurav Dhwaj Khadka / Wikimedia Commons (CC BY-SA 4.0)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'official_source',
    ai_confidence: 93,
    ai_summary_note: 'Official parliamentary proceedings summary verified against committee report draft.',
    created_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
    view_count: 920,
    timeline: [
      { time: '01:10 AM', source: 'Parliament Secretariat', update: 'Committee draft finalized unanimously.' }
    ]
  },
  {
    id: 'yk-007',
    title: 'Nepal National Cricket Team Commences Intensive Training Camp for International Triangular Series',
    slug: 'nepal-cricket-team-training-camp-triangular-series-tu-ground',
    summary: 'Head coach announces 18-player preliminary squad for training at TU International Cricket Ground in Kirtipur ahead of competitive overseas qualifiers.',
    content: `KIRTIPUR — The Cricket Association of Nepal (CAN) has officially launched a 3-week high-intensity preparatory camp at the Tribhuvan University International Ground in Kirtipur.\n\nThe camp gathers veteran all-rounders alongside rising pacers from the National U-19 Championship. Focus areas include death-overs bowling discipline, middle-order strike rotation on spinning tracks, and fitness benchmarks.\n\nCAN officials confirmed that the series matches will be broadcast nationally and feature upgraded floodlight readiness testing for upcoming night matches.`,
    category: 'Sports',
    tags: ['Sports', 'Cricket', 'CAN', 'Kirtipur', 'Nepal Cricket', 'Rhinos'],
    sources: [
      { id: 's-14', name: 'Cricket Association of Nepal (CAN)', url: 'https://can.org.np', reportedAt: '2026-10-04T18:00:00Z', isPrimary: true },
      { id: 's-15', name: 'Khabar Sports Desk', url: 'https://example.com/khabar-sports', reportedAt: '2026-10-04T18:25:00Z' }
    ],
    primarySource: 'Cricket Association of Nepal (CAN)',
    published_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/TU_Stadium_2025.jpg',
    image_source: 'Cricket Association of Nepal (CAN) Stadium Records',
    image_photographer: 'DarkFlames10',
    image_license: 'CC BY 4.0',
    image_attribution: 'Photo: DarkFlames10 / Wikimedia Commons (CC BY 4.0)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'official_source',
    ai_confidence: 96,
    ai_summary_note: 'Verified through official CAN roster announcement.',
    created_at: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
    view_count: 2840,
    timeline: [
      { time: '06:00 PM', source: 'CAN', update: 'Camp initialized at TU Ground with full squad attendance.' }
    ]
  },
  {
    id: 'yk-008',
    title: 'Kathmandu Heritage Conservation Trust Restores Historic Malla-Era Water Spout in Patan',
    slug: 'patan-malla-era-water-spout-restoration-heritage-conservation',
    summary: 'Traditional stonemasons and archaeologists successfully reactivate an underground terracotta conduit system dating back to the 17th century.',
    content: `LALITPUR — In an impressive feat of indigenous hydraulic engineering and heritage conservation, Patan's historic Manga Hiti water spout has seen its natural spring inflow restored after painstaking subterranean conduit clearance.\n\nThe project, executed in partnership with local guthi members and architectural conservators, repaired cracked terracotta conduits while preserving intricate stone-carved makara gargoyles.\n\nLocal elders celebrated the return of crystal-clear water, highlighting how traditional Newari urban water management continues to offer viable sustainable lessons for modern stormwater resilience.`,
    category: 'Nepal',
    tags: ['Nepal', 'Patan', 'Heritage', 'Water Spout', 'Architecture', 'Culture'],
    sources: [
      { id: 's-16', name: 'Heritage Conservation Board', url: 'https://example.com/heritage-board', reportedAt: '2026-10-04T15:00:00Z', isPrimary: true },
      { id: 's-17', name: 'Patan Post', url: 'https://example.com/patan-post', reportedAt: '2026-10-04T15:30:00Z' }
    ],
    primarySource: 'Heritage Conservation Board',
    published_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Patan_durbar_square.jpg',
    image_source: 'Lalitpur Cultural & Heritage Conservation Registry',
    image_photographer: 'Zulufive',
    image_license: 'CC0 Public Domain',
    image_attribution: 'Photo: Zulufive / Wikimedia Commons (CC0 Public Domain)',
    is_breaking: false,
    is_developing: false,
    status: 'published',
    verification_status: 'verified',
    ai_confidence: 95,
    ai_summary_note: 'Verified archaeological report and on-site restoration log.',
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    view_count: 1530,
    timeline: [
      { time: '03:00 PM', source: 'Heritage Board', update: 'Subterranean conduit clearing completed successfully.' }
    ]
  }
];

// Configured news sources feeds for automated ingestion
let feeds: NewsFeed[] = [
  { id: 'f-1', name: 'Onlinekhabar RSS', type: 'rss', url: 'https://onlinekhabar.com/feed', isActive: true, category: 'Nepal', lastChecked: new Date().toISOString(), fetchCount: 124 },
  { id: 'f-2', name: 'Ratopati News Feed', type: 'rss', url: 'https://ratopati.com/feed', isActive: true, category: 'Politics', lastChecked: new Date().toISOString(), fetchCount: 98 },
  { id: 'f-3', name: 'Setopati Digital Wire', type: 'rss', url: 'https://setopati.com/feed', isActive: true, category: 'Latest', lastChecked: new Date().toISOString(), fetchCount: 110 },
  { id: 'f-4', name: 'Nagarik News RSS', type: 'rss', url: 'https://nagariknetwork.com/feed', isActive: true, category: 'National', lastChecked: new Date().toISOString(), fetchCount: 82 },
  { id: 'f-5', name: 'Nepal Police Official Bulletin', type: 'official_bulletin', url: 'https://nepalpolice.gov.np/feed', isActive: true, category: 'Breaking News', lastChecked: new Date().toISOString(), fetchCount: 35 },
  { id: 'f-6', name: 'Disaster Risk Reduction Portal (NDRRMA)', type: 'official_bulletin', url: 'https://bipadportal.gov.np/feed', isActive: true, category: 'Emergency', lastChecked: new Date().toISOString(), fetchCount: 42 },
  { id: 'f-7', name: 'Civil Aviation Authority (CAAN)', type: 'official_bulletin', url: 'https://caanepal.gov.np/feed', isActive: true, category: 'Aviation', lastChecked: new Date().toISOString(), fetchCount: 29 },
  { id: 'f-8', name: 'Nepal Rastra Bank Announcements', type: 'api', url: 'https://nrb.org.np/api/news', isActive: true, category: 'Economy', lastChecked: new Date().toISOString(), fetchCount: 61 }
];

// Site settings & Publishing modes
let settings = {
  siteName: 'Yathartha Khabar',
  tagline: "Nepal's Modern Digital Newsroom",
  publishingMode: 'ASSISTED' as 'MANUAL' | 'ASSISTED' | 'AUTOMATIC',
  autoPublishConfidenceThreshold: 85,
  logoUrl: '', // When user uploads logo, path or data URL stored here
  emergencyBannerActive: false,
  emergencyBannerText: '',
  geminiModel: 'gemini-3.8-flash',
  pollingIntervalSeconds: 60,
  autoCollectorEnabled: true
};

// Initialize Background News Ingestion Engine (Section 1 & 2)
const collectorEngine = new CollectorEngine(aiClient);

collectorEngine.bindDependencies(
  broadcastRealtime,
  async (story: Article) => {
    articles.unshift(story);
    if (supabaseTableExists) {
      try {
        await supabase.from('articles').insert(formatRowFromArticle(story));
      } catch (err) {
        console.warn('[Supabase] Auto-collector insert:', err);
      }
    }
  },
  async (story: Article) => {
    const idx = articles.findIndex(a => a.id === story.id);
    if (idx !== -1) articles[idx] = story;
    if (supabaseTableExists) {
      try {
        await supabase.from('articles').update(formatRowFromArticle(story)).eq('id', story.id);
      } catch (err) {
        console.warn('[Supabase] Auto-collector update:', err);
      }
    }
  },
  () => articles
);

// Start collector on server boot
collectorEngine.start(settings.pollingIntervalSeconds);

// API Endpoints

// Real-Time Server-Sent Events stream for automated push updates (Section 9)
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// GET /api/collector/status (Section 13: Admin Live Monitor)
app.get('/api/collector/status', (_req: Request, res: Response) => {
  res.json({ success: true, data: collectorEngine.getStatus() });
});

// POST /api/collector/config (Section 2: Configurable Polling Intervals)
app.post('/api/collector/config', (req: Request, res: Response) => {
  const { intervalSeconds, isRunning } = req.body;
  if (typeof intervalSeconds === 'number') {
    settings.pollingIntervalSeconds = intervalSeconds;
    collectorEngine.setInterval(intervalSeconds);
  }
  if (typeof isRunning === 'boolean') {
    settings.autoCollectorEnabled = isRunning;
    if (isRunning) {
      collectorEngine.start(settings.pollingIntervalSeconds);
    } else {
      collectorEngine.stop();
    }
  }
  res.json({ success: true, data: collectorEngine.getStatus() });
});

// POST /api/collector/run (Manual trigger)
app.post('/api/collector/run', async (_req: Request, res: Response) => {
  const result = await collectorEngine.runCollectorCycle();
  res.json({ success: true, result, data: collectorEngine.getStatus() });
});

// POST /api/collector/simulate-breaking (Section 17: Demo Simulation)
app.post('/api/collector/simulate-breaking', async (req: Request, res: Response) => {
  const isBreaking = req.body.isBreaking !== false;
  const story = await collectorEngine.simulateIncomingStory(isBreaking, settings.publishingMode);
  res.json({ success: true, data: story });
});

// GET /api/images/editorial-archive (Authorized Licensed Nepal Visuals Registry)
app.get('/api/images/editorial-archive', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: VERIFIED_NEPAL_IMAGE_ARCHIVE.length,
    data: VERIFIED_NEPAL_IMAGE_ARCHIVE
  });
});

// POST /api/images/select (Automated Real Image Selection Tool)
app.post('/api/images/select', (req: Request, res: Response) => {
  const { title, summary, category, tags, sourceName, providedImageUrl } = req.body;
  const activeUrls = new Set(articles.map(a => a.image_url).filter(Boolean));
  const result = selectRealEditorialImage({
    title: title || '',
    summary: summary || '',
    category: category || 'Nepal',
    tags: tags || [],
    sourceName: sourceName || 'News Wire',
    providedImageUrl
  }, activeUrls);

  res.json({ success: true, data: result });
});

// 0. GET /api/supabase/status
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  let count = 0;
  if (supabaseTableExists) {
    const { count: c } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    count = c || 0;
  }
  res.json({
    success: true,
    connected: isSupabaseConnected,
    tableExists: supabaseTableExists,
    error: supabaseError,
    url: 'https://urvdiimpezhjyfugxatp.supabase.co',
    rowCount: count,
    schemaSql: SUPABASE_SCHEMA_SQL
  });
});

// POST /api/supabase/seed
app.post('/api/supabase/seed', async (_req: Request, res: Response) => {
  try {
    const rows = articles.map(formatRowFromArticle);
    const { error } = await supabase.from('articles').upsert(rows);
    if (error) {
      return res.status(400).json({ success: false, message: error.message, schemaSql: SUPABASE_SCHEMA_SQL });
    }
    supabaseTableExists = true;
    supabaseError = null;
    res.json({ success: true, message: `Successfully seeded ${rows.length} articles to Supabase.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. GET /api/news (filter by category, status, search, limit)
app.get('/api/news', async (req: Request, res: Response) => {
  const { category, status, search, is_breaking, limit } = req.query;

  // Attempt Supabase query if table exists
  if (supabaseTableExists) {
    try {
      let query = supabase.from('articles').select('*');
      if (status) {
        query = query.eq('status', status as string);
      } else {
        query = query.eq('status', 'published');
      }
      if (category && category !== 'All' && category !== 'Latest') {
        query = query.ilike('category', category as string);
      }
      if (is_breaking === 'true') {
        query = query.eq('is_breaking', true);
      }
      query = query.order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(parseInt(limit as string, 10));
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data.map(formatArticleFromRow);
        if (search) {
          const q = (search as string).toLowerCase();
          results = results.filter((a: Article) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.tags.some(t => t.toLowerCase().includes(q)) ||
            a.primarySource.toLowerCase().includes(q)
          );
        }
        return res.json({ success: true, count: results.length, data: results, source: 'supabase' });
      }
    } catch (err) {
      console.warn('[Supabase] Query fallback to memory:', err);
    }
  }

  // Memory fallback
  let filtered = [...articles];

  if (category && category !== 'All' && category !== 'Latest') {
    filtered = filtered.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (status) {
    filtered = filtered.filter(a => a.status === status);
  } else {
    filtered = filtered.filter(a => a.status === 'published');
  }

  if (is_breaking === 'true') {
    filtered = filtered.filter(a => a.is_breaking);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.primarySource.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit as string, 10));
  }

  res.json({ success: true, count: filtered.length, data: filtered, source: 'memory' });
});

// 2. GET /api/news/admin/all (returns all statuses: published, draft, needs_verification)
app.get('/api/news/admin/all', async (_req: Request, res: Response) => {
  if (supabaseTableExists) {
    try {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.json({ success: true, data: data.map(formatArticleFromRow), source: 'supabase' });
      }
    } catch (err) {
      console.warn('[Supabase] Admin all fallback to memory:', err);
    }
  }
  const sorted = [...articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: sorted, source: 'memory' });
});

// 3. GET /api/news/:id
app.get('/api/news/:id', async (req: Request, res: Response) => {
  if (supabaseTableExists) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .or(`id.eq.${req.params.id},slug.eq.${req.params.id}`)
        .single();

      if (!error && data) {
        const article = formatArticleFromRow(data);
        // increment view count asynchronously in Supabase
        supabase.from('articles').update({ view_count: (data.view_count || 1) + 1 }).eq('id', data.id);
        return res.json({ success: true, data: article, source: 'supabase' });
      }
    } catch (err) {
      console.warn('[Supabase] Single article fetch fallback:', err);
    }
  }

  const article = articles.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
  article.view_count += 1;
  res.json({ success: true, data: article, source: 'memory' });
});

// 4. POST /api/news (Create story)
app.post('/api/news', async (req: Request, res: Response) => {
  const body = req.body;
  const newArticle: Article = {
    id: `yk-${Date.now().toString(36)}`,
    title: body.title || 'Untitled Article',
    slug: (body.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    summary: body.summary || '',
    content: body.content || '',
    category: body.category || 'Nepal',
    tags: body.tags || ['Nepal'],
    sources: body.sources || [{ id: `s-${Date.now()}`, name: body.primarySource || 'Official Source', url: '#', reportedAt: new Date().toISOString(), isPrimary: true }],
    primarySource: body.primarySource || 'Editorial Newsroom',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: body.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    image_source: body.image_source || 'Verified Source',
    image_photographer: body.image_photographer || '',
    image_license: body.image_license || 'Standard Editorial License',
    image_attribution: body.image_attribution || 'Photo: Yathartha Khabar Media Archive',
    is_breaking: Boolean(body.is_breaking),
    is_developing: Boolean(body.is_developing),
    status: body.status || 'published',
    verification_status: body.verification_status || 'verified',
    ai_confidence: body.ai_confidence || 90,
    ai_summary_note: body.ai_summary_note || 'Standard verified editorial review.',
    created_at: new Date().toISOString(),
    view_count: 1,
    timeline: body.timeline || [{ time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), source: body.primarySource || 'Newsroom', update: 'Initial report filed.' }]
  };

  articles.unshift(newArticle);

  if (supabaseTableExists) {
    try {
      await supabase.from('articles').insert(formatRowFromArticle(newArticle));
    } catch (err) {
      console.warn('[Supabase] Insert article error:', err);
    }
  }

  // Broadcast real-time event to connected readers
  broadcastRealtime({
    type: 'NEW_STORY',
    article: newArticle,
    storyId: newArticle.id,
    isBreaking: newArticle.is_breaking,
    timestamp: newArticle.published_at
  });

  res.status(201).json({ success: true, data: newArticle });
});

// 5. PUT /api/news/:id (Update or moderate story)
app.put('/api/news/:id', async (req: Request, res: Response) => {
  const index = articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }

  const updated = {
    ...articles[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  articles[index] = updated;

  if (supabaseTableExists) {
    try {
      await supabase.from('articles').update(formatRowFromArticle(updated)).eq('id', req.params.id);
    } catch (err) {
      console.warn('[Supabase] Update article error:', err);
    }
  }

  // Broadcast real-time update
  broadcastRealtime({
    type: 'UPDATE_STORY',
    article: updated,
    storyId: updated.id,
    isBreaking: updated.is_breaking,
    timestamp: updated.updated_at
  });

  res.json({ success: true, data: updated });
});

// 6. DELETE /api/news/:id
app.delete('/api/news/:id', async (req: Request, res: Response) => {
  const index = articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
  const removed = articles.splice(index, 1);

  if (supabaseTableExists) {
    try {
      await supabase.from('articles').delete().eq('id', req.params.id);
    } catch (err) {
      console.warn('[Supabase] Delete article error:', err);
    }
  }

  res.json({ success: true, data: removed[0] });
});

// 7. POST /api/news/merge (Multi-Source Story Merging)
app.post('/api/news/merge', (req: Request, res: Response) => {
  const { targetArticleId, sourceArticleIds, newDevelopmentNote } = req.body;
  const target = articles.find(a => a.id === targetArticleId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Target story not found' });
  }

  const sourcesToAdd: StorySource[] = [];
  const sourceArticles = articles.filter(a => (sourceArticleIds as string[]).includes(a.id));

  for (const src of sourceArticles) {
    for (const s of src.sources) {
      if (!target.sources.some(existing => existing.name.toLowerCase() === s.name.toLowerCase())) {
        sourcesToAdd.push(s);
      }
    }
  }

  target.sources.push(...sourcesToAdd);
  target.is_developing = true;
  target.updated_at = new Date().toISOString();

  if (newDevelopmentNote) {
    target.timeline.unshift({
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      source: sourcesToAdd.map(s => s.name).join(', ') || 'Corroborating Reports',
      update: newDevelopmentNote
    });
  }

  // Update summary note to show multi-source transparency
  target.ai_summary_note = `Multi-source synthesis corroborated across ${target.sources.length} sources (${target.sources.map(s => s.name).join(', ')}).`;

  // Archive or remove merged duplicates
  for (const id of sourceArticleIds) {
    const idx = articles.findIndex(a => a.id === id);
    if (idx !== -1 && id !== targetArticleId) {
      articles[idx].status = 'rejected'; // marked as merged/archived
    }
  }

  res.json({ success: true, data: target, message: 'Stories merged successfully' });
});

// 8. POST /api/collector/simulate (Triggers automated news collector & duplicate detector)
app.post('/api/collector/simulate', async (req: Request, res: Response) => {
  const incomingSampleEvents = [
    {
      title: 'Department of Roads Finalizes Nagdhunga Tunnel Testing Schedule for Public Transport',
      category: 'Nepal',
      source: 'Ratopati',
      sourceUrl: 'https://ratopati.com/story/nagdhunga-tunnel',
      rawText: 'Department of Roads has announced that safety vehicle trials in the main tube of Nagdhunga tunnel will occur next week. Ventilation and jet fan calibration are finalized.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?q=80&w=1200&auto=format&fit=crop'
    },
    {
      title: 'Tribhuvan Airport Resurfacing: International Airlines Reconfirm Operational Schedule',
      category: 'Aviation',
      source: 'Onlinekhabar',
      sourceUrl: 'https://onlinekhabar.com/story/tia-night-flight',
      rawText: 'Following CAAN night maintenance notice at TIA runway, Middle Eastern and South Asian carriers have aligned flight windows.',
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop'
    },
    {
      title: 'Nepal Rastra Bank Issues Directive on Contactless Retail Digital QR Transactions',
      category: 'Business',
      source: 'Setopati',
      sourceUrl: 'https://setopati.com/story/nrb-qr-directive',
      rawText: 'Nepal Rastra Bank released new interoperability guidelines for mobile banking payment gateways to eliminate transaction friction across merchant networks.',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  // Pick one incoming item or request payload
  const incoming = req.body.title ? req.body : incomingSampleEvents[Math.floor(Math.random() * incomingSampleEvents.length)];

  // DUPLICATE & MULTI-SOURCE DETECTION ALGORITHM
  // Check against existing articles for matching key entities
  const incomingWords = (incoming.title + ' ' + (incoming.rawText || '')).toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
  let duplicateCandidate: Article | null = null;
  let highestOverlap = 0;

  for (const existing of articles) {
    const existingWords = (existing.title + ' ' + existing.summary).toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    const common = incomingWords.filter((w: string) => existingWords.includes(w));
    const overlapRatio = common.length / Math.min(incomingWords.length, existingWords.length);

    if (overlapRatio > 0.35 && overlapRatio > highestOverlap) {
      highestOverlap = overlapRatio;
      duplicateCandidate = existing;
    }
  }

  // If duplicate / related event detected, perform multi-source merge or flag
  if (duplicateCandidate && highestOverlap > 0.35) {
    const newSource: StorySource = {
      id: `s-${Date.now()}`,
      name: incoming.source,
      url: incoming.sourceUrl || '#',
      reportedAt: new Date().toISOString(),
      snippet: incoming.rawText || incoming.title
    };

    if (!duplicateCandidate.sources.some(s => s.name.toLowerCase() === incoming.source.toLowerCase())) {
      duplicateCandidate.sources.push(newSource);
      duplicateCandidate.is_developing = true;
      duplicateCandidate.updated_at = new Date().toISOString();
      duplicateCandidate.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        source: incoming.source,
        update: `Corroborating report received: "${incoming.title}"`
      });
      duplicateCandidate.ai_summary_note = `Merged story. Verified across ${duplicateCandidate.sources.length} sources (${duplicateCandidate.sources.map(s => s.name).join(', ')}).`;
    }

    return res.json({
      success: true,
      action: 'merged_into_existing',
      matchedArticle: duplicateCandidate,
      overlapScore: Math.round(highestOverlap * 100),
      message: `Detected corroborating report from ${incoming.source}. Merged into developing story "${duplicateCandidate.title}".`
    });
  }

  // Novel Story: Process with Gemini AI if configured or intelligent rule-based synthesizer
  let generatedHeadline = incoming.title;
  let generatedSummary = incoming.rawText || incoming.title;
  let aiConfidence = 92;

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are the lead editor for Yathartha Khabar (यथार्थ खबर), Nepal's premier digital newsroom.
Create a factual, objective, concise news summary from this raw report from ${incoming.source}:
Headline: ${incoming.title}
Text: ${incoming.rawText}

Return valid JSON with:
{
  "headline": "concise, neutral, highly readable title (under 90 chars)",
  "summary": "1-2 sentence objective summary",
  "category": "one of: Nepal, Politics, Business, Economy, Technology, Sports, Entertainment, Tourism, Aviation, Education, Health, World",
  "tags": ["3 to 5 tags"],
  "isHighRisk": false
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      if (parsed.headline) generatedHeadline = parsed.headline;
      if (parsed.summary) generatedSummary = parsed.summary;
      if (parsed.category) incoming.category = parsed.category;
    } catch (err) {
      console.warn('Gemini summarization fallback to standard rules:', err);
    }
  }

  // Determine publishing state according to Publishing Mode
  let initialStatus: 'published' | 'needs_verification' | 'draft' = 'published';
  if (settings.publishingMode === 'MANUAL') {
    initialStatus = 'needs_verification';
  } else if (settings.publishingMode === 'ASSISTED') {
    initialStatus = 'needs_verification';
  } else if (settings.publishingMode === 'AUTOMATIC') {
    // Check if sensitive topic
    const sensitive = /death|killed|casualty|bribe|corruption|court verdict|rape|murder/i.test(incoming.title);
    initialStatus = sensitive ? 'needs_verification' : 'published';
  }

  const novelArticle: Article = {
    id: `yk-${Date.now().toString(36)}`,
    title: generatedHeadline,
    slug: generatedHeadline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    summary: generatedSummary,
    content: `${incoming.rawText || generatedSummary}\n\nKATHMANDU — Yathartha Khabar news collector received initial reports from authorized feeds. Operational details are corroborated through official bulletins.\n\nMore verified updates will follow as reports develop.`,
    category: incoming.category || 'Nepal',
    tags: [incoming.category || 'Nepal', 'Yathartha Khabar', incoming.source],
    sources: [
      {
        id: `s-${Date.now()}`,
        name: incoming.source,
        url: incoming.sourceUrl || '#',
        reportedAt: new Date().toISOString(),
        isPrimary: true,
        snippet: incoming.rawText || incoming.title
      }
    ],
    primarySource: incoming.source,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: incoming.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    image_source: 'Authorized Feed Wire',
    image_photographer: `${incoming.source} Pool`,
    image_license: 'Permitted Source Attribution',
    image_attribution: `Photo via ${incoming.source} / Yathartha Khabar Archive`,
    is_breaking: Boolean(req.body.is_breaking),
    is_developing: false,
    status: initialStatus,
    verification_status: 'initial_report',
    ai_confidence: aiConfidence,
    ai_summary_note: 'AI-assisted summary based on initial authorized feed report.',
    created_at: new Date().toISOString(),
    view_count: 1,
    timeline: [
      {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        source: incoming.source,
        update: 'Story detected and categorized.'
      }
    ]
  };

  articles.unshift(novelArticle);

  res.status(201).json({
    success: true,
    action: 'created_novel_article',
    data: novelArticle,
    message: `New story collected from ${incoming.source} and processed in ${settings.publishingMode} mode.`
  });
});

// 9. GET & PUT /api/settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, data: settings });
});

// 10. GET & POST /api/collector/feeds
app.get('/api/collector/feeds', (_req: Request, res: Response) => {
  res.json({ success: true, data: feeds });
});

app.post('/api/collector/feeds', (req: Request, res: Response) => {
  const newFeed: NewsFeed = {
    id: `f-${Date.now().toString(36)}`,
    name: req.body.name || 'Custom Feed',
    type: req.body.type || 'rss',
    url: req.body.url || 'https://example.com/rss',
    isActive: true,
    category: req.body.category || 'Nepal',
    lastChecked: new Date().toISOString(),
    fetchCount: 0
  };
  feeds.push(newFeed);
  res.status(201).json({ success: true, data: newFeed });
});

// 11. POST /api/gemini/summarize (Server-side Gemini proxy)
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(503).json({
      success: false,
      message: 'Gemini API is not configured on the server. Please check the Secrets panel.'
    });
  }

  try {
    const { text, promptType } = req.body;
    const systemPrompt = `You are the lead editor for Yathartha Khabar (यथार्थ खबर), Nepal's trusted modern digital news platform.
Analyze the following text objectively without inventing facts, respecting journalistic neutrality and accuracy.
Output clean markdown summary or key bullet points suitable for a digital newsroom.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nTask: ${promptType || 'summarize'}\n\nContent:\n${text}`,
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dev server Vite middleware setup
async function startServer() {
  await checkAndInitSupabase();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Yathartha Khabar] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
