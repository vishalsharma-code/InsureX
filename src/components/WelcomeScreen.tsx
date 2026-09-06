import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Briefcase, 
  User, 
  Users, 
  ArrowRight, 
  Zap, 
  Calculator, 
  CheckCircle2, 
  Award, 
  Building2, 
  ChevronRight, 
  Lock, 
  Sparkles, 
  HeartHandshake, 
  Car, 
  Plane, 
  Home, 
  Heart,
  FileCheck,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import { InsurancePlan, User as AuthUser, UserRole } from '../types';
import { api } from '../api';
import { CalculatorModal } from './CalculatorModal';

interface WelcomeScreenProps {
  onEnterPortal: (role?: 'ADMIN' | 'AGENT' | 'CUSTOMER', customerMode?: 'SIGNUP' | 'LOGIN') => void;
  onQuickLogin: (role: UserRole) => void;
  plans?: InsurancePlan[];
  currentUser?: AuthUser | null;
  onReturnToDashboard?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterPortal,
  onQuickLogin,
  plans = [],
  currentUser,
  onReturnToDashboard,
}) => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [selectedPlanForCalc, setSelectedPlanForCalc] = useState<InsurancePlan | null>(null);

  // Available plans fallback
  const displayPlans = plans.length > 0 ? plans : api.getInitialData().plans;

  // Live real system metrics calculated from the operational database
  const [metrics, setMetrics] = useState(() => api.getSystemMetrics());

  useEffect(() => {
    // Refresh metrics on mount or when returning to screen
    setMetrics(api.getSystemMetrics());
  }, []);

  const formatSumAssured = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleOpenCalcForPlan = (plan: InsurancePlan) => {
    setSelectedPlanForCalc(plan);
    setIsCalcOpen(true);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'HEALTH':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'LIFE':
        return <HeartHandshake className="w-5 h-5 text-purple-600" />;
      case 'VEHICLE':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'TRAVEL':
        return <Plane className="w-5 h-5 text-amber-600" />;
      case 'PROPERTY':
        return <Home className="w-5 h-5 text-emerald-600" />;
      default:
        return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Ambience Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-purple-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white flex items-center justify-center font-black text-xl border border-white/30">
              X
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                Insure<span className="text-blue-600">X</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block -mt-0.5">
                Insurance Management System
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('portals-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
            >
              Access Portals
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
            >
              Insurance Products
            </button>
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Premium Calculator</span>
            </button>
          </nav>

          {/* Right Action Portals */}
          <div className="flex items-center gap-2.5">
            {currentUser && onReturnToDashboard ? (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEnterPortal('ADMIN')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all cursor-pointer"
                  title="Administrator Terminal"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEnterPortal('AGENT')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
                  title="Certified Agent Desk"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEnterPortal('CUSTOMER', 'LOGIN')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Compliance Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-blue-200 shadow-sm rounded-full text-xs font-bold text-slate-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-blue-700 font-extrabold uppercase tracking-wide text-[11px]">IRDAI Compliant</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Enterprise Underwriting & Policy Governance</span>
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Insurance Management
            </span> & Underwriting Platform
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            A unified digital ecosystem for <strong className="text-slate-800 font-semibold">Policyholders</strong>, <strong className="text-slate-800 font-semibold">Certified Agency Brokers</strong>, and <strong className="text-slate-800 font-semibold">Executive Underwriters</strong>. Streamline policy issuance, actuarial pricing, and paperless claim adjudication.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onEnterPortal('CUSTOMER', 'LOGIN')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Sign In / Access Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onEnterPortal('CUSTOMER', 'SIGNUP')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Create Policyholder Account</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-slate-600" />
              <span>Estimate Premium</span>
            </button>
          </div>

          {/* Evaluator 1-Click Fast Sandbox Access Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500 flex items-center gap-1.5 mr-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Evaluator Demo:</span>
            </span>
            <button
              type="button"
              onClick={() => onQuickLogin('ADMIN')}
              className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 transition-all cursor-pointer"
            >
              ⚡ 1-Click Admin
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin('AGENT')}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-all cursor-pointer"
            >
              ⚡ 1-Click Agent
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin('CUSTOMER')}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-all cursor-pointer"
            >
              ⚡ 1-Click Customer
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KEY TRUST METRICS STRIP (LIVE REAL-TIME DATABASE VALUES)                  */}
      {/* ========================================================================= */}
      <section className="bg-white/80 border-y border-slate-200/80 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatSumAssured(metrics.totalSumAssured)}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Sum Assured Underwritten
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Across {metrics.activePoliciesCount} Active Policies
              </span>
            </div>

            <div className="p-3 border-l border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {metrics.settlementRatio}%
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Claim Settlement Ratio
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {metrics.settledClaimsCount} Settled / {metrics.totalClaimsCount} Total Claims
              </span>
            </div>

            <div className="p-3 border-l border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
                {metrics.activePolicyholdersCount}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Active Policyholders
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Live Verified Customers
              </span>
            </div>

            <div className="p-3 border-l border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
                100%
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Digital & Paperless Ledger
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Zero Physical Paperwork
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3 DEDICATED ROLE PORTALS SECTION                                          */}
      {/* ========================================================================= */}
      <section id="portals-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Multi-Role Gateway
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Choose Your InsureX Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Tailored workspaces engineered specifically for each stakeholder in the insurance value chain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. Customer Portal Card */}
          <div className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:border-emerald-300 transition-all group">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer & Policyholder</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Self-Service</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Policyholder Portal
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Browse comprehensive coverage plans, enroll online instantly, track claim progress with live status, and pay premiums securely.
              </p>

              {/* Feature Points */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant policy application with custom sum assured sliders</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Digital policy certificates & printable premium receipts</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Paperless claim filing with incident surveyor tracker</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct underwriter Q&A ticket resolution desk</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => onEnterPortal('CUSTOMER', 'LOGIN')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as Customer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEnterPortal('CUSTOMER', 'SIGNUP')}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer text-center"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => onQuickLogin('CUSTOMER')}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
                  title="1-Click Demo Customer"
                >
                  ⚡ Demo
                </button>
              </div>
            </div>
          </div>

          {/* 2. Certified Agent Portal Card */}
          <div className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:border-blue-300 transition-all group">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Licensed Agency Network</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">IRDAI Certified</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Certified Agent Portal
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dedicated terminal for licensed brokers and agency partners to originate client policies, monitor commission disbursements, and manage renewals.
              </p>

              {/* Feature Points */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Rapid client enrollment & real-time proposal origination</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>12% commission tracking & direct bank settlement ledger</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Client portfolio renewal tracker & policyholder directory</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Official license verification (AGT-001 / Mumbai Central)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => onEnterPortal('AGENT')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Agent Portal (AGT-001)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onQuickLogin('AGENT')}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer text-center"
              >
                ⚡ 1-Click Agent Demo Login
              </button>
            </div>
          </div>

          {/* 3. Administrator Console Card */}
          <div className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:border-purple-300 transition-all group">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Executive Underwriting</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Level 4 Clearance</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Administrator Terminal
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Master oversight for underwriting risk review, global policy ledger auditing, claims adjudication desk, and 360° User & Agent Directory.
              </p>

              {/* Feature Points */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Central User Directory with deep dossier inspection & KYC</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>1-click policy approval, rejection, and coverage limits</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Claims adjudication desk with surveyor report validation</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Complete financial accounting & transaction voucher ledgers</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => onEnterPortal('ADMIN')}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onQuickLogin('ADMIN')}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-all cursor-pointer text-center"
              >
                ⚡ 1-Click Admin Demo Login
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* INSURANCE PRODUCTS SHOWCASE                                               */}
      {/* ========================================================================= */}
      <section id="products-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-100/70 rounded-3xl border border-slate-200/80 mb-16">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              Coverage Portfolio
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Active Underwriting Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore standardized insurance plans backed by dynamic actuarial rating models.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCalcOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Rating Calculator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayPlans.slice(0, 4).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {getPlanIcon(plan.insurance_type)}
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {plan.insurance_type}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">
                  {plan.plan_name}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Sum Assured</span>
                    <span className="font-bold text-slate-900">₹{(plan.coverage_amount / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Duration</span>
                    <span className="font-bold text-slate-700">{Math.round(plan.duration_months / 12)} Years</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Base Premium</span>
                    <span className="font-black text-blue-600">₹{plan.base_premium.toLocaleString('en-IN')}/yr</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCalcForPlan(plan)}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-500" />
                  <span>Estimate</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEnterPortal('CUSTOMER', 'LOGIN')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Apply for plan"
                >
                  <span>Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ENTERPRISE PILLARS & ACTUARIAL ARCHITECTURE                               */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
              Architecture & Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-3">
              Actuarial Intelligence Meets Transparent Policy Administration
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
              Built on mathematical risk loading models, our system computes dynamic age-weighted premiums, generates digital policy certificates, audits surveyor claim reports, and maintains immutable transaction ledgers for regulators.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Dynamic Actuarial Multiplier</h4>
                  <p className="text-xs text-slate-400 mt-1">Age-adjusted rating curves computed in real time for fair underwriting.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Adjudicated Claims Engine</h4>
                  <p className="text-xs text-slate-400 mt-1">Surveyor incident analysis with settlement voucher issuance.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onEnterPortal('ADMIN')}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Executive Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => onEnterPortal('CUSTOMER', 'SIGNUP')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enroll Online Today</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg text-white font-black text-xs flex items-center justify-center">
              X
            </div>
            <span className="font-bold text-slate-900">InsureX Management System</span>
            <span className="text-slate-300">|</span>
            <span>IRDAI Registration: 2026/INS-MGT/8841</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => onEnterPortal('ADMIN')}
              className="hover:text-purple-700 cursor-pointer"
            >
              Admin Terminal
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onEnterPortal('AGENT')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Agent Desk
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onEnterPortal('CUSTOMER', 'LOGIN')}
              className="hover:text-emerald-700 cursor-pointer"
            >
              Customer Portal
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="hover:text-blue-600 cursor-pointer"
            >
              Premium Calculator
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Operational Sandbox Active</span>
          </div>
        </div>
      </footer>

      {/* Calculator Modal if opened directly from Welcome Page */}
      {isCalcOpen && (
        <CalculatorModal
          plans={displayPlans}
          initialPlan={selectedPlanForCalc}
          onClose={() => setIsCalcOpen(false)}
          onApplyWithPremium={(plan, coverage, premium) => {
            setIsCalcOpen(false);
            onEnterPortal('CUSTOMER', 'LOGIN');
          }}
        />
      )}
    </div>
  );
};
