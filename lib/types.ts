export type LoanType =
  | 'Personal'
  | 'Home'
  | 'Auto'
  | 'Business'
  | 'Education'
  | 'Debt Consolidation';

export type LoanStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'funded';

export type EmploymentStatus =
  | 'Full-time'
  | 'Part-time'
  | 'Self-employed'
  | 'Retired'
  | 'Unemployed';

export type DocumentType =
  | 'government_id'
  | 'proof_of_income'
  | 'proof_of_address'
  | 'bank_statement'
  | 'tax_return'
  | 'other';

export type DocumentStatus = 'uploaded' | 'verifying' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  employer_name: string | null;
  annual_income: number | null;
  updated_at: string;
}

export interface LoanApplication {
  id: string;
  user_id: string;
  loan_type: LoanType;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  loan_purpose: string | null;
  applicant_first_name: string | null;
  applicant_last_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  applicant_dob: string | null;
  applicant_address: string | null;
  applicant_city: string | null;
  applicant_state: string | null;
  applicant_zip: string | null;
  employer_name: string | null;
  employment_status: string | null;
  monthly_income: number | null;
  co_applicant: boolean;
  co_applicant_name: string | null;
  co_applicant_relationship: string | null;
  co_applicant_income: number | null;
  references_json: ReferenceEntry[];
  documents_json: Record<string, string>;
  status: LoanStatus;
  current_step: number;
  reviewed_at: string | null;
  decisioned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceEntry {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  application_id: string | null;
  document_type: DocumentType;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string;
  status: DocumentStatus;
  created_at: string;
}

export interface EmiResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}
