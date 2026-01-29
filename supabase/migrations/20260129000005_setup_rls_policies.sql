-- Migration 05: Setup RLS Policies
-- 20260129000005_setup_rls_policies.sql

-- 1. Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Meetings RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update meetings" ON meetings FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete meetings" ON meetings FOR DELETE USING (auth.uid() = host_id);

-- 3. Participants RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Users can join meetings" ON participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel participation" ON participants FOR DELETE USING (auth.uid() = user_id);

-- 4. Personal Tasks RLS
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON personal_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public tasks" ON personal_tasks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own tasks" ON personal_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON personal_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON personal_tasks FOR DELETE USING (auth.uid() = user_id);
