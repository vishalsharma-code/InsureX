import React, { useState, useEffect } from 'react';
import { Calculator, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { InsurancePlan, PremiumCalculation } from '../types';
import { api } from '../api';

interface CalculatorModalProps {
  plans: InsurancePlan[];
  initialPlan?: InsurancePlan | null;
  onApplyWithPremium?: (plan: InsurancePlan, coverage: number, calculatedPremium: number) => void;
  isStandaloneTab?: boolean;
  onClose?: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  plans,
  initialPlan,
  onApplyWithPremium,
  isStandaloneTab = false,
  onClose,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<number>(initialPlan?.id || plans[0]?.id || 1);
  const [applicantAge, setApplicantAge] = useState<number>(28);
  const [coverageAmount, setCoverageAmount] = useState<number>(
    initialPlan?.coverage_amount || plans[0]?.coverage_amount || 1500000
  );

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlanId(initialPlan.id);
      setCoverageAmount(initialPlan.coverage_amount);
    }
  }, [initialPlan]);

  const calcResult: PremiumCalculation = api.calculatePremium(
    selectedPlan?.base_premium || 10000,
    applicantAge,
    coverageAmount,
    selectedPlan?.coverage_amount || 1500000
  );

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span>Underwriting Premium Calculator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic risk-adjusted actuarial model based on applicant age & coverage tier
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Inputs with Frosted Glass */}
        <div className="space-y-5 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm">
          {/* Plan Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Insurance Plan
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedPlanId(id);
                const pl = plans.find(p => p.id === id);
                if (pl) setCoverageAmount(pl.coverage_amount);
              }}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name} ({p.insurance_type})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Base rate: ₹{selectedPlan?.base_premium.toLocaleString()}/year
            </p>
          </div>

          {/* Age Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Applicant Age: <span className="text-blue-600 font-extrabold text-sm font-mono">{applicantAge} yrs</span>
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Factor: {calcResult.age_factor}x
              </span>
            </div>
            <input
              type="range"
              min={selectedPlan?.minimum_age || 18}
              max={selectedPlan?.maximum_age || 75}
              value={applicantAge}
              onChange={(e) => setApplicantAge(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{selectedPlan?.minimum_age || 18} yrs</span>
              <span>45 yrs</span>
              <span>{selectedPlan?.maximum_age || 75} yrs</span>
            </div>
          </div>

          {/* Coverage Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Sum Assured (Coverage):
              </label>
              <span className="text-sm font-extrabold font-mono text-slate-900">
                ₹{(coverageAmount / 100000).toFixed(1)} Lakhs
              </span>
            </div>
            <input
              type="range"
              min={200000}
              max={15000000}
              step={100000}
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹2 Lakhs</span>
              <span>₹50 Lakhs</span>
              <span>₹1.5 Crores</span>
            </div>
          </div>
        </div>

        {/* Right Output Calculation Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circle */}
          <div className="w-64 h-64 bg-white/10 rounded-full absolute -right-20 -bottom-20 blur-2xl pointer-events-none"></div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
              Actuarial Quote
            </span>
            <div className="mt-2 mb-4">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                ₹{calcResult.final_premium.toLocaleString()}
              </span>
              <span className="text-xs text-blue-200 font-medium ml-2">/ year</span>
            </div>

            {/* Formula Breakdown */}
            <div className="space-y-2.5 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-200">Standard Base Premium:</span>
                <span className="font-mono font-bold">₹{calcResult.base_premium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Age Risk Multiplier:</span>
                <span className="font-mono font-bold">{calcResult.age_factor}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Coverage Multiplier:</span>
                <span className="font-mono font-bold">{calcResult.coverage_factor}x</span>
              </div>
              <div className="pt-2 border-t border-white/20 flex justify-between font-bold text-emerald-300">
                <span>Calculated Annual Quote:</span>
                <span className="font-mono">₹{calcResult.final_premium.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <button
              onClick={() => {
                if (onApplyWithPremium && selectedPlan) {
                  onApplyWithPremium(selectedPlan, coverageAmount, calcResult.final_premium);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
            >
              <span>Apply with This Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isStandaloneTab) {
    return (
      <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 sm:p-8 rounded-3xl shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
        {content}
      </div>
    </div>
  );
};
