-- Make name nullable since it's updated after signup
ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;