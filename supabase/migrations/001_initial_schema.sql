-- HK Freelance Match - Initial Schema Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('freelancer', 'employer')),
    
    -- Common fields
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    bio_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Freelancer-specific fields
    skills TEXT[],
    hourly_rate INTEGER,
    willing_to_travel BOOLEAN DEFAULT false,
    
    -- Employer-specific fields
    company_name TEXT,
    company_logo TEXT,
    company_bio TEXT,
    website TEXT,
    contact_name TEXT
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- PORTFOLIO ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT,
    description_en TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_profile_id ON portfolio_items(profile_id);

-- ============================================
-- AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    UNIQUE(profile_id, date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_availability_profile_id ON availability(profile_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT NOT NULL,
    description_en TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'photography', 'videography', 'graphicDesign', 'socialMedia',
        'copywriting', 'eventPlanning', 'webDev', 'branding'
    )),
    budget_min INTEGER NOT NULL,
    budget_max INTEGER NOT NULL,
    deadline DATE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_jobs_fts ON jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(title_en, '') || ' ' || description || ' ' || COALESCE(description_en, '')));

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id ON applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[],
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_employer_id ON bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_freelancer_id ON bookings(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Helper: create policy only if not exists
DO $$ DECLARE
  _polname TEXT;
  _schemaname TEXT := 'public';
  _tablename TEXT;
BEGIN
  -- PROFILES POLICIES
  _tablename := 'profiles';
  _polname := 'Profiles are viewable by everyone';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT TO public USING (true);
  END IF;

  _polname := 'Users can insert their own profile';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  _polname := 'Users can update their own profile';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- PORTFOLIO POLICIES
  _tablename := 'portfolio_items';
  _polname := 'Portfolio items are viewable by everyone';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (true);
  END IF;

  _polname := 'Users can insert portfolio items for their own profile';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid())
    );
  END IF;

  _polname := 'Users can delete their own portfolio items';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR DELETE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid())
    );
  END IF;

  -- AVAILABILITY POLICIES
  _tablename := 'availability';
  _polname := 'Availability is viewable by everyone';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (true);
  END IF;

  _polname := 'Users can manage availability for their own profile';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid())
    );
  END IF;

  -- JOBS POLICIES
  _tablename := 'jobs';
  _polname := 'Jobs are viewable by everyone';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (true);
  END IF;

  _polname := 'Employers can insert jobs for their account';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = employer_id AND user_id = auth.uid() AND role = 'employer')
    );
  END IF;

  _polname := 'Employers can update their own jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR UPDATE USING (auth.uid() = employer_id);
  END IF;

  _polname := 'Employers can delete their own jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR DELETE USING (auth.uid() = employer_id);
  END IF;

  -- APPLICATIONS POLICIES
  _tablename := 'applications';
  _polname := 'Applications are viewable by job owner and applicant';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (
      auth.uid() = freelancer_id OR
      EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    );
  END IF;

  _polname := 'Freelancers can insert applications for open jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      auth.uid() = freelancer_id AND
      EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'open')
    );
  END IF;

  _polname := 'Applicants can update their own pending applications';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR UPDATE USING (
      auth.uid() = freelancer_id AND status = 'pending'
    );
  END IF;

  -- CONVERSATIONS POLICIES
  _tablename := 'conversations';
  _polname := 'Users can view their own conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (
      auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2))
    );
  END IF;

  _polname := 'Users can create conversations with other users';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2))
    );
  END IF;

  -- MESSAGES POLICIES
  _tablename := 'messages';
  _polname := 'Users can view messages in their conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = conversation_id
        AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))
      )
    );
  END IF;

  _polname := 'Users can send messages in their conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = conversation_id
        AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))
      )
    );
  END IF;

  -- BOOKINGS POLICIES
  _tablename := 'bookings';
  _polname := 'Users can view their own bookings';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR SELECT USING (
      auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id))
    );
  END IF;

  _polname := 'Employers can create bookings';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR INSERT WITH CHECK (
      auth.uid() IN (SELECT user_id FROM profiles WHERE id = employer_id AND role = 'employer')
    );
  END IF;

  _polname := 'Users can update bookings they are involved in';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename) THEN
    CREATE POLICY _polname ON _tablename FOR UPDATE USING (
      auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id))
    );
  END IF;
END $$;

-- ============================================
-- REALTIME SETUP
-- ============================================
-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars', 'avatars', true),
    ('portfolio', 'portfolio', true),
    ('company-logos', 'company-logos', true),
    ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (idempotent)
DO $$ DECLARE
  _polname TEXT;
  _schemaname TEXT := 'public';
  _tablename TEXT := 'objects';
BEGIN
  _polname := 'Anyone can view avatars';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'SELECT') THEN
    CREATE POLICY _polname ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  _polname := 'Users can upload their own avatar';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'INSERT') THEN
    CREATE POLICY _polname ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  _polname := 'Anyone can view portfolio images';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'SELECT') THEN
    CREATE POLICY _polname ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
  END IF;

  _polname := 'Users can upload to their portfolio';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'INSERT') THEN
    CREATE POLICY _polname ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  _polname := 'Anyone can view company logos';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'SELECT') THEN
    CREATE POLICY _polname ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
  END IF;

  _polname := 'Users can upload their company logo';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'INSERT') THEN
    CREATE POLICY _polname ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  _polname := 'Authenticated users can upload attachments';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'INSERT') THEN
    CREATE POLICY _polname ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'attachments' AND auth.uid() IS NOT NULL
    );
  END IF;

  _polname := 'Users can view attachments in their conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = _polname AND schemaname = _schemaname AND tablename = _tablename AND cmd = 'SELECT') THEN
    CREATE POLICY _polname ON storage.objects FOR SELECT USING (
        bucket_id = 'attachments' AND auth.uid() IS NOT NULL
    );
  END IF;
END $$;
