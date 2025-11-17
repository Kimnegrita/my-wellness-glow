-- Add avg_period_duration column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avg_period_duration integer DEFAULT 5;

COMMENT ON COLUMN public.profiles.avg_period_duration IS 'Average duration of menstrual period in days';