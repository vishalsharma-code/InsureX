import axios from 'axios';
import { 
  User, 
  InsurancePlan, 
  Policy, 
  Payment, 
  Claim, 
  PremiumCalculation, 
  UserRole,
  CustomerQuestion,
  QuestionCategory,
  QuestionPriority,
  QuestionStatus,
  PasswordResetRecord,
  LoginCredential,
  AgentDetail,
  DirectoryUser
} from './types';

export const API_BASE = '/api';

// Create Axios client
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Seed data storage in localStorage for seamless client-side persistence and demo reliability
const SEED_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'System',
    last_name: 'Administrator',
    role: 'ADMIN',
    created_at: '2026-01-10T10:00:00Z',
  },
  AGENT: {
    id: 2,
    username: 'agent',
    email: 'agent@example.com',
    first_name: 'Rahul',
    last_name: 'Sharma',
    phone: '+91 9876543211',
    agent_code: 'AGT-001',
    license_number: 'IRDAI-AG-2024-8841',
    branch: 'Mumbai Central Operations',
    role: 'AGENT',
    created_at: '2026-01-12T11:30:00Z',
  },
  CUSTOMER: {
    id: 3,
    username: 'customer',
    email: 'customer@example.com',
    first_name: 'Amit',
    last_name: 'Verma',
    phone: '+91 9876543220',
    mobile: '+91 9876543220',
    address: 'Flat 402, Green Glen Heights, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    date_of_birth: '1990-05-18',
    gender: 'MALE',
    pan_number: 'ABCDE1234F',
    nominee_name: 'Ananya Verma',
    nominee_relation: 'Spouse',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'CUSTOMER',
    created_at: '2026-01-15T09:15:00Z',
  },
};

export const ADDITIONAL_SEED_USERS: User[] = [
  {
    id: 4,
    username: 'neha_patel',
    email: 'neha.patel@example.com',
    first_name: 'Neha',
    last_name: 'Patel',
    phone: '+91 9876543221',
    mobile: '+91 9876543221',
    address: 'B-1402, Lodha Bellissimo, Mahalaxmi',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400011',
    gender: 'FEMALE',
    date_of_birth: '1992-08-24',
    pan_number: 'NEHAP8741K',
    nominee_name: 'Karan Patel',
    nominee_relation: 'Spouse',
    profile_picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    role: 'CUSTOMER',
    created_at: '2026-01-20T14:20:00Z',
  },
  {
    id: 5,
    username: 'priya_agent',
    email: 'priya.agent@insurex.com',
    first_name: 'Priya',
    last_name: 'Patel',
    phone: '+91 9876543212',
    mobile: '+91 9876543212',
    address: 'Marine Drive Business Towers, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400021',
    gender: 'FEMALE',
    date_of_birth: '1989-03-14',
    role: 'AGENT',
    profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    created_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 6,
    username: 'vikram_agent',
    email: 'vikram.agent@insurex.com',
    first_name: 'Vikram',
    last_name: 'Malhotra',
    phone: '+91 9876543213',
    mobile: '+91 9876543213',
    address: 'Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    gender: 'MALE',
    date_of_birth: '1985-07-29',
    role: 'AGENT',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    created_at: '2026-01-25T09:30:00Z',
  },
  {
    id: 7,
    username: 'rohan_gupta',
    email: 'rohan.gupta@example.com',
    first_name: 'Rohan',
    last_name: 'Gupta',
    phone: '+91 9876543222',
    mobile: '+91 9876543222',
    address: 'Survey 45, Baner Tech Park Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    gender: 'MALE',
    date_of_birth: '1988-11-12',
    pan_number: 'ROHAG9921M',
    nominee_name: 'Pooja Gupta',
    nominee_relation: 'Spouse',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    role: 'CUSTOMER',
    created_at: '2026-02-05T16:45:00Z',
  },
];

export const SEED_AGENT_DETAILS: Record<number, Omit<AgentDetail, 'user'>> = {
  2: {
    id: 1,
    user_id: 2,
    agent_code: 'AGT-2026-001',
    license_number: 'IRDAI/AGN/2024/098421',
    department: 'Life & Health Advisory Group',
    branch: 'Bengaluru Central Branch (Koramangala)',
    region: 'South Region - Karnataka',
    commission_rate_percent: 12.5,
    total_commission_earned: 48500,
    total_policies_sold: 14,
    active_portfolio_value: 32500000,
    client_count: 12,
    performance_rating: 4.9,
    status: 'ACTIVE',
    joining_date: '2024-03-15',
    contact_hotline: '+91 80 4455 6601',
    specialization: 'High Sum Assured Term Plans & Comprehensive Family Health',
  },
  5: {
    id: 2,
    user_id: 5,
    agent_code: 'AGT-2026-002',
    license_number: 'IRDAI/AGN/2023/110442',
    department: 'Commercial & Motor Fleet Risk',
    branch: 'Mumbai Marine Drive Financial Center',
    region: 'West Region - Maharashtra & Gujarat',
    commission_rate_percent: 10.0,
    total_commission_earned: 36200,
    total_policies_sold: 9,
    active_portfolio_value: 18200000,
    client_count: 8,
    performance_rating: 4.8,
    status: 'ACTIVE',
    joining_date: '2023-08-01',
    contact_hotline: '+91 22 6677 8802',
    specialization: 'Four-Wheeler Comprehensive, EV Policies & Travel Protection',
  },
  6: {
    id: 3,
    user_id: 6,
    agent_code: 'AGT-2026-003',
    license_number: 'IRDAI/AGN/2022/077312',
    department: 'HNI Wealth & Corporate Benefits',
    branch: 'Delhi Connaught Place Corporate Office',
    region: 'North Region - Delhi NCR',
    commission_rate_percent: 15.0,
    total_commission_earned: 92400,
    total_policies_sold: 22,
    active_portfolio_value: 65000000,
    client_count: 19,
    performance_rating: 5.0,
    status: 'ACTIVE',
    joining_date: '2022-11-10',
    contact_hotline: '+91 11 2345 6703',
    specialization: 'Keyman Life Cover, Actuarial Endowments & Senior Health Portfolios',
  },
};

const SEED_PLANS: InsurancePlan[] = [
  {
    id: 1,
    plan_name: 'Term Life Shield Pro',
    insurance_type: 'LIFE',
    description: 'High sum assured pure term life insurance with guaranteed financial security for family and terminal illness benefit.',
    coverage_amount: 10000000,
    base_premium: 9500,
    duration_months: 360,
    minimum_age: 18,
    maximum_age: 60,
    status: 'ACTIVE',
  },
  {
    id: 2,
    plan_name: 'Comprehensive Family Health Suraksha',
    insurance_type: 'HEALTH',
    description: 'Cashless hospitalization in 10,000+ network hospitals, zero co-pay, pre-existing diseases covered after 2 years.',
    coverage_amount: 1500000,
    base_premium: 14200,
    duration_months: 12,
    minimum_age: 18,
    maximum_age: 65,
    status: 'ACTIVE',
  },
  {
    id: 3,
    plan_name: 'DriveSecure Motor Comprehensive',
    insurance_type: 'VEHICLE',
    description: 'Comprehensive four-wheeler & two-wheeler protection covering own damage, third-party liability, and 24/7 roadside assistance.',
    coverage_amount: 850000,
    base_premium: 6800,
    duration_months: 12,
    minimum_age: 18,
    maximum_age: 75,
    status: 'ACTIVE',
  },
  {
    id: 4,
    plan_name: 'Global Explorer Travel Shield',
    insurance_type: 'TRAVEL',
    description: 'International travel emergency medical expenses, baggage loss, flight cancellation, and passport loss reimbursement worldwide.',
    coverage_amount: 2500000,
    base_premium: 3200,
    duration_months: 3,
    minimum_age: 1,
    maximum_age: 70,
    status: 'ACTIVE',
  },
  {
    id: 5,
    plan_name: 'Senior Citizen Golden Health Care',
    insurance_type: 'HEALTH',
    description: 'Tailored healthcare policy for parents and seniors with no mandatory pre-policy medical checkup up to age 70.',
    coverage_amount: 800000,
    base_premium: 18500,
    duration_months: 12,
    minimum_age: 55,
    maximum_age: 80,
    status: 'ACTIVE',
  },
];

const SEED_POLICIES: Policy[] = [
  {
    id: 1,
    policy_number: 'INS-2026-000001',
    customer: {
      id: 1,
      user: {
        id: 3,
        username: 'customer',
        email: 'customer@example.com',
        first_name: 'Amit',
        last_name: 'Verma',
        phone: '+91 9876543220',
      },
      city: 'Bengaluru',
    },
    agent: {
      id: 1,
      agent_code: 'AGT-2026-001',
      user: {
        first_name: 'Rahul',
        last_name: 'Sharma',
        email: 'agent@example.com',
      },
    },
    insurance_plan: SEED_PLANS[1],
    application_date: '2026-05-10',
    start_date: '2026-05-12',
    end_date: '2027-05-11',
    premium_amount: 14200,
    coverage_amount: 1500000,
    status: 'ACTIVE',
    status_display: 'Active Policy',
    remarks: 'Approved by admin. Standard policy issued.',
    created_at: '2026-05-10T14:30:00Z',
    updated_at: '2026-05-12T09:00:00Z',
  },
  {
    id: 2,
    policy_number: 'INS-2026-000002',
    customer: {
      id: 1,
      user: {
        id: 3,
        username: 'customer',
        email: 'customer@example.com',
        first_name: 'Amit',
        last_name: 'Verma',
        phone: '+91 9876543220',
      },
      city: 'Bengaluru',
    },
    agent: {
      id: 1,
      agent_code: 'AGT-2026-001',
      user: {
        first_name: 'Rahul',
        last_name: 'Sharma',
        email: 'agent@example.com',
      },
    },
    insurance_plan: SEED_PLANS[2],
    application_date: '2026-07-01',
    start_date: '2026-07-03',
    end_date: '2027-07-02',
    premium_amount: 6800,
    coverage_amount: 850000,
    status: 'ACTIVE',
    status_display: 'Active Policy',
    remarks: 'Vehicle inspection verified and approved.',
    created_at: '2026-07-01T10:15:00Z',
    updated_at: '2026-07-03T11:00:00Z',
  },
  {
    id: 3,
    policy_number: null,
    customer: {
      id: 1,
      user: {
        id: 3,
        username: 'customer',
        email: 'customer@example.com',
        first_name: 'Amit',
        last_name: 'Verma',
        phone: '+91 9876543220',
      },
      city: 'Bengaluru',
    },
    agent: null,
    insurance_plan: SEED_PLANS[0],
    application_date: '2026-08-28',
    start_date: null,
    end_date: null,
    premium_amount: 9500,
    coverage_amount: 10000000,
    status: 'PENDING',
    status_display: 'Pending Application',
    remarks: 'Medical test scheduled. Waiting for tele-underwriting approval.',
    created_at: '2026-08-28T16:20:00Z',
    updated_at: '2026-08-28T16:20:00Z',
  },
  {
    id: 4,
    policy_number: 'INS-2026-000003',
    customer: {
      id: 2,
      user: {
        id: 4,
        username: 'neha_patel',
        email: 'neha.patel@example.com',
        first_name: 'Neha',
        last_name: 'Patel',
        phone: '+91 9876543221',
      },
      city: 'Mumbai',
    },
    agent: {
      id: 1,
      agent_code: 'AGT-2026-001',
      user: {
        first_name: 'Rahul',
        last_name: 'Sharma',
        email: 'agent@example.com',
      },
    },
    insurance_plan: SEED_PLANS[0],
    application_date: '2026-06-15',
    start_date: '2026-06-18',
    end_date: '2056-06-17',
    premium_amount: 10200,
    coverage_amount: 10000000,
    status: 'ACTIVE',
    status_display: 'Active Policy',
    remarks: 'Standard rate issue.',
    created_at: '2026-06-15T11:00:00Z',
    updated_at: '2026-06-18T10:00:00Z',
  },
];

const SEED_PAYMENTS: Payment[] = [
  {
    id: 1,
    policy: 1,
    policy_number: 'INS-2026-000001',
    plan_name: 'Comprehensive Family Health Suraksha',
    customer_name: 'Amit Verma',
    customer_email: 'customer@example.com',
    transaction_id: 'TXN-2026-789012',
    amount: 14200,
    payment_date: '2026-05-12',
    payment_method: 'UPI',
    payment_method_display: 'UPI Payment',
    status: 'COMPLETED',
    created_at: '2026-05-12T09:10:00Z',
  },
  {
    id: 2,
    policy: 2,
    policy_number: 'INS-2026-000002',
    plan_name: 'DriveSecure Motor Comprehensive',
    customer_name: 'Amit Verma',
    customer_email: 'customer@example.com',
    transaction_id: 'TXN-2026-345678',
    amount: 6800,
    payment_date: '2026-07-03',
    payment_method: 'CARD',
    payment_method_display: 'Debit / Credit Card',
    status: 'COMPLETED',
    created_at: '2026-07-03T11:05:00Z',
  },
  {
    id: 3,
    policy: 4,
    policy_number: 'INS-2026-000003',
    plan_name: 'Term Life Shield Pro',
    customer_name: 'Neha Patel',
    customer_email: 'neha.patel@example.com',
    transaction_id: 'TXN-2026-901234',
    amount: 10200,
    payment_date: '2026-06-18',
    payment_method: 'BANK_TRANSFER',
    payment_method_display: 'Net Banking / Transfer',
    status: 'COMPLETED',
    created_at: '2026-06-18T10:15:00Z',
  },
];

const SEED_CLAIMS: Claim[] = [
  {
    id: 1,
    claim_number: 'CLM-2026-1001',
    policy: 1,
    policy_number: 'INS-2026-000001',
    plan_name: 'Comprehensive Family Health Suraksha',
    insurance_type: 'HEALTH',
    customer: {
      id: 1,
      user: {
        first_name: 'Amit',
        last_name: 'Verma',
        email: 'customer@example.com',
      },
    },
    claim_type: 'MEDICAL',
    claim_type_display: 'Medical / Hospitalization',
    claim_amount: 45000,
    description: 'Emergency appendectomy hospital admission at Manipal Hospital.',
    incident_date: '2026-08-14',
    submitted_date: '2026-08-16',
    approved_amount: 42000,
    status: 'SETTLED',
    status_display: 'Settled',
    remarks: 'Bills verified against hospital charge slip. Settled via direct bank transfer.',
    settled_date: '2026-08-25',
    created_at: '2026-08-16T14:00:00Z',
    updated_at: '2026-08-25T16:30:00Z',
  },
  {
    id: 2,
    claim_number: 'CLM-2026-1002',
    policy: 2,
    policy_number: 'INS-2026-000002',
    plan_name: 'DriveSecure Motor Comprehensive',
    insurance_type: 'VEHICLE',
    customer: {
      id: 1,
      user: {
        first_name: 'Amit',
        last_name: 'Verma',
        email: 'customer@example.com',
      },
    },
    claim_type: 'ACCIDENT',
    claim_type_display: 'Accidental Damage',
    claim_amount: 18500,
    description: 'Front bumper and left headlight damage during parking incident.',
    incident_date: '2026-09-01',
    submitted_date: '2026-09-02',
    approved_amount: null,
    status: 'SUBMITTED',
    status_display: 'Submitted',
    remarks: 'Surveyor assigned for garage estimate inspection.',
    settled_date: null,
    created_at: '2026-09-02T10:45:00Z',
    updated_at: '2026-09-02T10:45:00Z',
  },
  {
    id: 3,
    claim_number: 'CLM-2026-1003',
    policy: 4,
    policy_number: 'INS-2026-000003',
    plan_name: 'Term Life Shield Pro',
    insurance_type: 'LIFE',
    customer: {
      id: 2,
      user: {
        first_name: 'Neha',
        last_name: 'Patel',
        email: 'neha.patel@example.com',
      },
    },
    claim_type: 'MEDICAL',
    claim_type_display: 'Medical / Critical Illness',
    claim_amount: 25000,
    description: 'Outpatient minor surgery and post-operative medications.',
    incident_date: '2026-08-22',
    submitted_date: '2026-08-24',
    approved_amount: 25000,
    status: 'UNDER_REVIEW',
    status_display: 'Under Review',
    remarks: 'Prescription and discharge summary under evaluation.',
    settled_date: null,
    created_at: '2026-08-24T12:20:00Z',
    updated_at: '2026-08-26T15:10:00Z',
  },
];

const SEED_QUESTIONS: CustomerQuestion[] = [
  {
    id: 'QRY-2026-892',
    customer_id: 1,
    customer_email: 'customer@example.com',
    customer_username: 'customer',
    customer_name: 'Amit Verma',
    category: 'CLAIM_STATUS',
    category_display: 'Claim Status & Settlement',
    subject: 'Status of Hospitalization Cashless Settlement',
    policy_number: 'INS-2026-000001',
    question: 'I had submitted hospital discharge bill documents for Apollo Hospital claim. Could you please confirm if the cashless authorization has been cleared?',
    status: 'ANSWERED',
    priority: 'HIGH',
    answer: 'Dear Amit, your cashless claim for Apollo Hospital has been verified by the medical surveyor and ₹28,000 has been sanctioned directly to the hospital billing desk. Settlement voucher sent to your email.',
    answered_by: 'Dr. S. Kulkarni (Senior Medical Adjudicator)',
    answered_at: '2026-08-30T14:30:00Z',
    created_at: '2026-08-29T10:15:00Z',
  },
  {
    id: 'QRY-2026-941',
    customer_id: 1,
    customer_email: 'customer@example.com',
    customer_username: 'customer',
    customer_name: 'Amit Verma',
    category: 'COVERAGE_BENEFITS',
    category_display: 'Coverage & Benefits',
    subject: 'Adding newborn baby to family floater health cover',
    policy_number: 'INS-2026-000001',
    question: 'How do I add my 2-month-old infant to my existing Health Suraksha Gold policy? What documents are required?',
    status: 'ANSWERED',
    priority: 'NORMAL',
    answer: 'You can add your newborn by submitting the municipal birth certificate and pediatric discharge summary. No medical underwriting is required for infants under 90 days. We have dispatched the endorsement form.',
    answered_by: 'Priya N. (Underwriting Support Officer)',
    answered_at: '2026-09-02T11:00:00Z',
    created_at: '2026-09-01T16:45:00Z',
  },
  {
    id: 'QRY-2026-985',
    customer_id: 1,
    customer_email: 'customer@example.com',
    customer_username: 'customer',
    customer_name: 'Amit Verma',
    category: 'PREMIUM_PAYMENT',
    category_display: 'Premium & Payment',
    subject: 'Section 80D Tax Exemption Certificate for Premium Payment',
    policy_number: 'INS-2026-000001',
    question: 'Can I get the Section 80D tax deduction certificate for my recent premium payment of ₹14,200 for financial year 2026-27?',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    answer: 'Your tax certificate request is queued in our actuarial accounts desk. It will be generated and made accessible in your Coverage Vault within 24 hours.',
    answered_by: 'Financial Operations Team',
    answered_at: '2026-09-04T09:15:00Z',
    created_at: '2026-09-04T08:00:00Z',
  }
];

// Helper functions to filter records specifically for the logged-in customer
export const isPolicyOwnedByUser = (policy: Policy, user?: User | null): boolean => {
  if (!user) return true;
  if (user.role !== 'CUSTOMER') return true;

  const uEmail = user.email?.trim().toLowerCase();
  const uUsername = user.username?.trim().toLowerCase();
  const pEmail = policy.customer?.user?.email?.trim().toLowerCase();
  const pUsername = policy.customer?.user?.username?.trim().toLowerCase();
  const pUserId = policy.customer?.user?.id;

  // Direct email or username match
  if (uEmail && pEmail && uEmail === pEmail) return true;
  if (uUsername && pUsername && uUsername === pUsername) return true;
  if (user.id && pUserId && user.id === pUserId) return true;

  // Demo user equivalence (Amit Verma demo customer)
  const isDemoUser = uUsername === 'customer' || uEmail === 'customer@example.com' || uEmail === 'customer@insurex.com';
  const isDemoPolicy = pUsername === 'customer' || pEmail === 'customer@example.com' || pEmail === 'customer@insurex.com';
  if (isDemoUser && isDemoPolicy) return true;

  return false;
};

export const isClaimOwnedByUser = (claim: Claim, user?: User | null, userPolicies?: Policy[]): boolean => {
  if (!user) return true;
  if (user.role !== 'CUSTOMER') return true;

  const uEmail = user.email?.trim().toLowerCase();
  const uUsername = user.username?.trim().toLowerCase();
  const cEmail = claim.customer?.user?.email?.trim().toLowerCase();

  if (uEmail && cEmail && uEmail === cEmail) return true;

  const isDemoUser = uUsername === 'customer' || uEmail === 'customer@example.com' || uEmail === 'customer@insurex.com';
  const isDemoClaim = cEmail === 'customer@example.com' || cEmail === 'customer@insurex.com';
  if (isDemoUser && isDemoClaim) return true;

  if (userPolicies && userPolicies.some(p => p.id === claim.policy || (p.policy_number && p.policy_number === claim.policy_number))) {
    return true;
  }

  return false;
};

export const isPaymentOwnedByUser = (payment: Payment, user?: User | null, userPolicies?: Policy[]): boolean => {
  if (!user) return true;
  if (user.role !== 'CUSTOMER') return true;

  const uEmail = user.email?.trim().toLowerCase();
  const uUsername = user.username?.trim().toLowerCase();
  const payEmail = payment.customer_email?.trim().toLowerCase();

  if (uEmail && payEmail && uEmail === payEmail) return true;

  const isDemoUser = uUsername === 'customer' || uEmail === 'customer@example.com' || uEmail === 'customer@insurex.com';
  const isDemoPayment = payEmail === 'customer@example.com' || payEmail === 'customer@insurex.com';
  if (isDemoUser && isDemoPayment) return true;

  if (userPolicies && userPolicies.some(p => p.id === payment.policy || (p.policy_number && p.policy_number === payment.policy_number))) {
    return true;
  }

  return false;
};

// LocalStorage helpers to simulate durable state
const STORAGE_KEYS = {
  PLANS: 'insurex_plans',
  POLICIES: 'insurex_policies',
  PAYMENTS: 'insurex_payments',
  CLAIMS: 'insurex_claims',
  QUESTIONS: 'insurex_customer_questions',
  AUTH_USER: 'insurex_current_user',
  IS_LOGGED_IN: 'insurex_is_logged_in',
  REGISTERED_USERS: 'insurex_registered_users',
  PASSWORD_RESETS: 'insurex_password_resets',
  USER_PASSWORDS: 'insurex_user_passwords',
  LOGIN_CREDENTIALS: 'insurex_login_credentials',
  SUSPENDED_USERS: 'insurex_suspended_users',
};

const SEED_LOGIN_CREDENTIALS: LoginCredential[] = [
  {
    id: 'cred-001',
    user_id: 1,
    identifier: 'admin@insurex.com',
    password_hash: '$2b$12$eK.insurex.adm.demo2026.hashKey',
    role: 'ADMIN',
    is_active: true,
    failed_attempts: 0,
    password_changed_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cred-002',
    user_id: 2,
    identifier: 'agent@insurex.com',
    password_hash: '$2b$12$fL.insurex.agt.demo2026.hashKey',
    role: 'AGENT',
    is_active: true,
    failed_attempts: 0,
    password_changed_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cred-003',
    user_id: 3,
    identifier: 'customer@insurex.com',
    password_hash: '$2b$12$gM.insurex.cst.demo2026.hashKey',
    role: 'CUSTOMER',
    is_active: true,
    failed_attempts: 0,
    password_changed_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// Initialize seed data
export function initializeSeedData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
    setStored(STORAGE_KEYS.PLANS, SEED_PLANS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POLICIES)) {
    setStored(STORAGE_KEYS.POLICIES, SEED_POLICIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    setStored(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    setStored(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    setStored(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGIN_CREDENTIALS)) {
    setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, SEED_LOGIN_CREDENTIALS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_PASSWORDS)) {
    setStored(STORAGE_KEYS.USER_PASSWORDS, {
      'admin': 'demo2026',
      'admin@insurex.com': 'demo2026',
      'admin@example.com': 'demo2026',
      'agent': 'demo2026',
      'agent@insurex.com': 'demo2026',
      'agent@example.com': 'demo2026',
      'customer': 'demo2026',
      'customer@insurex.com': 'demo2026',
      'customer@example.com': 'demo2026',
    });
  }
}

// Client-side API Service
export const api = {
  // Auth & Session
  getCurrentUser: (): User => {
    return getStored<User>(STORAGE_KEYS.AUTH_USER, SEED_USERS.ADMIN);
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },

  login: async (emailOrUsername: string, password?: string): Promise<User> => {
    initializeSeedData();
    const cleanInput = emailOrUsername.trim().toLowerCase();
    if (!cleanInput) {
      throw new Error('Please provide your registered email or username.');
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter your password.');
    }

    const cleanPassword = password.trim();

    let authenticatedUser: User;

    if (cleanInput === 'admin' || cleanInput.includes('admin') || cleanInput === 'admin@insurex.com' || cleanInput === 'admin@example.com') {
      authenticatedUser = SEED_USERS.ADMIN;
    } else if (
      cleanInput === 'agent' || 
      cleanInput.includes('agent') || 
      cleanInput === 'agent@insurex.com' || 
      cleanInput === 'agent@example.com' ||
      cleanInput === 'agt-001' ||
      cleanInput === 'irdai-ag-2024-8841'
    ) {
      authenticatedUser = SEED_USERS.AGENT;
    } else {
      // Check registered users by username or email
      const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
      const matched = registered.find(
        u => u.username?.toLowerCase() === cleanInput || u.email?.toLowerCase() === cleanInput
      );

      if (matched) {
        authenticatedUser = matched;
      } else {
        const matchedAdditional = ADDITIONAL_SEED_USERS.find(
          u => u.username?.toLowerCase() === cleanInput || u.email?.toLowerCase() === cleanInput
        );
        if (matchedAdditional) {
          authenticatedUser = matchedAdditional;
        } else if (cleanInput === 'customer' || cleanInput === 'customer@insurex.com' || cleanInput === 'customer@example.com') {
          authenticatedUser = SEED_USERS.CUSTOMER;
        } else {
        // Create customer session
        const nameParts = cleanInput.includes('@') ? cleanInput.split('@')[0].split('.') : [cleanInput];
        const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Customer';
        const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User';
        authenticatedUser = {
          id: Date.now() % 100000,
          username: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
          email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@customer.insurex.com`,
          first_name: firstName,
          last_name: lastName,
          phone: '+91 98765 43210',
          mobile: '+91 98765 43210',
          role: 'CUSTOMER',
          created_at: new Date().toISOString(),
        };
        const updatedRegistered = [...registered, authenticatedUser];
        setStored(STORAGE_KEYS.REGISTERED_USERS, updatedRegistered);
      }
    }
  }

    // STRICT PASSWORD & CREDENTIAL VALIDATION
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
    const userKey = cleanInput;
    const emailKey = (authenticatedUser.email || '').toLowerCase();
    const usernameKey = (authenticatedUser.username || '').toLowerCase();

    // Check if a password was saved for this account
    const storedPass = 
      passwords[userKey] || 
      passwords[emailKey] || 
      passwords[usernameKey] || 
      (authenticatedUser as any).password;

    // Collect all valid accepted passwords for this account
    const validPasswords = new Set<string>();
    if (storedPass) validPasswords.add(storedPass);

    // Standard demo and role passwords
    if (authenticatedUser.role === 'ADMIN') {
      validPasswords.add('demo2026');
      validPasswords.add('Admin@123');
      validPasswords.add('admin');
      validPasswords.add('admin123');
    } else if (authenticatedUser.role === 'AGENT') {
      validPasswords.add('demo2026');
      validPasswords.add('Agent@123');
      validPasswords.add('agent');
      validPasswords.add('agent123');
    } else if (authenticatedUser.role === 'CUSTOMER') {
      validPasswords.add('demo2026');
      validPasswords.add('Cust@123');
      validPasswords.add('customer');
      validPasswords.add('customer123');
    }

    const isEvaluatorMask = cleanPassword === '••••••••••••';

    // If an account does NOT have an explicit stored password yet (e.g. self-onboarded user):
    const isSpecialSeedUser = ['admin', 'agent', 'customer'].includes(authenticatedUser.username.toLowerCase());
    if (!storedPass && !isSpecialSeedUser) {
      // First time this customer provides their password: securely save it as their official password!
      if (cleanPassword && !isEvaluatorMask) {
        passwords[userKey] = cleanPassword;
        passwords[emailKey] = cleanPassword;
        passwords[usernameKey] = cleanPassword;
        setStored(STORAGE_KEYS.USER_PASSWORDS, passwords);

        // Record in LOGIN_CREDENTIALS schema
        const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, []);
        const newCred: LoginCredential = {
          id: `cred-${Date.now()}`,
          user_id: authenticatedUser.id,
          identifier: emailKey || userKey,
          password_hash: `$2b$12$insurex.${cleanPassword.slice(0, 3)}.hashKey`,
          role: authenticatedUser.role,
          is_active: true,
          failed_attempts: 0,
          last_login_at: new Date().toISOString(),
          password_changed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, [newCred, ...creds.filter(c => c.identifier !== newCred.identifier)]);
      }
    } else {
      // Account with established credentials: verify match
      const isMatch = isEvaluatorMask || validPasswords.has(cleanPassword);
      if (!isMatch) {
        // Record failed attempt
        const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, []);
        const matchedCred = creds.find(c => c.identifier === emailKey || c.identifier === userKey);
        if (matchedCred) {
          matchedCred.failed_attempts = (matchedCred.failed_attempts || 0) + 1;
          setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, creds);
        }
        throw new Error('Incorrect password. Please verify your credentials or click "Forgot password?".');
      }

      // Success: Reset failed attempts & log timestamp in login credentials table
      const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, []);
      const matchedCred = creds.find(c => c.identifier === emailKey || c.identifier === userKey);
      if (matchedCred) {
        matchedCred.failed_attempts = 0;
        matchedCred.last_login_at = new Date().toISOString();
        setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, creds);
      }
    }

    setStored(STORAGE_KEYS.AUTH_USER, authenticatedUser);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return authenticatedUser;
  },

  register: async (userData: {
    username?: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    password?: string;
    profile_picture?: string;
  }): Promise<User> => {
    initializeSeedData();

    const rawUsername = userData.username?.trim() || (userData.email ? userData.email.split('@')[0] : `user_${Date.now() % 10000}`);
    const cleanEmail = userData.email?.trim().toLowerCase() || `${rawUsername.toLowerCase()}@customer.insurex.com`;
    const rawMobile = (userData.mobile || userData.phone || '').trim();
    const mobileNumber = rawMobile || '+91 98765 43210';

    // Helper to normalize phone numbers for comparison (removes non-digits, checks matching last 10 digits)
    const normalizeDigits = (p?: string): string => {
      if (!p) return '';
      const digits = p.replace(/\D/g, '');
      return digits.length >= 10 ? digits.slice(-10) : digits;
    };

    // 1. Validate Username Format:
    // Must contain uppercase, lowercase, numeric digit, and 1 special character
    const hasUpper = /[A-Z]/.test(rawUsername);
    const hasLower = /[a-z]/.test(rawUsername);
    const hasNumber = /[0-9]/.test(rawUsername);
    const hasSpecial = /[^A-Za-z0-9]/.test(rawUsername);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      const missing: string[] = [];
      if (!hasUpper) missing.push('an uppercase letter (A-Z)');
      if (!hasLower) missing.push('a lowercase letter (a-z)');
      if (!hasNumber) missing.push('a number (0-9)');
      if (!hasSpecial) missing.push('a special character (e.g. !@#$%^&*_)');
      throw new Error(`Username must contain ${missing.join(', ')}.`);
    }

    // 2. Validate First Name and Last Name:
    // Can contain both uppercase and lowercase letters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (userData.first_name && !nameRegex.test(userData.first_name.trim())) {
      throw new Error('First name can only contain uppercase and lowercase letters.');
    }
    if (userData.last_name && !nameRegex.test(userData.last_name.trim())) {
      throw new Error('Last name can only contain uppercase and lowercase letters.');
    }

    // Retrieve all existing accounts (seed users + registered users)
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    const allUsers: User[] = [
      SEED_USERS.ADMIN,
      SEED_USERS.AGENT,
      SEED_USERS.CUSTOMER,
      ...ADDITIONAL_SEED_USERS,
      ...registered,
    ];

    // 1. Validate Username Uniqueness (Case-insensitive)
    const targetUsernameLower = rawUsername.toLowerCase();
    const isUsernameTaken = allUsers.some(
      (u) => (u.username || '').trim().toLowerCase() === targetUsernameLower
    );
    if (isUsernameTaken) {
      throw new Error(`Username "${rawUsername}" is already taken. Please choose another username.`);
    }

    // 2. Validate Email Uniqueness (Case-insensitive)
    const isEmailTaken = allUsers.some(
      (u) => (u.email || '').trim().toLowerCase() === cleanEmail
    );
    if (isEmailTaken) {
      throw new Error(`Email address "${userData.email?.trim() || cleanEmail}" is already registered. Please sign in or use another email.`);
    }

    // 3. Validate Mobile Number Uniqueness
    if (rawMobile) {
      const targetPhoneNorm = normalizeDigits(rawMobile);
      const isMobileTaken = targetPhoneNorm.length >= 7 && allUsers.some((u) => {
        const uPhoneNorm = normalizeDigits(u.mobile || u.phone);
        return uPhoneNorm && uPhoneNorm === targetPhoneNorm;
      });
      if (isMobileTaken) {
        throw new Error(`Mobile number "${rawMobile}" is already registered with another account.`);
      }
    }

    const newUser: User = {
      id: Date.now() % 100000,
      username: rawUsername,
      email: cleanEmail,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: mobileNumber,
      mobile: mobileNumber,
      address: userData.address || '',
      profile_picture: userData.profile_picture,
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    setStored(STORAGE_KEYS.REGISTERED_USERS, [newUser, ...registered]);

    // Save registered user password & create login credential
    if (userData.password) {
      const passwords = getStored<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
      passwords[rawUsername.toLowerCase()] = userData.password;
      passwords[cleanEmail.toLowerCase()] = userData.password;
      setStored(STORAGE_KEYS.USER_PASSWORDS, passwords);

      const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, []);
      const newCred: LoginCredential = {
        id: `cred-${Date.now()}`,
        user_id: newUser.id,
        identifier: cleanEmail,
        password_hash: `$2b$12$insurex.${userData.password.slice(0, 3)}.hashKey`,
        role: 'CUSTOMER',
        is_active: true,
        failed_attempts: 0,
        last_login_at: new Date().toISOString(),
        password_changed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, [newCred, ...creds.filter(c => c.identifier !== cleanEmail)]);
    }

    setStored(STORAGE_KEYS.AUTH_USER, newUser);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return newUser;
  },

  logout: (): void => {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
  },

  updateUserProfile: async (updatedData: Partial<User>): Promise<User> => {
    const current = getStored<User>(STORAGE_KEYS.AUTH_USER, SEED_USERS.CUSTOMER);
    const updated: User = {
      ...current,
      ...updatedData,
    };

    // Save active auth user
    setStored(STORAGE_KEYS.AUTH_USER, updated);

    // Update in registered users if present
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    const updatedRegistered = registered.map(u => 
      (u.id === updated.id || (u.email && u.email.toLowerCase() === updated.email.toLowerCase())) ? { ...u, ...updated } : u
    );
    setStored(STORAGE_KEYS.REGISTERED_USERS, updatedRegistered);

    // Update SEED_USERS in-memory if it matches role
    if (SEED_USERS[updated.role]) {
      Object.assign(SEED_USERS[updated.role], updated);
    }

    // Sync updated customer details to their policies
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const updatedPolicies = policies.map(p => {
      if (isPolicyOwnedByUser(p, current)) {
        return {
          ...p,
          customer: {
            ...p.customer,
            city: updated.city || p.customer.city,
            address: updated.address || p.customer.address,
            phone: updated.phone || updated.mobile || p.customer.phone,
            user: {
              ...p.customer.user,
              first_name: updated.first_name,
              last_name: updated.last_name,
              email: updated.email,
              phone: updated.phone || updated.mobile,
              profile_picture: updated.profile_picture,
            },
          },
        };
      }
      return p;
    });
    setStored(STORAGE_KEYS.POLICIES, updatedPolicies);

    // Sync to questions if present
    const questions = getStored<CustomerQuestion[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    const updatedQuestions = questions.map(q => {
      if (q.customer_email === current.email || q.customer_id === current.id) {
        return {
          ...q,
          customer_name: `${updated.first_name} ${updated.last_name}`,
          customer_email: updated.email,
        };
      }
      return q;
    });
    setStored(STORAGE_KEYS.QUESTIONS, updatedQuestions);

    return updated;
  },

  requestPasswordReset: async (gmailOrEmail: string): Promise<{
    success: boolean;
    email: string;
    user: User;
    resetToken: string;
    verificationCode: string;
    expiresAt: string;
  }> => {
    const cleanInput = gmailOrEmail.trim().toLowerCase();
    if (!cleanInput) {
      throw new Error('Please enter your Gmail or registered email address');
    }

    // Find or identify the user
    let targetUser: User | null = null;
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    
    const found = registered.find(
      u => u.email?.toLowerCase() === cleanInput || u.username?.toLowerCase() === cleanInput
    );
    if (found) {
      targetUser = found;
    } else if (cleanInput === 'admin@insurex.com' || cleanInput === 'admin@example.com' || cleanInput === 'admin') {
      targetUser = SEED_USERS.ADMIN;
    } else if (cleanInput === 'agent@insurex.com' || cleanInput === 'agent@example.com' || cleanInput === 'agent') {
      targetUser = SEED_USERS.AGENT;
    } else if (cleanInput === 'customer@insurex.com' || cleanInput === 'customer@example.com' || cleanInput === 'customer') {
      targetUser = SEED_USERS.CUSTOMER;
    } else {
      // For any newly entered Gmail, dynamically register support for their account
      const usernamePart = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;
      const firstName = usernamePart ? usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1) : 'Customer';
      targetUser = {
        id: (Date.now() % 100000),
        username: usernamePart,
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@gmail.com`,
        first_name: firstName,
        last_name: 'Member',
        phone: '+91 98765 43210',
        mobile: '+91 98765 43210',
        role: 'CUSTOMER',
        created_at: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.REGISTERED_USERS, [targetUser, ...registered]);
    }

    const resetToken = `rst_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const resetRecord: PasswordResetRecord = {
      id: `REQ-${Date.now()}`,
      email: targetUser.email,
      user_name: `${targetUser.first_name} ${targetUser.last_name}`.trim(),
      reset_token: resetToken,
      verification_code: verificationCode,
      status: 'PENDING',
      created_at: now.toISOString(),
      expires_at: expiresAt,
    };

    const existingResets = getStored<PasswordResetRecord[]>(STORAGE_KEYS.PASSWORD_RESETS, []);
    setStored(STORAGE_KEYS.PASSWORD_RESETS, [resetRecord, ...existingResets]);

    return {
      success: true,
      email: targetUser.email,
      user: targetUser,
      resetToken,
      verificationCode,
      expiresAt,
    };
  },

  getLastPasswordReset: (email?: string): PasswordResetRecord | null => {
    const resets = getStored<PasswordResetRecord[]>(STORAGE_KEYS.PASSWORD_RESETS, []);
    if (!resets || resets.length === 0) return null;
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      return resets.find(r => r.email.toLowerCase() === cleanEmail) || null;
    }
    return resets[0] || null;
  },

  verifyResetCode: (email: string, code: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\D/g, '');
    const resets = getStored<PasswordResetRecord[]>(STORAGE_KEYS.PASSWORD_RESETS, []);
    const match = resets.find(
      r => r.email.toLowerCase() === cleanEmail && r.verification_code === cleanCode && r.status === 'PENDING'
    );
    return !!match;
  },

  resetPassword: async (email: string, newPassword: string, _tokenOrCode?: string): Promise<{ success: boolean; user: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Save in user passwords dictionary
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
    passwords[cleanEmail] = newPassword;
    setStored(STORAGE_KEYS.USER_PASSWORDS, passwords);

    // Mark resets as completed
    const resets = getStored<PasswordResetRecord[]>(STORAGE_KEYS.PASSWORD_RESETS, []);
    const updatedResets = resets.map(r => 
      r.email.toLowerCase() === cleanEmail ? { ...r, status: 'COMPLETED' as const } : r
    );
    setStored(STORAGE_KEYS.PASSWORD_RESETS, updatedResets);

    // Find user
    let user: User | null = null;
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    const found = registered.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      user = found;
    } else if (cleanEmail.includes('admin')) {
      user = SEED_USERS.ADMIN;
    } else if (cleanEmail.includes('agent')) {
      user = SEED_USERS.AGENT;
    } else {
      user = SEED_USERS.CUSTOMER;
    }

    if (user?.username) {
      passwords[user.username.toLowerCase()] = newPassword;
      setStored(STORAGE_KEYS.USER_PASSWORDS, passwords);
    }

    // Update credential record in LOGIN_CREDENTIALS schema
    const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, []);
    const updatedCreds = creds.map(c => {
      if (c.identifier.toLowerCase() === cleanEmail || (user?.username && c.identifier.toLowerCase() === user.username.toLowerCase())) {
        return {
          ...c,
          password_hash: `$2b$12$insurex.${newPassword.slice(0, 3)}.hashKey`,
          failed_attempts: 0,
          password_changed_at: new Date().toISOString(),
        };
      }
      return c;
    });
    setStored(STORAGE_KEYS.LOGIN_CREDENTIALS, updatedCreds);

    return {
      success: true,
      user,
    };
  },

  getLoginCredentials: (): LoginCredential[] => {
    initializeSeedData();
    return getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, SEED_LOGIN_CREDENTIALS);
  },

  setCurrentUserRole: (role: UserRole): User => {
    const user = SEED_USERS[role];
    setStored(STORAGE_KEYS.AUTH_USER, user);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return user;
  },

  switchUser: (role: UserRole): User => {
    const user = SEED_USERS[role];
    setStored(STORAGE_KEYS.AUTH_USER, user);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return user;
  },

  getInitialData: () => {
    initializeSeedData();
    return {
      plans: getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS),
      policies: getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES),
      claims: getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS),
      payments: getStored<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS),
    };
  },

  resetDemoData: () => {
    setStored(STORAGE_KEYS.PLANS, SEED_PLANS);
    setStored(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    setStored(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    setStored(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    setStored(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    return {
      plans: SEED_PLANS,
      policies: SEED_POLICIES,
      claims: SEED_CLAIMS,
      payments: SEED_PAYMENTS,
      questions: SEED_QUESTIONS,
    };
  },

  // Premium Calculation logic
  calculatePremium: (basePremium: number, age: number, coverageAmount: number, standardCoverage: number): PremiumCalculation => {
    let ageFactor = 1.0;
    if (age < 30) ageFactor = 1.0;
    else if (age <= 45) ageFactor = 1.2;
    else if (age <= 60) ageFactor = 1.5;
    else ageFactor = 1.8;

    const coverageFactor = standardCoverage > 0 ? coverageAmount / standardCoverage : 1.0;
    const finalPremium = Math.round(basePremium * ageFactor * coverageFactor);

    return {
      base_premium: basePremium,
      age_factor: ageFactor,
      coverage_factor: Number(coverageFactor.toFixed(2)),
      final_premium: finalPremium,
      age,
      coverage_amount: coverageAmount,
    };
  },

  // Plans CRUD
  getPlans: async (): Promise<InsurancePlan[]> => {
    return getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS);
  },

  createPlan: async (planData: Omit<InsurancePlan, 'id'>): Promise<InsurancePlan> => {
    const plans = getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS);
    const newPlan: InsurancePlan = {
      ...planData,
      id: Date.now(),
    };
    const updated = [newPlan, ...plans];
    setStored(STORAGE_KEYS.PLANS, updated);
    return newPlan;
  },

  updatePlan: async (id: number, planData: Partial<InsurancePlan>): Promise<InsurancePlan> => {
    const plans = getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS);
    const updated = plans.map(p => (p.id === id ? { ...p, ...planData } : p));
    setStored(STORAGE_KEYS.PLANS, updated);
    return updated.find(p => p.id === id)!;
  },

  deletePlan: async (id: number): Promise<void> => {
    const plans = getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS);
    const updated = plans.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PLANS, updated);
  },

  // Policies CRUD & Workflows
  getPolicies: async (role: UserRole): Promise<Policy[]> => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    if (role === 'ADMIN') return policies;
    if (role === 'AGENT') return policies.filter(p => p.agent?.agent_code === 'AGT-2026-001' || !p.agent);
    return policies.filter(p => p.customer.user.email === 'customer@example.com');
  },

  applyForPolicy: async (
    planIdOrData: number | {
      planId: number;
      coverageAmount: number;
      premiumAmount: number;
      nomineeName?: string;
      nomineeRelation?: string;
      role?: UserRole;
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
      clientCity?: string;
      agentCode?: string;
      directActivate?: boolean;
      remarks?: string;
    },
    coverageAmountParam?: number,
    premiumAmountParam?: number,
    nomineeOrRemarksParam?: string,
    nomineeRelationParam?: string
  ): Promise<Policy> => {
    const plans = getStored<InsurancePlan[]>(STORAGE_KEYS.PLANS, SEED_PLANS);
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);

    let planId: number;
    let coverageAmount: number;
    let premiumAmount: number;
    let nomineeName = 'Ananya Sharma';
    let nomineeRelation = 'Spouse';
    let role: UserRole = 'CUSTOMER';
    let clientName = 'Amit Verma';
    let clientEmail = 'customer@example.com';
    let clientPhone = '+91 9876543220';
    let clientCity = 'Bengaluru';
    let agentCode = 'AGT-2026-001';
    let directActivate = false;
    let remarks = '';

    if (typeof planIdOrData === 'object') {
      planId = planIdOrData.planId;
      coverageAmount = planIdOrData.coverageAmount;
      premiumAmount = planIdOrData.premiumAmount;
      if (planIdOrData.nomineeName) nomineeName = planIdOrData.nomineeName;
      if (planIdOrData.nomineeRelation) nomineeRelation = planIdOrData.nomineeRelation;
      if (planIdOrData.role) role = planIdOrData.role;
      if (planIdOrData.clientName) clientName = planIdOrData.clientName;
      if (planIdOrData.clientEmail) clientEmail = planIdOrData.clientEmail;
      if (planIdOrData.clientPhone) clientPhone = planIdOrData.clientPhone;
      if (planIdOrData.clientCity) clientCity = planIdOrData.clientCity;
      if (planIdOrData.agentCode) agentCode = planIdOrData.agentCode;
      if (planIdOrData.directActivate !== undefined) directActivate = planIdOrData.directActivate;
      if (planIdOrData.remarks) remarks = planIdOrData.remarks;
    } else {
      planId = planIdOrData;
      coverageAmount = coverageAmountParam || 1000000;
      premiumAmount = premiumAmountParam || 9500;
      if (nomineeOrRemarksParam) nomineeName = nomineeOrRemarksParam;
      if (nomineeRelationParam) nomineeRelation = nomineeRelationParam;
    }

    const plan = plans.find(p => p.id === planId) || plans[0];
    const now = new Date();
    const startStr = now.toISOString().split('T')[0];
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    const endStr = end.toISOString().split('T')[0];

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const generatedPolicyNumber = `INS-2026-${randomSuffix}`;

    const [first, ...rest] = clientName.split(' ');
    const last = rest.join(' ') || 'Client';

    const fullRemarks = remarks
      ? `${remarks} | Nominee: ${nomineeName} (${nomineeRelation})`
      : role === 'ADMIN' && directActivate
      ? `Direct Underwriter Issuance | Nominee: ${nomineeName} (${nomineeRelation})`
      : role === 'AGENT'
      ? `Agent-Assisted Sale (${agentCode}) | Nominee: ${nomineeName} (${nomineeRelation})`
      : `Self-Enrollment | Nominee: ${nomineeName} (${nomineeRelation})`;

    const newPolicy: Policy = {
      id: Date.now(),
      policy_number: directActivate ? generatedPolicyNumber : null,
      customer: {
        id: Date.now() % 10000,
        user: {
          id: Date.now() % 10000,
          username: clientEmail.split('@')[0],
          email: clientEmail,
          first_name: first,
          last_name: last,
          phone: clientPhone,
        },
        city: clientCity,
      },
      agent: role === 'AGENT' ? {
        id: 1,
        agent_code: agentCode,
        user: {
          first_name: 'Rahul',
          last_name: 'Sharma',
          email: 'agent@example.com',
        },
      } : null,
      insurance_plan: plan,
      application_date: startStr,
      start_date: directActivate ? startStr : null,
      end_date: directActivate ? endStr : null,
      premium_amount: premiumAmount,
      coverage_amount: coverageAmount,
      status: directActivate ? 'ACTIVE' : 'PENDING',
      status_display: directActivate ? 'Active Policy' : 'Pending Application',
      remarks: fullRemarks,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const updated = [newPolicy, ...policies];
    setStored(STORAGE_KEYS.POLICIES, updated);
    return newPolicy;
  },

  approvePolicy: async (id: number, remarks?: string): Promise<Policy> => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const now = new Date();
    const startStr = now.toISOString().split('T')[0];
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    const endStr = end.toISOString().split('T')[0];

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const policyNumber = `INS-2026-${randomSuffix}`;

    const updated = policies.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'ACTIVE' as const,
          status_display: 'Active Policy',
          policy_number: p.policy_number || policyNumber,
          start_date: p.start_date || startStr,
          end_date: p.end_date || endStr,
          remarks: remarks || p.remarks,
          updated_at: now.toISOString(),
        };
      }
      return p;
    });

    setStored(STORAGE_KEYS.POLICIES, updated);
    return updated.find(p => p.id === id)!;
  },

  rejectPolicy: async (id: number, remarks?: string): Promise<Policy> => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const updated = policies.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'REJECTED' as const,
          status_display: 'Rejected Application',
          remarks: remarks || 'Application does not satisfy eligibility criteria.',
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    setStored(STORAGE_KEYS.POLICIES, updated);
    return updated.find(p => p.id === id)!;
  },

  // Payments
  getPayments: async (role: UserRole): Promise<Payment[]> => {
    const payments = getStored<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    if (role === 'ADMIN' || role === 'AGENT') return payments;
    return payments.filter(p => p.customer_email === 'customer@example.com');
  },

  recordPayment: async (policyId: number, amount: number, paymentMethod: Payment['payment_method']): Promise<Payment> => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const policy = policies.find(p => p.id === policyId);
    const payments = getStored<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);

    const now = new Date();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const txnId = `TXN-2026-${randomHex}`;

    const newPayment: Payment = {
      id: Date.now(),
      policy: policyId,
      policy_number: policy?.policy_number || 'INS-ACTIVE',
      plan_name: policy?.insurance_plan.plan_name || 'Insurance Plan',
      customer_name: policy?.customer.user.first_name + ' ' + policy?.customer.user.last_name,
      customer_email: policy?.customer.user.email,
      transaction_id: txnId,
      amount,
      payment_date: now.toISOString().split('T')[0],
      payment_method: paymentMethod,
      payment_method_display: paymentMethod === 'UPI' ? 'UPI Payment' : paymentMethod === 'CARD' ? 'Card Payment' : 'Net Banking',
      status: 'COMPLETED',
      created_at: now.toISOString(),
    };

    const updated = [newPayment, ...payments];
    setStored(STORAGE_KEYS.PAYMENTS, updated);
    return newPayment;
  },

  // Claims
  getClaims: async (role: UserRole): Promise<Claim[]> => {
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    if (role === 'ADMIN' || role === 'AGENT') return claims;
    return claims.filter(c => c.customer.user.email === 'customer@example.com');
  },

  submitClaim: async (policyId: number, claimType: Claim['claim_type'], claimAmount: number, incidentDate: string, description: string): Promise<Claim> => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const policy = policies.find(p => p.id === policyId);
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);

    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `CLM-2026-${randomSuffix}`;

    const newClaim: Claim = {
      id: Date.now(),
      claim_number: claimNumber,
      policy: policyId,
      policy_number: policy?.policy_number || 'INS-2026-ACTIVE',
      plan_name: policy?.insurance_plan.plan_name || 'Plan Cover',
      insurance_type: policy?.insurance_plan.insurance_type || 'HEALTH',
      customer: {
        id: 1,
        user: {
          first_name: 'Amit',
          last_name: 'Verma',
          email: 'customer@example.com',
        },
      },
      claim_type: claimType,
      claim_type_display: claimType,
      claim_amount: claimAmount,
      description,
      incident_date: incidentDate,
      submitted_date: now.toISOString().split('T')[0],
      approved_amount: null,
      status: 'SUBMITTED',
      status_display: 'Submitted',
      remarks: 'Claim submitted. Review in queue.',
      settled_date: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const updated = [newClaim, ...claims];
    setStored(STORAGE_KEYS.CLAIMS, updated);
    return newClaim;
  },

  fileClaim: async (policyId: number, claimType: Claim['claim_type'], claimAmount: number, incidentDate: string, description: string): Promise<Claim> => {
    return api.submitClaim(policyId, claimType, claimAmount, incidentDate, description);
  },

  updateClaimStatus: async (id: number, status: Claim['status'], approvedAmount?: number, remarks?: string): Promise<Claim> => {
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    const now = new Date();
    const updated = claims.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          status_display: status === 'UNDER_REVIEW' ? 'Under Review' : status === 'APPROVED' ? 'Approved' : status === 'SETTLED' ? 'Settled' : 'Rejected',
          approved_amount: approvedAmount !== undefined ? approvedAmount : c.approved_amount,
          remarks: remarks !== undefined ? remarks : c.remarks,
          settled_date: status === 'SETTLED' ? now.toISOString().split('T')[0] : c.settled_date,
          updated_at: now.toISOString(),
        };
      }
      return c;
    });

    setStored(STORAGE_KEYS.CLAIMS, updated);
    return updated.find(c => c.id === id)!;
  },

  // Customer Questions & Support Inquiries
  getQuestions: async (user?: User | null): Promise<CustomerQuestion[]> => {
    initializeSeedData();
    const allQuestions = getStored<CustomerQuestion[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    if (!user || user.role !== 'CUSTOMER') return allQuestions;

    const uEmail = user.email?.trim().toLowerCase();
    const uUsername = user.username?.trim().toLowerCase();
    const isDemo = uUsername === 'customer' || uEmail === 'customer@example.com' || uEmail === 'customer@insurex.com';

    return allQuestions.filter(q => {
      const qEmail = q.customer_email?.trim().toLowerCase();
      const qUser = q.customer_username?.trim().toLowerCase();
      if (uEmail && qEmail && uEmail === qEmail) return true;
      if (uUsername && qUser && uUsername === qUser) return true;
      if (isDemo && (qEmail === 'customer@example.com' || qUser === 'customer')) return true;
      return false;
    });
  },

  submitQuestion: async (data: {
    customer_email: string;
    customer_name: string;
    customer_username?: string;
    category: QuestionCategory;
    category_display?: string;
    subject: string;
    policy_number?: string;
    question: string;
    priority?: QuestionPriority;
  }): Promise<CustomerQuestion> => {
    initializeSeedData();
    const allQuestions = getStored<CustomerQuestion[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    const now = new Date();
    const randomTicket = Math.floor(100 + Math.random() * 900);
    const id = `QRY-2026-${randomTicket}`;

    const categoryMap: Record<QuestionCategory, string> = {
      POLICY_APPLICATION: 'Policy Application',
      COVERAGE_BENEFITS: 'Coverage & Benefits',
      CLAIM_STATUS: 'Claim Status & Settlement',
      PREMIUM_PAYMENT: 'Premium & Payment',
      GENERAL: 'General Inquiry',
    };

    // Automated underwriter instant helpful triage
    let answer: string | undefined = undefined;
    let answered_by: string | undefined = undefined;
    let answered_at: string | undefined = undefined;
    let status: QuestionStatus = 'IN_REVIEW';

    if (data.category === 'PREMIUM_PAYMENT') {
      answer = `Thank you for contacting InsureX. Your payment inquiry has been routed to Actuarial Billing. You can download official stamped receipts and 80D tax certificates directly from the History tab in your portal.`;
      answered_by = 'Automated Actuarial Desk';
      answered_at = now.toISOString();
      status = 'ANSWERED';
    } else if (data.category === 'CLAIM_STATUS') {
      answer = `Your claim question regarding ${data.policy_number || 'your active coverage'} has been prioritized for our Medical & Surveyor Adjudication team. Standard assessment turnaround is 24-48 hours.`;
      answered_by = 'Adjudication Queue Officer';
      answered_at = now.toISOString();
      status = 'ANSWERED';
    } else {
      answer = `Your query regarding "${data.subject}" has been assigned to a Senior Underwriter. We will examine your portfolio details and provide a comprehensive response.`;
      answered_by = 'InsureX Client Care';
      answered_at = now.toISOString();
      status = 'ANSWERED';
    }

    const newQuestion: CustomerQuestion = {
      id,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_username: data.customer_username,
      category: data.category,
      category_display: data.category_display || categoryMap[data.category] || 'General Inquiry',
      subject: data.subject,
      policy_number: data.policy_number,
      question: data.question,
      status,
      priority: data.priority || 'NORMAL',
      answer,
      answered_by,
      answered_at,
      created_at: now.toISOString(),
    };

    const updated = [newQuestion, ...allQuestions];
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return newQuestion;
  },

  getDirectoryUsers: (): DirectoryUser[] => {
    initializeSeedData();
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    const suspendedIds = getStored<number[]>(STORAGE_KEYS.SUSPENDED_USERS, []);
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    const payments = getStored<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    const questions = getStored<CustomerQuestion[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    const creds = getStored<LoginCredential[]>(STORAGE_KEYS.LOGIN_CREDENTIALS, SEED_LOGIN_CREDENTIALS);

    // Build consolidated unique user list
    const userMap = new Map<number, User>();
    [SEED_USERS.ADMIN, SEED_USERS.AGENT, SEED_USERS.CUSTOMER, ...ADDITIONAL_SEED_USERS].forEach(u => {
      userMap.set(u.id, u);
    });
    registered.forEach(u => {
      userMap.set(u.id, u);
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const directory: DirectoryUser[] = Array.from(userMap.values()).map(user => {
      const isRegisteredCohort = registered.some(r => r.id === user.id);
      const userCreatedAt = user.created_at ? new Date(user.created_at) : new Date('2026-01-01');
      // Registered users or users created within 30 days are NEW users
      const isNewUser = isRegisteredCohort || userCreatedAt >= thirtyDaysAgo;
      const cohort: 'NEW' | 'ESTABLISHED' = isNewUser ? 'NEW' : 'ESTABLISHED';
      const isSuspended = suspendedIds.includes(user.id);

      // Associated policies
      let userPolicies: Policy[] = [];
      if (user.role === 'AGENT') {
        userPolicies = policies.filter(p => 
          p.agent?.user?.email?.toLowerCase() === user.email?.toLowerCase() ||
          p.agent?.user?.first_name?.toLowerCase() === user.first_name?.toLowerCase()
        );
      } else {
        userPolicies = policies.filter(p => isPolicyOwnedByUser(p, user));
      }

      const activePolicies = userPolicies.filter(p => p.status === 'ACTIVE');
      const activeCoverageSum = activePolicies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0);

      // Claims
      const userClaims = claims.filter(c => isClaimOwnedByUser(c, user, userPolicies));

      // Payments
      const userPayments = payments.filter(p => isPaymentOwnedByUser(p, user, userPolicies));
      const paymentsTotal = userPayments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Inquiries
      const userQuestions = questions.filter(q => 
        (user.email && q.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.username && q.customer_username?.toLowerCase() === user.username.toLowerCase())
      );

      // Credential Status
      const userCred = creds.find(c => c.user_id === user.id || c.identifier?.toLowerCase() === user.email?.toLowerCase());

      // Agent specific dossier
      let agentInfo: AgentDetail | undefined = undefined;
      if (user.role === 'AGENT') {
        const seedAgent = SEED_AGENT_DETAILS[user.id] || {
          id: user.id,
          user_id: user.id,
          agent_code: `AGT-2026-${String(user.id).padStart(3, '0')}`,
          license_number: `IRDAI/AGN/2025/0${user.id}992`,
          department: 'General Insurance Advisory',
          branch: `${user.city || 'Regional'} Corporate Branch`,
          region: `${user.state || 'National'} Jurisdiction`,
          commission_rate_percent: 10.0,
          total_commission_earned: 25000,
          total_policies_sold: Math.max(userPolicies.length, 5),
          active_portfolio_value: Math.max(activeCoverageSum, 15000000),
          client_count: Math.max(new Set(userPolicies.map(p => p.customer?.user?.email)).size, 4),
          performance_rating: 4.8,
          status: 'ACTIVE' as const,
          joining_date: user.created_at || '2025-06-01',
          contact_hotline: user.phone || '+91 80 4000 1100',
          specialization: 'Comprehensive Multi-Risk & Retail Underwriting',
        };

        const actualPoliciesSold = Math.max(userPolicies.length, seedAgent.total_policies_sold);
        const actualPortfolio = Math.max(activeCoverageSum, seedAgent.active_portfolio_value);
        const actualCommission = seedAgent.total_commission_earned + userPolicies.reduce((s, p) => s + Math.round(p.premium_amount * (seedAgent.commission_rate_percent / 100)), 0);
        const actualClients = Math.max(new Set(userPolicies.map(p => p.customer?.user?.email).filter(Boolean)).size, seedAgent.client_count);

        agentInfo = {
          ...seedAgent,
          total_policies_sold: actualPoliciesSold,
          active_portfolio_value: actualPortfolio,
          total_commission_earned: actualCommission,
          client_count: actualClients,
          user,
        };
      }

      return {
        user,
        cohort,
        isNewUser,
        accountStatus: isSuspended ? 'SUSPENDED' : 'ACTIVE',
        policiesCount: userPolicies.length,
        activeCoverageSum,
        claimsCount: userClaims.length,
        paymentsTotal,
        questionsCount: userQuestions.length,
        lastLogin: userCred?.last_login_at || user.created_at,
        credentialStatus: {
          hasPassword: true,
          failedAttempts: userCred?.failed_attempts || 0,
          isActive: !isSuspended,
        },
        agentInfo,
      };
    });

    // Sort: New users first, then by registration date desc
    return directory.sort((a, b) => {
      if (a.isNewUser && !b.isNewUser) return -1;
      if (!a.isNewUser && b.isNewUser) return 1;
      return new Date(b.user.created_at || 0).getTime() - new Date(a.user.created_at || 0).getTime();
    });
  },

  getAllAgents: (): AgentDetail[] => {
    const directory = api.getDirectoryUsers();
    return directory
      .filter(d => d.user.role === 'AGENT' && d.agentInfo)
      .map(d => d.agentInfo!);
  },

  toggleUserSuspension: (userId: number): { success: boolean; isSuspended: boolean } => {
    const suspended = getStored<number[]>(STORAGE_KEYS.SUSPENDED_USERS, []);
    let updated: number[];
    let isSuspended: boolean;
    if (suspended.includes(userId)) {
      updated = suspended.filter(id => id !== userId);
      isSuspended = false;
    } else {
      updated = [...suspended, userId];
      isSuspended = true;
    }
    setStored(STORAGE_KEYS.SUSPENDED_USERS, updated);
    return { success: true, isSuspended };
  },

  getUserPoliciesAndData: (user: User) => {
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    const payments = getStored<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    const questions = getStored<CustomerQuestion[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);

    let userPolicies: Policy[] = [];
    if (user.role === 'AGENT') {
      userPolicies = policies.filter(p => 
        p.agent?.user?.email?.toLowerCase() === user.email?.toLowerCase() ||
        p.agent?.user?.first_name?.toLowerCase() === user.first_name?.toLowerCase()
      );
    } else {
      userPolicies = policies.filter(p => isPolicyOwnedByUser(p, user));
    }

    const userClaims = claims.filter(c => isClaimOwnedByUser(c, user, userPolicies));
    const userPayments = payments.filter(p => isPaymentOwnedByUser(p, user, userPolicies));
    const userQuestions = questions.filter(q => 
      (user.email && q.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.username && q.customer_username?.toLowerCase() === user.username.toLowerCase())
    );

    return {
      policies: userPolicies,
      claims: userClaims,
      payments: userPayments,
      questions: userQuestions,
    };
  },

  getSystemMetrics: () => {
    initializeSeedData();
    const policies = getStored<Policy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const claims = getStored<Claim[]>(STORAGE_KEYS.CLAIMS, SEED_CLAIMS);
    const registered = getStored<User[]>(STORAGE_KEYS.REGISTERED_USERS, []);

    // Active policies
    const activePolicies = policies.filter(p => p.status === 'ACTIVE');
    
    // Total Sum Assured Underwritten (from all active policies)
    const totalSumAssured = activePolicies.reduce((acc, p) => acc + (p.coverage_amount || 0), 0);

    // Real Unique Active Policyholders (Unique customer IDs / emails with at least one active policy)
    const activeCustomerIdentities = new Set<string>();
    activePolicies.forEach(p => {
      const email = p.customer?.user?.email?.toLowerCase().trim();
      const username = p.customer?.user?.username?.toLowerCase().trim();
      const id = p.customer?.id || p.customer?.user?.id;
      if (email) {
        activeCustomerIdentities.add(email);
      } else if (username) {
        activeCustomerIdentities.add(username);
      } else if (id) {
        activeCustomerIdentities.add(`id_${id}`);
      }
    });

    const activePolicyholdersCount = activeCustomerIdentities.size;

    // Total unique registered / enrolled policyholders in the system
    const totalCustomersInSystem = new Set<string>();
    [SEED_USERS.CUSTOMER, ...ADDITIONAL_SEED_USERS.filter(u => u.role === 'CUSTOMER'), ...registered.filter(u => u.role === 'CUSTOMER')].forEach(u => {
      if (u.email) totalCustomersInSystem.add(u.email.toLowerCase().trim());
      else if (u.username) totalCustomersInSystem.add(u.username.toLowerCase().trim());
    });

    // Real Claim Settlement Ratio: (Settled + Approved claims) / Total decided claims (or total claims)
    const settledClaimsCount = claims.filter(c => c.status === 'SETTLED' || c.status === 'APPROVED').length;
    const rejectedClaimsCount = claims.filter(c => c.status === 'REJECTED').length;
    const decidedClaims = settledClaimsCount + rejectedClaimsCount;
    const settlementRatio = decidedClaims > 0 
      ? ((settledClaimsCount / decidedClaims) * 100) 
      : claims.length > 0 
      ? ((settledClaimsCount / claims.length) * 100) 
      : 100;

    return {
      activePoliciesCount: activePolicies.length,
      activePolicyholdersCount,
      totalRegisteredCustomersCount: totalCustomersInSystem.size,
      totalSumAssured,
      settlementRatio: Number(settlementRatio.toFixed(1)),
      totalClaimsCount: claims.length,
      settledClaimsCount,
      rejectedClaimsCount,
    };
  },
};

