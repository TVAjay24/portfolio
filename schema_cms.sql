-- ====================================================================
-- T V Ajay's Portfolio CMS Database Schema Setup & RLS Configuration
-- Copy and paste this script directly into your Supabase SQL Editor!
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Create Projects Table (with clean overrides)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    live_url TEXT DEFAULT '#',
    github_url TEXT DEFAULT '#',
    thumbnail_url TEXT,
    date TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial projects matching your dynamic quest mainframe
INSERT INTO public.projects (title, description, tech_stack, github_url, live_url, date, sort_order)
VALUES 
(
  'CampusLink', 
  'A comprehensive full-stack campus community web application custom engineered for Vidyavardhaka College of Engineering (VVCE) students. Features include an active peer Marketplace, Event coordinates, open discussion Forum boards, group messaging nodes, and personal Connection Wishlists.', 
  ARRAY['React + Vite', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL'], 
  'https://github.com/ajayotaku2-dev/CampusLink', 
  '#', 
  '2024 - 2025',
  1
),
(
  'CampusFinance', 
  'A student-centric financial micro-budgeting dashboard built under tight hackathon timelines. Empowers students to log daily expenditures, track scholarship/grant allocations, and visualize monthly budgeting structures to curb college costs.', 
  ARRAY['React', 'Node.js', 'Express.js', 'Supabase'], 
  'https://github.com/ajayotaku2-dev/CampusFinance', 
  '#', 
  '2024',
  2
);

-- --------------------------------------------------------------------
-- 2. Create Blog Posts Table (Chronicles)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.blog_posts CASCADE;

CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Supports rich Markdown content
    cover_image_url TEXT,
    published_date TEXT,
    is_draft BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial high-fidelity markdown blog chronicles
INSERT INTO public.blog_posts (title, slug, content, cover_image_url, published_date, is_draft)
VALUES 
(
  'Building an Immersive Gaming HUD Portfolio with React & Supabase',
  'building-gaming-hud-portfolio',
  '# The Telemetry Dashboard Architecture\n\nDesigning a personal portfolio that stands out in 2026 requires moving beyond simple minimum viable templates. To make an impact in full-stack engineering, I constructed an immersive, story-rich **Gaming HUD / Anime-Inspired console**.\n\n## 🛠️ The Technology Blueprint\n- **Client Mainframe**: React + Vite SPA using CSS scanline keyframes and hardware-accelerated animations.\n- **Database Core**: Supabase (PostgreSQL) hosting dynamic stats, HP/MP telemetry, quest cards, and timeline badges.\n- **Security Grid**: Row Level Security (RLS) restricting writing sessions to authorized admin keys.\n\n## 🎨 Immersive Scanline Glows\nApplying physical cathode-ray tubes (CRT) screen flicker keyframes completely alters the feel of the DOM:\n\n```css\n@keyframes hologram-flicker {\n  0% { opacity: 0.99; }\n  50% { opacity: 0.92; }\n  100% { opacity: 0.99; }\n}\n```\nThis aesthetic brings the digital dashboard alive, transforming a simple portfolio into an active, responsive mainframe.',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800',
  'MAY 2026',
  false
),
(
  'Mastering Row Level Security (RLS) for Bulletproof Serverless Apps',
  'mastering-supabase-rls-security',
  '# The Rules of Database Security\n\nServerless database architectures are incredibly convenient, but they expose direct network endpoints to the client. This means anyone with a browser console can write query commands if you leave key gates unlocked.\n\n## 🔒 Row Level Security (RLS) to the Rescue\nWith RLS active, PostgreSQL evaluates every single query against an authorization policy before executing it.\n\n```sql\n-- Create authenticated-only write policy\nCREATE POLICY "Allow authenticated admin writes" \nON public.projects \nFOR ALL \nTO authenticated \nUSING (true) \nWITH CHECK (true);\n```\n\nBy restricting writes strictly to `authenticated` tokens, we ensure that public anonymous visitors enjoy a fast, cached, read-only experience, while only our cockpit session can alter values.',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800',
  'APRIL 2026',
  false
);

-- --------------------------------------------------------------------
-- 3. Create Contact Messages Table (Transmissions)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.contact_messages CASCADE;

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed an initial transmission message
INSERT INTO public.contact_messages (name, email, message)
VALUES ('Asuka Langley', 'asuka@nerv.org', 'Hey T V Ajay! I checked out your Gaming HUD portfolio and it looks incredibly sick. Let''s collaborate on some cyberpunk web designs! /// SIGNAL_OUT');

-- --------------------------------------------------------------------
-- 4. Configure Row Level Security (RLS) & Policies
-- --------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Projects select
CREATE POLICY "Allow public read access for projects" ON public.projects FOR SELECT USING (true);
-- Blog select
CREATE POLICY "Allow public read access for blog_posts" ON public.blog_posts FOR SELECT USING (true);

-- Authenticated Writes Policies for Projects and Blogs
CREATE POLICY "Allow authenticated admin writes for projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact Messages Policies
-- 1. Anonymous Insert Allowed (any portfolio visitor can transmit messages)
CREATE POLICY "Allow public insert for contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- 2. Authenticated Select & Delete (only logged-in admin can read or delete)
CREATE POLICY "Allow authenticated admin read for contact_messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin delete for contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);
