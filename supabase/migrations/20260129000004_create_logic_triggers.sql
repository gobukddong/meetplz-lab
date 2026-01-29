-- Migration 04: Create Business Logic Triggers
-- 20260129000004_create_logic_triggers.sql

-- 1. Auto-Create Task on Join
CREATE OR REPLACE FUNCTION create_task_on_meeting_join()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO personal_tasks (
    user_id,
    content,
    due_date,
    is_public,
    source,
    meeting_id
  )
  SELECT
    NEW.user_id,
    m.title,
    m.meeting_at::DATE,
    false,
    'meeting',
    NEW.meeting_id
  FROM meetings m
  WHERE m.id = NEW.meeting_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_task_on_join
  AFTER INSERT ON participants
  FOR EACH ROW
  WHEN (NEW.status = 'joined')
  EXECUTE FUNCTION create_task_on_meeting_join();


-- 2. Auto-Delete Task on Cancel
CREATE OR REPLACE FUNCTION delete_task_on_meeting_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    DELETE FROM personal_tasks
    WHERE meeting_id = NEW.meeting_id
      AND user_id = NEW.user_id
      AND source = 'meeting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_delete_task_on_cancel
  AFTER UPDATE ON participants
  FOR EACH ROW
  WHEN (OLD.status = 'joined' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION delete_task_on_meeting_cancel();
