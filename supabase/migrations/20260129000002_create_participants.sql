-- Migration 02: Create Participants
-- 20260129000002_create_participants.sql

-- 1. Enums
CREATE TYPE participation_status AS ENUM ('joined', 'cancelled');

-- 2. Participants Table
CREATE TABLE participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participation_status NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

-- 3. Indexes
CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
