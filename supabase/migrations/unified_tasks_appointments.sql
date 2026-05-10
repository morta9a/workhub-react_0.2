-- Add time and reminder columns to tasks and appointments
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "time" TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "reminder" BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "reminder" BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "date" TEXT; -- To align with tasks
