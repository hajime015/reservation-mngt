-- Drop all existing policies on the three tables (role-gated ones)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('reservations','restaurant_tables','staff')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- Clear previously shared data
DELETE FROM public.reservations;
DELETE FROM public.restaurant_tables;
DELETE FROM public.staff;

-- reservations: rename table -> table_name, add owner
ALTER TABLE public.reservations RENAME COLUMN "table" TO table_name;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();

-- staff: add ordering + owner
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();

-- restaurant_tables: add owner
ALTER TABLE public.restaurant_tables ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();

-- Owner-based policies
CREATE POLICY "Users manage their own reservations"
  ON public.reservations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own tables"
  ON public.restaurant_tables FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own staff"
  ON public.staff FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);