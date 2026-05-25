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

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase environment keys missing in backend!");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ROOT Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'Ajay\'s Portfolio CMS API Server mainframe' });
});

// ==========================================
// 1. PUBLIC PROJECTS ENDPOINTS
// ==========================================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ==========================================
// 3. PUBLIC TRANSMISSION SIGNALS (CONTACT)
// ==========================================

// Post visitor transmission / contact message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required transmission properties' });
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message }]);

    if (error) throw error;
    res.json({ success: true, signal: 'TRANSMISSION RECEIVED // ENCRYPTED SAFE' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CMS Backend running on port ${PORT}`);
});

export default app;
