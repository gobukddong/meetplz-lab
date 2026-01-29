-- Migration 03: Create Personal Tasks
-- 20260129000003_create_personal_tasks.sql

-- 1. Enums
CREATE TYPE task_source AS ENUM ('personal', 'meeting');

-- 2. Tables
CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  source task_source NOT NULL DEFAULT 'personal',
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger
CREATE TRIGGER update_personal_tasks_updated_at 
BEFORE UPDATE ON personal_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Indexes
CREATE INDEX idx_personal_tasks_user_id ON personal_tasks(user_id);
CREATE INDEX idx_personal_tasks_due_date ON personal_tasks(due_date);
CREATE INDEX idx_personal_tasks_is_public ON personal_tasks(is_public) WHERE is_public = true;
