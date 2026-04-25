-- =============================================================================
-- Migration: 20260425000001_init_schema
-- SMBC Origin — 10-table schema from ORIGIN_DESIGN.md §7
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('rm', 'client_admin', 'client_user');

CREATE TYPE application_status AS ENUM (
  'invited', 'in_progress', 'in_review', 'approved', 'activated', 'on_hold'
);

CREATE TYPE entity_source AS ENUM ('registry', 'document', 'manual');

CREATE TYPE document_status AS ENUM (
  'uploaded', 'extracting', 'extracted', 'verified', 'rejected'
);

CREATE TYPE screening_subject AS ENUM ('entity', 'ubo');

CREATE TYPE screening_disposition AS ENUM ('cleared', 'escalated', 'blocked');

CREATE TYPE product_status AS ENUM (
  'draft', 'submitted', 'approved', 'provisioned'
);

CREATE TYPE credit_memo_status AS ENUM (
  'drafting', 'drafted', 'reviewed', 'approved'
);

CREATE TYPE actor_type AS ENUM ('client', 'rm', 'ai', 'system');

-- ---------------------------------------------------------------------------
-- updated_at trigger (shared across tables that need it)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. profiles  (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role           user_role NOT NULL,
  display_name   text NOT NULL,
  email          text NOT NULL,
  avatar_url     text,
  org_id         uuid,                 -- FK to organizations added below (circular dep)
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. organizations  (the corporate customer parent)
-- ---------------------------------------------------------------------------

CREATE TABLE organizations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name       text NOT NULL,
  display_name     text NOT NULL,
  hq_jurisdiction  text,
  industry         text,
  size_band        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Add FK from profiles → organizations now that organizations exists
ALTER TABLE profiles
  ADD CONSTRAINT profiles_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 3. applications  (one onboarding case)
-- ---------------------------------------------------------------------------

CREATE TABLE applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  rm_user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status                application_status NOT NULL DEFAULT 'invited',
  current_stage         int NOT NULL DEFAULT 1
                          CHECK (current_stage BETWEEN 1 AND 6),
  target_jurisdictions  text[] NOT NULL DEFAULT '{}',
  products_requested    text[] NOT NULL DEFAULT '{}',
  opened_at             timestamptz NOT NULL DEFAULT now(),
  target_close_date     date,
  closed_at             timestamptz
);

CREATE INDEX applications_rm_user_id_idx       ON applications(rm_user_id);
CREATE INDEX applications_organization_id_idx  ON applications(organization_id);
CREATE INDEX applications_status_idx           ON applications(status);

-- ---------------------------------------------------------------------------
-- 4. entities  (legal entities under an application — self-referencing tree)
-- ---------------------------------------------------------------------------

CREATE TABLE entities (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  parent_entity_id    uuid REFERENCES entities(id) ON DELETE SET NULL,
  legal_name          text NOT NULL,
  registration_number text,
  jurisdiction        text,
  entity_type         text,
  registered_address  jsonb,
  ownership_pct       numeric CHECK (ownership_pct BETWEEN 0 AND 100),
  confidence_score    numeric CHECK (confidence_score BETWEEN 0 AND 1),
  is_shell            boolean NOT NULL DEFAULT false,
  source              entity_source NOT NULL DEFAULT 'manual',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entities_application_id_idx    ON entities(application_id);
CREATE INDEX entities_parent_entity_id_idx  ON entities(parent_entity_id);

-- ---------------------------------------------------------------------------
-- 5. ubos  (natural persons at top of structure)
-- ---------------------------------------------------------------------------

CREATE TABLE ubos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  full_name        text NOT NULL,
  nationality      text,
  dob              date,
  ownership_pct    numeric CHECK (ownership_pct BETWEEN 0 AND 100),
  control_type     text,
  is_pep           boolean NOT NULL DEFAULT false,
  screening_status text,
  confidence_score numeric CHECK (confidence_score BETWEEN 0 AND 1),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ubos_application_id_idx ON ubos(application_id);

-- ---------------------------------------------------------------------------
-- 6. documents  (uploads + AI-extracted data)
-- ---------------------------------------------------------------------------

CREATE TABLE documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id     uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  entity_id          uuid REFERENCES entities(id) ON DELETE SET NULL,
  doc_type           text NOT NULL,
  file_url           text,
  status             document_status NOT NULL DEFAULT 'uploaded',
  extraction_result  jsonb,
  uploaded_by        uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  uploaded_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX documents_application_id_idx ON documents(application_id);
CREATE INDEX documents_entity_id_idx       ON documents(entity_id);
CREATE INDEX documents_status_idx          ON documents(status);

-- ---------------------------------------------------------------------------
-- 7. screening_results
-- ---------------------------------------------------------------------------

CREATE TABLE screening_results (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  subject_type        screening_subject NOT NULL,
  subject_id          uuid NOT NULL,
  sanctions_hit       boolean NOT NULL DEFAULT false,
  pep_hit             boolean NOT NULL DEFAULT false,
  adverse_media_hit   boolean NOT NULL DEFAULT false,
  risk_score          numeric CHECK (risk_score BETWEEN 0 AND 1),
  ai_narrative        text,
  disposition         screening_disposition,
  disposition_note    text,
  disposed_by         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  disposed_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX screening_results_application_id_idx ON screening_results(application_id);
CREATE INDEX screening_results_subject_idx
  ON screening_results(subject_type, subject_id);

-- ---------------------------------------------------------------------------
-- 8. products  (per-application product config)
-- ---------------------------------------------------------------------------

CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  product_type    text NOT NULL,
  config          jsonb NOT NULL DEFAULT '{}',
  status          product_status NOT NULL DEFAULT 'draft',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_application_id_idx ON products(application_id);

-- ---------------------------------------------------------------------------
-- 9. credit_memos
-- ---------------------------------------------------------------------------

CREATE TABLE credit_memos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id       uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  facility_amount_usd  numeric,
  facility_type        text,
  tenor_months         int,
  -- sections: { exec_summary, client_overview, financials, risk, recommendation }
  -- each section: { content: string, status: 'drafting'|'drafted', confidence: 0-1 }
  sections             jsonb NOT NULL DEFAULT '{}',
  status               credit_memo_status NOT NULL DEFAULT 'drafting',
  drafted_at           timestamptz,
  approved_at          timestamptz,
  approved_by          uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX credit_memos_application_id_idx ON credit_memos(application_id);

-- ---------------------------------------------------------------------------
-- 10. activities  (unified timeline for both personas)
-- ---------------------------------------------------------------------------

CREATE TABLE activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_type      actor_type NOT NULL,
  actor_id        uuid,
  event_type      text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- DESC index — feed is always queried newest-first
CREATE INDEX activities_application_id_created_at_idx
  ON activities(application_id, created_at DESC);
CREATE INDEX activities_event_type_idx ON activities(event_type);
