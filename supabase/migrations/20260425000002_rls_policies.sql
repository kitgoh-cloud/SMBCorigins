-- =============================================================================
-- Migration: 20260425000002_rls_policies
-- Row-level security for all 10 tables.
--
-- Two personas:
--   rm           — sees their own portfolio (applications where rm_user_id = auth.uid())
--   client_admin / client_user — see their org's application(s)
--
-- API routes in app/api/ use the service-role key, which bypasses RLS entirely.
-- These policies govern direct Supabase client calls (browser / server component).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_memos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities        ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Auth helper functions
-- ---------------------------------------------------------------------------

-- Current user's role (rm | client_admin | client_user)
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- True if the current user is an RM
CREATE OR REPLACE FUNCTION is_rm()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT auth_role() = 'rm'
$$;

-- Current user's org_id (null for RMs)
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------

-- Users read and update their own profile
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- RMs read profiles of clients in their applications
CREATE POLICY "profiles: rm reads client profiles"
  ON profiles FOR SELECT
  USING (
    is_rm()
    AND org_id IN (
      SELECT organization_id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- ORGANIZATIONS
-- ---------------------------------------------------------------------------

-- RMs read all orgs in their portfolio
CREATE POLICY "organizations: rm read portfolio"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- RMs create and update orgs
CREATE POLICY "organizations: rm write"
  ON organizations FOR INSERT
  WITH CHECK (is_rm());

CREATE POLICY "organizations: rm update"
  ON organizations FOR UPDATE
  USING (is_rm());

-- Clients read their own org
CREATE POLICY "organizations: client read own"
  ON organizations FOR SELECT
  USING (id = auth_org_id());

-- ---------------------------------------------------------------------------
-- APPLICATIONS
-- ---------------------------------------------------------------------------

-- RMs own their applications (full CRUD)
CREATE POLICY "applications: rm owns"
  ON applications FOR ALL
  USING (rm_user_id = auth.uid());

-- Clients read applications belonging to their org
CREATE POLICY "applications: client reads own org"
  ON applications FOR SELECT
  USING (organization_id = auth_org_id());

-- ---------------------------------------------------------------------------
-- ENTITIES
-- ---------------------------------------------------------------------------

CREATE POLICY "entities: rm via application"
  ON entities FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

CREATE POLICY "entities: client reads"
  ON entities FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id = auth_org_id()
    )
  );

-- ---------------------------------------------------------------------------
-- UBOS
-- ---------------------------------------------------------------------------

CREATE POLICY "ubos: rm via application"
  ON ubos FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

CREATE POLICY "ubos: client reads"
  ON ubos FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id = auth_org_id()
    )
  );

-- ---------------------------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------------------------

-- RMs have full access
CREATE POLICY "documents: rm via application"
  ON documents FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- Clients can read and upload their own application's documents
CREATE POLICY "documents: client read and upload"
  ON documents FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id = auth_org_id()
    )
  );

-- ---------------------------------------------------------------------------
-- SCREENING RESULTS
-- Compliance-sensitive: RM-only. Clients never see raw screening data.
-- ---------------------------------------------------------------------------

CREATE POLICY "screening_results: rm only"
  ON screening_results FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------

CREATE POLICY "products: rm via application"
  ON products FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

CREATE POLICY "products: client reads"
  ON products FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id = auth_org_id()
    )
  );

-- ---------------------------------------------------------------------------
-- CREDIT MEMOS
-- Internal banking document: RM-only. Clients never see the credit memo.
-- ---------------------------------------------------------------------------

CREATE POLICY "credit_memos: rm only"
  ON credit_memos FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- ACTIVITIES
-- ---------------------------------------------------------------------------

CREATE POLICY "activities: rm via application"
  ON activities FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE rm_user_id = auth.uid()
    )
  );

-- Clients read their timeline; system/AI actors insert via service role
CREATE POLICY "activities: client reads"
  ON activities FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id = auth_org_id()
    )
  );
