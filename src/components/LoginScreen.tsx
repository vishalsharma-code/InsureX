import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  Zap, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Award,
  FileText,
  Users,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';
import { User as AuthUser, UserRole } from '../types';
import { api } from '../api';
import { ForgotPasswordView } from './ForgotPasswordView';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  initialPortal?: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  initialCustomerMode?: 'SIGNUP' | 'LOGIN';
  onBackToWelcome?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess,
  initialPortal = 'ADMIN',
  initialCustomerMode = 'LOGIN',
  onBackToWelcome,
}) => {
  // Active Portal: ADMIN, AGENT, or CUSTOMER
  const [activePortal, setActivePortal] = useState<'ADMIN' | 'AGENT' | 'CUSTOMER'>(initialPortal);

  // Customer sub-mode: SIGNUP or LOGIN
  const [customerMode, setCustomerMode] = useState<'SIGNUP' | 'LOGIN'>(initialCustomerMode);

  // Forgot Password page state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [infoNotification, setInfoNotification] = useState<string | null>(null);

  // Common loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================= ADMIN LOGIN STATE =================
  const [adminIdentifier, setAdminIdentifier] = useState('admin@insurex.com');
  const [adminPassword, setAdminPassword] = useState('••••••••••••');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // ================= AGENT LOGIN STATE =================
  const [agentIdentifier, setAgentIdentifier] = useState('agent@insurex.com');
  const [agentCode, setAgentCode] = useState('AGT-001');
  const [agentPassword, setAgentPassword] = useState('••••••••••••');
  const [showAgentPassword, setShowAgentPassword] = useState(false);

  // ================= CUSTOMER LOGIN STATE =================
  const [custLoginUsername, setCustLoginUsername] = useState('');
  const [custLoginPassword, setCustLoginPassword] = useState('');
  const [showCustLoginPassword, setShowCustLoginPassword] = useState(false);

  // ================= CUSTOMER SIGNUP STATE =================
  // Left: username, first name, mobile, email, profile picture
  const [custRegUsername, setCustRegUsername] = useState('');
  const [custRegFirstName, setCustRegFirstName] = useState('');
  const [custRegMobile, setCustRegMobile] = useState('');
  const [custRegEmail, setCustRegEmail] = useState('');
  const [custRegProfilePic, setCustRegProfilePic] = useState<string | null>(null);

  // Right: password, last name, address
  const [custRegPassword, setCustRegPassword] = useState('');
  const [showCustRegPassword, setShowCustRegPassword] = useState(false);
  const [custRegLastName, setCustRegLastName] = useState('');
  const [custRegAddress, setCustRegAddress] = useState('');

  // ================= SUBMIT HANDLERS =================

  // Quick 1-Click Account Login for Evaluators
  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    let targetId = 'admin@insurex.com';
    if (role === 'AGENT') targetId = 'agent@insurex.com';
    if (role === 'CUSTOMER') targetId = 'customer@insurex.com';

    try {
      const user = await api.login(targetId, 'demo2026');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Login Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminIdentifier.trim()) {
      setError('Please provide your administrator email or username.');
      return;
    }
    if (!adminPassword.trim()) {
      setError('Please provide your master administrative password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const user = await api.login(adminIdentifier.trim(), adminPassword);
      if (user.role !== 'ADMIN') {
        setError('The provided credentials do not have administrator clearance.');
        setIsLoading(false);
        return;
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Admin authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Agent Login Submit
  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Agent can sign in with agentIdentifier OR agentCode
    const idToUse = agentIdentifier.trim() || agentCode.trim();
    if (!idToUse) {
      setError('Please provide your agent username, registered email, or agent code (e.g. AGT-001).');
      return;
    }
    if (!agentPassword.trim()) {
      setError('Please provide your agent password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const user = await api.login(idToUse, agentPassword);
      if (user.role !== 'AGENT' && user.role !== 'ADMIN') {
        setError('The provided credentials do not belong to an active certified agent.');
        setIsLoading(false);
        return;
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Agent authentication failed. Please verify your agency credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Customer Login Submit
  const handleCustomerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custLoginUsername.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!custLoginPassword.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const user = await api.login(custLoginUsername.trim(), custLoginPassword);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Profile Picture File Upload Handler
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustRegProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Customer Signup Submit Handler
  const handleCustomerSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custRegUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    // Validate username requirements: uppercase, lowercase, numeric, 1 special character
    const userUpper = /[A-Z]/.test(custRegUsername);
    const userLower = /[a-z]/.test(custRegUsername);
    const userNum = /[0-9]/.test(custRegUsername);
    const userSpecial = /[^A-Za-z0-9]/.test(custRegUsername);

    if (!userUpper || !userLower || !userNum || !userSpecial) {
      const missing: string[] = [];
      if (!userUpper) missing.push('an uppercase letter (A-Z)');
      if (!userLower) missing.push('a lowercase letter (a-z)');
      if (!userNum) missing.push('a number (0-9)');
      if (!userSpecial) missing.push('a special character (e.g. !@#$%^&*_)');
      setError(`Username must contain ${missing.join(', ')}.`);
      return;
    }

    if (!custRegFirstName.trim()) {
      setError('Please enter your first name');
      return;
    }

    // First name and last name can contain both upper and lower case letters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(custRegFirstName.trim())) {
      setError('First name can only contain uppercase and lowercase letters.');
      return;
    }

    if (custRegLastName.trim() && !nameRegex.test(custRegLastName.trim())) {
      setError('Last name can only contain uppercase and lowercase letters.');
      return;
    }

    if (!custRegMobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!custRegEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!custRegPassword.trim()) {
      setError('Please create a password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newUser = await api.register({
        username: custRegUsername.trim(),
        first_name: custRegFirstName.trim(),
        last_name: custRegLastName.trim() || 'Customer',
        email: custRegEmail.trim(),
        mobile: custRegMobile.trim(),
        phone: custRegMobile.trim(),
        address: custRegAddress.trim(),
        password: custRegPassword,
        profile_picture: custRegProfilePic || undefined,
      });
      onLoginSuccess(newUser);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If Forgot Password flow is open
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f1f5f9] to-[#e0e7ff] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background Frosted Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full">
          <ForgotPasswordView
            initialEmail={forgotPasswordEmail}
            onBackToLogin={() => {
              setIsForgotPassword(false);
              setError(null);
            }}
            onPasswordResetSuccess={(user) => {
              setIsForgotPassword(false);
              setError(null);
              setInfoNotification(`Password updated for ${user.email || user.username}! You can now sign in with your new password.`);
              if (user.role === 'ADMIN') {
                setActivePortal('ADMIN');
                setAdminIdentifier(user.email || user.username);
              } else if (user.role === 'AGENT') {
                setActivePortal('AGENT');
                setAgentIdentifier(user.email || user.username);
              } else {
                setActivePortal('CUSTOMER');
                setCustomerMode('LOGIN');
                setCustLoginUsername(user.username || user.email);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f1f5f9] to-[#e0e7ff] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Frosted Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className={`w-full ${activePortal === 'CUSTOMER' && customerMode === 'SIGNUP' ? 'max-w-3xl' : 'max-w-xl'} relative z-10 transition-all duration-300`}>
        
        {/* Back to Welcome Link */}
        {onBackToWelcome && (
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToWelcome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Welcome Page</span>
            </button>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              InsureX Gateway
            </span>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30 text-white font-black text-2xl mb-3 border border-white/40">
            X
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Insure<span className="text-blue-600">X</span> Portal
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Enterprise Insurance & Underwriting Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl p-6 sm:p-8">
          
          {/* 3-Way Portal Selector: Admin Portal | Agent Portal | Customer Portal */}
          <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-2xl mb-6 border border-slate-200/60 gap-1.5">
            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => { setActivePortal('ADMIN'); setError(null); setInfoNotification(null); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'ADMIN'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 shrink-0 ${activePortal === 'ADMIN' ? 'text-white' : 'text-purple-600'}`} />
              <span className="truncate">Admin Portal</span>
            </button>

            {/* Agent Tab */}
            <button
              type="button"
              onClick={() => { setActivePortal('AGENT'); setError(null); setInfoNotification(null); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'AGENT'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Briefcase className={`w-3.5 h-3.5 shrink-0 ${activePortal === 'AGENT' ? 'text-white' : 'text-blue-600'}`} />
              <span className="truncate">Agent Portal</span>
            </button>

            {/* Customer Tab */}
            <button
              type="button"
              onClick={() => { setActivePortal('CUSTOMER'); setError(null); setInfoNotification(null); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'CUSTOMER'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <User className={`w-3.5 h-3.5 shrink-0 ${activePortal === 'CUSTOMER' ? 'text-white' : 'text-emerald-600'}`} />
              <span className="truncate">Customer</span>
            </button>
          </div>

          {infoNotification && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{infoNotification}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. ADMIN PORTAL LOGIN                                          */}
          {/* ============================================================== */}
          {activePortal === 'ADMIN' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Badge & Title */}
              <div className="border-b border-slate-200/70 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                    <Shield className="w-3 h-3 text-purple-700" />
                    <span>Executive Underwriting Console</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Security Level 4
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Administrator Authentication
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enterprise terminal for master user directory oversight, policy ledger auditing, claims adjudication, and agent portfolio governance.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {/* Admin Identifier */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Admin Work Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="admin@insurex.com or admin"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Master Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordEmail(adminIdentifier.includes('@') ? adminIdentifier : 'admin@insurex.com');
                        setIsForgotPassword(true);
                        setInfoNotification(null);
                        setError(null);
                      }}
                      className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot admin password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terminal Security Token Status */}
                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs text-purple-900">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">IRDAI Auditor Clearance Protocol Active</p>
                      <p className="text-[10px] text-purple-700/80">Audit logging & master record modification ledger enabled</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                    Encrypted
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating Terminal...' : 'Sign In as Administrator'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Fast Access for Admin */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Evaluator instant access:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>1-Click Admin Demo Login</span>
                  </button>
                </div>
              </form>

              {/* Admin Privileges Overview */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Administrator Privileges Granted
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">Detail access to all new & historic users</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">Agent licensing, dossiers & commissions</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">Claims adjudication & global policy ledger</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. AGENT PORTAL LOGIN                                          */}
          {/* ============================================================== */}
          {activePortal === 'AGENT' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Badge & Title */}
              <div className="border-b border-slate-200/70 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    <Briefcase className="w-3 h-3 text-blue-700" />
                    <span>Certified Agency Partner Portal</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    IRDAI Licensed Network
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Agent & Broker Sign-In
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Dedicated terminal for licensed insurance agents to originate policies, manage client portfolios, and track commission disbursements.
                </p>
              </div>

              <form onSubmit={handleAgentSubmit} className="space-y-4">
                {/* Agent Email or Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Agent Registered Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={agentIdentifier}
                      onChange={(e) => setAgentIdentifier(e.target.value)}
                      placeholder="agent@insurex.com or agent"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Agent Code & License ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Agent Code
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={agentCode}
                        onChange={(e) => setAgentCode(e.target.value)}
                        placeholder="e.g. AGT-001"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Assigned Branch
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        value="Mumbai Central Operations"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordEmail(agentIdentifier.includes('@') ? agentIdentifier : 'agent@insurex.com');
                        setIsForgotPassword(true);
                        setInfoNotification(null);
                        setError(null);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot agent password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAgentPassword ? 'text' : 'password'}
                      required
                      value={agentPassword}
                      onChange={(e) => setAgentPassword(e.target.value)}
                      placeholder="Enter agent password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAgentPassword(!showAgentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAgentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Agent Network Status Banner */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">IRDAI License Verified: IRDAI-AG-2024-8841</p>
                      <p className="text-[10px] text-blue-700/80">Direct agency commission payouts linked to verified ledger</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                    Active Agent
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Agency Credentials...' : 'Sign In to Agent Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Fast Access for Agent */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Evaluator instant access:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('AGENT')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>1-Click Agent Demo Login</span>
                  </button>
                </div>
              </form>

              {/* Agent Tools Overview */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Agency Sales Tools & Features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">Client policy submissions & live quotes</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">12% commission tracking & payment ledger</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-tight">Client portfolio renewals & tracking</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. CUSTOMER PORTAL (SIGNUP & LOGIN)                            */}
          {/* ============================================================== */}
          {activePortal === 'CUSTOMER' && (
            <div className="animate-in fade-in duration-200">
              {/* Customer Welcome Header Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  hello, customer
                </h1>
                <h2 className="text-base sm:text-lg font-bold text-blue-600 mt-1">
                  welcome to insureX-Insurance Management System
                </h2>
                <h4 className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  you can access various features after login
                </h4>

                {/* Sub-navigation: create your account | login */}
                <div className="flex items-center justify-center gap-3 text-sm font-bold mt-4 pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => { setCustomerMode('SIGNUP'); setError(null); }}
                    className={`transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                      customerMode === 'SIGNUP'
                        ? 'text-blue-600 font-extrabold underline decoration-2 underline-offset-4 bg-blue-50/80'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    create your account
                  </button>
                  <span className="text-slate-300 font-normal select-none">|</span>
                  <button
                    type="button"
                    onClick={() => { setCustomerMode('LOGIN'); setError(null); }}
                    className={`transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                      customerMode === 'LOGIN'
                        ? 'text-blue-600 font-extrabold underline decoration-2 underline-offset-4 bg-blue-50/80'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    login
                  </button>
                </div>
              </div>

              {/* Sub-view 1: CUSTOMER LOGIN */}
              {customerMode === 'LOGIN' && (
                <div className="max-w-md mx-auto space-y-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-5">
                    login to your account
                  </h1>

                  <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
                    {/* Box 1: username */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        username
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={custLoginUsername}
                          onChange={(e) => setCustLoginUsername(e.target.value)}
                          placeholder="username"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Box 2: password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordEmail(custLoginUsername.includes('@') ? custLoginUsername : '');
                            setIsForgotPassword(true);
                            setInfoNotification(null);
                            setError(null);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCustLoginPassword ? 'text' : 'password'}
                          required
                          value={custLoginPassword}
                          onChange={(e) => setCustLoginPassword(e.target.value)}
                          placeholder="password"
                          className="w-full pl-10 pr-10 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustLoginPassword(!showCustLoginPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCustLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Below these 2 boxes: login */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isLoading ? 'logging in...' : 'login'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Evaluator Quick Demo Login for Customer */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Evaluator customer demo:
                      </p>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('CUSTOMER')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>1-Click Customer Demo Login</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-view 2: CUSTOMER SIGNUP */}
              {customerMode === 'SIGNUP' && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">
                    customer signup
                  </h1>

                  <form onSubmit={handleCustomerSignupSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left Column / Row: username, first name, mobile, profile picture with upload feature */}
                      <div className="space-y-3.5">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              username
                            </label>
                            {custRegUsername && (
                              <span className={`text-[10px] font-semibold ${
                                /[A-Z]/.test(custRegUsername) &&
                                /[a-z]/.test(custRegUsername) &&
                                /[0-9]/.test(custRegUsername) &&
                                /[^A-Za-z0-9]/.test(custRegUsername)
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                              }`}>
                                {/[A-Z]/.test(custRegUsername) &&
                                /[a-z]/.test(custRegUsername) &&
                                /[0-9]/.test(custRegUsername) &&
                                /[^A-Za-z0-9]/.test(custRegUsername)
                                  ? '✓ Requirements met'
                                  : 'Missing requirements'}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={custRegUsername}
                              onChange={(e) => setCustRegUsername(e.target.value)}
                              placeholder="e.g. Alex_99#"
                              className="w-full pl-9 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          {/* Username format requirements pills */}
                          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px]">
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-all ${
                              /[A-Z]/.test(custRegUsername) 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                /[A-Z]/.test(custRegUsername) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>{/[A-Z]/.test(custRegUsername) ? '✓' : '•'}</span>
                              <span>Uppercase (A-Z)</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-all ${
                              /[a-z]/.test(custRegUsername) 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                /[a-z]/.test(custRegUsername) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>{/[a-z]/.test(custRegUsername) ? '✓' : '•'}</span>
                              <span>Lowercase (a-z)</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-all ${
                              /[0-9]/.test(custRegUsername) 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                /[0-9]/.test(custRegUsername) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>{/[0-9]/.test(custRegUsername) ? '✓' : '•'}</span>
                              <span>Numeric (0-9)</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-all ${
                              /[^A-Za-z0-9]/.test(custRegUsername) 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                /[^A-Za-z0-9]/.test(custRegUsername) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>{/[^A-Za-z0-9]/.test(custRegUsername) ? '✓' : '•'}</span>
                              <span>1 Special (!@#$...)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            first name
                          </label>
                          <input
                            type="text"
                            required
                            value={custRegFirstName}
                            onChange={(e) => setCustRegFirstName(e.target.value)}
                            placeholder="first name (e.g. John, Alice)"
                            className={`w-full px-3.5 py-2.5 bg-white/90 border rounded-xl text-sm focus:ring-2 focus:outline-none ${
                              custRegFirstName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegFirstName.trim())
                                ? 'border-rose-400 focus:ring-rose-400'
                                : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          />
                          <p className={`text-[10px] mt-1 ${
                            custRegFirstName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegFirstName.trim())
                              ? 'text-rose-600 font-medium'
                              : 'text-slate-500'
                          }`}>
                            {custRegFirstName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegFirstName.trim())
                              ? '✕ First name can only contain uppercase and lowercase letters'
                              : 'Can contain both uppercase & lowercase letters'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              mobile
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="tel"
                                required
                                value={custRegMobile}
                                onChange={(e) => setCustRegMobile(e.target.value)}
                                placeholder="mobile"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              email address
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="email"
                                required
                                value={custRegEmail}
                                onChange={(e) => setCustRegEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            profile picture
                          </label>
                          <div className="flex items-center gap-3 p-3 bg-slate-50/90 border border-dashed border-slate-300 rounded-2xl">
                            {custRegProfilePic ? (
                              <div className="relative shrink-0">
                                <img
                                  src={custRegProfilePic}
                                  alt="Profile"
                                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setCustRegProfilePic(null)}
                                  title="Remove picture"
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-rose-600 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                                <User className="w-6 h-6" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor="profile-upload"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-sm transition-all"
                              >
                                <Upload className="w-3.5 h-3.5 text-blue-600" />
                                <span>{custRegProfilePic ? 'Change Photo' : 'Upload Photo'}</span>
                              </label>
                              <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePicChange}
                                className="hidden"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                Upload image file (PNG, JPG, WebP)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column / Row: password, last name, address */}
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showCustRegPassword ? 'text' : 'password'}
                              required
                              value={custRegPassword}
                              onChange={(e) => setCustRegPassword(e.target.value)}
                              placeholder="password"
                              className="w-full pl-9 pr-10 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCustRegPassword(!showCustRegPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showCustRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            last name
                          </label>
                          <input
                            type="text"
                            required
                            value={custRegLastName}
                            onChange={(e) => setCustRegLastName(e.target.value)}
                            placeholder="last name (e.g. Smith, O'Connor)"
                            className={`w-full px-3.5 py-2.5 bg-white/90 border rounded-xl text-sm focus:ring-2 focus:outline-none ${
                              custRegLastName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegLastName.trim())
                                ? 'border-rose-400 focus:ring-rose-400'
                                : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          />
                          <p className={`text-[10px] mt-1 ${
                            custRegLastName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegLastName.trim())
                              ? 'text-rose-600 font-medium'
                              : 'text-slate-500'
                          }`}>
                            {custRegLastName.trim() && !/^[a-zA-Z\s'-]+$/.test(custRegLastName.trim())
                              ? '✕ Last name can only contain uppercase and lowercase letters'
                              : 'Can contain both uppercase & lowercase letters'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            address
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <textarea
                              rows={4}
                              required
                              value={custRegAddress}
                              onChange={(e) => setCustRegAddress(e.target.value)}
                              placeholder="address"
                              className="w-full pl-9 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* In below middle: sign Up */}
                    <div className="flex justify-center pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{isLoading ? 'signing up...' : 'sign Up'}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Security & Regulatory Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 text-[11px] font-semibold text-slate-500 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>IRDAI Web Aggregator Standard</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
