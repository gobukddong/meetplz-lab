-- Migration: Add Meeting End At
-- 20260201000001_add_meeting_end_at.sql

ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS meeting_end_at TIMESTAMPTZ;
