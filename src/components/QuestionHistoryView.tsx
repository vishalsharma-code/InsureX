import React, { useState, useEffect } from 'react';
import { 
  MessagesSquare, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  UserCheck, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Filter,
  MessageCircle,
  Tag
} from 'lucide-react';
import { User, CustomerQuestion, QuestionStatus } from '../types';
import { api } from '../api';

interface QuestionHistoryViewProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export const QuestionHistoryView: React.FC<QuestionHistoryViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [questions, setQuestions] = useState<CustomerQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuestionStatus>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getQuestions(currentUser);
      setQuestions(data);
      if (data.length > 0 && !expandedId) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load customer questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentUser]);

  const filteredQuestions = questions.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesSearch = 
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.policy_number && q.policy_number.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <MessagesSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Underwriting Inquiries Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Question & Support History
          </h1>
          <p className="text-xs text-slate-500">
            Official records of your queries, surveyor verifications, and underwriter resolutions
          </p>
        </div>

        <button
          onClick={() => onNavigate('ask_question')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ask New Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/45 backdrop-blur-md p-4 rounded-2xl border border-white/70">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: `All (${questions.length})` },
            { id: 'ANSWERED', label: `Answered (${questions.filter(q => q.status === 'ANSWERED').length})` },
            { id: 'IN_REVIEW', label: `In Review (${questions.filter(q => q.status === 'IN_REVIEW').length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-white border border-slate-200/60'
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
            placeholder="Search tickets, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center bg-white/40 rounded-3xl border border-white/60">
          <p className="text-sm font-semibold text-slate-500">Loading your inquiry history...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {searchQuery
              ? 'No support questions match your search keywords.'
              : 'You have not submitted any questions yet. Need assistance with coverage or claims?'}
          </p>
          <button
            onClick={() => onNavigate('ask_question')}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isAnswered = q.status === 'ANSWERED';

            return (
              <div
                key={q.id}
                className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Card Header (clickable) */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isAnswered
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isAnswered ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {q.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {q.category_display || q.category}
                        </span>
                        {q.policy_number && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Policy: {q.policy_number}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          q.priority === 'HIGH' || q.priority === 'URGENT'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {q.priority}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 truncate">
                        {q.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submitted on {new Date(q.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isAnswered
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {isAnswered ? 'Resolved' : 'In Review'}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Card Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
                    {/* Customer's question */}
                    <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Your Inquiry</span>
                        <span>{q.customer_name} ({q.customer_email})</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {q.question}
                      </p>
                    </div>

                    {/* Official Underwriting Response */}
                    {q.answer ? (
                      <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-2xl border border-emerald-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                            <span className="text-xs font-bold text-emerald-950">
                              Official Underwriting Resolution
                            </span>
                          </div>
                          {q.answered_at && (
                            <span className="text-[11px] text-emerald-700 font-mono">
                              {new Date(q.answered_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-wrap mt-2">
                          {q.answer}
                        </p>

                        {q.answered_by && (
                          <div className="mt-3 pt-3 border-t border-emerald-200/70 flex items-center justify-between text-[11px] text-emerald-800">
                            <span className="font-semibold">Sign-off: {q.answered_by}</span>
                            <span className="font-mono text-[10px] bg-emerald-100/80 px-2 py-0.5 rounded">
                              Underwriting Desk
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            In Review by Senior Underwriter
                          </p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Our team is actively reviewing your portfolio documents. A licensed adjudicator will post the answer here within 24 hours.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
