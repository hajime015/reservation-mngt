ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_waitlist boolean NOT NULL DEFAULT false;