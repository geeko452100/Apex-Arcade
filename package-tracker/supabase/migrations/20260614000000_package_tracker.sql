-- Package Tracker: roles, customers, packages, and status history

-- ---------------------------------------------------------------------------
-- Roles on profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'staff', 'admin'));

-- ---------------------------------------------------------------------------
-- Helper: current user's role (for RLS)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '');
$$;

-- ---------------------------------------------------------------------------
-- Shipping customers (recipients — not auth users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.shipping_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX shipping_customers_name_idx ON public.shipping_customers (name);

-- ---------------------------------------------------------------------------
-- Packages
-- ---------------------------------------------------------------------------
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.shipping_customers(id),
  destination_address jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX packages_tracking_id_idx ON public.packages (tracking_id);
CREATE INDEX packages_status_idx ON public.packages (status);

-- ---------------------------------------------------------------------------
-- Status history audit trail
-- ---------------------------------------------------------------------------
CREATE TABLE public.package_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id)
);

CREATE INDEX package_status_history_package_idx ON public.package_status_history (package_id, changed_at DESC);

-- ---------------------------------------------------------------------------
-- Tracking ID generator
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  attempts int := 0;
BEGIN
  LOOP
    candidate := 'PKG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.packages WHERE tracking_id = candidate);
    attempts := attempts + 1;
    IF attempts > 20 THEN
      RAISE EXCEPTION 'Could not generate unique tracking ID';
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

-- ---------------------------------------------------------------------------
-- Auto-set tracking_id and record initial status on insert
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.packages_before_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER packages_before_insert_trigger
  BEFORE INSERT ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.packages_before_insert();

CREATE OR REPLACE FUNCTION public.packages_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.package_status_history (package_id, status, notes, changed_by)
  VALUES (NEW.id, NEW.status, NEW.notes, NEW.created_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER packages_after_insert_trigger
  AFTER INSERT ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.packages_after_insert();

CREATE OR REPLACE FUNCTION public.packages_before_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.package_status_history (package_id, status, notes, changed_by)
    VALUES (NEW.id, NEW.status, NEW.notes, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER packages_before_update_trigger
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.packages_before_update();

-- ---------------------------------------------------------------------------
-- Public tracking RPC (anon + authenticated) — returns safe subset only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_package(p_tracking_id text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'tracking_id', p.tracking_id,
    'status', p.status,
    'destination_city', p.destination_address->>'city',
    'destination_state', p.destination_address->>'state',
    'destination_country', p.destination_address->>'country',
    'updated_at', p.updated_at,
    'history', COALESCE((
      SELECT json_agg(
        json_build_object(
          'status', h.status,
          'changed_at', h.changed_at
        ) ORDER BY h.changed_at ASC
      )
      FROM public.package_status_history h
      WHERE h.package_id = p.id
    ), '[]'::json)
  )
  INTO result
  FROM public.packages p
  WHERE upper(trim(p.tracking_id)) = upper(trim(p_tracking_id));

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_package(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Staff/admin status update RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_package_status(
  p_package_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS public.packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  updated_row public.packages;
BEGIN
  caller_role := public.get_my_role();

  IF caller_role NOT IN ('staff', 'admin') THEN
    RAISE EXCEPTION 'Only staff or admin can update package status';
  END IF;

  IF p_status NOT IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  UPDATE public.packages
  SET
    status = p_status,
    notes = COALESCE(p_notes, notes),
    updated_by = auth.uid()
  WHERE id = p_package_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Package not found';
  END IF;

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_package_status(uuid, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.shipping_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_status_history ENABLE ROW LEVEL SECURITY;

-- shipping_customers: admin full access
CREATE POLICY "Admin manage shipping customers"
  ON public.shipping_customers
  FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- packages: admin full access
CREATE POLICY "Admin manage packages"
  ON public.packages
  FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- packages: staff read-only (updates go through RPC)
CREATE POLICY "Staff read packages"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));

-- package_status_history: staff/admin read
CREATE POLICY "Staff admin read status history"
  ON public.package_status_history
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));

-- package_status_history: admin read (covered above); inserts via triggers (security definer)
