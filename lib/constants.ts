import type { DocumentType, LoanType, EmploymentStatus, LoanStatus } from './types';

export const LOAN_TYPES: { value: LoanType; label: string; description: string }[] = [
  { value: 'Personal', label: 'Personal Loan', description: 'Flexible funds for any purpose' },
  { value: 'Home', label: 'Home Loan', description: 'Buy, build, or refinance a home' },
  { value: 'Auto', label: 'Auto Loan', description: 'Finance a new or used vehicle' },
  { value: 'Business', label: 'Business Loan', description: 'Grow your enterprise' },
  { value: 'Education', label: 'Education Loan', description: 'Fund your studies' },
  { value: 'Debt Consolidation', label: 'Debt Consolidation', description: 'Combine multiple debts' },
];

export const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Retired',
  'Unemployed',
];

export const US_STATES: string[] = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

export const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'government_id', label: 'Government ID', description: 'Driver license, passport, or state ID' },
  { value: 'proof_of_income', label: 'Proof of Income', description: 'Recent pay stubs or offer letter' },
  { value: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or lease agreement' },
  { value: 'bank_statement', label: 'Bank Statement', description: 'Last 3 months of statements' },
  { value: 'tax_return', label: 'Tax Return', description: 'Most recent annual return' },
  { value: 'other', label: 'Other', description: 'Any additional supporting document' },
];

export const LOAN_STATUS_META: Record<LoanStatus, { label: string; color: string; badge: string }> = {
  draft: { label: 'Draft', color: '#64748b', badge: 'secondary' },
  submitted: { label: 'Submitted', color: '#0ea5e9', badge: 'default' },
  under_review: { label: 'Under Review', color: '#f59e0b', badge: 'default' },
  approved: { label: 'Approved', color: '#16a34a', badge: 'default' },
  rejected: { label: 'Rejected', color: '#dc2626', badge: 'destructive' },
  funded: { label: 'Funded', color: '#2563eb', badge: 'default' },
};

export const WIZARD_STEPS = [
  { number: 1, title: 'Loan Type', description: 'Choose your loan product' },
  { number: 2, title: 'Loan Amount', description: 'How much do you need' },
  { number: 3, title: 'Personal Info', description: 'Tell us about yourself' },
  { number: 4, title: 'Employment', description: 'Your employment details' },
  { number: 5, title: 'Co-Applicant', description: 'Add a co-applicant (optional)' },
  { number: 6, title: 'References', description: 'Personal references' },
  { number: 7, title: 'Documents', description: 'Upload supporting documents' },
  { number: 8, title: 'Review', description: 'Review and submit' },
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
];
