import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Zap, 
  BadgePercent, 
  UserCheck, 
  Briefcase, 
  Building2, 
  AlertCircle, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { InsurancePlan, Customer, User as AuthUser, UserRole } from '../types';

interface ApplyModalProps {
  plan: InsurancePlan;
  coverageAmount: number;
  premiumAmount: number;
  customer: Customer;
  currentUser: AuthUser;
  onSubmit: (data: {
    planId: number;
    coverageAmount: number;
    premiumAmount: number;
    nomineeName: string;
    nomineeRelation: string;
    role: UserRole;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCity?: string;
    agentCode?: string;
    directActivate?: boolean;
    remarks?: string;
  }) => void;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  plan,
  coverageAmount,
  premiumAmount,
  customer,
  currentUser,
  onSubmit,
  onClose,
}) => {
  const role = currentUser.role;

  // Common state
  const [nomineeName, setNomineeName] = useState('Ananya Sharma');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Agent state
  const [agentClientName, setAgentClientName] = useState('Neha Patel');
  const [agentClientEmail, setAgentClientEmail] = useState('neha.patel@gmail.com');
  const [agentClientPhone, setAgentClientPhone] = useState('+91 98234 56789');
  const [agentClientCity, setAgentClientCity] = useState('Mumbai');
  const [agentVerifiedKyc, setAgentVerifiedKyc] = useState(true);

  // Admin state
  const [adminDirectActivate, setAdminDirectActivate] = useState(true);
  const [adminClientName, setAdminClientName] = useState('Vikramaditya Rao');
  const [adminClientEmail, setAdminClientEmail] = useState('v.rao@enterprises.in');
  const [adminClientCity, setAdminClientCity] = useState('Bengaluru');
  const [adminAdjustedPremium, setAdminAdjustedPremium] = useState<number>(premiumAmount);
  const [adminRemarks, setAdminRemarks] = useState('Executive underwriter review complete. Risk assessed within standard tier.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'CUSTOMER') {
      if (!agreeTerms) return;
      onSubmit({
        planId: plan.id,
        coverageAmount,
        premiumAmount,
        nomineeName,
        nomineeRelation,
        role: 'CUSTOMER',
        clientName: `${customer.user.first_name} ${customer.user.last_name}`,
        clientEmail: customer.user.email,
        clientPhone: customer.phone,
        clientCity: customer.city,
        directActivate: false,
        remarks: 'Self-enrollment submitted via Customer Portal',
      });
    } else if (role === 'AGENT') {
      if (!agentVerifiedKyc) return;
      onSubmit({
        planId: plan.id,
        coverageAmount,
        premiumAmount,
        nomineeName,
        nomineeRelation,
        role: 'AGENT',
        clientName: agentClientName,
        clientEmail: agentClientEmail,
        clientPhone: agentClientPhone,
        clientCity: agentClientCity,
        agentCode: 'AGT-2026-001',
        directActivate: false,
        remarks: `Agent Assisted Sale by Rahul Sharma (AGT-2026-001) | Client: ${agentClientName}`,
      });
    } else if (role === 'ADMIN') {
      onSubmit({
        planId: plan.id,
        coverageAmount,
        premiumAmount: Number(adminAdjustedPremium),
        nomineeName,
        nomineeRelation,
        role: 'ADMIN',
        clientName: adminClientName,
        clientEmail: adminClientEmail,
        clientCity: adminClientCity,
        directActivate: adminDirectActivate,
        remarks: adminRemarks,
      });
    }
  };

  const estimatedCommission = Math.round(premiumAmount * 0.10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header with Role Badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {role === 'ADMIN' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Master Underwriting Console</span>
              </span>
            )}
            {role === 'AGENT' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Agent Assisted Sale (Code: AGT-2026-001)</span>
              </span>
            )}
            {role === 'CUSTOMER' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Self-Service Portal</span>
              </span>
            )}

            <h3 className="text-xl font-black text-slate-900 mt-2">
              {role === 'ADMIN' && 'Underwriter Policy Issuance & Entry'}
              {role === 'AGENT' && `Client Enrollment: ${plan.plan_name}`}
              {role === 'CUSTOMER' && `Apply for ${plan.plan_name}`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {role === 'ADMIN' && 'Direct back-office underwriting entry with immediate activation authority.'}
              {role === 'AGENT' && 'Enroll a walk-in client on their behalf with agency commission attribution.'}
              {role === 'CUSTOMER' && 'Personal policy purchase routed to underwriters for document validation.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Plan Summary Badge */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-5 text-xs">
          <div>
            <p className="text-slate-400 font-semibold uppercase">Coverage Tier</p>
            <p className="text-sm font-bold text-slate-900 font-mono">
              ₹{coverageAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase">Standard Premium</p>
            <p className="text-sm font-bold text-blue-600 font-mono">
              ₹{premiumAmount.toLocaleString()}/yr
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ================= CUSTOMER VIEW ================= */}
          {role === 'CUSTOMER' && (
            <>
              {/* Locked Personal Details */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Primary Insured (Logged-in Account)</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-white/70 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked Identity</span>
                  </span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="font-semibold text-sm text-slate-900">
                    {customer.user.first_name} {customer.user.last_name}
                  </p>
                  <p className="text-slate-500">
                    {customer.user.email} • {customer.phone} • {customer.city}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    ✓ Verified KYC via DigiLocker
                  </p>
                </div>
              </div>

              {/* Nominee details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="e.g. Suman Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child / Dependent</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                ℹ️ <strong>Underwriter Review Notice:</strong> Your application will be placed into <strong>PENDING</strong> status. Once approved by the underwriting desk, your official policy certificate and payment links will be activated.
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="cust-agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="cust-agree" className="text-xs text-slate-600 leading-relaxed">
                  I declare that the health and asset statements provided are truthful, and I agree to InsureX policy terms.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/30 transition-all"
                >
                  Submit for Underwriter Review
                </button>
              </div>
            </>
          )}

          {/* ================= AGENT VIEW ================= */}
          {role === 'AGENT' && (
            <>
              {/* Agent Attribution & Commission Banner */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      Agency Code: <span className="font-mono text-blue-700">AGT-2026-001</span>
                    </p>
                    <p className="text-slate-500">Intermediary: Rahul Sharma</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Agent Commission</span>
                    <p className="font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{estimatedCommission.toLocaleString()} (10%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Entry Fields */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Walk-in Client Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Client Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={agentClientName}
                      onChange={(e) => setAgentClientName(e.target.value)}
                      placeholder="e.g. Neha Patel"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={agentClientEmail}
                      onChange={(e) => setAgentClientEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={agentClientPhone}
                      onChange={(e) => setAgentClientPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={agentClientCity}
                      onChange={(e) => setAgentClientCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Nominee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Client Nominee Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="Nominee name"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Relationship
                  </label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agent-verify"
                  checked={agentVerifiedKyc}
                  onChange={(e) => setAgentVerifiedKyc(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agent-verify" className="text-xs text-slate-600 leading-relaxed">
                  I certify as an authorized IRDAI agent that I have personally verified the client's identity documents and explained policy terms.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agentVerifiedKyc}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>Submit Client Policy</span>
                  <span className="text-xs font-normal opacity-80">(Pending Review)</span>
                </button>
              </div>
            </>
          )}

          {/* ================= ADMIN VIEW ================= */}
          {role === 'ADMIN' && (
            <>
              {/* Issuance Mode Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Underwriter Issuance Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAdminDirectActivate(true)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      adminDirectActivate
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={`w-4 h-4 ${adminDirectActivate ? 'text-purple-700' : 'text-slate-400'}`} />
                      <span className="text-xs font-black text-slate-900">
                        ⚡ Direct Issue & Activate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Bypasses pending queue. Instantly issues policy #, certificate, and marks ACTIVE today.
                    </p>
                  </div>

                  <div
                    onClick={() => setAdminDirectActivate(false)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      !adminDirectActivate
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className={`w-4 h-4 ${!adminDirectActivate ? 'text-purple-700' : 'text-slate-400'}`} />
                      <span className="text-xs font-black text-slate-900">
                        📋 Queue as Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Saves in underwriting queue for regular medical checks and committee approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Policyholder Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Insured Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminClientName}
                    onChange={(e) => setAdminClientName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Insured Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminClientEmail}
                    onChange={(e) => setAdminClientEmail(e.target.value)}
                    placeholder="v.rao@enterprises.in"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    City / Territory
                  </label>
                  <input
                    type="text"
                    required
                    value={adminClientCity}
                    onChange={(e) => setAdminClientCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Adjusted Premium Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Underwriting Premium Override (₹)
                  </label>
                  <input
                    type="number"
                    value={adminAdjustedPremium}
                    onChange={(e) => setAdminAdjustedPremium(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Designated Nominee
                  </label>
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="Nominee full name"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Admin Remarks */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Official Underwriting File Remarks
                </label>
                <textarea
                  rows={2}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Record underwriting conditions or special endorsements..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                    adminDirectActivate
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
                  }`}
                >
                  {adminDirectActivate ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>⚡ Direct Issue & Activate Policy</span>
                    </>
                  ) : (
                    <span>Queue for Underwriting Review</span>
                  )}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};
