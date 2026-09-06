import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  FilePlus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Shield,
  HeartPulse,
  CreditCard,
  Sparkles,
  HelpCircle,
  Plus,
  Pencil,
  Camera,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { User, Policy, Claim } from '../types';
import { isPolicyOwnedByUser, isClaimOwnedByUser } from '../api';

interface DashboardViewProps {
  currentUser: User;
  policies: Policy[];
  claims: Claim[];
  onNavigate: (tab: string) => void;
  onApprovePolicy?: (id: number) => void;
  onRejectPolicy?: (id: number) => void;
  onEditProfile?: () => void;
}

const REVENUE_DATA = [
  { month: 'Apr', revenue: 42000, claims: 15000 },
  { month: 'May', revenue: 58000, claims: 22000 },
  { month: 'Jun', revenue: 71000, claims: 18000 },
  { month: 'Jul', revenue: 89000, claims: 34000 },
  { month: 'Aug', revenue: 105000, claims: 45000 },
  { month: 'Sep', revenue: 128000, claims: 42000 },
];

const TYPE_COLORS: Record<string, string> = {
  HEALTH: '#3b82f6',   // Blue
  LIFE: '#8b5cf6',     // Purple
  VEHICLE: '#0f172a',  // Slate 900
  TRAVEL: '#f97316',   // Orange
  PROPERTY: '#10b981', // Emerald
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  policies,
  claims,
  onNavigate,
  onApprovePolicy,
  onRejectPolicy,
  onEditProfile,
}) => {
  const isCustomer = currentUser.role === 'CUSTOMER';

  // -------------------------------------------------------------
  // CUSTOMER-SPECIFIC DATA & ANALYSIS
  // -------------------------------------------------------------
  const customerPolicies = policies.filter(p => isPolicyOwnedByUser(p, currentUser));
  const customerClaims = claims.filter(c => isClaimOwnedByUser(c, currentUser, customerPolicies));

  const customerActivePolicies = customerPolicies.filter(p => p.status === 'ACTIVE');
  const customerPendingPolicies = customerPolicies.filter(p => p.status === 'PENDING');
  const customerTotalSumAssured = customerActivePolicies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0);
  const customerTotalAnnualPremium = customerActivePolicies.reduce((sum, p) => sum + (p.premium_amount || 0), 0);
  const customerOpenClaims = customerClaims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');
  const customerSettledClaims = customerClaims.filter(c => c.status === 'SETTLED');

  // Customer Category Breakdown
  const customerCategoryTotals: Record<string, number> = {
    HEALTH: 0,
    LIFE: 0,
    VEHICLE: 0,
    TRAVEL: 0,
    PROPERTY: 0,
  };

  customerActivePolicies.forEach(p => {
    const type = p.insurance_plan?.insurance_type || 'HEALTH';
    customerCategoryTotals[type] = (customerCategoryTotals[type] || 0) + (p.coverage_amount || 0);
  });

  const customerPieData = Object.keys(customerCategoryTotals)
    .filter(k => customerCategoryTotals[k] > 0)
    .map(key => ({
      name: key,
      value: customerCategoryTotals[key],
      color: TYPE_COLORS[key] || '#3b82f6',
    }));

  // Fallback demo distribution if user has not yet applied or has 0 active policies
  const displayPieData = customerPieData.length > 0 
    ? customerPieData 
    : [
        { name: 'Target Health', value: 40, color: '#3b82f6' },
        { name: 'Target Life', value: 35, color: '#8b5cf6' },
        { name: 'Target Motor', value: 25, color: '#0f172a' },
      ];

  // Personalized Protection Timeline for this customer
  const customerProtectionTimeline = [
    { 
      month: 'Apr', 
      coverage: customerTotalSumAssured > 0 ? Math.round(customerTotalSumAssured * 0.8) : 0, 
      premiumPaid: Math.round(customerTotalAnnualPremium * 0.5) 
    },
    { 
      month: 'May', 
      coverage: customerTotalSumAssured > 0 ? Math.round(customerTotalSumAssured * 0.8) : 0, 
      premiumPaid: Math.round(customerTotalAnnualPremium * 0.6) 
    },
    { 
      month: 'Jun', 
      coverage: customerTotalSumAssured > 0 ? Math.round(customerTotalSumAssured * 0.9) : 0, 
      premiumPaid: Math.round(customerTotalAnnualPremium * 0.75) 
    },
    { 
      month: 'Jul', 
      coverage: customerTotalSumAssured, 
      premiumPaid: Math.round(customerTotalAnnualPremium * 0.9) 
    },
    { 
      month: 'Aug', 
      coverage: customerTotalSumAssured, 
      premiumPaid: customerTotalAnnualPremium 
    },
    { 
      month: 'Sep', 
      coverage: customerTotalSumAssured, 
      premiumPaid: customerTotalAnnualPremium 
    },
  ];

  // Protection health index score
  const hasHealth = customerActivePolicies.some(p => p.insurance_plan?.insurance_type === 'HEALTH');
  const hasLife = customerActivePolicies.some(p => p.insurance_plan?.insurance_type === 'LIFE');
  const hasVehicle = customerActivePolicies.some(p => p.insurance_plan?.insurance_type === 'VEHICLE');
  let protectionScore = 0;
  if (hasHealth) protectionScore += 45;
  if (hasLife) protectionScore += 35;
  if (hasVehicle) protectionScore += 20;
  if (customerActivePolicies.length === 0 && customerPendingPolicies.length > 0) protectionScore = 25;

  // -------------------------------------------------------------
  // ADMIN & AGENT OVERVIEW METRICS
  // -------------------------------------------------------------
  const activeCount = policies.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = policies.filter(p => p.status === 'PENDING').length;
  const openClaimsCount = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const totalRevenueNumber = policies
    .filter(p => p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.premium_amount, 34200);

  // =============================================================
  // RENDER: CUSTOMER MY COVERAGE VAULT
  // =============================================================
  if (isCustomer) {
    return (
      <div className="space-y-8">
        {/* Welcome Banner for Customer */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl border border-white/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {currentUser.profile_picture ? (
                  <img
                    src={currentUser.profile_picture}
                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-500/25 bg-slate-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white flex items-center justify-center font-black text-2xl border-2 border-emerald-400 shadow-lg">
                    {currentUser.first_name ? currentUser.first_name[0].toUpperCase() : 'C'}
                  </div>
                )}
                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    title="Change Profile Photo & Details"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-md transition-all border border-slate-900"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Coverage Vault • Verified Member</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Welcome back, {currentUser.first_name}!
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5 max-w-xl leading-relaxed">
                  Here is your personal insurance portfolio, active policy certificates, claim settlement tracking, and risk analysis.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('apply_policy')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Policy</span>
              </button>
              <button
                onClick={() => onNavigate('ask_question')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ask Question</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Frosted Glass Stat Cards (Strictly for this logged-in Customer) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Active Coverage */}
          <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Total Active Cover
              </p>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
              {customerTotalSumAssured >= 10000000
                ? `₹${(customerTotalSumAssured / 10000000).toFixed(2)} Cr`
                : customerTotalSumAssured > 0
                ? `₹${(customerTotalSumAssured / 100000).toFixed(1)} Lakhs`
                : '₹0'}
            </h3>
            <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{customerActivePolicies.length} active policy certificates</span>
            </p>
          </div>

          {/* Annual Premium Outlay */}
          <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Annual Premium
              </p>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹{customerTotalAnnualPremium.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Eligible for Section 80D Tax Benefit
            </p>
          </div>

          {/* Open Claims */}
          <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                My Claims & Inquiries
              </p>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-orange-600">
              {customerOpenClaims.length}
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {customerSettledClaims.length} settled claims on record
            </p>
          </div>

          {/* Protection Health Index */}
          <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Protection Index
              </p>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-purple-700">
              {protectionScore}/100
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {protectionScore >= 70
                ? 'Strong Multi-Asset Cover'
                : protectionScore >= 40
                ? 'Moderate Protection'
                : 'Coverage Recommended'}
            </p>
          </div>
        </section>

        {/* Main Grid: Left My Policies Table & Right Coverage Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: My Active Policies */}
          <div className="lg:col-span-2 bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="p-6 border-b border-white/30 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  My Active Policies & Applications
                </h2>
                <p className="text-xs text-slate-500">
                  Showing policies strictly issued to {currentUser.first_name} {currentUser.last_name}
                </p>
              </div>
              <button
                onClick={() => onNavigate('apply_policy')}
                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>+ Apply for Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto p-2">
              {customerPolicies.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Your Coverage Vault is Empty
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    You do not have any active or pending insurance policies yet. Protect your health, life, vehicle, and family in minutes with digital issuance.
                  </p>
                  <button
                    onClick={() => onNavigate('apply_policy')}
                    className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Apply for Insurance Policy</span>
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-100/60 backdrop-blur-sm text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-xl">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Policy / Plan</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Sum Assured</th>
                      <th className="px-4 py-3 text-right">Premium</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/40">
                    {customerPolicies.map((p) => {
                      const type = p.insurance_plan?.insurance_type || 'HEALTH';
                      const isPending = p.status === 'PENDING';
                      const isApproved = p.status === 'ACTIVE';

                      return (
                        <tr key={p.id} className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900">
                              {p.insurance_plan?.plan_name}
                            </div>
                            <div className="text-xs font-mono text-slate-500">
                              {p.policy_number || `Application #${p.id}`}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide inline-block ${
                                type === 'HEALTH'
                                  ? 'bg-blue-100 text-blue-700'
                                  : type === 'LIFE'
                                  ? 'bg-purple-100 text-purple-700'
                                  : type === 'VEHICLE'
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {type}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right font-mono font-bold text-slate-800">
                            ₹{p.coverage_amount ? p.coverage_amount.toLocaleString() : '—'}
                          </td>

                          <td className="px-4 py-4 text-right font-mono text-slate-700">
                            ₹{p.premium_amount?.toLocaleString()}/yr
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                                isPending
                                  ? 'bg-orange-100 text-orange-700'
                                  : isApproved
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => onNavigate('history')}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right 1 Col: Customer's Coverage Distribution Analysis */}
          <div className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-900 mb-1">
                My Coverage Distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Personalized asset & health protection analysis
              </p>

              {/* Donut Chart visualization */}
              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [
                        customerTotalSumAssured > 0 
                          ? `₹${Number(value).toLocaleString()}` 
                          : `${value}% Target`, 
                        'Cover'
                      ]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Cover</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {customerTotalSumAssured > 0 
                      ? (customerTotalSumAssured >= 10000000 
                          ? `${(customerTotalSumAssured / 10000000).toFixed(1)} Cr` 
                          : `${(customerTotalSumAssured / 100000).toFixed(0)} L`)
                      : '0'}
                  </span>
                </div>
              </div>

              {/* Category Legend & Actual Totals */}
              <div className="space-y-2.5 mt-3">
                {Object.keys(customerCategoryTotals).map((cat) => {
                  const amount = customerCategoryTotals[cat];
                  const percentage = customerTotalSumAssured > 0 
                    ? Math.round((amount / customerTotalSumAssured) * 100) 
                    : 0;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: TYPE_COLORS[cat] }} 
                          />
                          {cat} Cover
                        </span>
                        <span className="font-mono">
                          {amount > 0 ? `₹${(amount / 100000).toFixed(1)}L (${percentage}%)` : 'Uninsured'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: TYPE_COLORS[cat] 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Insured Sum
                  </p>
                  <p className="text-lg font-black text-slate-900 font-mono">
                    ₹{customerTotalSumAssured.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('apply_policy')}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  Enhance Cover
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Protection & Premium Analysis in Visualization */}
        <section className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Personal Protection & Premium Growth Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Month-by-month analysis of {currentUser.first_name}&apos;s cumulative active cover vs premium investments (INR)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-700">Active Protection Sum</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Premium Outlay</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerProtectionTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${v}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any, name: string) => [`₹${Number(value).toLocaleString()}`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="coverage" 
                  name="Active Protection Sum"
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCover)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="premiumPaid" 
                  name="Premium Outlay"
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorPrem)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    );
  }

  // =============================================================
  // RENDER: ADMIN & AGENT OVERVIEW
  // =============================================================
  return (
    <div className="space-y-8">
      {/* Admin Quick Action Banner: User & Agent Directory */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">User & Agent Directory Oversight</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-900">
                  FULL ACCESS
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Inspect complete dossiers of new registered clients, established seed users, and licensed insurance agent portfolios.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('users')}
            className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <span>Open User Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Frosted Glass Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Total Premium Pool
            </p>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            ₹{(totalRevenueNumber / 1000).toFixed(1)}k
          </h3>
          <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% from last month</span>
          </p>
        </div>

        {/* Active Policies */}
        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Active Policies
            </p>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {activeCount + 1840}
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {pendingCount} pending verification
          </p>
        </div>

        {/* Open Claims */}
        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Open Claims
            </p>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-orange-600">
            {openClaimsCount}
          </h3>
          <p className="text-xs text-orange-600/90 mt-2 font-semibold">
            {openClaimsCount > 0 ? `${openClaimsCount} require underwriter review` : 'No urgent pending claims'}
          </p>
        </div>

        {/* New Applications */}
        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              New Applications
            </p>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FilePlus className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-blue-600">
            {pendingCount + 42}
          </h3>
          <p className="text-xs text-blue-600/90 mt-2 font-semibold">
            {pendingCount} pending your approval
          </p>
        </div>
      </section>

      {/* Main Grid: Left Table & Right Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Policy Applications */}
        <div className="lg:col-span-2 bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 border-b border-white/30 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Recent Policy Applications
              </h2>
              <p className="text-xs text-slate-500">
                Incoming underwriting requests and active coverage
              </p>
            </div>
            <button
              onClick={() => onNavigate('policies')}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left">
              <thead className="bg-slate-100/60 backdrop-blur-sm text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-xl">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Applicant</th>
                  <th className="px-4 py-3">Plan Type</th>
                  <th className="px-4 py-3 text-right">Premium</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/40">
                {policies.slice(0, 5).map((p) => {
                  const type = p.insurance_plan?.insurance_type || 'HEALTH';
                  const isPending = p.status === 'PENDING';
                  const isApproved = p.status === 'ACTIVE';

                  return (
                    <tr key={p.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {p.customer?.user?.first_name} {p.customer?.user?.last_name}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[180px]">
                          {p.customer?.user?.email}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide inline-block ${
                            type === 'HEALTH'
                              ? 'bg-blue-100 text-blue-700'
                              : type === 'LIFE'
                              ? 'bg-purple-100 text-purple-700'
                              : type === 'VEHICLE'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {p.insurance_plan?.plan_name?.split(' ')[0] || type}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-800">
                        ₹{p.premium_amount?.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                            isPending
                              ? 'bg-orange-100 text-orange-700'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {isPending && currentUser.role === 'ADMIN' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApprovePolicy && onApprovePolicy(p.id)}
                              title="Approve Policy"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectPolicy && onRejectPolicy(p.id)}
                              title="Reject Application"
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onNavigate('policies')}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Policies by Type */}
        <div className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900 mb-1">
              Policies by Type
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Portfolio distribution across categories
            </p>

            <div className="space-y-4">
              {/* Health */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Health Suraksha
                  </span>
                  <span>45%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%] rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Life */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Life Insurance
                  </span>
                  <span>28%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[28%] rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    Vehicle Motor
                  </span>
                  <span>18%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 w-[18%] rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Travel */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    Travel Shield
                  </span>
                  <span>9%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-[9%] rounded-full transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Managed Funds
                </p>
                <p className="text-xl font-extrabold text-slate-900">₹1.2 Cr</p>
              </div>
              <button
                onClick={() => onNavigate('plans')}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Browse Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Claims Monthly Trend with Recharts */}
      <section className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Financial Performance & Settlement Velocity
            </h2>
            <p className="text-xs text-slate-500">
              Monthly premium collections vs claim settlements (INR)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-700">Premium Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-slate-700">Claims Settled</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorClaim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Premium Revenue"
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
              <Area 
                type="monotone" 
                dataKey="claims" 
                name="Claims Settled"
                stroke="#f97316" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorClaim)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

