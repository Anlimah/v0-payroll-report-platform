-- Add fields to staffs table for leave status and salary currency
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS on_bonded_or_study_leave BOOLEAN DEFAULT FALSE;
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(3) DEFAULT 'GHS';

-- Add fields to allowances table for leave and type management
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS allowed_on_leave BOOLEAN DEFAULT TRUE;
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'standard';

-- When a staff is added, set salary_currency based on status
-- permanent staff = USD, others = GHS
