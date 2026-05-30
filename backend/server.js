import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Clients
const supabaseUrl = process.env.SUPABASE_URL || 'https://aicclaajxoiqzhtsybee.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_IiODikvGCfYDdeClPC6iDA_pzNPHMb_';
// Standard client for public anon read and auth checks
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Administrative client for writes (bypasses RLS utilizing the superuser service role key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn("WARNING: SUPABASE_SERVICE_KEY is missing in backend, using anon key fallback locally.");
}

// Auth Verification Middleware
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    
    // Validate session JWT with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized session' });
    }
    
    // Ensure email is exact administrator match
    if (user.email !== 'tvajay0@gmail.com') {
      return res.status(403).json({ error: 'Forbidden: Access restricted to Administrator tvajay0@gmail.com' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth checkpoint failure: ' + err.message });
  }
};

// Defensive Database Write Handler (catches missing SUPABASE_SERVICE_KEY / RLS policy issues gracefully)
const handleWriteResponse = (res, data, error, statusCode = 200) => {
  if (error) throw error;
  if (!data || data.length === 0) {
    if (supabaseServiceKey === supabaseAnonKey) {
      return res.status(403).json({
        error: "Database write failed (no rows updated). The administrative SUPABASE_SERVICE_KEY environment variable is missing on your backend server context. Please add it to your Vercel project settings (Environment Variables) as SUPABASE_SERVICE_KEY, and then REDEPLOY your project so Vercel loads the new variable."
      });
    }
    return res.status(400).json({
      error: "Database write failed (no rows updated). Please verify your target record exists and that Row Level Security (RLS) policies allow this modification."
    });
  }
  res.status(statusCode).json(data[0]);
};

// ROOT Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'T V Ajay\'s Dynamic HUD Portfolio CMS REST API Core' });
});

// ==========================================
// 1. PROFILE STATS ENDPOINTS
// ==========================================
app.get('/api/profile', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profile_stats')
      .select('*')
      .limit(1)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabaseAdmin
      .from('profile_stats')
      .update(payload)
      .eq('character_name', 'T V AJAY')
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ACTIVE ABILITIES (SKILLS) ENDPOINTS
// ==========================================
app.get('/api/skills', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skills', requireAdmin, async (req, res) => {
  try {
    const { category, name, level, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('skills')
      .insert([{ category, name, level: parseInt(level), description, sort_order: sort_order || 0 }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/skills/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, level, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('skills')
      .update({ category, name, level: parseInt(level), description, sort_order })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/skills/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('skills')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Ability node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PASSIVE ABILITIES (TRAITS) ENDPOINTS
// ==========================================
app.get('/api/passive-skills', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('passive_skills')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/passive-skills', requireAdmin, async (req, res) => {
  try {
    const { name, jp_name, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('passive_skills')
      .insert([{ name, jp_name, description, sort_order: sort_order || 0 }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/passive-skills/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, jp_name, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('passive_skills')
      .update({ name, jp_name, description, sort_order })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/passive-skills/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('passive_skills')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Passive trait node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. QUEST LOGS (PROJECTS) ENDPOINTS
// ==========================================
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([payload])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Quest project node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. TROPHIES (ACHIEVEMENTS) ENDPOINTS
// ==========================================
app.get('/api/achievements', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/achievements', requireAdmin, async (req, res) => {
  try {
    const { title, jp_name, award, date, xp_reward, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .insert([{ title, jp_name, award, date, xp_reward, description, sort_order: sort_order || 0 }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/achievements/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, jp_name, award, date, xp_reward, description, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .update({ title, jp_name, award, date, xp_reward, description, sort_order })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/achievements/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('achievements')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Achievement trophy node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ACADEMIC OBJECTIVES (EDUCATION) ENDPOINTS
// ==========================================
app.get('/api/education', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('education_objectives')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/education', requireAdmin, async (req, res) => {
  try {
    const { objective_number, text, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('education_objectives')
      .insert([{ objective_number, text, sort_order: sort_order || 0 }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/education/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { objective_number, text, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('education_objectives')
      .update({ objective_number, text, sort_order })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/education/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('education_objectives')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Education objective node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CONTACT CHANNELS (METHODS) ENDPOINTS
// ==========================================
app.get('/api/contact', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_methods')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contact', requireAdmin, async (req, res) => {
  try {
    const { title, jp_name, icon_type, line, link, badge, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('contact_methods')
      .insert([{ title, jp_name, icon_type, line, link, badge, sort_order: sort_order || 0 }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contact/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, jp_name, icon_type, line, link, badge, sort_order } = req.body;
    const { data, error } = await supabaseAdmin
      .from('contact_methods')
      .update({ title, jp_name, icon_type, line, link, badge, sort_order })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contact/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('contact_methods')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Contact channel node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. CHRONICLES (BLOG POSTS) ENDPOINTS
// ==========================================
app.get('/api/blog', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/blog', requireAdmin, async (req, res) => {
  try {
    const { title, slug, content, cover_image_url, published_date, is_draft } = req.body;
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([{ title, slug, content, cover_image_url, published_date, is_draft: !!is_draft }])
      .select();
    handleWriteResponse(res, data, error, 201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/blog/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, cover_image_url, published_date, is_draft } = req.body;
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({ title, slug, content, cover_image_url, published_date, is_draft: !!is_draft })
      .eq('id', id)
      .select();
    handleWriteResponse(res, data, error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/blog/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Chronicle blog post node dissolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. VISITOR TRANSMISSIONS (CONTACT MESSAGES)
// ==========================================
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required transmission properties' });
    }

    const { error } = await supabaseAdmin // Bypass RLS to allow inserts from visitors
      .from('contact_messages')
      .insert([{ name, email, message }]);

    if (error) throw error;
    res.json({ success: true, signal: 'TRANSMISSION RECEIVED // ENCRYPTED SAFE' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Visitor transmission deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CMS Backend running on port ${PORT}`);
});

export default app;
