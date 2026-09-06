import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Shield, 
  FileText, 
  MessageSquare,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, Policy, QuestionCategory, QuestionPriority } from '../types';
import { api, isPolicyOwnedByUser } from '../api';

interface AskQuestionViewProps {
  currentUser: User;
  policies: Policy[];
  onNavigate: (tab: string) => void;
  onQuestionSubmitted?: () => void;
}

export const AskQuestionView: React.FC<AskQuestionViewProps> = ({
  currentUser,
  policies,
  onNavigate,
  onQuestionSubmitted,
}) => {
  const [category, setCategory] = useState<QuestionCategory>('COVERAGE_BENEFITS');
  const [selectedPolicyNumber, setSelectedPolicyNumber] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [priority, setPriority] = useState<QuestionPriority>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const userPolicies = policies.filter(p => isPolicyOwnedByUser(p, currentUser));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !questionText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.submitQuestion({
        customer_email: currentUser.email,
        customer_name: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
        customer_username: currentUser.username,
        category,
        subject: subject.trim(),
        policy_number: selectedPolicyNumber || undefined,
        question: questionText.trim(),
        priority,
      });

      setSubmittedTicket(res.id);
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    } catch (err) {
      console.error('Error submitting question', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setQuestionText('');
    setSelectedPolicyNumber('');
    setSubmittedTicket(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-white/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            <span>Dedicated Customer Care Desk</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Ask InsureX Underwriters
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Have questions regarding your policy coverage, claim settlements, endorsement additions, or 80D tax receipts? 
            Our licensed underwriters and medical adjudicators will respond directly.
          </p>
        </div>
      </div>

      {submittedTicket ? (
        <div className="bg-white/70 backdrop-blur-md border border-emerald-500/40 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Inquiry Dispatched Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Ticket ID: {submittedTicket}
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
              Your inquiry has been registered in the priority underwriting queue. An initial response has been generated and filed in your Question History.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('question_history')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <span>View Question History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-7 shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-lg font-black text-slate-900">Submit New Inquiry</h2>
              <p className="text-xs text-slate-500">Provide details so our desk can promptly assist you</p>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Inquiry Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'COVERAGE_BENEFITS', label: 'Coverage & Benefits' },
                  { id: 'CLAIM_STATUS', label: 'Claim Status & Cashless' },
                  { id: 'PREMIUM_PAYMENT', label: 'Premium & 80D Tax' },
                  { id: 'POLICY_APPLICATION', label: 'Policy Application' },
                  { id: 'GENERAL', label: 'General / Portability' },
                ].map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id as QuestionCategory)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                      category === c.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white/80 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Policy dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Related Policy (Optional)
              </label>
              <select
                value={selectedPolicyNumber}
                onChange={(e) => setSelectedPolicyNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="">-- General Inquiry (All Policies) --</option>
                {userPolicies.map((p) => (
                  <option key={p.id} value={p.policy_number || `POL-${p.id}`}>
                    {p.policy_number || `Policy #${p.id}`} — {p.insurance_plan?.plan_name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cashless authorization query for City Hospital"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as QuestionPriority)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High (Hospitalization)</option>
                  <option value="URGENT">Urgent (Emergency)</option>
                </select>
              </div>
            </div>

            {/* Question Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Question *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Please describe your question in detail. Mention hospital name, date of incident, or specific clause if applicable..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Logged in as <span className="font-bold text-slate-700">{currentUser.first_name} {currentUser.last_name}</span> ({currentUser.email})
              </p>
              <button
                type="submit"
                disabled={submitting || !subject.trim() || !questionText.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Question'}</span>
              </button>
            </div>
          </form>

          {/* Side Guidance Card */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Underwriting Support SLA</span>
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-white/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Cashless Hospitalization</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Emergency cashless requests processed within 60 minutes.</p>
                  </div>
                </div>

                <div className="p-3 bg-white/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Policy Endorsements</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Add nominees, update address, or add dependents in 24 hours.</p>
                  </div>
                </div>

                <div className="p-3 bg-white/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Section 80D Tax Certificates</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automated digitally signed certificates available instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link to History */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-sm text-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-900">Track Previous Questions</h4>
              <p className="text-xs text-slate-500 mt-1">Review replies and resolution notes from our underwriting team.</p>
              <button
                onClick={() => onNavigate('question_history')}
                className="mt-3 px-4 py-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all"
              >
                <span>Open Question History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
