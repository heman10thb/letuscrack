# Product Requirements Document: Coding Tutorials Blog

## 1. Executive Summary

### 1.1 Product Overview
A blog-style tutorials website that displays coding problems with their solutions in multiple programming languages. Users can browse, search, and read tutorials organized by topics and categories.

### 1.2 Technology Stack
- **Frontend & Backend**: Next.js 14+ (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: Vercel (recommended)

### 1.3 Target Audience
- Computer science students learning to code
- Developers looking for reference solutions
- Interview candidates studying common problems
- Programming enthusiasts exploring different languages

## 2. Goals and Objectives

### 2.1 Primary Goals
- Provide clear, well-organized coding tutorials
- Display solutions in multiple programming languages
- Make content easily discoverable through search and categories
- Create a clean, blog-style reading experience

### 2.2 Success Metrics
- Monthly active readers
- Page views per session
- Average time on page
- Search engine rankings
- Organic traffic growth

## 3. Core Features

### 3.1 Public Features (No Authentication Required)

#### 3.1.1 Homepage
- Hero section with site description
- Featured tutorials
- Recent tutorials
- Browse by category cards
- Search bar

#### 3.1.2 Tutorial Display
- **Problem Statement Section**:
  - Clear problem description
  - Input/output format
  - Example test cases
  - Constraints

- **Solution Section**:
  - Language tabs (Python, Java, C++, JavaScript, etc.)
  - Syntax-highlighted code
  - Copy code button
  - Explanation of approach
  - Time and space complexity

- **Additional Info**:
  - Related topics/tags
  - Category
  - Difficulty level
  - Publication date

#### 3.1.3 Browse & Navigation
- Browse by category page
- Browse by topic/tags page
- Browse by difficulty
- Browse by programming language
- All tutorials listing page

#### 3.1.4 Search
- Full-text search across all tutorials
- Filter results by category, difficulty, language
- Search suggestions
- No results fallback with suggestions

### 3.2 Admin Features (Authentication Required)

#### 3.2.1 Admin Dashboard
- Overview statistics (total tutorials, views, etc.)
- Recent tutorials list
- Quick actions (add new, edit)

#### 3.2.2 Tutorial Management
- Create new tutorial
- Edit existing tutorial
- Delete tutorial
- Rich text editor for content
- Image upload capability
- Preview before publishing
- Draft/Published status

#### 3.2.3 Category Management
- Add/edit/delete categories
- Add/edit/delete tags
- Organize taxonomy

## 4. Technical Requirements

### 4.1 Frontend (Next.js)

#### 4.1.1 Page Structure

**Public Pages**:
- `/` - Homepage
- `/tutorials` - All tutorials listing
- `/tutorials/[slug]` - Individual tutorial page
- `/categories` - Categories overview
- `/categories/[slug]` - Tutorials by category
- `/topics/[tag]` - Tutorials by topic/tag
- `/search` - Search results page
- `/about` - About page

**Admin Pages** (Protected):
- `/admin/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/tutorials/new` - Create tutorial
- `/admin/tutorials/edit/[id]` - Edit tutorial
- `/admin/categories` - Manage categories

#### 4.1.2 Key Components
- Navigation bar with search
- Tutorial card component
- Code block with syntax highlighting (Prism.js or Highlight.js)
- Language selector tabs
- Breadcrumbs
- Category badges
- Footer with links
- Loading skeletons
- SEO meta tags component

#### 4.1.3 Performance
- Static generation (SSG) for tutorial pages
- Incremental Static Regeneration (ISR)
- Image optimization with Next.js Image
- Code splitting
- Lazy loading for images

### 4.2 Backend (Supabase)

#### 4.2.1 Database Schema (PostgreSQL)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon identifier
  display_order INTEGER DEFAULT 0,
  tutorial_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  tutorial_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutorials Table
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT, -- meta description
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  problem_statement TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  examples JSONB, -- array of {input, output, explanation}
  solutions JSONB, -- {python: {code, explanation}, java: {...}, ...}
  approach TEXT, -- overall approach explanation
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

-- Tutorial Tags Junction Table (Many-to-Many)
CREATE TABLE tutorial_tags (
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tutorial_id, tag_id)
);

-- Admin Users Table (extends Supabase auth.users)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Statistics Table
CREATE TABLE site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_tutorials INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_categories INTEGER DEFAULT 0,
  total_tags INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial stats row
INSERT INTO site_stats (id) VALUES (1);

-- Indexes for better query performance
CREATE INDEX idx_tutorials_slug ON tutorials(slug);
CREATE INDEX idx_tutorials_category ON tutorials(category_id);
CREATE INDEX idx_tutorials_status ON tutorials(status);
CREATE INDEX idx_tutorials_published_at ON tutorials(published_at DESC);
CREATE INDEX idx_tutorials_views ON tutorials(views DESC);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tutorial_tags_tutorial ON tutorial_tags(tutorial_id);
CREATE INDEX idx_tutorial_tags_tag ON tutorial_tags(tag_id);

-- Full-text search
CREATE INDEX idx_tutorials_search ON tutorials 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || problem_statement));

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update category tutorial count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET tutorial_count = tutorial_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE categories SET tutorial_count = tutorial_count - 1 WHERE id = OLD.category_id;
    UPDATE categories SET tutorial_count = tutorial_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET tutorial_count = tutorial_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_tag_tutorial_count
AFTER INSERT OR DELETE ON tutorial_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_count();
```

#### 4.2.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for published tutorials
CREATE POLICY "Public can view published tutorials"
ON tutorials FOR SELECT
USING (status = 'published');

-- Admin full access to tutorials
CREATE POLICY "Admins can do everything with tutorials"
ON tutorials FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Public read access for categories
CREATE POLICY "Public can view categories"
ON categories FOR SELECT
TO public
USING (true);

-- Admin full access to categories
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Public read access for tags
CREATE POLICY "Public can view tags"
ON tags FOR SELECT
TO public
USING (true);

-- Admin full access to tags
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

-- Site stats public read
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
```

#### 4.2.3 Supabase Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutorial-images', 'tutorial-images', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-icons', 'category-icons', true);

-- Storage policies
CREATE POLICY "Public can view tutorial images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutorial-images');

CREATE POLICY "Admins can upload tutorial images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tutorial-images' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Admins can delete tutorial images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tutorial-images' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Public can view category icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-icons');

CREATE POLICY "Admins can manage category icons"
ON storage.objects FOR ALL
USING (
  bucket_id = 'category-icons' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);
```

#### 4.2.4 Supabase Auth Configuration
- Enable Email/Password authentication
- Configure email templates (confirmation, password reset)
- Set up admin user manually in Supabase dashboard
- Add admin user to `admin_users` table

### 4.3 API Routes (Next.js)

#### 4.3.1 Public APIs
- `GET /api/tutorials` - List tutorials with pagination and filters
- `GET /api/tutorials/[slug]` - Get single tutorial
- `GET /api/tutorials/[id]/increment-view` - Increment view count
- `GET /api/categories` - List all categories
- `GET /api/tags` - List all tags
- `GET /api/search?q={query}` - Search tutorials

#### 4.3.2 Admin APIs (Protected)
- `POST /api/admin/tutorials` - Create tutorial
- `PUT /api/admin/tutorials/[id]` - Update tutorial
- `DELETE /api/admin/tutorials/[id]` - Delete tutorial
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category
- `POST /api/admin/tags` - Create tag
- `POST /api/admin/upload` - Upload images

### 4.4 Supabase Client Setup

```typescript
// lib/supabase/client.ts - Client-side
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts - Server-side
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

## 5. User Experience

### 5.1 User Flows

#### 5.1.1 Reader Flow
1. Land on homepage
2. Browse featured tutorials or search
3. Click on tutorial of interest
4. Read problem statement
5. Switch between language tabs to view solutions
6. Click on related tutorials or categories

#### 5.1.2 Admin Content Creation Flow
1. Navigate to /admin/login
2. Login with email/password
3. Dashboard shows tutorial statistics
4. Click "Create New Tutorial"
5. Fill in tutorial details:
   - Title and slug (auto-generated)
   - Category and tags selection
   - Problem statement (rich text)
   - Examples with input/output
   - Solutions for multiple languages
   - Explanation and complexity
   - Upload featured image
6. Preview tutorial
7. Save as draft or publish

### 5.2 Design Guidelines
- Clean, blog-style layout
- Readable typography (18px body text)
- White/light background for readability
- Dark mode support (optional)
- Mobile-responsive design
- Minimal navigation
- Focus on content

## 6. Development Phases

### Phase 1: Setup & Core Features (3-4 weeks)
- Next.js project setup
- Supabase project creation and schema setup
- Homepage with featured tutorials
- Tutorial detail page with code display
- Category browsing
- Basic admin authentication
- Admin tutorial CRUD operations
- Responsive design

### Phase 2: Enhanced Features (2-3 weeks)
- Search functionality with full-text search
- Tag system
- Related tutorials
- Admin dashboard with statistics
- Rich text editor (TipTap or similar)
- Image upload to Supabase Storage
- Draft/publish workflow
- Filtering and sorting

### Phase 3: Polish & SEO (2 weeks)
- SEO optimization (meta tags, sitemap)
- Performance optimization
- Loading states and animations
- Error handling and validation
- About page
- Analytics integration (Vercel Analytics)

### Phase 4: Testing & Launch (1 week)
- Content migration (if any)
- Cross-browser testing
- Mobile testing
- Bug fixes
- Documentation
- Deployment to Vercel

## 7. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ljgfnqvsqxwjucsifloo.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_FK0HON8kg3r3OtI0nmoQOw_BzKZWBPI


# Optional
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

## 8. Non-Functional Requirements

### 8.1 Performance
- First Contentful Paint: <1.5 seconds
- Time to Interactive: <3 seconds
- Lighthouse score: >90
- Mobile performance: >85

### 8.2 SEO
- Server-side rendering for all public pages
- Proper meta tags (title, description, Open Graph)
- XML sitemap auto-generation
- Structured data (Article schema)
- Mobile-friendly
- Fast loading times
- Clean URLs with slugs

### 8.3 Security
- HTTPS only
- Row Level Security (RLS) enabled
- Admin authentication required
- Input sanitization
- XSS protection
- CSRF protection
- Environment variables for secrets

### 8.4 Accessibility
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation
- ARIA labels where needed
- Sufficient color contrast (WCAG AA)

## 9. Content Strategy

### 9.1 Initial Categories
- Arrays & Strings
- Linked Lists
- Trees & Graphs
- Dynamic Programming
- Sorting & Searching
- Mathematical Problems
- Recursion & Backtracking
- Stack & Queue
- Hash Tables
- Greedy Algorithms

### 9.2 Programming Languages
- Python (primary)
- Java
- C++
- JavaScript
- C
- Additional languages as needed

### 9.3 Tutorial Structure Template
```
Title: [Clear, Descriptive Title]

Difficulty: Easy/Medium/Hard
Category: [Category Name]
Tags: [Relevant Tags]

Problem Statement:
[Clear description of the problem]

Input Format:
[How input is provided]

Output Format:
[Expected output format]

Example 1:
Input: [sample input]
Output: [sample output]
Explanation: [optional]

Example 2:
[Additional examples]

Constraints:
[Problem constraints]

Solutions:

[Python Tab]
- Code with comments
- Explanation of approach
- Time & Space Complexity

[Java Tab]
- Same structure

[Other Languages]
- Same structure

Approach:
[Overall explanation of the solution approach]

Related Topics:
[Links to related tutorials]
```

## 10. Future Enhancements (Post-Launch)

- Email newsletter for new tutorials
- RSS feed
- Tutorial series/learning paths
- Video explanations
- Interactive code playground
- Comments section (with moderation)
- Bookmark/favorites (requires user auth)
- Share to social media
- Print-friendly version
- Multi-language UI support
- Tutorial difficulty voting
- Code snippet testing

## 11. Success Criteria

- **Month 1**: 50 high-quality tutorials, Supabase setup complete
- **Month 3**: 150 tutorials, 1,000 monthly readers
- **Month 6**: 300+ tutorials, 10,000 monthly readers
- **Year 1**: Established authority, 50,000+ monthly organic visits

## 12. Risks and Mitigation

### 12.1 Technical Risks
- **Risk**: Supabase costs with high traffic
- **Mitigation**: Use static generation, implement caching, monitor database queries

- **Risk**: Slow page loads with large code snippets
- **Mitigation**: Code splitting, lazy loading, optimize bundle size

- **Risk**: Database query performance issues
- **Mitigation**: Proper indexing, use PostgreSQL full-text search, pagination

### 12.2 Content Risks
- **Risk**: Difficulty maintaining content quality
- **Mitigation**: Create content guidelines, editorial process

- **Risk**: Competition from established sites
- **Mitigation**: Focus on quality, unique explanations, better UX