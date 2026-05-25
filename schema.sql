-- ====================================================================
-- Ajay's 100% Dynamic Gaming HUD Portfolio Database Blueprint
-- Copy and paste this entire script into your Supabase SQL Editor!
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Drop existing tables if they exist (for clean initialization)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.contact_methods CASCADE;
DROP TABLE IF EXISTS public.education_objectives CASCADE;
DROP TABLE IF EXISTS public.passive_skills CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.profile_stats CASCADE;

-- --------------------------------------------------------------------
-- 2. Create profile_stats Table (Global settings + character stats)
-- --------------------------------------------------------------------
CREATE TABLE public.profile_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_name TEXT NOT NULL DEFAULT 'AJAY',
    level INTEGER NOT NULL DEFAULT 26,
    xp_percent INTEGER NOT NULL DEFAULT 92,
    class TEXT NOT NULL DEFAULT 'CSE STUDENT',
    guild TEXT NOT NULL DEFAULT 'VVCE, VTU AFFILIATED',
    hp_current INTEGER NOT NULL DEFAULT 980,
    hp_max INTEGER NOT NULL DEFAULT 980,
    mp_current INTEGER NOT NULL DEFAULT 920,
    mp_max INTEGER NOT NULL DEFAULT 1000,
    player_rank TEXT NOT NULL DEFAULT 'LV.26',
    
    -- Expanded Dynamic CMS text fields
    hero_greeting TEXT NOT NULL DEFAULT '[ STABLE_LINK // ONLINE ]',
    typewriter_words TEXT[] NOT NULL DEFAULT '{}',
    biography TEXT NOT NULL DEFAULT '',
    education_school TEXT NOT NULL DEFAULT '',
    education_degree TEXT NOT NULL DEFAULT '',
    education_period TEXT NOT NULL DEFAULT '',
    education_progress INTEGER NOT NULL DEFAULT 25,
    education_progress_label TEXT NOT NULL DEFAULT '',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial stats + text fields
INSERT INTO public.profile_stats (
    character_name, level, xp_percent, class, guild, hp_current, hp_max, mp_current, mp_max, player_rank,
    hero_greeting, typewriter_words, biography, education_school, education_degree, education_period, education_progress, education_progress_label
) VALUES (
    'AJAY', 26, 92, 'CSE STUDENT', 'VVCE, VTU AFFILIATED', 980, 980, 920, 1000, 'LV.26',
    '[ STABLE_LINK // ONLINE ]',
    ARRAY['Full Stack Developer', 'CSE Student @ VVCE', 'Anime Enthusiast', 'Game Dev Explorer'],
    'I am a first-year B.E. Computer Science student at Vidyavardhaka College of Engineering (VVCE), Mysuru, affiliated with VTU. Deeply passionate about modern web technologies and full-stack architecture, I also enjoy exploring game development, diving into immersive anime worlds, and building sleek, responsive systems that bridge functional design with engaging storytelling.',
    'VIDYAVARDHAKA COLLEGE OF ENGINEERING (VVCE), MYSURU',
    'Bachelor of Engineering (B.E.) — Computer Science & Engineering',
    'QUEST PERIOD: 2024 — 2028',
    25,
    '25% UNLOCKED (1ST YEAR COMPLETED)'
);

-- --------------------------------------------------------------------
-- 3. Create skills Table (Technical ability bars)
-- --------------------------------------------------------------------
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'languages', 'frontend', 'backend', 'database', 'tools'
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.skills (category, name, level, description, sort_order) VALUES
('languages', 'JavaScript', 90, 'Primary logic syntax for web scripts and interactive systems.', 1),
('languages', 'Python', 85, 'Used for general computations, automation scripts, and backend prototypes.', 2),
('languages', 'C Language', 80, 'Foundational syntax for memory structures and pointer algorithms.', 3),
('frontend', 'React', 88, 'Standard client blueprint compiler for interactive SPA nodes.', 1),
('frontend', 'Vite', 85, 'Modern frontend build engine with rapid virtual hot-reloading.', 2),
('frontend', 'HTML5', 95, 'Structure markup parser for digital layouts and DOM frameworks.', 3),
('frontend', 'CSS3', 90, 'Styling sheet compiler using responsive grids, shapes, and custom glows.', 4),
('backend', 'Node.js', 80, 'Runtime compiler for executing JavaScript logic on the server mainframe.', 1),
('backend', 'Express.js', 82, 'Routing server blueprint library for standard REST API endpoints.', 2),
('database', 'Supabase', 85, 'Digital database cluster mapping custom authentication and tables.', 1),
('database', 'PostgreSQL', 80, 'Relational database server using rigid schemas and secure logic queries.', 2),
('database', 'MongoDB', 78, 'Document database storage using dynamic JSON schema models.', 3),
('tools', 'Git', 85, 'Main version logger and branch management database tool.', 1),
('tools', 'GitHub', 88, 'Remote terminal server for online repository backups.', 2),
('tools', 'VS Code', 92, 'Primary IDE workspace styled with keybind maps and extensions.', 3);

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

INSERT INTO public.passive_skills (name, jp_name, description, sort_order) VALUES
('FAST LEARNER', '急速な学習', 'Adapting swiftly to novel system structures, coding stacks, and developer tools.', 1),
('CREATIVE BUILDER', '創造的創造物', 'Architecting immersive designs, interactive HUD graphics, and detailed animations.', 2),
('OTAKU CORE', 'オタク精神', 'Drawing inspiration from story-rich games, detailed manga, and complex anime themes.', 3),
('PROBLEM SOLVER', '解決者', 'Approaching logic bugs and algorithmic hurdles with a systematic C/Python process.', 4);

-- --------------------------------------------------------------------
-- 5. Create projects Table (Quest logs)
-- --------------------------------------------------------------------
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'MAIN QUEST',
    name TEXT NOT NULL,
    jp_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN PROGRESS',
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    loot TEXT[] NOT NULL DEFAULT '{}',
    github TEXT DEFAULT '#',
    live TEXT DEFAULT '#',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.projects (type, name, jp_name, status, difficulty, description, loot, github, live, sort_order) VALUES
('MAIN QUEST', 'CampusLink', 'キャンパスリンク', 'IN PROGRESS', 'HARD', 'A comprehensive full-stack campus community web application custom engineered for Vidyavardhaka College of Engineering (VVCE) students. Features include an active peer Marketplace, Event coordinates, open discussion Forum boards, group messaging nodes, and personal Connection Wishlists.', ARRAY['React + Vite', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL'], 'https://github.com/ajayotaku2-dev/CampusLink', '#', 1),
('HACKATHON QUEST', 'CampusFinance', 'キャンパスファイナンス', 'IN PROGRESS', 'MEDIUM', 'A student-centric financial micro-budgeting dashboard built under tight hackathon timelines. Empowers students to log daily expenditures, track scholarship/grant allocations, and visualize monthly budgeting structures to curb college costs.', ARRAY['React', 'Node.js', 'Express.js', 'Supabase'], 'https://github.com/ajayotaku2-dev/CampusFinance', '#', 2);

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

INSERT INTO public.achievements (title, jp_name, award, date, xp_reward, description, sort_order) VALUES
('THE BIG CODE — GOOGLE', 'コーディングチャレンジ参加者', 'Cleared Round 2 — Top 1,500 of 100,000+ nationally', 'APRIL 2026', '+1200 XP UNLOCKED', 'Competed in Google India''s The Big Code Challenge 2026, a national multi-stage coding elimination powered by HackerEarth. Advanced through the Qualifying Round and Round 1 to break into the Top 1,500 out of 100,000+ engineering students across India. Round 2 featured a high-stakes algorithmic coding showdown testing advanced DSA, problem-solving speed, and CS fundamentals under pressure.', 1),
('HACKATHON PARTICIPANT', 'ハッカソン出場者', 'Designed & Assembled CampusFinance', 'OCTOBER 2024', '+500 XP UNLOCKED', 'Competed in an intense student hackathon sprint. Designed and assembled CampusFinance—a high-fidelity student-focused micro-budgeting web app. Effectively bridged a React interface layer with real-time Supabase analytics and authentication modules to streamline student financial tracking.', 2);

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

INSERT INTO public.education_objectives (objective_number, text, sort_order) VALUES
('01', 'Acquire intermediate memory-addressing structures and pointer mapping in C and Python systems.', 1),
('02', 'Formulate modular, non-blocking asynchronous REST pipelines using the React + Express stack.', 2),
('03', 'Deconstruct computational logic constraints, discrete structures, and algorithms.', 3);

-- --------------------------------------------------------------------
-- 8. Create contact_methods Table
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

INSERT INTO public.contact_methods (title, jp_name, icon_type, line, link, badge, sort_order) VALUES
('GITHUB UPLINK', 'ソースコード', 'github', '> HANDLE // TVAjay', 'https://github.com/TVAjay', 'CONNECTED', 1),
('LINKEDIN NETWORK', 'プロフェッショナル', 'linkedin', '> PROFILE // T V Ajay', 'https://www.linkedin.com/in/t-v-ajay-b047013a5', 'CONNECTED', 2),
('MAIL TERMINAL', 'メール', 'email', '> ADDRESS // tvajay0@gmail.com', 'mailto:tvajay0@gmail.com', 'ACTIVE', 3),
('DIRECT COMM LINK', '電話番号', 'phone', '> NUMBER // +91 8050325644', 'tel:+918050325644', 'ACTIVE', 4);

-- --------------------------------------------------------------------
-- 9. Configure Row Level Security (RLS)
-- --------------------------------------------------------------------

ALTER TABLE public.profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Allow public read access for profile_stats" ON public.profile_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access for skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access for passive_skills" ON public.passive_skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access for projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access for achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow public read access for education_objectives" ON public.education_objectives FOR SELECT USING (true);
CREATE POLICY "Allow public read access for contact_methods" ON public.contact_methods FOR SELECT USING (true);

-- Authenticated Writes Policies
CREATE POLICY "Allow authenticated admin writes for profile_stats" ON public.profile_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for passive_skills" ON public.passive_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for achievements" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for education_objectives" ON public.education_objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin writes for contact_methods" ON public.contact_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);
