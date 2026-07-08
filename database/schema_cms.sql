-- ====================================================================
-- T V Ajay's Portfolio CMS Database Schema Setup & RLS Configuration
-- Clean rebuild from scratch
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Clean Rebuild triggers and tables
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.about_me CASCADE;

-- Reusable auto-updating trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. Projects Table
-- --------------------------------------------------------------------
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    live_url TEXT,
    github_url TEXT,
    thumbnail_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger for projects
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------
-- 3. Skills Table
-- --------------------------------------------------------------------
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT, -- e.g. "languages", "frontend", "backend", "database", "tools"
    icon_url TEXT,
    proficiency INT2, -- 1 to 5 scale
    sort_order INT4 DEFAULT 0
);

-- --------------------------------------------------------------------
-- 4. About Me Table
-- --------------------------------------------------------------------
CREATE TABLE public.about_me (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bio TEXT,
    tagline TEXT,
    resume_url TEXT,
    profile_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger for about me
CREATE TRIGGER set_about_me_updated_at
BEFORE UPDATE ON public.about_me
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- --------------------------------------------------------------------
-- 5. Row Level Security (RLS) Configuration
-- --------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_me ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- Policies for skills
CREATE POLICY "Public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.skills FOR ALL USING (auth.role() = 'authenticated');

-- Policies for about_me
CREATE POLICY "Public read" ON public.about_me FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.about_me FOR ALL USING (auth.role() = 'authenticated');


-- --------------------------------------------------------------------
-- 6. Seed Initial Data
-- --------------------------------------------------------------------

-- Seed projects
INSERT INTO public.projects (title, description, tech_stack, github_url, live_url, featured)
VALUES 
(
  'CampusLink', 
  'A comprehensive campus community web application custom engineered for Vidyavardhaka College of Engineering (VVCE) students. Features include a peer Marketplace, Event coordinates, discussion Forum boards, and group messaging nodes.', 
  ARRAY['React', 'Node.js', 'Express', 'Supabase', 'PostgreSQL'], 
  'https://github.com/TVAjay24/CampusLink', 
  '#', 
  true
),
(
  'CampusFinance', 
  'A student-centric financial micro-budgeting dashboard built under tight hackathon timelines. Empowers students to log daily expenditures, track scholarship/grant allocations, and visualize monthly budgeting structures.', 
  ARRAY['React', 'Node.js', 'Express', 'Supabase'], 
  'https://github.com/TVAjay24/CampusFinance', 
  '#', 
  false
);

-- Seed skills
INSERT INTO public.skills (name, category, proficiency, sort_order)
VALUES 
('JavaScript', 'languages', 5, 1),
('Python', 'languages', 4, 2),
('C', 'languages', 4, 3),
('React', 'frontend', 4, 1),
('Node.js', 'backend', 4, 1),
('Express', 'backend', 4, 2),
('Supabase', 'database', 4, 1),
('MongoDB', 'database', 4, 2),
('Git', 'tools', 4, 1);

-- Seed about me
INSERT INTO public.about_me (bio, tagline, resume_url, profile_image_url)
VALUES 
(
  'I am a B.E. Computer Science student at Vidyavardhaka College of Engineering (VVCE), Mysuru. Passionate about modern web technologies and full-stack architecture, I enjoy exploring game development, anime, and building sleek systems.',
  'CSE STUDENT @ VVCE // BUILDER OF SLEEK MAIN FRAME SYSTEMS',
  '#',
  ''
);
