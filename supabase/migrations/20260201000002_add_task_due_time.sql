-- Migration: Add due_time to personal_tasks
-- 20260201000002_add_task_due_time.sql

ALTER TABLE personal_tasks ADD COLUMN due_time TIME;

-- No need for complex logic as existing tasks can have NULL due_time
