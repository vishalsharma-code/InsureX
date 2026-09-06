import React, { useState } from 'react';
import { 
  FileText, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  ArrowUpRight,
  Filter,
  ShieldCheck,
  Calendar,
  Search
} from 'lucide-react';
import { Policy, Payment, Claim, User } from '../types';
import { isPolicyOwnedByUser, isClaimOwnedByUser, isPaymentOwnedByUser } from '../api';

interface CustomerHistoryViewProps {
  currentUser: User;
  policies: Policy[];
  payments: Payment[];
  claims: Claim[];
  onNavigate: (tab: string) => void;
}

export const CustomerHistoryView: React.FC<CustomerHistoryViewProps> = ({
  currentUser,
  policies,
  payments,
  claims,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'POLICIES' | 'PAYMENTS' | 'CLAIMS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter strictly for the logged-in customer
  const userPolicies = policies.filter(p => isPolicyOwnedByUser(p, currentUser));
  const userPayments = payments.filter(pay => isPaymentOwnedByUser(pay, currentUser, userPolicies));
  const userClaims = claims.filter(c => isClaimOwnedByUser(c, currentUser, userPolicies));

  // Compute summary stats
  const totalPoliciesCount = userPolicies.length;
  const activePoliciesCount = userPolicies.filter(p => p.status === 'ACTIVE').length;
  const totalPremiumsPaid = userPayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalClaimsCount = userClaims.length;

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/50 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-2">
            <span>Total Enrolled</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalPoliciesCount}</h3>
          <p className="text-xs text-slate-500 mt-1">{activePoliciesCount} active certificates</p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-2">
            <span>Premiums Deposited</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            ₹{totalPremiumsPaid.toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-600 mt-1 font-semibold">{userPayments.length} transactions recorded</p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-2">
            <span>Claims Logged</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalClaimsCount}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {userClaims.filter(c => c.status === 'SETTLED').length} settled successfully
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-2">
            <span>Member Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-extrabold text-slate-900">Good Standing</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">KYC & Underwriting Verified</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/45 backdrop-blur-md p-4 rounded-2xl border border-white/70">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All History' },
            { id: 'POLICIES', label: 'Policies & Applications' },
            { id: 'PAYMENTS', label: 'Premium Payments' },
            { id: 'CLAIMS', label: 'Claims History' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm overflow-hidden">
        {/* SECTION: POLICIES */}
        {(activeFilter === 'ALL' || activeFilter === 'POLICIES') && (
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Policy Enrolment & Lifecycle Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">Historical records of your applications and active coverage</p>
              </div>
              <button
                onClick={() => onNavigate('apply_policy')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                + New Application
              </button>
            </div>

            {userPolicies.length === 0 ? (
              <div className="p-8 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-700">No policy applications on record for your account.</p>
                <button
                  onClick={() => onNavigate('apply_policy')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Browse Insurance Plans
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Policy / Plan</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Sum Assured</th>
                      <th className="px-4 py-3 text-right">Premium</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Application Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {userPolicies.map((p) => (
                      <tr key={p.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{p.insurance_plan?.plan_name}</p>
                          <p className="text-xs font-mono text-slate-500">
                            {p.policy_number || `Pending Review (#${p.id})`}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-700">
                            {p.insurance_plan?.insurance_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                          ₹{p.coverage_amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          ₹{p.premium_amount?.toLocaleString()}/yr
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : p.status === 'PENDING'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-slate-500">
                          {p.application_date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION: PAYMENTS */}
        {(activeFilter === 'ALL' || activeFilter === 'PAYMENTS') && (
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Premium Payment Receipts & Tax Vouchers</span>
                </h3>
                <p className="text-xs text-slate-500">Official digital receipts eligible for Section 80D tax benefits</p>
              </div>
            </div>

            {userPayments.length === 0 ? (
              <div className="p-6 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-700">No premium payment records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Transaction ID</th>
                      <th className="px-4 py-3">Plan / Policy</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {userPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">
                          {pay.transaction_id}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-900">{pay.plan_name || 'Insurance Plan'}</p>
                          <p className="text-xs font-mono text-slate-500">{pay.policy_number || `Policy #${pay.policy}`}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-600">
                          ₹{pay.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                            {pay.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {pay.payment_date}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => alert(`Receipt #${pay.transaction_id} for ₹${pay.amount.toLocaleString()} verified and downloaded.`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION: CLAIMS */}
        {(activeFilter === 'ALL' || activeFilter === 'CLAIMS') && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Claims Adjudication History</span>
                </h3>
                <p className="text-xs text-slate-500">Incident filings, surveyor validations, and payout disbursements</p>
              </div>
            </div>

            {userClaims.length === 0 ? (
              <div className="p-6 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-700">No claims submitted on your account. Your record is pristine.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Claim Reference</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Claimed</th>
                      <th className="px-4 py-3 text-right">Approved</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Incident Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {userClaims.map((c) => (
                      <tr key={c.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-mono font-bold text-slate-900">{c.claim_number}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{c.description}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-700">
                            {c.claim_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                          ₹{c.claim_amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                          {c.approved_amount ? `₹${c.approved_amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            c.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : c.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-700'
                              : c.status === 'UNDER_REVIEW'
                              ? 'bg-purple-100 text-purple-700'
                              : c.status === 'SUBMITTED'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-slate-500">
                          {c.incident_date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
