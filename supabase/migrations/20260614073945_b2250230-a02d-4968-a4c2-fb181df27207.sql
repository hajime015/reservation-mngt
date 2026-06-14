CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'staff'::app_role)
      OR public.has_role(_user_id, 'admin'::app_role)
$$;

DROP POLICY IF EXISTS "Users manage their own reservations" ON public.reservations;
CREATE POLICY "Staff manage their own reservations"
ON public.reservations FOR ALL TO authenticated
USING (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Users manage their own tables" ON public.restaurant_tables;
CREATE POLICY "Staff manage their own tables"
ON public.restaurant_tables FOR ALL TO authenticated
USING (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Users manage their own staff" ON public.staff;
CREATE POLICY "Staff manage their own staff"
ON public.staff FOR ALL TO authenticated
USING (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_staff_or_admin(auth.uid()));