export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  pan_number?: string;
  nominee_name?: string;
  nominee_relation?: string;
  profile_picture?: string;
  agent_code?: string;
  license_number?: string;
  branch?: string;
  role: UserRole;
  created_at: string;
}

export interface CustomerProfile {
  id: number;
  date_of_birth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Customer {
  id: number;
  user: User;
  phone?: string;
  address?: string;
  city?: string;
}

export interface AgentProfile {
  id: number;
  agent_code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InsurancePlan {
  id: number;
  plan_name: string;
  insurance_type: 'HEALTH' | 'LIFE' | 'VEHICLE' | 'TRAVEL' | 'PROPERTY';
  description: string;
  coverage_amount: number;
  base_premium: number;
  duration_months: number;
  minimum_age: number;
  maximum_age: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export type PolicyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface Policy {
  id: number;
  policy_number: string | null;
  customer: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      profile_picture?: string;
    };
    city?: string;
    phone?: string;
    address?: string;
  };
  agent?: {
    id: number;
    agent_code: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  } | null;
  insurance_plan: InsurancePlan;
  application_date: string;
  start_date: string | null;
  end_date: string | null;
  premium_amount: number;
  coverage_amount: number;
  status: PolicyStatus;
  status_display: string;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CASH';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Payment {
  id: number;
  policy: number;
  policy_number?: string;
  plan_name?: string;
  customer_name?: string;
  customer_email?: string;
  transaction_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  payment_method_display: string;
  status: PaymentStatus;
  created_at: string;
}

export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SETTLED';
export type ClaimType = 'MEDICAL' | 'ACCIDENT' | 'THEFT' | 'DEATH' | 'DISABILITY' | 'TRAVEL_DELAY' | 'OTHER';

export interface Claim {
  id: number;
  claim_number: string;
  policy: number;
  policy_number?: string;
  plan_name?: string;
  insurance_type?: string;
  customer: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  claim_type: ClaimType;
  claim_type_display: string;
  claim_amount: number;
  description: string;
  incident_date: string;
  submitted_date: string;
  approved_amount: number | null;
  status: ClaimStatus;
  status_display: string;
  remarks: string;
  settled_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PremiumCalculation {
  base_premium: number;
  age_factor: number;
  coverage_factor: number;
  final_premium: number;
  age: number;
  coverage_amount: number;
}

export type QuestionCategory = 'POLICY_APPLICATION' | 'COVERAGE_BENEFITS' | 'CLAIM_STATUS' | 'PREMIUM_PAYMENT' | 'GENERAL';
export type QuestionStatus = 'OPEN' | 'IN_REVIEW' | 'ANSWERED';
export type QuestionPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface CustomerQuestion {
  id: string;
  customer_id?: number;
  customer_email: string;
  customer_username?: string;
  customer_name: string;
  category: QuestionCategory;
  category_display: string;
  subject: string;
  policy_number?: string;
  question: string;
  status: QuestionStatus;
  priority: QuestionPriority;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
  created_at: string;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  user_name: string;
  reset_token: string;
  verification_code: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  created_at: string;
  expires_at: string;
}

export interface LoginCredential {
  id: string;
  user_id: number;
  identifier: string; // email or username (case-insensitive lookup)
  password_hash: string; // bcrypt / sha256 or secure hash
  role: UserRole;
  is_active: boolean;
  failed_attempts: number;
  locked_until?: string | null;
  last_login_at?: string | null;
  password_changed_at: string;
  created_at: string;
}

export interface AgentDetail {
  id: number;
  user_id: number;
  user: User;
  agent_code: string;
  license_number: string;
  department: string;
  branch: string;
  region: string;
  commission_rate_percent: number;
  total_commission_earned: number;
  total_policies_sold: number;
  active_portfolio_value: number;
  client_count: number;
  performance_rating: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION';
  joining_date: string;
  contact_hotline?: string;
  specialization: string;
}

export interface DirectoryUser {
  user: User;
  cohort: 'NEW' | 'ESTABLISHED';
  isNewUser: boolean;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  policiesCount: number;
  activeCoverageSum: number;
  claimsCount: number;
  paymentsTotal: number;
  questionsCount: number;
  lastLogin?: string;
  credentialStatus: {
    hasPassword: boolean;
    failedAttempts: number;
    isActive: boolean;
  };
  agentInfo?: AgentDetail;
}

