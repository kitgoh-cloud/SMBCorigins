-- =============================================================================
-- Dev seed: SMBC Origin demo data
-- Kaisei Manufacturing KK (hero scenario) + 6 portfolio clients for RM cockpit
--
-- Prerequisites:
--   1. Run migrations (supabase db push)
--   2. Create auth users:  node supabase/seed/create-users.mjs
--   3. Run this file in Supabase dashboard → SQL Editor
--
-- IDs are resolved by email — no UUID changes needed.
-- =============================================================================

DO $$
DECLARE
  james_id  uuid := (SELECT id FROM auth.users WHERE email = 'james.lee@smbc.com.sg');
  yuki_id   uuid := (SELECT id FROM auth.users WHERE email = 'yuki.tanaka@kaisei.co.jp');

BEGIN
  -- Guard: fail fast if auth users haven't been created yet
  IF james_id IS NULL THEN
    RAISE EXCEPTION 'james.lee@smbc.com.sg not found in auth.users — run create-users.mjs first';
  END IF;
  IF yuki_id IS NULL THEN
    RAISE EXCEPTION 'yuki.tanaka@kaisei.co.jp not found in auth.users — run create-users.mjs first';
  END IF;
END $$;

-- Re-open main block with resolved IDs
DO $$
DECLARE
  james_id  uuid := (SELECT id FROM auth.users WHERE email = 'james.lee@smbc.com.sg');
  yuki_id   uuid := (SELECT id FROM auth.users WHERE email = 'yuki.tanaka@kaisei.co.jp');

  -- organizations
  kaisei_org_id       uuid := gen_random_uuid();
  fujiwara_org_id     uuid := gen_random_uuid();
  sato_org_id         uuid := gen_random_uuid();
  ishikawa_org_id     uuid := gen_random_uuid();
  hayashi_org_id      uuid := gen_random_uuid();
  nakamura_org_id     uuid := gen_random_uuid();
  ota_org_id          uuid := gen_random_uuid();

  -- applications
  kaisei_app_id       uuid := gen_random_uuid();
  fujiwara_app_id     uuid := gen_random_uuid();
  sato_app_id         uuid := gen_random_uuid();
  ishikawa_app_id     uuid := gen_random_uuid();
  hayashi_app_id      uuid := gen_random_uuid();
  nakamura_app_id     uuid := gen_random_uuid();
  ota_app_id          uuid := gen_random_uuid();

  -- Kaisei entity tree
  kaisei_parent_id    uuid := gen_random_uuid();
  kaisei_sg_id        uuid := gen_random_uuid();
  kaisei_hk_id        uuid := gen_random_uuid();
  kaisei_uk_id        uuid := gen_random_uuid();
  kaisei_tech_id      uuid := gen_random_uuid();
  morita_id           uuid := gen_random_uuid();

BEGIN

  -- -------------------------------------------------------------------------
  -- Profiles
  -- -------------------------------------------------------------------------

  INSERT INTO profiles (id, role, display_name, email, avatar_url, org_id) VALUES
    (james_id, 'rm',           'James Lee',   'james.lee@smbc.com.sg',     NULL,          NULL),
    (yuki_id,  'client_admin', 'Yuki Tanaka', 'yuki.tanaka@kaisei.co.jp',  NULL,          kaisei_org_id);

  -- -------------------------------------------------------------------------
  -- Organizations
  -- -------------------------------------------------------------------------

  INSERT INTO organizations (id, legal_name, display_name, hq_jurisdiction, industry, size_band) VALUES
    (kaisei_org_id,   'Kaisei Manufacturing KK',    '架星製造',         'JP', 'Automotive Components',   'Large (¥380B revenue)'),
    (fujiwara_org_id, 'Fujiwara Pharmaceutical KK', 'Fujiwara Pharma', 'JP', 'Pharmaceuticals',         'Mid-Market'),
    (sato_org_id,     'Sato Trading Co. Ltd',       'Sato Trading',    'JP', 'Trading',                 'Mid-Market'),
    (ishikawa_org_id, 'Ishikawa Logistics KK',      'Ishikawa Logistics','JP','Logistics & Supply Chain','Mid-Market'),
    (hayashi_org_id,  'Hayashi Foods KK',            'Hayashi Foods',   'JP', 'Food & Beverage',         'SME'),
    (nakamura_org_id, 'Nakamura Electronics KK',    'Nakamura Elec.',  'JP', 'Electronics',             'Mid-Market'),
    (ota_org_id,      'Ota Robotics KK',             'Ota Robotics',    'JP', 'Industrial Robotics',     'Growth');

  -- -------------------------------------------------------------------------
  -- Applications
  -- -------------------------------------------------------------------------

  INSERT INTO applications
    (id, organization_id, rm_user_id, status, current_stage,
     target_jurisdictions, products_requested, opened_at, target_close_date)
  VALUES
    -- Hero: Kaisei — Stage 2, in_progress
    (kaisei_app_id, kaisei_org_id, james_id, 'in_progress', 2,
     ARRAY['SG','HK','UK','JP'],
     ARRAY['accounts','cash_management','fx','trade_finance','credit'],
     now() - interval '5 days', (now() + interval '9 days')::date),

    -- Fujiwara Pharma — Stage 3, doc review
    (fujiwara_app_id, fujiwara_org_id, james_id, 'in_progress', 3,
     ARRAY['SG','HK'], ARRAY['accounts','cash_management'],
     now() - interval '18 days', (now() + interval '10 days')::date),

    -- Sato Trading — Stage 4, screening (amber hit)
    (sato_app_id, sato_org_id, james_id, 'in_review', 4,
     ARRAY['SG'], ARRAY['accounts','trade_finance'],
     now() - interval '25 days', (now() + interval '5 days')::date),

    -- Ishikawa Logistics — Stage 5, credit memo drafting
    (ishikawa_app_id, ishikawa_org_id, james_id, 'in_review', 5,
     ARRAY['SG','JP'], ARRAY['accounts','credit'],
     now() - interval '30 days', (now() + interval '3 days')::date),

    -- Hayashi Foods — Stage 1, just invited
    (hayashi_app_id, hayashi_org_id, james_id, 'invited', 1,
     ARRAY['SG'], ARRAY['accounts'],
     now() - interval '2 days', (now() + interval '20 days')::date),

    -- Nakamura Electronics — Stage 6, activating
    (nakamura_app_id, nakamura_org_id, james_id, 'approved', 6,
     ARRAY['SG','UK'], ARRAY['accounts','cash_management','fx'],
     now() - interval '55 days', (now() + interval '2 days')::date),

    -- Ota Robotics — on hold
    (ota_app_id, ota_org_id, james_id, 'on_hold', 3,
     ARRAY['SG'], ARRAY['accounts','trade_finance'],
     now() - interval '40 days', NULL);

  -- -------------------------------------------------------------------------
  -- Kaisei entity tree (ORIGIN_DESIGN.md §11.1)
  -- -------------------------------------------------------------------------

  INSERT INTO entities
    (id, application_id, parent_entity_id, legal_name, registration_number,
     jurisdiction, entity_type, registered_address, ownership_pct,
     confidence_score, is_shell, source)
  VALUES
    -- Parent
    (kaisei_parent_id, kaisei_app_id, NULL,
     'Kaisei Manufacturing KK', '0123-01-012345',
     'JP', 'Kabushiki Kaisha',
     '{"street":"1-1 Kaisei-cho","city":"Nagoya","postcode":"460-0001","country":"JP"}'::jsonb,
     NULL, 0.99, false, 'registry'),

    -- Singapore subsidiary
    (kaisei_sg_id, kaisei_app_id, kaisei_parent_id,
     'Kaisei Asia Pacific Pte Ltd', '202412345K',
     'SG', 'Private Limited',
     '{"street":"1 Harbourfront Ave","city":"Singapore","postcode":"098632","country":"SG"}'::jsonb,
     100.00, 0.98, false, 'registry'),

    -- Hong Kong subsidiary
    (kaisei_hk_id, kaisei_app_id, kaisei_parent_id,
     'Kaisei Trading HK Ltd', '3456789',
     'HK', 'Private Limited',
     '{"street":"8 Finance St","city":"Hong Kong","country":"HK"}'::jsonb,
     100.00, 0.97, false, 'registry'),

    -- UK subsidiary
    (kaisei_uk_id, kaisei_app_id, kaisei_parent_id,
     'Kaisei Europe Ltd', 'SC987654',
     'UK', 'Private Limited',
     '{"street":"100 Oxford St","city":"London","postcode":"W1D 1LL","country":"GB"}'::jsonb,
     100.00, 0.97, false, 'registry'),

    -- Japan tech subsidiary (partially held by Morita)
    (kaisei_tech_id, kaisei_app_id, kaisei_parent_id,
     'Kaisei Technology KK', '0123-01-098765',
     'JP', 'Kabushiki Kaisha',
     '{"street":"2-3 Sakura-dori","city":"Tokyo","postcode":"100-0001","country":"JP"}'::jsonb,
     80.00, 0.95, false, 'registry'),

    -- Morita Holdings (BVI shell — unwrapped)
    (morita_id, kaisei_app_id, kaisei_tech_id,
     'Morita Holdings Ltd', 'BVI-20241234',
     'VG', 'International Business Company',
     '{"street":"Offshore Chambers","city":"Road Town","country":"VG"}'::jsonb,
     20.00, 0.82, true, 'registry');

  -- -------------------------------------------------------------------------
  -- UBOs (ORIGIN_DESIGN.md §11.2)
  -- -------------------------------------------------------------------------

  INSERT INTO ubos
    (application_id, full_name, nationality, dob, ownership_pct,
     control_type, is_pep, screening_status, confidence_score)
  VALUES
    (kaisei_app_id, 'Hiroshi Kaisei',   'JP', '1982-03-15', 42.00,
     'direct_and_indirect', false, 'cleared', 0.97),

    (kaisei_app_id, 'Yuki Kaisei',      'JP', '1985-09-22', 18.00,
     'direct', false, 'cleared', 0.96),

    (kaisei_app_id, 'Kenji Morita',     'JP', '1968-11-04', 12.00,
     'indirect_via_bvi', false, 'pending', 0.85),

    (kaisei_app_id, 'Tanaka Haruki',    'JP', '1955-06-30',  3.50,
     'trust_beneficiary', false, 'pending', 0.78),

    (kaisei_app_id, 'Tanaka Michiko',   'JP', '1958-02-14',  3.50,
     'trust_beneficiary', false, 'pending', 0.78);

  -- -------------------------------------------------------------------------
  -- Documents — 22 items spread across types (REQUIREMENTS.md BOUND-03)
  -- -------------------------------------------------------------------------

  INSERT INTO documents
    (application_id, entity_id, doc_type, file_url, status,
     extraction_result, uploaded_by, uploaded_at)
  VALUES
    -- Kaisei parent COI
    (kaisei_app_id, kaisei_parent_id, 'coi',
     'https://placeholder.smbc/docs/kaisei-coi-jp.pdf', 'extracted',
     '{"entity_name":"Kaisei Manufacturing KK","reg_no":"0123-01-012345","incorporated":"1962-04-01","jurisdiction":"JP"}'::jsonb,
     yuki_id, now() - interval '4 days'),

    -- Singapore COI
    (kaisei_app_id, kaisei_sg_id, 'coi',
     'https://placeholder.smbc/docs/kaisei-sg-coi.pdf', 'extracted',
     '{"entity_name":"Kaisei Asia Pacific Pte Ltd","reg_no":"202412345K","incorporated":"2024-01-15","jurisdiction":"SG"}'::jsonb,
     yuki_id, now() - interval '4 days'),

    -- HK COI
    (kaisei_app_id, kaisei_hk_id, 'coi',
     'https://placeholder.smbc/docs/kaisei-hk-coi.pdf', 'extracted',
     '{"entity_name":"Kaisei Trading HK Ltd","reg_no":"3456789","incorporated":"2024-03-01","jurisdiction":"HK"}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- UK COI
    (kaisei_app_id, kaisei_uk_id, 'coi',
     'https://placeholder.smbc/docs/kaisei-uk-coi.pdf', 'extracted',
     '{"entity_name":"Kaisei Europe Ltd","reg_no":"SC987654","incorporated":"2024-06-01","jurisdiction":"UK"}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- Japan parent Memorandum & Articles
    (kaisei_app_id, kaisei_parent_id, 'moa',
     'https://placeholder.smbc/docs/kaisei-moa-jp.pdf', 'verified',
     '{"directors":["Hiroshi Kaisei","Satoru Yamamoto","Akiko Sato"],"share_capital":"JPY 5,000,000,000"}'::jsonb,
     yuki_id, now() - interval '4 days'),

    -- Board resolution authorising banking
    (kaisei_app_id, kaisei_parent_id, 'board_resolution',
     'https://placeholder.smbc/docs/kaisei-board-res.pdf', 'verified',
     '{"resolution":"Authorise opening of bank accounts at SMBC","dated":"2026-04-10","signatories":["Hiroshi Kaisei"]}'::jsonb,
     yuki_id, now() - interval '4 days'),

    -- Audited financials FY2025
    (kaisei_app_id, kaisei_parent_id, 'audited_financials',
     'https://placeholder.smbc/docs/kaisei-financials-fy2025.pdf', 'extracting',
     NULL,
     yuki_id, now() - interval '1 day'),

    -- Hiroshi Kaisei passport
    (kaisei_app_id, NULL, 'signatory_id',
     'https://placeholder.smbc/docs/ubo-hiroshi-passport.pdf', 'verified',
     '{"name":"Hiroshi Kaisei","doc_type":"Passport","number":"TK1234567","expiry":"2030-03-14","nationality":"JP"}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- Yuki Kaisei passport
    (kaisei_app_id, NULL, 'signatory_id',
     'https://placeholder.smbc/docs/ubo-yuki-passport.pdf', 'verified',
     '{"name":"Yuki Kaisei","doc_type":"Passport","number":"TK7654321","expiry":"2031-09-21","nationality":"JP"}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- Kenji Morita passport (pending)
    (kaisei_app_id, NULL, 'signatory_id',
     'https://placeholder.smbc/docs/ubo-kenji-passport.pdf', 'uploaded',
     NULL,
     yuki_id, now() - interval '1 day'),

    -- SG shareholder register
    (kaisei_app_id, kaisei_sg_id, 'shareholder_register',
     'https://placeholder.smbc/docs/kaisei-sg-shareholders.pdf', 'extracted',
     '{"shareholders":[{"name":"Kaisei Manufacturing KK","pct":100}]}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- HK shareholder register
    (kaisei_app_id, kaisei_hk_id, 'shareholder_register',
     'https://placeholder.smbc/docs/kaisei-hk-shareholders.pdf', 'extracted',
     '{"shareholders":[{"name":"Kaisei Manufacturing KK","pct":100}]}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- UK shareholder register
    (kaisei_app_id, kaisei_uk_id, 'shareholder_register',
     'https://placeholder.smbc/docs/kaisei-uk-shareholders.pdf', 'extracted',
     '{"shareholders":[{"name":"Kaisei Manufacturing KK","pct":100}]}'::jsonb,
     yuki_id, now() - interval '3 days'),

    -- Morita BVI documents
    (kaisei_app_id, morita_id, 'coi',
     'https://placeholder.smbc/docs/morita-bvi-coi.pdf', 'uploaded',
     NULL,
     yuki_id, now() - interval '2 days'),

    -- Tanaka Family Trust deed
    (kaisei_app_id, NULL, 'trust_deed',
     'https://placeholder.smbc/docs/tanaka-trust-deed.pdf', 'uploaded',
     NULL,
     yuki_id, now() - interval '1 day'),

    -- SG ACRA bizfile
    (kaisei_app_id, kaisei_sg_id, 'registry_extract',
     'https://placeholder.smbc/docs/acra-bizfile-sg.pdf', 'extracted',
     '{"source":"ACRA","retrieved":"2026-04-22","status":"Active"}'::jsonb,
     yuki_id, now() - interval '2 days'),

    -- HK companies registry extract
    (kaisei_app_id, kaisei_hk_id, 'registry_extract',
     'https://placeholder.smbc/docs/cr-extract-hk.pdf', 'extracted',
     '{"source":"HKCR","retrieved":"2026-04-22","status":"Active"}'::jsonb,
     yuki_id, now() - interval '2 days'),

    -- UK Companies House filing
    (kaisei_app_id, kaisei_uk_id, 'registry_extract',
     'https://placeholder.smbc/docs/ch-filing-uk.pdf', 'extracted',
     '{"source":"Companies House","retrieved":"2026-04-22","status":"Active"}'::jsonb,
     yuki_id, now() - interval '2 days'),

    -- Japan hojin bangou registry
    (kaisei_app_id, kaisei_parent_id, 'registry_extract',
     'https://placeholder.smbc/docs/houjin-bangou-jp.pdf', 'verified',
     '{"source":"NTA","retrieved":"2026-04-20","status":"Active","hojin_bangou":"1234567890123"}'::jsonb,
     yuki_id, now() - interval '4 days'),

    -- SG FX mandate
    (kaisei_app_id, kaisei_sg_id, 'product_mandate',
     'https://placeholder.smbc/docs/kaisei-sg-fx-mandate.pdf', 'uploaded',
     NULL,
     yuki_id, now() - interval '1 day'),

    -- Credit facility application form
    (kaisei_app_id, kaisei_parent_id, 'credit_application',
     'https://placeholder.smbc/docs/kaisei-credit-app.pdf', 'uploaded',
     NULL,
     yuki_id, now() - interval '1 day'),

    -- Account opening form SG
    (kaisei_app_id, kaisei_sg_id, 'account_opening_form',
     'https://placeholder.smbc/docs/kaisei-sg-aof.pdf', 'extracted',
     '{"account_type":"Operating","currencies":["SGD","USD","JPY"],"signatories":["Hiroshi Kaisei","Yuki Tanaka"]}'::jsonb,
     yuki_id, now() - interval '3 days');

  -- -------------------------------------------------------------------------
  -- Screening results (Kaisei)
  -- -------------------------------------------------------------------------

  INSERT INTO screening_results
    (application_id, subject_type, subject_id, sanctions_hit, pep_hit,
     adverse_media_hit, risk_score, ai_narrative, disposition)
  VALUES
    -- Kaisei parent entity — clear
    (kaisei_app_id, 'entity', kaisei_parent_id, false, false, false, 0.08,
     'No matches found in OFAC, UN, EU, or MAS sanctions lists. No adverse media. Clean.',
     'cleared'),

    -- Singapore entity — clear
    (kaisei_app_id, 'entity', kaisei_sg_id, false, false, false, 0.05,
     'Newly incorporated entity. ACRA record active. No watchlist matches.',
     'cleared'),

    -- Hiroshi Kaisei — clear
    (kaisei_app_id, 'ubo',
     (SELECT id FROM ubos WHERE application_id = kaisei_app_id AND full_name = 'Hiroshi Kaisei'),
     false, false, false, 0.06,
     'No PEP, sanctions, or adverse media matches. One news article (2023 Nikkei) confirms role as President of Kaisei Manufacturing.',
     'cleared'),

    -- Kenji Morita — amber: pending manual review
    (kaisei_app_id, 'ubo',
     (SELECT id FROM ubos WHERE application_id = kaisei_app_id AND full_name = 'Kenji Morita'),
     false, false, true, 0.34,
     'One adverse media hit: 2019 article in Toyo Keizai noting Morita Holdings in a tax-efficiency restructuring story. Not a sanctions match. Recommend RM review and disposition before proceeding.',
     NULL);

  -- -------------------------------------------------------------------------
  -- Credit memo (Kaisei — drafting in progress)
  -- -------------------------------------------------------------------------

  INSERT INTO credit_memos
    (application_id, facility_amount_usd, facility_type, tenor_months,
     sections, status, drafted_at)
  VALUES
    (kaisei_app_id, 50000000, 'revolving_credit_facility', 36,
     '{
       "exec_summary":    {"content": null, "status": "drafting", "confidence": null},
       "client_overview": {"content": null, "status": "drafting", "confidence": null},
       "financials":      {"content": null, "status": "drafting", "confidence": null},
       "risk":            {"content": null, "status": "drafting", "confidence": null},
       "recommendation":  {"content": null, "status": "drafting", "confidence": null}
     }'::jsonb,
     'drafting', NULL);

  -- -------------------------------------------------------------------------
  -- Products (Kaisei — draft config)
  -- -------------------------------------------------------------------------

  INSERT INTO products (application_id, product_type, config, status)
  VALUES
    (kaisei_app_id, 'accounts',
     '{"jurisdictions":["SG","HK","UK","JP"],"currencies":["SGD","HKD","GBP","JPY","USD"],"account_types":["operating","fcy"]}'::jsonb,
     'draft'),

    (kaisei_app_id, 'cash_management',
     '{"structure":"multi_entity_liquidity","sweep":true,"payment_limits":{"daily_usd":5000000}}'::jsonb,
     'draft'),

    (kaisei_app_id, 'fx',
     '{"pairs":["JPYUSD","JPYSGD","JPYHKD","JPYGBP"],"types":["spot","forward"]}'::jsonb,
     'draft'),

    (kaisei_app_id, 'trade_finance',
     '{"instruments":["letter_of_credit","standby_lc"],"limit_usd":10000000}'::jsonb,
     'draft'),

    (kaisei_app_id, 'credit',
     '{"facility_type":"revolving_credit_facility","amount_usd":50000000,"tenor_months":36,"currency":"USD"}'::jsonb,
     'draft');

  -- -------------------------------------------------------------------------
  -- Activities timeline (Kaisei — last 5 days)
  -- -------------------------------------------------------------------------

  INSERT INTO activities
    (application_id, actor_type, actor_id, event_type, payload, created_at)
  VALUES
    (kaisei_app_id, 'system', NULL,       'application.created',
     '{"message":"Application created for Kaisei Manufacturing KK"}'::jsonb,
     now() - interval '5 days'),

    (kaisei_app_id, 'rm',     james_id,   'invite.sent',
     '{"message":"Invitation sent to Yuki Tanaka","channel":"email"}'::jsonb,
     now() - interval '5 days'),

    (kaisei_app_id, 'client', yuki_id,    'invite.accepted',
     '{"message":"Yuki Tanaka accepted invitation and activated portal access"}'::jsonb,
     now() - interval '4 days'),

    (kaisei_app_id, 'client', yuki_id,    'document.uploaded',
     '{"message":"Certificate of Incorporation uploaded","doc_type":"coi","entity":"Kaisei Manufacturing KK"}'::jsonb,
     now() - interval '4 days'),

    (kaisei_app_id, 'ai',     NULL,       'entity.structure.analysed',
     '{"message":"AI completed structure analysis. Found 5 entities, 5 UBOs, 1 shell company (Morita Holdings BVI). Confidence: 94%."}'::jsonb,
     now() - interval '3 days'),

    (kaisei_app_id, 'client', yuki_id,    'document.uploaded',
     '{"message":"12 documents uploaded across SG, HK, UK, and JP entities"}'::jsonb,
     now() - interval '3 days'),

    (kaisei_app_id, 'ai',     NULL,       'document.extraction.complete',
     '{"message":"AI extracted structured data from 8 documents. 3 still processing. 1 inconsistency flagged on Morita address."}'::jsonb,
     now() - interval '2 days'),

    (kaisei_app_id, 'rm',     james_id,   'stage.advanced',
     '{"message":"James advanced application to Stage 2: Entity & Structure","from_stage":1,"to_stage":2}'::jsonb,
     now() - interval '2 days'),

    (kaisei_app_id, 'ai',     NULL,       'screening.complete',
     '{"message":"Screening complete. 4 entities and 2 UBOs cleared. 1 adverse media hit flagged for Kenji Morita (Morita Holdings BVI). RM review required."}'::jsonb,
     now() - interval '1 day'),

    (kaisei_app_id, 'client', yuki_id,    'document.uploaded',
     '{"message":"3 additional documents uploaded: Tanaka Family Trust deed, Kenji Morita passport, SG FX mandate"}'::jsonb,
     now() - interval '1 day');

END $$;
