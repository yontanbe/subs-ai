CREATE TABLE IF NOT EXISTS calendar_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube')) DEFAULT 'youtube',
  scheduled_date TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
