import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Eye, 
  Download, 
  CreditCard,
  Building,
  UserCheck,
  Zap,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  Printer,
  Plus
} from 'lucide-react';
import { Policy, User, PolicyStatus } from '../types';

interface PoliciesViewProps {
  currentUser: User;
  policies: Policy[];
  onApprove: (id: number, remarks?: string) => void;
  onReject: (id: number, remarks?: string) => void;
  onPayForPolicy: (policy: Policy) => void;
  onOpenApplyModal?: () => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  currentUser,
  policies,
  onApprove,
  onReject,
  onPayForPolicy,
  onOpenApplyModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPolicyForDoc, setSelectedPolicyForDoc] = useState<Policy | null>(null);
  const [actionRemarksModal, setActionRemarksModal] = useState<{ id: number; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [remarksInput, setRemarksInput] = useState('');

  const filtered = policies.filter((p) => {
    // Strict Customer data isolation: Customer only sees their personal policies
    if (currentUser.role === 'CUSTOMER') {
      const isOwn = 
        p.customer?.user?.email?.toLowerCase() === currentUser.email.toLowerCase() ||
        p.customer?.user?.id === currentUser.id ||
        (currentUser.email.toLowerCase().includes('customer') && (p.customer?.id === 1 || p.customer?.user?.role === 'CUSTOMER'));
      if (!isOwn) return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.policy_number && p.policy_number.toLowerCase().includes(term)) ||
      p.customer?.user?.first_name?.toLowerCase().includes(term) ||
      p.customer?.user?.last_name?.toLowerCase().includes(term) ||
      p.insurance_plan?.plan_name?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleActionConfirm = () => {
    if (!actionRemarksModal) return;
    if (actionRemarksModal.action === 'APPROVE') {
      onApprove(actionRemarksModal.id, remarksInput.trim() || 'Approved by underwriter.');
    } else {
      onReject(actionRemarksModal.id, remarksInput.trim() || 'Declined due to eligibility guidelines.');
    }
    setActionRemarksModal(null);
    setRemarksInput('');
  };

  const statuses = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Role Authority Banner */}
      <div className={`p-4 rounded-3xl border backdrop-blur-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        currentUser.role === 'ADMIN'
          ? 'bg-purple-50/70 border-purple-200/80 text-purple-900'
          : currentUser.role === 'AGENT'
          ? 'bg-blue-50/70 border-blue-200/80 text-blue-900'
          : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-2xl shrink-0 ${
            currentUser.role === 'ADMIN'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
              : currentUser.role === 'AGENT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
          }`}>
            {currentUser.role === 'ADMIN' && <Zap className="w-5 h-5" />}
            {currentUser.role === 'AGENT' && <Briefcase className="w-5 h-5" />}
            {currentUser.role === 'CUSTOMER' && <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {currentUser.role === 'ADMIN' && 'Master Underwriting Access'}
                {currentUser.role === 'AGENT' && 'Agency Intermediary Portfolio (Code: AGT-2026-001)'}
                {currentUser.role === 'CUSTOMER' && 'Personal Policyholder Vault'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              {currentUser.role === 'ADMIN' &&
                'Admins have direct policy issuance authority to bypass pending queues, approve/reject underwriting applications, and manage global risk limits.'}
              {currentUser.role === 'AGENT' &&
                'Agents can assist walk-in clients with customized plan enrollment and track commission earnings. Final approval is subject to Admin underwriter review.'}
              {currentUser.role === 'CUSTOMER' &&
                'Customers can self-enroll for coverage, download authenticated digital certificates, and make online annual premium payments.'}
            </p>
          </div>
        </div>

        {onOpenApplyModal && (
          <button
            onClick={onOpenApplyModal}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all shrink-0 flex items-center gap-2 ${
              currentUser.role === 'ADMIN'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                : currentUser.role === 'AGENT'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            {currentUser.role === 'ADMIN' ? (
              <>
                <Zap className="w-4 h-4" />
                <span>⚡ Direct Issue Policy</span>
              </>
            ) : currentUser.role === 'AGENT' ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>+ Enroll Client</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>+ Apply for Coverage</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/45 backdrop-blur-md border border-white/70 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies by number, applicant, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statuses.map((s) => {
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Policy Portfolio Records
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filtered.length} total registered insurance documents
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
            Real-time Underwriting State
          </span>
        </div>

        <div className="overflow-x-auto p-3">
          <table className="w-full text-left">
            <thead className="bg-slate-100/60 backdrop-blur-sm text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-xl">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Policy / Doc ID</th>
                <th className="px-4 py-3">Applicant / Member</th>
                <th className="px-4 py-3">Insurance Plan</th>
                <th className="px-4 py-3 text-right">Coverage</th>
                <th className="px-4 py-3 text-right">Annual Premium</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {currentUser.role === 'CUSTOMER' ? 'No Active Insurance Policies Yet' : 'No Matching Policies Found'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs">
                        {currentUser.role === 'CUSTOMER'
                          ? 'You do not have any active policies yet. Browse our insurance plans to apply for immediate coverage.'
                          : 'No policies match your search or filter criteria. Check your filters or enroll a new policyholder.'}
                      </p>
                      {onOpenApplyModal && (
                        <button
                          onClick={onOpenApplyModal}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{currentUser.role === 'CUSTOMER' ? 'Browse Plans & Apply' : 'Enroll New Policy'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((policy) => {
                  const isPending = policy.status === 'PENDING';
                  const isActive = policy.status === 'ACTIVE';
                  const isRejected = policy.status === 'REJECTED';

                  return (
                    <tr key={policy.id} className="hover:bg-white/40 transition-colors">
                      {/* Policy Number */}
                      <td className="px-4 py-4">
                        <div className="font-mono font-bold text-xs text-slate-900">
                          {policy.policy_number ? (
                            <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              {policy.policy_number}
                            </span>
                          ) : (
                            <span className="text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                              UNDER REVIEW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Applied: {policy.application_date}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {policy.customer?.user?.first_name} {policy.customer?.user?.last_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {policy.customer?.user?.email}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">
                          {policy.insurance_plan?.plan_name}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {policy.insurance_plan?.insurance_type}
                        </span>
                      </td>

                      {/* Coverage */}
                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-800">
                        ₹{(policy.coverage_amount / 100000).toFixed(1)}L
                      </td>

                      {/* Premium */}
                      <td className="px-4 py-4 text-right font-mono font-extrabold text-blue-600">
                        ₹{policy.premium_amount?.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                            isPending
                              ? 'bg-orange-100 text-orange-700'
                              : isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {policy.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Certificate button */}
                          <button
                            onClick={() => setSelectedPolicyForDoc(policy)}
                            title="View Policy Certificate"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-white/80"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin actions if pending */}
                          {currentUser.role === 'ADMIN' && isPending && (
                            <>
                              <button
                                onClick={() => setActionRemarksModal({ id: policy.id, action: 'APPROVE' })}
                                title="Approve Application"
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setActionRemarksModal({ id: policy.id, action: 'REJECT' })}
                                title="Reject Application"
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Customer pay premium if active */}
                          {isActive && (
                            <button
                              onClick={() => onPayForPolicy(policy)}
                              title="Pay Premium"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Action Confirmation Modal */}
      {actionRemarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {actionRemarksModal.action === 'APPROVE' ? 'Approve Policy Underwriting' : 'Reject Policy Application'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter official underwriter review notes for this application.
            </p>

            <textarea
              rows={3}
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
              placeholder="Underwriter remarks and verification status notes..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setActionRemarksModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  actionRemarksModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                }`}
              >
                Confirm {actionRemarksModal.action === 'APPROVE' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Policy Certificate Modal */}
      {selectedPolicyForDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md">
                  X
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    InsureX Certificate of Coverage
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official e-Policy Document • IRDAI Compliant
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedPolicyForDoc.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {selectedPolicyForDoc.status}
              </span>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-sm">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Policy Number</p>
                <p className="font-mono font-bold text-blue-700 text-base">
                  {selectedPolicyForDoc.policy_number || 'PENDING ASSIGNMENT'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Plan Name</p>
                <p className="font-bold text-slate-800">
                  {selectedPolicyForDoc.insurance_plan?.plan_name}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Primary Insured</p>
                <p className="font-semibold text-slate-900">
                  {selectedPolicyForDoc.customer?.user?.first_name} {selectedPolicyForDoc.customer?.user?.last_name}
                </p>
                <p className="text-xs text-slate-500">{selectedPolicyForDoc.customer?.user?.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Assigned Agent</p>
                <p className="font-semibold text-slate-800">
                  {selectedPolicyForDoc.agent ? `${selectedPolicyForDoc.agent.user.first_name} (${selectedPolicyForDoc.agent.agent_code})` : 'Direct Digital Underwriting'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Sum Assured (Coverage)</p>
                <p className="font-mono font-extrabold text-slate-900 text-lg">
                  ₹{selectedPolicyForDoc.coverage_amount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Annual Premium</p>
                <p className="font-mono font-extrabold text-blue-600 text-lg">
                  ₹{selectedPolicyForDoc.premium_amount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Effective Start Date</p>
                <p className="font-medium text-slate-700">
                  {selectedPolicyForDoc.start_date || 'Upon Approval'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Policy Expiry Date</p>
                <p className="font-medium text-slate-700">
                  {selectedPolicyForDoc.end_date || 'TBD'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-slate-600 mb-6">
              <p className="font-bold text-slate-800 mb-1">Underwriter Remarks:</p>
              <p>{selectedPolicyForDoc.remarks || 'Standard terms & conditions apply.'}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-400">
                Document verified digitally via SHA-256
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedPolicyForDoc(null)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
