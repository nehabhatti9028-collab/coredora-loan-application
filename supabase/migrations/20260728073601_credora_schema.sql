/*
# Credora fintech loan platform schema

## Overview
Creates the core data model for Credora, a multi-user fintech loan application
platform. Each authenticated user owns their own profile, loan applications,
and uploaded documents. Row Level Security enforces per-user isolation.

## New Tables
1. `profiles` — app-facing user data extending auth.users (id, full_name, phone, dob, address, city, state, postal_code, country, employer_name, annual_income, updated_at)
2. `loan_applications` — one row per loan (loan_type, loan_amount, interest_rate, loan_term_months, applicant_* fields, employer, income, co_applicant, references_json, documents_json, status, current_step, timestamps)
3. `documents` — uploaded file metadata (document_type, file_name, file_size, mime_type, storage_path, status)

## Security
- RLS enabled on all tables; owner-scoped CRUD (4 policies each, no FOR ALL).
- Owner columns default to auth.uid() so client inserts omitting user_id succeed.
- No anon access — app requires authentication.

## Notes
1. Email confirmation OFF. Email/password auth only.
2. profiles separate from auth.users; we never write to Supabase auth schema.
3. Auto-creates a profile row on signup via a trigger.
*/

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  date_of_birth date,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'United States',
  employer_name text,
  annual_income numeric,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- loan_applications
-- ============================================================
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type text NOT NULL,
  loan_amount numeric NOT NULL,
  interest_rate numeric NOT NULL,
  loan_term_months integer NOT NULL,
  loan_purpose text,
  applicant_first_name text,
  applicant_last_name text,
  applicant_email text,
  applicant_phone text,
  applicant_dob date,
  applicant_address text,
  applicant_city text,
  applicant_state text,
  applicant_zip text,
  employer_name text,
  employment_status text,
  monthly_income numeric,
  co_applicant boolean DEFAULT false,
  co_applicant_name text,
  co_applicant_relationship text,
  co_applicant_income numeric,
  references_json jsonb DEFAULT '[]'::jsonb,
  documents_json jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  current_step integer DEFAULT 1,
  reviewed_at timestamptz,
  decisioned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON loan_applications;
CREATE POLICY "select_own_applications" ON loan_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON loan_applications;
CREATE POLICY "insert_own_applications" ON loan_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON loan_applications;
CREATE POLICY "update_own_applications" ON loan_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON loan_applications;
CREATE POLICY "delete_own_applications" ON loan_applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);

-- ============================================================
-- documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES loan_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);

-- ============================================================
-- updated_at trigger + auto profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER trg_loan_applications_updated_at BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
