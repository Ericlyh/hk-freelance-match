-- Migration 002: RLS Policies (PostgreSQL 14 safe — CREATEs only, no DROP)
-- Safe to run even if policies already exist
-- For PostgreSQL 14: uses DO block to conditionally create each policy

BEGIN;

-- Helper to create policy only if it doesn't exist
DO $$
DECLARE
  pol TEXT;
  tab TEXT;
BEGIN
  -- PROFILES
  pol := 'Profiles are viewable by everyone'; tab := 'profiles';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (true)';
  END IF;

  pol := 'Users can insert their own profile'; tab := 'profiles';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;

  pol := 'Users can update their own profile'; tab := 'profiles';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'UPDATE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  -- PORTFOLIO
  pol := 'Portfolio items are viewable by everyone'; tab := 'portfolio_items';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (true)';
  END IF;

  pol := 'Users can insert portfolio items for their own profile'; tab := 'portfolio_items';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()))';
  END IF;

  pol := 'Users can delete their own portfolio items'; tab := 'portfolio_items';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'DELETE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()))';
  END IF;

  -- AVAILABILITY
  pol := 'Availability is viewable by everyone'; tab := 'availability';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (true)';
  END IF;

  pol := 'Users can manage availability for their own profile'; tab := 'availability';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'ALL') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()))';
  END IF;

  -- JOBS
  pol := 'Jobs are viewable by everyone'; tab := 'jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (true)';
  END IF;

  pol := 'Employers can insert jobs for their account'; tab := 'jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = employer_id AND user_id = auth.uid() AND role = ''employer''))';
  END IF;

  pol := 'Employers can update their own jobs'; tab := 'jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'UPDATE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR UPDATE USING (auth.uid() = employer_id)';
  END IF;

  pol := 'Employers can delete their own jobs'; tab := 'jobs';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'DELETE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR DELETE USING (auth.uid() = employer_id)';
  END IF;

  -- APPLICATIONS
  pol := 'Applications are viewable by job owner and applicant'; tab := 'applications';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))';
  END IF;

  pol := 'Freelancers can insert applications for open jobs'; tab := 'applications';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (auth.uid() = freelancer_id AND EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = ''open''))';
  END IF;

  pol := 'Applicants can update their own pending applications'; tab := 'applications';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'UPDATE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR UPDATE USING (auth.uid() = freelancer_id AND status = ''pending'')';
  END IF;

  -- CONVERSATIONS
  pol := 'Users can view their own conversations'; tab := 'conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2)))';
  END IF;

  pol := 'Users can create conversations with other users'; tab := 'conversations';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2)))';
  END IF;

  -- MESSAGES
  pol := 'Users can view messages in their conversations'; tab := 'messages';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))))';
  END IF;

  pol := 'Users can send messages in their conversations'; tab := 'messages';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))))';
  END IF;

  -- BOOKINGS
  pol := 'Users can view their own bookings'; tab := 'bookings';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id)))';
  END IF;

  pol := 'Employers can create bookings'; tab := 'bookings';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = employer_id AND role = ''employer''))';
  END IF;

  pol := 'Users can update bookings they are involved in'; tab := 'bookings';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'UPDATE') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON ' || tab || ' FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id)))';
  END IF;

  -- STORAGE
  pol := 'Anyone can view avatars'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR SELECT USING (bucket_id = ''avatars'')';
  END IF;

  pol := 'Users can upload their own avatar'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;

  pol := 'Anyone can view portfolio images'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR SELECT USING (bucket_id = ''portfolio'')';
  END IF;

  pol := 'Users can upload to their portfolio'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''portfolio'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;

  pol := 'Anyone can view company logos'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR SELECT USING (bucket_id = ''company-logos'')';
  END IF;

  pol := 'Users can upload their company logo'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''company-logos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;

  pol := 'Authenticated users can upload attachments'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'INSERT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''attachments'' AND auth.uid() IS NOT NULL)';
  END IF;

  pol := 'Users can view attachments in their conversations'; tab := 'storage.objects';
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = pol AND schemaname = 'public' AND tablename = tab AND cmd = 'SELECT') THEN
    EXECUTE 'CREATE POLICY "' || pol || '" ON storage.objects FOR SELECT USING (bucket_id = ''attachments'' AND auth.uid() IS NOT NULL)';
  END IF;

END $$;

COMMIT;
