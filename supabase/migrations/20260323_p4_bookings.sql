-- P4: Bookings + Escrow Migration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  employer_id UUID NOT NULL REFERENCES profiles(id),
  freelancer_id UUID NOT NULL REFERENCES profiles(id),
  slot_date DATE NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','escrow_funded','completed','cancelled','refunded')),
  employer_notes TEXT,
  freelancer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON bookings FOR ALL USING (auth.uid() = employer_id OR auth.uid() = freelancer_id);
