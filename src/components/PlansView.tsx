import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Calculator, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { InsurancePlan, User } from '../types';

interface PlansViewProps {
  currentUser: User;
  plans: InsurancePlan[];
  onSelectPlanForCalc: (plan: InsurancePlan) => void;
  onApplyPlan: (plan: InsurancePlan) => void;
  onCreatePlan: (plan: Omit<InsurancePlan, 'id'>) => void;
  onDeletePlan: (id: number) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  currentUser,
  plans,
  onSelectPlanForCalc,
  onApplyPlan,
  onCreatePlan,
  onDeletePlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newType, setNewType] = useState<InsurancePlan['insurance_type']>('HEALTH');
  const [newDesc, setNewDesc] = useState('');
  const [newCoverage, setNewCoverage] = useState<number>(1000000);
  const [newBasePremium, setNewBasePremium] = useState<number>(8500);
  const [newDuration, setNewDuration] = useState<number>(12);
  const [newMinAge, setNewMinAge] = useState<number>(18);
  const [newMaxAge, setNewMaxAge] = useState<number>(65);

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || p.insurance_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    onCreatePlan({
      plan_name: newPlanName.trim(),
      insurance_type: newType,
      description: newDesc.trim() || 'Comprehensive protection plan.',
      coverage_amount: Number(newCoverage),
      base_premium: Number(newBasePremium),
      duration_months: Number(newDuration),
      minimum_age: Number(newMinAge),
      maximum_age: Number(newMaxAge),
      status: 'ACTIVE',
    });

    // Reset and close
    setNewPlanName('');
    setIsCreateModalOpen(false);
  };

  const types = ['ALL', 'HEALTH', 'LIFE', 'VEHICLE', 'TRAVEL'];

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/45 backdrop-blur-md border border-white/70 p-4 rounded-3xl shadow-sm">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans by name, cover, or benefits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Type pills filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {types.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Admin Create Plan Button */}
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        )}
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const isHealth = plan.insurance_type === 'HEALTH';
          const isLife = plan.insurance_type === 'LIFE';
          const isVehicle = plan.insurance_type === 'VEHICLE';
          const isTravel = plan.insurance_type === 'TRAVEL';

          return (
            <div
              key={plan.id}
              className="bg-white/45 backdrop-blur-md border border-white/70 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header with Type badge and Admin delete */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      isHealth
                        ? 'bg-blue-100 text-blue-700'
                        : isLife
                        ? 'bg-purple-100 text-purple-700'
                        : isVehicle
                        ? 'bg-slate-900 text-white'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {plan.insurance_type}
                  </span>

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      title="Delete plan"
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {plan.plan_name}
                </h3>
                <p className="text-xs text-slate-600 mb-5 line-clamp-3 leading-relaxed">
                  {plan.description}
                </p>

                {/* Key Metrics box */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-white/60 rounded-2xl border border-white/80 mb-5">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Coverage</p>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{(plan.coverage_amount / 100000).toFixed(1)} Lakhs
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Base Premium</p>
                    <p className="text-base font-extrabold text-blue-600 font-mono">
                      ₹{plan.base_premium.toLocaleString()}<span className="text-xs font-normal text-slate-500">/yr</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Duration</p>
                    <p className="text-xs font-bold text-slate-700">
                      {plan.duration_months} Months
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Eligible Age</p>
                    <p className="text-xs font-bold text-slate-700">
                      {plan.minimum_age} - {plan.maximum_age} yrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/40">
                <button
                  onClick={() => onSelectPlanForCalc(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100/80 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calc Rate</span>
                </button>
                <button
                  onClick={() => onApplyPlan(plan)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold shadow-md transition-all ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                      : currentUser.role === 'AGENT'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  <span>
                    {currentUser.role === 'ADMIN'
                      ? '⚡ Direct Issue'
                      : currentUser.role === 'AGENT'
                      ? 'Enroll Client'
                      : 'Apply Now'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Create Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Create New Insurance Plan
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Add a new underwriting product to the InsureX catalogue
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Guard Super Plus"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Insurance Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HEALTH">Health</option>
                    <option value="LIFE">Life</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="PROPERTY">Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Coverage Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="100000"
                    value={newCoverage}
                    onChange={(e) => setNewCoverage(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Base Premium (₹/yr)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    value={newBasePremium}
                    onChange={(e) => setNewBasePremium(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Min Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMinAge}
                    onChange={(e) => setNewMinAge(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMaxAge}
                    onChange={(e) => setNewMaxAge(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description & Key Benefits
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Enter policy coverage terms, inclusions and benefits..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/30 transition-all"
                >
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
