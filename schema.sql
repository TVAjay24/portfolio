-- ====================================================================
-- Ajay's 100% Unified Gaming HUD Portfolio & CMS Database Blueprint
-- Copy and paste this ENTIRE script into your Supabase SQL Editor!
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Drop existing tables if they exist (for clean initialization)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.contact_methods CASCADE;
DROP TABLE IF EXISTS public.education_objectives CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.passive_skills CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.profile_stats CASCADE;

-- --------------------------------------------------------------------
-- 2. Create profile_stats Table (Global settings + character stats)
-- --------------------------------------------------------------------
CREATE TABLE public.profile_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_name TEXT NOT NULL DEFAULT 'YOUR_NAME',
    level INTEGER NOT NULL DEFAULT 1,
    xp_percent INTEGER NOT NULL DEFAULT 0,
    class TEXT NOT NULL DEFAULT 'YOUR_CLASS',
    guild TEXT NOT NULL DEFAULT 'YOUR_GUILD',
    hp_current INTEGER NOT NULL DEFAULT 100,
    hp_max INTEGER NOT NULL DEFAULT 100,
    mp_current INTEGER NOT NULL DEFAULT 100,
    mp_max INTEGER NOT NULL DEFAULT 100,
    player_rank TEXT NOT NULL DEFAULT 'LV.1',
    
    -- Dynamic CMS & Biography fields
    hero_greeting TEXT NOT NULL DEFAULT '[ STABLE_LINK // ONLINE ]',
    typewriter_words TEXT[] NOT NULL DEFAULT '{}',
    biography TEXT NOT NULL DEFAULT '',
    
    -- Main Quest Education Details
    education_school TEXT NOT NULL DEFAULT '',
    education_degree TEXT NOT NULL DEFAULT '',
    education_period TEXT NOT NULL DEFAULT '',
    education_progress INTEGER NOT NULL DEFAULT 0,
    education_progress_label TEXT NOT NULL DEFAULT '',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. Create skills Table (Technical ability bars)
-- --------------------------------------------------------------------
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'languages', 'frontend', 'backend', 'database', 'tools'
    name TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. Create passive_skills Table (Traits)
-- --------------------------------------------------------------------
CREATE TABLE public.passive_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    jp_name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. Create projects Table (Quest logs - supports BOTH RPG and CMS schemas)
-- --------------------------------------------------------------------
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- CMS Columns
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    live_url TEXT DEFAULT '#',
    github_url TEXT DEFAULT '#',
    thumbnail_url TEXT,
    date TEXT,
    
    -- RPG Quest Columns (for backwards compatibility/bridge mapping)
    name TEXT NOT NULL,
    jp_name TEXT NOT NULL DEFAULT 'プロジェクト',
    type TEXT NOT NULL DEFAULT 'MAIN QUEST', -- 'MAIN QUEST' or 'HACKATHON QUEST'
    status TEXT NOT NULL DEFAULT 'IN PROGRESS',
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
    loot TEXT[] NOT NULL DEFAULT '{}',
    github TEXT DEFAULT '#',
    live TEXT DEFAULT '#',
    
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. Create achievements Table (Trophy logs)
-- --------------------------------------------------------------------
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    jp_name TEXT NOT NULL,
    award TEXT NOT NULL,
    date TEXT NOT NULL,
    xp_reward TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. Create education_objectives Table
-- --------------------------------------------------------------------
CREATE TABLE public.education_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_number TEXT NOT NULL,
    text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. Create contact_methods Table (Contact Uplinks)
-- --------------------------------------------------------------------
CREATE TABLE public.contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    jp_name TEXT NOT NULL,
    icon_type TEXT NOT NULL, -- 'github', 'linkedin', 'email', 'phone'
    line TEXT NOT NULL,
    link TEXT NOT NULL,
    badge TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. Create blog_posts Table (Chronicles)
-- --------------------------------------------------------------------
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Markdown content
    cover_image_url TEXT,
    published_date TEXT,
    is_draft BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 10. Create contact_messages Table (Visitor Transmissions)
-- --------------------------------------------------------------------
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 11. Seed Table Records with Clearly Labeled Placeholders
-- --------------------------------------------------------------------

-- Profile Stats Seed
INSERT INTO public.profile_stats (
    character_name, level, xp_percent, class, guild, hp_current, hp_max, mp_current, mp_max, player_rank,
    hero_greeting, typewriter_words, biography, education_school, education_degree, education_period, education_progress, education_progress_label
) VALUES (
    'YOUR_NAME', 26, 92, 'YOUR_CLASS', 'YOUR_GUILD', 980, 980, 920, 1000, 'LV.26',
    '[ STABLE_LINK // ONLINE ]',
    ARRAY['YOUR_SKILL_1', 'YOUR_SKILL_2', 'YOUR_SKILL_3'],
    'This is a placeholder narrative bio. Log in to the SYS_ADMIN cockpit (/admin) and update this biography segment to display your own custom story, quest campaign details, and development coordinates!',
    'YOUR_SCHOOL_NAME',
    'YOUR_DEGREE_AND_MAJOR',
    'QUEST PERIOD: 2024 — 2028',
    25,
    '25% UNLOCKED (1ST YEAR COMPLETED)'
);

-- Skills Seed
INSERT INTO public.skills (category, name, level, description, sort_order) VALUES
('languages', 'JavaScript', 90, 'Placeholder technical skill description. Edit this row or dissolve it through the administrator panel.', 1);

-- Passive Skills Seed
INSERT INTO public.passive_skills (name, jp_name, description, sort_order) VALUES
('FAST LEARNER', '急速な学習', 'Placeholder passive trait description. Swiftly acquiring novel programming language libraries.', 1);

-- Projects Seed
INSERT INTO public.projects (
    title, description, tech_stack, live_url, github_url, thumbnail_url, date,
    name, jp_name, type, status, difficulty, loot, github, live, sort_order
) VALUES (
    'PLACEHOLDER QUEST',
    'This is a placeholder project description. You can seamlessly modify, update, or dissolve this quest log through the secure administrator panel.',
    ARRAY['React', 'Node.js', 'Supabase'],
    'https://YOUR_LIVE_URL.com',
    'https://github.com/TVAjay24/YOUR_REPO_NAME',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    '2025 - 2026',
    'PLACEHOLDER QUEST',
    'プレースホルダー',
    'MAIN QUEST',
    'IN PROGRESS',
    'MEDIUM',
    ARRAY['React', 'Node.js', 'Supabase'],
    'https://github.com/TVAjay24/YOUR_REPO_NAME',
    'https://YOUR_LIVE_URL.com',
    1
);

-- Achievements Seed
INSERT INTO public.achievements (title, jp_name, award, date, xp_reward, description, sort_order) VALUES
('THE BIG CODE', 'チャレンジ達成', 'Cleared challenge parameters successfully', 'MAY 2026', '+1000 XP UNLOCKED', 'This is a placeholder award. Double-click the LV.26 shield badge to log into the Admin Cockpit and inject your actual career trophies and certifications.', 1);

-- Education Objectives Seed
INSERT INTO public.education_objectives (objective_number, text, sort_order) VALUES
('01', 'Placeholder objective text. Acquire foundations in memory architecture and full-stack API networks.', 1);

-- Contact Methods Seed
INSERT INTO public.contact_methods (title, jp_name, icon_type, line, link, badge, sort_order) VALUES
('GITHUB UPLINK', 'ソースコード', 'github', '> HANDLE // TVAjay24', 'https://github.com/TVAjay24', 'CONNECTED', 1);

-- Blog Posts Seed
INSERT INTO public.blog_posts (title, slug, content, cover_image_url, published_date, is_draft) VALUES
('Placeholder Chronicle', 'placeholder-chronicle', '# Welcome to your Chronicles\n\nThis is a placeholder markdown blog post. Access the Admin Cockpit to publish real articles!', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', 'MAY 2026', true);

-- Contact Messages Seed
INSERT INTO public.contact_messages (name, email, message) VALUES
('Asuka Langley', 'asuka@nerv.org', 'Hey Ajay! This is a secure visitor transmission system check. /// SIGNAL_OUT');

-- --------------------------------------------------------------------
-- 12. Configure Row Level Security (RLS) & Policies
-- --------------------------------------------------------------------

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 12a. Public READ (SELECT) Policies for Public Consumption
CREATE POLICY "Allow public read access for profile_stats" ON public.profile_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access for skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access for passive_skills" ON public.passive_skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access for projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access for achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow public read access for education_objectives" ON public.education_objectives FOR SELECT USING (true);
CREATE POLICY "Allow public read access for contact_methods" ON public.contact_methods FOR SELECT USING (true);
CREATE POLICY "Allow public read access for blog_posts" ON public.blog_posts FOR SELECT USING (true);

-- 12b. Authenticated WRITE (ALL) Policies for Administration
CREATE POLICY "Allow authenticated admin writes for profile_stats" ON public.profile_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for passive_skills" ON public.passive_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for achievements" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for education_objectives" ON public.education_objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for contact_methods" ON public.contact_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12c. Contact Messages Policies (Visitor Transmissions)
-- Public can only INSERT (send messages)
CREATE POLICY "Allow public insert for contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- Authenticated admins can SELECT (read) and DELETE (dissolve) transmissions
CREATE POLICY "Allow authenticated admin read for contact_messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin delete for contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);
