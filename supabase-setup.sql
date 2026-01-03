-- =====================================================
-- CodeTuts Blog - Supabase Database Setup
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  tutorial_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  tutorial_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutorials Table
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  problem_statement TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  examples JSONB,
  solutions JSONB,
  approach TEXT,
  time_complexity VARCHAR(100),
  space_complexity VARCHAR(100),
  related_tutorial_ids UUID[],
  featured_image_url TEXT,
  views INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Tutorial Tags Junction Table
CREATE TABLE IF NOT EXISTS tutorial_tags (
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tutorial_id, tag_id)
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Statistics Table
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_tutorials INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_categories INTEGER DEFAULT 0,
  total_tags INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial stats row
INSERT INTO site_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_status ON tutorials(status);
CREATE INDEX IF NOT EXISTS idx_tutorials_published_at ON tutorials(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_views ON tutorials(views DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tutorial_tags_tutorial ON tutorial_tags(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_tags_tag ON tutorial_tags(tag_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_tutorials_search ON tutorials 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || problem_statement));

-- =====================================================
-- 3. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tutorials_updated_at ON tutorials;
CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update category tutorial count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    UPDATE categories SET tutorial_count = tutorial_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE categories SET tutorial_count = tutorial_count - 1 WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id IS NOT NULL THEN
      UPDATE categories SET tutorial_count = tutorial_count + 1 WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories SET tutorial_count = tutorial_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_tutorial_count ON tutorials;
CREATE TRIGGER update_category_tutorial_count
AFTER INSERT OR UPDATE OR DELETE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_category_count();

-- Update tag tutorial count
CREATE OR REPLACE FUNCTION update_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET tutorial_count = tutorial_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET tutorial_count = tutorial_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tag_tutorial_count ON tutorial_tags;
CREATE TRIGGER update_tag_tutorial_count
AFTER INSERT OR DELETE ON tutorial_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_count();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published tutorials" ON tutorials;
DROP POLICY IF EXISTS "Admins can do everything with tutorials" ON tutorials;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Public can view tutorial tags" ON tutorial_tags;
DROP POLICY IF EXISTS "Admins can manage tutorial tags" ON tutorial_tags;
DROP POLICY IF EXISTS "Public can view site stats" ON site_stats;
DROP POLICY IF EXISTS "Admins can update site stats" ON site_stats;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Tutorials policies
CREATE POLICY "Public can view published tutorials"
ON tutorials FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can do everything with tutorials"
ON tutorials FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Categories policies
CREATE POLICY "Public can view categories"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Tags policies
CREATE POLICY "Public can view tags"
ON tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Tutorial tags policies
CREATE POLICY "Public can view tutorial tags"
ON tutorial_tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage tutorial tags"
ON tutorial_tags FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Site stats policies
CREATE POLICY "Public can view site stats"
ON site_stats FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can update site stats"
ON site_stats FOR UPDATE
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users policy
CREATE POLICY "Admins can view admin users"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT id FROM admin_users));

-- =====================================================
-- 5. SEED DATA - Initial Categories
-- =====================================================

INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Arrays & Strings', 'arrays-strings', 'Master array manipulation and string algorithms', '📊', 1),
  ('Linked Lists', 'linked-lists', 'Learn linked list operations and patterns', '🔗', 2),
  ('Trees & Graphs', 'trees-graphs', 'Explore tree traversals and graph algorithms', '🌳', 3),
  ('Dynamic Programming', 'dynamic-programming', 'Solve optimization problems with DP', '🧩', 4),
  ('Sorting & Searching', 'sorting-searching', 'Efficient sorting and searching techniques', '🔍', 5),
  ('Stack & Queue', 'stack-queue', 'LIFO and FIFO data structure problems', '📚', 6),
  ('Hash Tables', 'hash-tables', 'Efficient lookups and counting problems', '🗂️', 7),
  ('Recursion & Backtracking', 'recursion-backtracking', 'Recursive solutions and backtracking patterns', '🔄', 8),
  ('Greedy Algorithms', 'greedy-algorithms', 'Locally optimal choices for global solutions', '💡', 9),
  ('Mathematical Problems', 'mathematical', 'Number theory and mathematical algorithms', '🔢', 10)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 6. SEED DATA - Initial Tags
-- =====================================================

INSERT INTO tags (name, slug) VALUES
  ('Two Pointers', 'two-pointers'),
  ('Sliding Window', 'sliding-window'),
  ('Binary Search', 'binary-search'),
  ('Recursion', 'recursion'),
  ('Memoization', 'memoization'),
  ('BFS', 'bfs'),
  ('DFS', 'dfs'),
  ('Hash Map', 'hash-map'),
  ('Sorting', 'sorting'),
  ('Greedy', 'greedy'),
  ('Backtracking', 'backtracking'),
  ('Bit Manipulation', 'bit-manipulation')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DONE! Now create an admin user:
-- 1. Go to Authentication > Users in Supabase dashboard
-- 2. Click "Add user" and create a user with email/password
-- 3. Copy the user's UUID
-- 4. Run this command (replace the UUID):
--
-- INSERT INTO admin_users (id, email, display_name, role)
-- VALUES ('YOUR-USER-UUID-HERE', 'your@email.com', 'Admin', 'super_admin');
-- =====================================================
