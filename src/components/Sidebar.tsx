import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  CreditCard, 
  Calculator, 
  FileCode, 
  UserCheck, 
  Users,
  Building2,
  LogOut,
  Zap,
  Briefcase,
  Shield,
  RotateCcw,
  History,
  HelpCircle,
  MessagesSquare,
  Pencil,
  Sparkles
} from 'lucide-react';
import { UserRole, User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  onResetDemoData?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onEditProfile?: () => void;
  onViewWelcome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onResetDemoData,
  onEditProfile,
  onViewWelcome,
}) => {
  // Role-specific navigation items
  const getNavItems = () => {
    if (currentUser.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User & Agent Directory', icon: Users },
        { id: 'plans', label: 'Plan Catalogue & Rates', icon: ShieldCheck },
        { id: 'policies', label: 'Global Policy Ledger', icon: FileText },
        { id: 'claims', label: 'Claims Adjudication', icon: AlertCircle },
        { id: 'payments', label: 'Financial Audit Ledger', icon: CreditCard },
        { id: 'calculator', label: 'Actuarial Calculator', icon: Calculator },
        { id: 'api_docs', label: 'Swagger & API Specs', icon: FileCode },
      ];
    }
    if (currentUser.role === 'AGENT') {
      return [
        { id: 'dashboard', label: 'Agent Sales Portal', icon: LayoutDashboard },
        { id: 'plans', label: 'Insurance Products', icon: ShieldCheck },
        { id: 'policies', label: 'Client Policy Portfolio', icon: FileText },
        { id: 'claims', label: 'Client Claims Tracker', icon: AlertCircle },
        { id: 'calculator', label: 'Commission & Rate Calc', icon: Calculator },
        { id: 'api_docs', label: 'Swagger & API Specs', icon: FileCode },
      ];
    }
    // CUSTOMER role - Strictly: Dashboard, Apply Policy, History, Ask Question, Question History
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'apply_policy', label: 'Apply Policy', icon: ShieldCheck },
      { id: 'history', label: 'History', icon: History },
      { id: 'ask_question', label: 'Ask Question', icon: HelpCircle },
      { id: 'question_history', label: 'Question History', icon: MessagesSquare },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl text-white flex flex-col border-r border-white/20 shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30 text-white">
          X
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
            InsureX
          </span>
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
            Insurance Management
          </p>
        </div>
      </div>

      {/* Authenticated Role Card: Current Session Box */}
      <div className="px-4 pt-4 pb-2">
        <div className={`p-3 rounded-2xl border ${
          currentUser.role === 'ADMIN'
            ? 'bg-purple-950/40 border-purple-500/30 text-purple-200'
            : currentUser.role === 'AGENT'
            ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">
              Current Session
            </span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              currentUser.role === 'ADMIN'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : currentUser.role === 'AGENT'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            {currentUser.role === 'ADMIN' && <Zap className="w-4 h-4 text-purple-400 shrink-0" />}
            {currentUser.role === 'AGENT' && <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />}
            {currentUser.role === 'CUSTOMER' && <Shield className="w-4 h-4 text-emerald-400 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.role === 'AGENT' ? 'Code: AGT-2026-001' : currentUser.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1st: Customer Uploaded Image/Profile Image with Full Name (below current session box) */}
      {currentUser.role === 'CUSTOMER' && (
        <div className="px-4 py-1.5">
          <div className="p-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-emerald-500/30 shadow-md shadow-emerald-950/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {currentUser.profile_picture ? (
                  <img
                    src={currentUser.profile_picture}
                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shadow-emerald-500/25 bg-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white flex items-center justify-center font-black text-lg border-2 border-emerald-400 shadow-md shadow-emerald-500/25">
                    {currentUser.first_name ? currentUser.first_name[0].toUpperCase() : 'C'}
                  </div>
                )}
                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    title="Change Photo"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow transition-colors border border-slate-900"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                    Customer Profile
                  </span>
                  {onEditProfile && (
                    <button
                      onClick={onEditProfile}
                      title="Edit Profile Details & Picture"
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline transition-colors"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                <p 
                  className="text-sm font-black text-white truncate mt-1 leading-snug tracking-tight"
                  title={`${currentUser.first_name} ${currentUser.last_name}`}
                >
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                  {currentUser.phone || currentUser.email}
                </p>
              </div>
            </div>

            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="w-full mt-2.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Profile & Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 mt-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile, Reset Demo & Sign Out Card */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40 space-y-2">
        {onViewWelcome && (
          <button
            onClick={onViewWelcome}
            title="View public Welcome & Landing Page"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Welcome Landing Page</span>
          </button>
        )}

        {onResetDemoData && (
          <button
            onClick={onResetDemoData}
            title="Reset sample policies, claims, and plans back to default"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 rounded-xl text-[11px] font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Sandbox</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all group"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Sign Out / Log Out</span>
        </button>

        <p className="text-[10px] text-center text-slate-500">
          InsureX RBAC Security Active
        </p>
      </div>
    </aside>
  );
};
