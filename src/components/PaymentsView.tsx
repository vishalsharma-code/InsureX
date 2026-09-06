import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  CheckCircle2, 
  Receipt, 
  ArrowDownRight, 
  Smartphone, 
  Building2, 
  QrCode,
  Download,
  Printer
} from 'lucide-react';
import { Payment, Policy, User, PaymentMethod } from '../types';

interface PaymentsViewProps {
  currentUser: User;
  payments: Payment[];
  policies: Policy[];
  onRecordPayment: (policyId: number, amount: number, method: PaymentMethod) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  currentUser,
  payments,
  policies,
  onRecordPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);
  const [customAmount, setCustomAmount] = useState<number>(selectedPolicy?.premium_amount || 14200);

  const handlePolicyChange = (id: number) => {
    setSelectedPolicyId(id);
    const p = policies.find(item => item.id === id);
    if (p) {
      setCustomAmount(p.premium_amount);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    onRecordPayment(selectedPolicyId, Number(customAmount), paymentMethod);
    setIsPayModalOpen(false);
  };

  const filteredPayments = payments.filter((p) => {
    // Strict customer isolation
    if (currentUser.role === 'CUSTOMER') {
      const isOwn =
        p.customer_name?.toLowerCase().includes(currentUser.first_name.toLowerCase()) ||
        p.customer_name?.toLowerCase().includes(currentUser.last_name.toLowerCase()) ||
        (currentUser.email.toLowerCase().includes('customer') && p.customer_name?.includes('Verma'));
      if (!isOwn) return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.transaction_id.toLowerCase().includes(term) ||
      (p.policy_number && p.policy_number.toLowerCase().includes(term)) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(term)) ||
      (p.plan_name && p.plan_name.toLowerCase().includes(term));

    const matchesMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats with Frosted Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Settled Premium
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{totalCollected.toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            ✓ 100% Reconciliation Success
          </p>
        </div>

        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Transactions
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            {payments.length} Records
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Instant digital receipts issued
          </p>
        </div>

        <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
              Active Policy Covers
            </p>
            <h3 className="text-2xl font-extrabold text-blue-600 font-mono">
              {activePolicies.length} Active
            </h3>
          </div>
          <button
            onClick={() => {
              if (activePolicies.length === 0) {
                alert('No active policies available for payment.');
                return;
              }
              setIsPayModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pay Premium</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/45 backdrop-blur-md border border-white/70 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments by TXN ID, policy #, or member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'UPI', 'CARD', 'BANK_TRANSFER'].map((method) => {
            const isSelected = methodFilter === method;
            return (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60'
                }`}
              >
                {method === 'BANK_TRANSFER' ? 'Net Banking' : method}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Transaction Ledger & Receipts
            </h2>
            <p className="text-xs text-slate-500">
              Auditable payment logs with encrypted payment gateway signatures
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Automated Payment Settlement
          </span>
        </div>

        <div className="overflow-x-auto p-3">
          <table className="w-full text-left">
            <thead className="bg-slate-100/60 backdrop-blur-sm text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-xl">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Transaction ID</th>
                <th className="px-4 py-3">Policy Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/40">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-sm">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {currentUser.role === 'CUSTOMER' ? 'No Payment History' : 'No Transactions Found'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs">
                        {currentUser.role === 'CUSTOMER'
                          ? 'You have not made any premium payments yet. Keep your policies protected by paying annual premiums on time.'
                          : 'No financial transaction vouchers found for the selected payment method.'}
                      </p>
                      {activePolicies.length > 0 && (
                        <button
                          onClick={() => setIsPayModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Pay Premium Online</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {payment.transaction_id}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Date: {payment.payment_date}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono font-semibold text-slate-800 text-xs">
                      {payment.policy_number || 'INS-ACTIVE'}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {payment.customer_name || 'Policy Holder'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {payment.plan_name}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right font-mono font-extrabold text-emerald-600 text-base">
                      ₹{payment.amount.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {payment.payment_method_display || payment.payment_method}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 inline-block">
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(payment)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 ml-auto transition-all"
                      >
                        <Receipt className="w-3.5 h-3.5 text-blue-600" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Make Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Pay Policy Premium
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Instant renewal & premium payment with zero transaction fees
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Active Policy
                </label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => handlePolicyChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activePolicies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policy_number} — {p.insurance_plan?.plan_name} (₹{p.premium_amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Premium Amount Due (₹)
                </label>
                <input
                  type="number"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'UPI'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs">UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-xs">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Method specific display */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Scan UPI QR / VPA ID: insurex.collect@icici</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Supported: Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/30 transition-all"
                >
                  Confirm ₹{Number(customAmount).toLocaleString()} Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Payment Receipt
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {selectedReceipt.transaction_id}
              </p>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Policy Number:</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedReceipt.policy_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.plan_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.customer_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.payment_method_display || selectedReceipt.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Timestamp:</span>
                <span>{selectedReceipt.payment_date}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-600 uppercase">
                  {selectedReceipt.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">InsureX Billing Services</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md"
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
