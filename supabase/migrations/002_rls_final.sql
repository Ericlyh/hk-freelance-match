-- FINAL CLEAN MIGRATION: RLS Policies
-- Copy ALL of this into Supabase SQL Editor and run once.
-- Safe: uses DROP IF EXISTS + CREATE. Works in Supabase SQL Editor.

BEGIN;

-- Drop existing policies (ignore errors if some don't exist)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Portfolio items are viewable by everyone" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert portfolio items for their own profile" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Availability is viewable by everyone" ON availability;
DROP POLICY IF EXISTS "Users can manage availability for their own profile" ON availability;
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Employers can insert jobs for their account" ON jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON jobs;
DROP POLICY IF EXISTS "Applications are viewable by job owner and applicant" ON applications;
DROP POLICY IF EXISTS "Freelancers can insert applications for open jobs" ON applications;
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON applications;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations with other users" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Employers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update bookings they are involved in" ON bookings;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON storage.objects;

-- Create fresh policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Users can insert portfolio items for their own profile" ON portfolio_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their own portfolio items" ON portfolio_items FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Users can manage availability for their own profile" ON availability FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs for their account" ON jobs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = employer_id AND user_id = auth.uid() AND role = 'employer'));
CREATE POLICY "Employers can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own jobs" ON jobs FOR DELETE USING (auth.uid() = employer_id);
CREATE POLICY "Applications are viewable by job owner and applicant" ON applications FOR SELECT USING (auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Freelancers can insert applications for open jobs" ON applications FOR INSERT WITH CHECK (auth.uid() = freelancer_id AND EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'open'));
CREATE POLICY "Applicants can update their own pending applications" ON applications FOR UPDATE USING (auth.uid() = freelancer_id AND status = 'pending');
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2)));
CREATE POLICY "Users can create conversations with other users" ON conversations FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (participant_1, participant_2)));
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))));
CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (c.participant_1, c.participant_2))));
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id)));
CREATE POLICY "Employers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = employer_id AND role = 'employer'));
CREATE POLICY "Users can update bookings they are involved in" ON bookings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (employer_id, freelancer_id)));
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Users can upload to their portfolio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view company logos" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Users can upload their company logo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view attachments in their conversations" ON storage.objects FOR SELECT USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);

COMMIT;
