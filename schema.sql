-- ====================================================================
-- SUPABASE COMPLETE SYSTEM BLUEPRINT FOR GAMING HUD PORTFOLIO
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Clean Slate: Drop existing tables if they exist
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
-- 2. Create profile_stats Table
-- --------------------------------------------------------------------
CREATE TABLE public.profile_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_name TEXT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    xp_percent INT NOT NULL DEFAULT 0,
    class TEXT,
    guild TEXT,
    hp_current INT NOT NULL DEFAULT 100,
    hp_max INT NOT NULL DEFAULT 100,
    mp_current INT NOT NULL DEFAULT 100,
    mp_max INT NOT NULL DEFAULT 100,
    player_rank TEXT,
    hero_greeting TEXT,
    typewriter_words TEXT[],
    biography TEXT,
    education_school TEXT,
    education_degree TEXT,
    education_period TEXT,
    education_progress INT NOT NULL DEFAULT 0,
    education_progress_label TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. Create skills Table
-- --------------------------------------------------------------------
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('languages', 'frontend', 'backend', 'database', 'tools')),
    name TEXT NOT NULL,
    level INT NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
    description TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. Create passive_skills Table
-- --------------------------------------------------------------------
CREATE TABLE public.passive_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    jp_name TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. Create projects Table
-- --------------------------------------------------------------------
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('MAIN QUEST', 'HACKATHON QUEST', 'SIDE QUEST')),
    name TEXT NOT NULL,
    jp_name TEXT,
    status TEXT NOT NULL DEFAULT 'IN PROGRESS',
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
    description TEXT,
    loot TEXT[], -- Tech stack array
    github_url TEXT,
    live_url TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. Create achievements Table
-- --------------------------------------------------------------------
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    jp_name TEXT,
    award TEXT,
    date TEXT,
    xp_reward TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. Create education_objectives Table
-- --------------------------------------------------------------------
CREATE TABLE public.education_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_number TEXT NOT NULL,
    text TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. Create contact_methods Table
-- --------------------------------------------------------------------
CREATE TABLE public.contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    jp_name TEXT,
    icon_type TEXT,
    line TEXT,
    link TEXT,
    badge TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. Create blog_posts Table
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
-- 11. Seed Placeholder Records (Only 1 row in each table)
-- --------------------------------------------------------------------

-- Profile Stats Placeholder
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

-- Skills Placeholder
INSERT INTO public.skills (category, name, level, description, sort_order) 
VALUES ('languages', 'YOUR_SKILL_NAME', 90, 'Placeholder technical skill description. Edit this row or dissolve it through the administrator panel.', 1);

-- Passive Skills Placeholder
INSERT INTO public.passive_skills (name, jp_name, description, sort_order) 
VALUES ('YOUR_PASSIVE_NAME', '急速な学習', 'Placeholder passive trait description. Swiftly acquiring novel programming language libraries.', 1);

-- Projects Placeholder
INSERT INTO public.projects (
    type, name, jp_name, status, difficulty, description, loot, github_url, live_url, sort_order
) VALUES (
    'MAIN QUEST',
    'YOUR_PROJECT_NAME',
    'プレースホルダー',
    'IN PROGRESS',
    'MEDIUM',
    'This is a placeholder project description. You can seamlessly modify, update, or dissolve this quest log through the secure administrator panel.',
    ARRAY['React', 'Node.js', 'Supabase'],
    'https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME',
    'https://YOUR_LIVE_URL.com',
    1
);

-- Achievements Placeholder
INSERT INTO public.achievements (title, jp_name, award, date, xp_reward, description, sort_order) 
VALUES ('YOUR_ACHIEVEMENT_TITLE', 'チャレンジ達成', 'YOUR_AWARD_HIGHLIGHT', 'MAY 2026', '+1000 XP UNLOCKED', 'This is a placeholder award. Double-click the LV.26 shield badge to log into the Admin Cockpit and inject your actual career trophies and certifications.', 1);

-- Education Objectives Placeholder
INSERT INTO public.education_objectives (objective_number, text, sort_order) 
VALUES ('01', 'Placeholder objective text. Acquire foundations in memory architecture and full-stack API networks.', 1);

-- Contact Methods Placeholder
INSERT INTO public.contact_methods (title, jp_name, icon_type, line, link, badge, sort_order) 
VALUES ('YOUR_CONTACT_TITLE', 'ソースコード', 'github', '> HANDLE // YOUR_HANDLE', 'https://github.com/YOUR_GITHUB_USERNAME', 'CONNECTED', 1);

-- Blog Posts Placeholder
INSERT INTO public.blog_posts (title, slug, content, cover_image_url, published_date, is_draft) 
VALUES ('YOUR_POST_TITLE', 'placeholder-chronicle', '# Welcome to your Chronicles\n\nThis is a placeholder markdown blog post. Access the Admin Cockpit to publish real articles!', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', 'MAY 2026', true);

-- Contact Messages Placeholder
INSERT INTO public.contact_messages (name, email, message) 
VALUES ('YOUR_VISITOR_NAME', 'visitor@domain.org', 'Hey Ajay! This is a secure visitor transmission system check. /// SIGNAL_OUT');

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
CREATE POLICY "Allow public read access for contact_messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);

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
CREATE POLICY "Allow authenticated admin delete for contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);
