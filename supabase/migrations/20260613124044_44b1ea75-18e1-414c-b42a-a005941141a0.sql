
-- Helper: is the current user an active staff member or admin?
CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('staff'::app_role, 'admin'::app_role)
  )
$$;

-- Reservations: restrict to staff/admin
DROP POLICY IF EXISTS "Authenticated manage reservations" ON public.reservations;
CREATE POLICY "Staff manage reservations"
ON public.reservations
FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Restaurant tables: restrict to staff/admin
DROP POLICY IF EXISTS "Authenticated manage tables" ON public.restaurant_tables;
CREATE POLICY "Staff manage tables"
ON public.restaurant_tables
FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Staff: restrict to staff/admin
DROP POLICY IF EXISTS "Authenticated manage staff" ON public.staff;
CREATE POLICY "Staff manage staff"
ON public.staff
FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Lock down SECURITY DEFINER helpers so signed-in users cannot call them directly.
-- RLS policy evaluation still works without these EXECUTE grants.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff_or_admin(uuid) FROM PUBLIC, anon, authenticated;
