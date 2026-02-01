-- Migration: Add Recruitment Fields to Meetings
-- 20260201000000_add_recruitment_fields.sql

ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS recruitment_deadline TIMESTAMPTZ;

-- Update existing recruiting meetings to have a default deadline if needed
-- UPDATE meetings SET recruitment_deadline = created_at + INTERVAL '7 days' WHERE recruitment_deadline IS NULL AND status = 'recruiting';
