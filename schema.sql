-- MediHealth Supabase Schema

CREATE TABLE appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  service         TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  notes           TEXT,
  status          TEXT DEFAULT 'confirmed',
  user_id         UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "insert_own" ON appointments FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "select_own" ON appointments FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "update_own" ON appointments FOR UPDATE USING (auth.uid()=user_id);
CREATE POLICY "delete_own" ON appointments FOR DELETE USING (auth.uid()=user_id);

-- Policies for anonymous/guest bookings
CREATE POLICY "anon_insert" ON appointments FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "anon_select" ON appointments FOR SELECT USING (user_id IS NULL);