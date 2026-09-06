import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HeartPulse, 
  Car, 
  Plane, 
  Home, 
  Check, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { InsurancePlan, User } from '../types';

interface ApplyPolicyViewProps {
  currentUser: User;
  plans: InsurancePlan[];
  onApplyPlan: (plan: InsurancePlan) => void;
  onCalculateRate: (plan: InsurancePlan) => void;
}

export const ApplyPolicyView: React.FC<ApplyPolicyViewProps> = ({
  currentUser,
  plans,
  onApplyPlan,
  onCalculateRate,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const typeIcons: Record<string, any> = {
    HEALTH: HeartPulse,
    LIFE: ShieldCheck,
    VEHICLE: Car,
    TRAVEL: Plane,
    PROPERTY: Home,
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesType = selectedType === 'ALL' || plan.insurance_type === selectedType;
    const matchesSearch = plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner for Customer Apply */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-white/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Digital Underwriting Portal for {currentUser.first_name}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Apply for Instant Coverage
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Choose from comprehensive Health, Life, Motor, and Travel insurance plans. 
            Guaranteed cashless hospitalization, zero co-pay options, and 100% digital issuance.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 10-Minute Instant Issuance
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 10,000+ Cashless Hospitals
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Section 80D Tax Exemption
            </span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-gradient-to-l from-blue-400 to-transparent pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/45 backdrop-blur-md p-4 rounded-2xl border border-white/70">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'HEALTH', 'LIFE', 'VEHICLE', 'TRAVEL', 'PROPERTY'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {type === 'ALL' ? 'All Plans' : type}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by plan name or feature..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Available Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const Icon = typeIcons[plan.insurance_type] || Shield;
          const isHealth = plan.insurance_type === 'HEALTH';
          const isLife = plan.insurance_type === 'LIFE';

          return (
            <div
              key={plan.id}
              className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    isHealth 
                      ? 'bg-blue-100 text-blue-600' 
                      : isLife 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {plan.insurance_type}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                  {plan.plan_name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>

                {/* Key Benefits / Specs */}
                <div className="mt-5 p-4 rounded-2xl bg-white/70 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Sum Assured</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{plan.coverage_amount >= 10000000 
                        ? `${(plan.coverage_amount / 10000000).toFixed(1)} Cr` 
                        : `${(plan.coverage_amount / 100000).toFixed(0)} Lakhs`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Policy Tenure</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {plan.duration_months >= 12 ? `${plan.duration_months / 12} Years` : `${plan.duration_months} Months`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Eligible Age</span>
                    <span className="font-semibold text-slate-700">
                      {plan.minimum_age} – {plan.maximum_age} years
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & Apply Action */}
              <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Base Premium
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 font-mono">
                    ₹{plan.base_premium.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500">/yr</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCalculateRate(plan)}
                    title="Calculate personalized premium"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onApplyPlan(plan)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 group-hover:scale-105"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
