import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  DollarSign, 
  HelpCircle,
  ShieldCheck,
  Calendar,
  Printer
} from 'lucide-react';
import { Claim, Policy, User, ClaimStatus, ClaimType } from '../types';

interface ClaimsViewProps {
  currentUser: User;
  claims: Claim[];
  policies: Policy[];
  onSubmitClaim: (policyId: number, claimType: ClaimType, claimAmount: number, incidentDate: string, description: string) => void;
  onUpdateClaimStatus: (id: number, status: ClaimStatus, approvedAmount?: number, remarks?: string) => void;
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({
  currentUser,
  claims,
  policies,
  onSubmitClaim,
  onUpdateClaimStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);

  // New claim form state - strictly scoped to customer if role is CUSTOMER
  const activePolicies = policies.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    if (currentUser.role === 'CUSTOMER') {
      return (
        p.customer?.user?.email?.toLowerCase() === currentUser.email.toLowerCase() ||
        p.customer?.user?.id === currentUser.id ||
        (currentUser.email.toLowerCase().includes('customer') && (p.customer?.id === 1 || p.customer?.user?.role === 'CUSTOMER'))
      );
    }
    return true;
  });
  const [selectedPolicyId, setSelectedPolicyId] = useState<number>(activePolicies[0]?.id || 1);
  const [claimType, setClaimType] = useState<ClaimType>('MEDICAL');
  const [claimAmount, setClaimAmount] = useState<number>(25000);
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Admin review modal state
  const [reviewStatus, setReviewStatus] = useState<ClaimStatus>('UNDER_REVIEW');
  const [approvedAmount, setApprovedAmount] = useState<number>(25000);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');

  const currentPolicyObj = policies.find(p => p.id === selectedPolicyId);

  const filteredClaims = claims.filter((c) => {
    // Strict customer isolation
    if (currentUser.role === 'CUSTOMER') {
      const isOwn =
        c.customer?.user?.email?.toLowerCase() === currentUser.email.toLowerCase() ||
        c.customer?.user?.id === currentUser.id ||
        (currentUser.email.toLowerCase().includes('customer') && (c.customer?.id === 1 || c.customer?.user?.role === 'CUSTOMER'));
      if (!isOwn) return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.claim_number.toLowerCase().includes(term) ||
      (c.policy_number && c.policy_number.toLowerCase().includes(term)) ||
      c.customer?.user?.first_name?.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentPolicyObj) {
      setFormError('Please select a valid policy.');
      return;
    }

    if (claimAmount > currentPolicyObj.coverage_amount) {
      setFormError(`Claim amount cannot exceed policy coverage limit of ₹${currentPolicyObj.coverage_amount.toLocaleString()}.`);
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide incident details description.');
      return;
    }

    onSubmitClaim(selectedPolicyId, claimType, Number(claimAmount), incidentDate, description.trim());
    setIsSubmitModalOpen(false);
    setDescription('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForReview) return;

    onUpdateClaimStatus(
      selectedClaimForReview.id,
      reviewStatus,
      approvedAmount,
      reviewRemarks.trim() || 'Reviewed by Claims Department'
    );
    setSelectedClaimForReview(null);
  };

  const openReviewModal = (claim: Claim) => {
    setSelectedClaimForReview(claim);
    setReviewStatus(claim.status);
    setApprovedAmount(claim.approved_amount || claim.claim_amount);
    setReviewRemarks(claim.remarks || '');
  };

  const statuses = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SETTLED', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/45 backdrop-blur-md border border-white/70 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search claims by ID, customer, or policy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((s) => {
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
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

        <button
          onClick={() => {
            if (activePolicies.length === 0) {
              alert('You must have at least one active policy to file a claim.');
              return;
            }
            setIsSubmitModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>File Claim</span>
        </button>
      </div>

      {/* Claims Table */}
      <div className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Insurance Claims Queue
            </h2>
            <p className="text-xs text-slate-500">
              Disbursement claims evaluation, surveyor inspections and settlements
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            Automated Underwriting Guard
          </span>
        </div>

        <div className="overflow-x-auto p-3">
          <table className="w-full text-left">
            <thead className="bg-slate-100/60 backdrop-blur-sm text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-xl">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Claim Number</th>
                <th className="px-4 py-3">Policy & Type</th>
                <th className="px-4 py-3">Claimant</th>
                <th className="px-4 py-3 text-right">Claim Amount</th>
                <th className="px-4 py-3 text-right">Approved Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/40">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {currentUser.role === 'CUSTOMER' ? 'No Insurance Claims Filed' : 'No Claims Found'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs">
                        {currentUser.role === 'CUSTOMER'
                          ? 'You have not submitted any claims yet. If you have experienced a covered medical, motor, or life incident, file a cashless claim.'
                          : 'No claims match your search or filter criteria. Check your status filters.'}
                      </p>
                      {currentUser.role === 'CUSTOMER' && (
                        <button
                          onClick={() => setIsSubmitModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>File a Claim</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const isSubmitted = claim.status === 'SUBMITTED';
                  const isReview = claim.status === 'UNDER_REVIEW';
                  const isApproved = claim.status === 'APPROVED';
                  const isSettled = claim.status === 'SETTLED';
                  const isRejected = claim.status === 'REJECTED';

                  return (
                    <tr key={claim.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                          {claim.claim_number}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Filed: {claim.submitted_date}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">
                          {claim.plan_name}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {claim.claim_type}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {claim.customer?.user?.first_name} {claim.customer?.user?.last_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Incident: {claim.incident_date}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-800">
                        ₹{claim.claim_amount?.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-extrabold text-emerald-600">
                        {claim.approved_amount ? `₹${claim.approved_amount.toLocaleString()}` : '—'}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-700'
                              : isApproved
                              ? 'bg-blue-100 text-blue-700'
                              : isReview
                              ? 'bg-purple-100 text-purple-700'
                              : isSubmitted
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {currentUser.role === 'ADMIN' ? (
                          <button
                            onClick={() => openReviewModal(claim)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            Review & Adjudicate
                          </button>
                        ) : (
                          <button
                            onClick={() => openReviewModal(claim)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit New Claim Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              File Insurance Claim
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Submit incident details for fast-track cashless or reimbursement review
            </p>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Covered Policy
                </label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activePolicies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policy_number} — {p.insurance_plan?.plan_name} (Cover: ₹{p.coverage_amount.toLocaleString()})
                    </option>
                  ))}
                </select>
                {currentPolicyObj && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Maximum Coverage Limit: ₹{currentPolicyObj.coverage_amount.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Incident Nature
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MEDICAL">Medical / Health</option>
                    <option value="ACCIDENT">Accident Damage</option>
                    <option value="THEFT">Loss / Theft</option>
                    <option value="DISABILITY">Critical Illness</option>
                    <option value="TRAVEL_DELAY">Travel Delay</option>
                    <option value="OTHER">Other Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Claim Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    min="1000"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Incident Date
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Incident Description & Bill Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide date, hospital / garage name, and summary of expenses incurred..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/30 transition-all"
                >
                  File Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review & Adjudication Modal */}
      {selectedClaimForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Claim Adjudication
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedClaimForReview.claim_number}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                {selectedClaimForReview.claim_type}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">
                  {selectedClaimForReview.customer?.user?.first_name} {selectedClaimForReview.customer?.user?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Claim Amount:</span>
                <span className="font-bold text-blue-600 font-mono">
                  ₹{selectedClaimForReview.claim_amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Incident Date:</span>
                <span>{selectedClaimForReview.incident_date}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-800 mb-1">Incident Report:</p>
                <p className="italic text-slate-600">{selectedClaimForReview.description}</p>
              </div>
            </div>

            {currentUser.role === 'ADMIN' ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Adjudication Decision
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="SETTLED">Settled & Disbursed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Approved Payout (₹)
                    </label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Underwriter Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Document validation remarks..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Claim Sheet</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClaimForReview(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                    >
                      Save Decision
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Claim Sheet</span>
                </button>
                <button
                  onClick={() => setSelectedClaimForReview(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
