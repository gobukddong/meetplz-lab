-- Migration 01: Create Meetings
-- 20260129000001_create_meetings.sql

-- 1. Enums
CREATE TYPE meeting_status AS ENUM ('recruiting', 'confirmed', 'completed', 'cancelled');

-- 2. Meetings Table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  meeting_at TIMESTAMPTZ NOT NULL,
  status meeting_status NOT NULL DEFAULT 'recruiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Meetings Trigger
CREATE TRIGGER update_meetings_updated_at 
BEFORE UPDATE ON meetings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Indexes
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_meeting_at ON meetings(meeting_at);
CREATE INDEX idx_meetings_status ON meetings(status);
