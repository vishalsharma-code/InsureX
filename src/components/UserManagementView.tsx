import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Shield, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText, 
  Award, 
  Briefcase, 
  Key, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Eye, 
  BadgeAlert, 
  Sparkles,
  ChevronRight,
  X,
  TrendingUp,
  UserPlus,
  HelpCircle,
  Hash,
  Download
} from 'lucide-react';
import { User, DirectoryUser, AgentDetail, Policy, Claim, Payment, CustomerQuestion } from '../types';
import { api } from '../api';

interface UserManagementViewProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

type FilterCohort = 'ALL' | 'NEW' | 'ESTABLISHED' | 'AGENTS' | 'CUSTOMERS' | 'ADMINS';
type SortOption = 'NEWEST' | 'OLDEST' | 'NAME' | 'POLICIES' | 'COVERAGE';

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCohort, setActiveCohort] = useState<FilterCohort>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load directory data
  const loadData = () => {
    const data = api.getDirectoryUsers();
    setDirectory(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = directory.length;
    const newUsers = directory.filter(u => u.isNewUser).length;
    const established = directory.filter(u => !u.isNewUser).length;
    const agents = directory.filter(u => u.user.role === 'AGENT').length;
    const customers = directory.filter(u => u.user.role === 'CUSTOMER').length;
    const admins = directory.filter(u => u.user.role === 'ADMIN').length;
    const suspended = directory.filter(u => u.accountStatus === 'SUSPENDED').length;
    
    // Aggregates for agents
    const agentDetails = directory
      .filter(u => u.user.role === 'AGENT' && u.agentInfo)
      .map(u => u.agentInfo!);
    const totalCommission = agentDetails.reduce((sum, a) => sum + a.total_commission_earned, 0);
    const totalAgencyPortfolio = agentDetails.reduce((sum, a) => sum + a.active_portfolio_value, 0);

    return {
      total,
      newUsers,
      established,
      agents,
      customers,
      admins,
      suspended,
      totalCommission,
      totalAgencyPortfolio,
    };
  }, [directory]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return directory
      .filter(item => {
        // Cohort & Role Filter
        if (activeCohort === 'NEW' && !item.isNewUser) return false;
        if (activeCohort === 'ESTABLISHED' && item.isNewUser) return false;
        if (activeCohort === 'AGENTS' && item.user.role !== 'AGENT') return false;
        if (activeCohort === 'CUSTOMERS' && item.user.role !== 'CUSTOMER') return false;
        if (activeCohort === 'ADMINS' && item.user.role !== 'ADMIN') return false;

        // Status Filter
        if (statusFilter !== 'ALL' && item.accountStatus !== statusFilter) return false;

        // Search Query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${item.user.first_name || ''} ${item.user.last_name || ''}`.toLowerCase();
        const username = (item.user.username || '').toLowerCase();
        const email = (item.user.email || '').toLowerCase();
        const phone = (item.user.phone || item.user.mobile || '').toLowerCase();
        const city = (item.user.city || '').toLowerCase();
        const state = (item.user.state || '').toLowerCase();
        const agentCode = (item.agentInfo?.agent_code || '').toLowerCase();
        const license = (item.agentInfo?.license_number || '').toLowerCase();

        return (
          fullName.includes(q) ||
          username.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          agentCode.includes(q) ||
          license.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.user.created_at || 0).getTime() - new Date(a.user.created_at || 0).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.user.created_at || 0).getTime() - new Date(b.user.created_at || 0).getTime();
        }
        if (sortBy === 'NAME') {
          const nameA = `${a.user.first_name || ''} ${a.user.last_name || ''}`;
          const nameB = `${b.user.first_name || ''} ${b.user.last_name || ''}`;
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'POLICIES') {
          return b.policiesCount - a.policiesCount;
        }
        if (sortBy === 'COVERAGE') {
          return b.activeCoverageSum - a.activeCoverageSum;
        }
        return 0;
      });
  }, [directory, activeCohort, statusFilter, searchQuery, sortBy]);

  // Handle Account Suspension Toggle
  const handleToggleSuspension = (userId: number, userName: string) => {
    const res = api.toggleUserSuspension(userId);
    loadData();
    if (selectedUser && selectedUser.user.id === userId) {
      setSelectedUser(prev => prev ? {
        ...prev,
        accountStatus: res.isSuspended ? 'SUSPENDED' : 'ACTIVE',
        credentialStatus: {
          ...prev.credentialStatus,
          isActive: !res.isSuspended,
        }
      } : null);
    }
    showToast(
      res.isSuspended
        ? `Account for ${userName} has been SUSPENDED. Authentication is restricted.`
        : `Account for ${userName} has been REACTIVATED successfully.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section: Overview Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Accounts */}
        <div className="bg-white/50 backdrop-blur-md border border-white/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{stats.total}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
            <span>{stats.customers} Customers</span>
            <span>•</span>
            <span>{stats.agents} Agents</span>
            <span>•</span>
            <span>{stats.admins} Admins</span>
          </p>
        </div>

        {/* New Users */}
        <div className="bg-white/50 backdrop-blur-md border border-emerald-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-100/60 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              New Users (Recent)
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600">{stats.newUsers}</h3>
          <p className="text-xs text-emerald-700 mt-2 font-medium">
            Registered via portal with verified credentials
          </p>
        </div>

        {/* Established Old Accounts */}
        <div className="bg-white/50 backdrop-blur-md border border-white/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Established / Seed Users
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{stats.established}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Historic portfolios & foundational accounts
          </p>
        </div>

        {/* Certified Agents */}
        <div className="bg-white/50 backdrop-blur-md border border-white/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Advisors & Agents
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-700">{stats.agents}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            ₹{(stats.totalAgencyPortfolio / 10000000).toFixed(2)} Cr active portfolio under management
          </p>
        </div>
      </section>

      {/* Main Directory Container */}
      <div className="bg-white/50 backdrop-blur-md border border-white/70 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Controls Bar: Filters & Search */}
        <div className="p-6 border-b border-white/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Comprehensive User & Agent Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect complete dossiers of new registered users, established customers, and certified insurance agents.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const csvData = directory.map(d => ({
                    ID: d.user.id,
                    Role: d.user.role,
                    Cohort: d.cohort,
                    Name: `${d.user.first_name || ''} ${d.user.last_name || ''}`,
                    Username: d.user.username || '',
                    Email: d.user.email,
                    Mobile: d.user.mobile || d.user.phone || '',
                    City: d.user.city || '',
                    State: d.user.state || '',
                    Policies: d.policiesCount,
                    CoverageSum: d.activeCoverageSum,
                    Status: d.accountStatus,
                    Joined: d.user.created_at || '',
                  }));
                  const blob = new Blob([JSON.stringify(csvData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `insurex_users_directory_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Directory export generated successfully');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Directory
              </button>
            </div>
          </div>

          {/* Search Bar & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, email, phone, city, or agent code..."
                className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Status: Active Only</option>
                <option value="SUSPENDED">Status: Suspended</option>
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="NAME">Sort: Name (A-Z)</option>
                <option value="POLICIES">Sort: Most Policies</option>
                <option value="COVERAGE">Sort: Highest Coverage</option>
              </select>
            </div>
          </div>

          {/* Cohort Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/50">
            <button
              onClick={() => setActiveCohort('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <span>All Users</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveCohort('NEW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'NEW'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>New Users (Recent)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'NEW' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {stats.newUsers}
              </span>
            </button>

            <button
              onClick={() => setActiveCohort('ESTABLISHED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'ESTABLISHED'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Established Users</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'ESTABLISHED' ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-800'
              }`}>
                {stats.established}
              </span>
            </button>

            <button
              onClick={() => setActiveCohort('AGENTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'AGENTS'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Certified Agents</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'AGENTS' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-800'
              }`}>
                {stats.agents}
              </span>
            </button>

            <button
              onClick={() => setActiveCohort('CUSTOMERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'CUSTOMERS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Customers</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'CUSTOMERS' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-800'
              }`}>
                {stats.customers}
              </span>
            </button>

            <button
              onClick={() => setActiveCohort('ADMINS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCohort === 'ADMINS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Administrators</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCohort === 'ADMINS' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'
              }`}>
                {stats.admins}
              </span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto min-h-[380px]">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No matching accounts found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try adjusting your search criteria or resetting the active filter tabs.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCohort('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">User & Identity</th>
                  <th className="py-3.5 px-4">Role & Cohort</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4">Portfolio / Activity</th>
                  <th className="py-3.5 px-4">Security & Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((item) => {
                  const user = item.user;
                  const isAgent = user.role === 'AGENT';
                  const isNew = item.isNewUser;
                  const isSuspended = item.accountStatus === 'SUSPENDED';

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-white/80 transition-colors group ${
                        isSuspended ? 'bg-rose-50/20' : isNew ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.profile_picture ? (
                              <img
                                src={user.profile_picture}
                                alt={user.first_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${
                                isAgent ? 'bg-amber-600' : user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'
                              }`}>
                                {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            {isNew && (
                              <span 
                                title="New user account" 
                                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-black"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {user.first_name} {user.last_name}
                              </span>
                              {user.username && (
                                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                  @{user.username}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span>ID: #{user.id}</span>
                              {isAgent && item.agentInfo?.agent_code && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-amber-700">{item.agentInfo.agent_code}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Cohort */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {/* Role Pill */}
                          <div>
                            {user.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                <ShieldCheck className="w-3 h-3" />
                                Administrator
                              </span>
                            )}
                            {user.role === 'AGENT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Briefcase className="w-3 h-3" />
                                Licensed Agent
                              </span>
                            )}
                            {user.role === 'CUSTOMER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                <Shield className="w-3 h-3" />
                                Policyholder
                              </span>
                            )}
                          </div>

                          {/* Cohort Pill */}
                          <div>
                            {isNew ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                New User
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                Established
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[190px]">{user.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.mobile || user.phone || 'No phone set'}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.city ? `${user.city}, ${user.state || 'India'}` : 'National / Remote'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Portfolio & Activity */}
                      <td className="py-4 px-4">
                        {isAgent ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                ₹{((item.agentInfo?.active_portfolio_value || 0) / 100000).toFixed(1)}L
                              </span>
                              <span className="text-[10px] text-slate-500">book</span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {item.agentInfo?.total_policies_sold || item.policiesCount} policies sold
                            </p>
                            <p className="text-[10px] font-semibold text-emerald-600">
                              ₹{item.agentInfo?.total_commission_earned.toLocaleString('en-IN')} earned
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                {item.policiesCount} {item.policiesCount === 1 ? 'Policy' : 'Policies'}
                              </span>
                              {item.activeCoverageSum > 0 && (
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  ₹{(item.activeCoverageSum / 100000).toFixed(1)}L Cover
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {item.claimsCount} claims filed • {item.questionsCount} inquiries
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Security & Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div>
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Joined {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jan 2026'}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(item)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-semibold border border-blue-200 hover:border-blue-600 transition-all flex items-center gap-1.5 shadow-sm"
                            title="Inspect complete user dossier and details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleToggleSuspension(user.id, `${user.first_name} ${user.last_name}`)}
                              className={`p-1.5 rounded-xl border text-xs transition-all shadow-sm ${
                                isSuspended
                                  ? 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200'
                                  : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200'
                              }`}
                              title={isSuspended ? 'Reactivate account' : 'Suspend account'}
                            >
                              {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Directory Footer summary */}
        <div className="p-4 border-t border-white/40 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-800">{directory.length}</strong> total registered and seed accounts
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats.newUsers} New accounts registered
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {stats.agents} Active licensed advisors
            </span>
          </div>
        </div>
      </div>

      {/* Deep User Detail Dossier Modal */}
      {selectedUser && (
        <UserDetailModal
          directoryUser={selectedUser}
          currentUser={currentUser}
          onClose={() => setSelectedUser(null)}
          onToggleSuspension={() => handleToggleSuspension(selectedUser.user.id, `${selectedUser.user.first_name} ${selectedUser.user.last_name}`)}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};

// =========================================================================
// DEEP USER DETAIL MODAL COMPONENT
// =========================================================================

interface UserDetailModalProps {
  directoryUser: DirectoryUser;
  currentUser: User;
  onClose: () => void;
  onToggleSuspension: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  directoryUser,
  currentUser,
  onClose,
  onToggleSuspension,
  onNavigateTab,
}) => {
  const { user, cohort, isNewUser, accountStatus, credentialStatus, agentInfo } = directoryUser;
  const isAgent = user.role === 'AGENT';
  const isCustomer = user.role === 'CUSTOMER';
  const isAdmin = user.role === 'ADMIN';

  // Retrieve full associated policies, claims, payments, inquiries
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'POLICIES' | 'AGENT_DATA' | 'CLAIMS' | 'PAYMENTS' | 'INQUIRIES'>('OVERVIEW');
  const [userData, setUserData] = useState<{
    policies: Policy[];
    claims: Claim[];
    payments: Payment[];
    questions: CustomerQuestion[];
  }>({
    policies: [],
    claims: [],
    payments: [],
    questions: [],
  });

  useEffect(() => {
    const data = api.getUserPoliciesAndData(user);
    setUserData(data);
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.first_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md ${
                  isAgent ? 'bg-amber-600' : isAdmin ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {isNewUser && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[9px] font-black shadow-sm">
                  NEW
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {user.first_name} {user.last_name}
                </h2>
                {user.username && (
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-semibold">
                    @{user.username}
                  </span>
                )}
                {/* Role Pill */}
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Administrator
                  </span>
                )}
                {isAgent && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Certified Agent
                  </span>
                )}
                {isCustomer && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Insured Client
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>Account ID: #{user.id}</span>
                <span>•</span>
                <span>Cohort: <strong>{cohort}</strong></span>
                <span>•</span>
                <span>Status: <strong className={accountStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}>{accountStatus}</strong></span>
                <span>•</span>
                <span>Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Jan 2026'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role !== 'ADMIN' && (
              <button
                onClick={onToggleSuspension}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-sm ${
                  accountStatus === 'SUSPENDED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
              >
                {accountStatus === 'SUSPENDED' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    Reactivate User
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Suspend Access
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50/50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'OVERVIEW'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Identity & Contact Dossier
          </button>

          {isAgent && (
            <button
              onClick={() => setActiveSubTab('AGENT_DATA')}
              className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
                activeSubTab === 'AGENT_DATA'
                  ? 'border-amber-600 text-amber-700 bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Agent Licensing & Sales Portfolio
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('POLICIES')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'POLICIES'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Policies ({userData.policies.length})
          </button>

          <button
            onClick={() => setActiveSubTab('CLAIMS')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'CLAIMS'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Claims History ({userData.claims.length})
          </button>

          <button
            onClick={() => setActiveSubTab('PAYMENTS')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'PAYMENTS'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Receipts & Payments ({userData.payments.length})
          </button>

          <button
            onClick={() => setActiveSubTab('INQUIRIES')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'INQUIRIES'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Inquiries ({userData.questions.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Personal & Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Contact Information */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Contact & Communication
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Primary Email:</span>
                      <span className="font-semibold">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <span className="font-semibold">{user.mobile || user.phone || 'Not recorded'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Residential Address:</span>
                      <span className="font-semibold text-right max-w-[220px]">{user.address || 'Standard Registered Residence'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">City / State:</span>
                      <span className="font-semibold">{user.city || 'Bengaluru'}, {user.state || 'Karnataka'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Postal Pincode:</span>
                      <span className="font-mono font-semibold">{user.pincode || '560103'}</span>
                    </div>
                  </div>
                </div>

                {/* Identity & Legal KYC */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Identity & KYC Demographics
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Permanent Account Number (PAN):</span>
                      <span className="font-mono font-bold text-slate-900">{user.pan_number || 'ABCDE1234F'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-semibold">{user.date_of_birth || '1990-05-18'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Gender:</span>
                      <span className="font-semibold">{user.gender || 'MALE'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Designated Nominee:</span>
                      <span className="font-semibold text-slate-900">{user.nominee_name || 'Ananya Verma'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Nominee Relationship:</span>
                      <span className="font-semibold">{user.nominee_relation || 'Spouse'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Authentication Health */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-600" />
                  Security, Credentials & Account Health
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Authentication Method</p>
                    <p className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Encrypted Password (Bcrypt)
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Compliant with IRDAI Auth Standard</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Failed Login Attempts</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {credentialStatus.failedAttempts} / 5 attempts
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">No lockout active</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Account Standing</p>
                    <p className={`font-bold mt-1 ${accountStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {accountStatus === 'ACTIVE' ? 'Verified & Active' : 'Suspended by Admin'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {accountStatus === 'ACTIVE' ? 'Has full portal access' : 'Login attempts blocked'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT SPECIFIC DOSSIER */}
          {activeSubTab === 'AGENT_DATA' && agentInfo && (
            <div className="space-y-6">
              {/* Agent Badge & License Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-600 text-white uppercase tracking-wider">
                      {agentInfo.agent_code}
                    </span>
                    <span className="text-sm font-bold text-amber-950">
                      IRDAI Licensed Insurance Advisor
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1.5">
                    {user.first_name} {user.last_name} — {agentInfo.department}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Branch: {agentInfo.branch} • Jurisdiction: {agentInfo.region}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Performance Rating</p>
                  <p className="text-2xl font-black text-amber-700">⭐ {agentInfo.performance_rating} / 5.0</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Top Tier Production Advisor</p>
                </div>
              </div>

              {/* Agent Financial & Production Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Policies Sold</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{agentInfo.total_policies_sold}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Underwritten policies</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Active Portfolio Book</p>
                  <p className="text-xl font-black text-blue-600 mt-1">
                    ₹{(agentInfo.active_portfolio_value / 10000000).toFixed(2)} Cr
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Total Sum Assured</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Commission Rate</p>
                  <p className="text-xl font-black text-purple-600 mt-1">{agentInfo.commission_rate_percent}%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contracted rate</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Commission Earned</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    ₹{agentInfo.total_commission_earned.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">Disbursed to date</p>
                </div>
              </div>

              {/* Licensing Specifications */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Regulatory & Compliance Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Official IRDAI License:</span>
                    <span className="font-mono font-bold text-slate-900">{agentInfo.license_number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Appointment / Joining Date:</span>
                    <span className="font-semibold">{agentInfo.joining_date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Emergency Desk Hotline:</span>
                    <span className="font-semibold">{agentInfo.contact_hotline || '+91 80 4455 6601'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Product Specialization:</span>
                    <span className="font-semibold text-right max-w-[200px]">{agentInfo.specialization}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POLICIES PORTFOLIO */}
          {activeSubTab === 'POLICIES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isAgent ? 'Client Policies Originated by this Agent' : 'Coverage Policies & Certificates'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {userData.policies.length} total records
                </span>
              </div>

              {userData.policies.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No policies associated with this account</p>
                  <p className="text-slate-400 text-xs mt-0.5">This customer has not submitted a policy application yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.policies.map(p => (
                    <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.policy_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                            {p.plan?.insurance_type || 'LIFE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{p.plan?.plan_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Issued: {p.start_date || '2026-01-01'} • Valid Until: {p.end_date || '2056-01-01'}
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Sum Assured</p>
                        <p className="font-extrabold text-slate-900 text-sm">₹{(p.coverage_amount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          Premium: ₹{(p.premium_amount || 0).toLocaleString('en-IN')}/yr
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLAIMS HISTORY */}
          {activeSubTab === 'CLAIMS' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Incident Claims & Settlement Ledger</h3>
              {userData.claims.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Clean Claim History</p>
                  <p className="text-slate-400 text-xs mt-0.5">Zero claims filed or pending adjudication for this account.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.claims.map(c => (
                    <div key={c.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.claim_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 font-medium">{c.incident_description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Filed on: {c.claim_date || '2026-02-10'} • Surveyor Incident Date: {c.incident_date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Claim Amount</p>
                        <p className="text-sm font-black text-slate-900">₹{(c.claim_amount || 0).toLocaleString('en-IN')}</p>
                        {c.settled_amount && (
                          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                            Settled: ₹{c.settled_amount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeSubTab === 'PAYMENTS' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Official Financial Vouchers & Premium Payments</h3>
              {userData.payments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No premium transactions recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.payments.map(pay => (
                    <div key={pay.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{pay.transaction_id}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                            {pay.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Method: {pay.payment_method} • Date: {pay.payment_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{(pay.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INQUIRIES */}
          {activeSubTab === 'INQUIRIES' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Underwriting Questions & Resolution Tickets</h3>
              {userData.questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No inquiries submitted</p>
                  <p className="text-slate-400 text-xs mt-0.5">This user has not raised any support or policy questions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.questions.map(q => (
                    <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{q.id}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                          {q.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{q.subject}</h4>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{q.question}</p>
                      {q.answer && (
                        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 text-blue-900">
                          <p className="text-[10px] font-bold uppercase text-blue-700">Officer Response ({q.answered_by}):</p>
                          <p className="mt-0.5">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Audit ID: <span className="font-mono">IRDAI-USR-{user.id}</span> • Confidential Underwriter Record
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
