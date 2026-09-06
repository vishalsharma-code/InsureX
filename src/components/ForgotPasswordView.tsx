import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Inbox,
  ShieldAlert,
  Clock,
  Send
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onPasswordResetSuccess: (user: User, newPassword?: string) => void;
  initialEmail?: string;
}

type ResetStep = 'ASK_GMAIL' | 'GMAIL_SENT' | 'CHANGE_PASSWORD' | 'SUCCESS';

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
  onPasswordResetSuccess,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<ResetStep>('ASK_GMAIL');
  const [gmail, setGmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sent message details
  const [sentEmail, setSentEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);

  // Quick preset test addresses
  const presetAccounts = [
    'Sharmavishal2478@gmail.com',
    'customer@insurex.com',
    'admin@insurex.com',
  ];

  // Stage 1: Request Password Reset via Gmail
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = gmail.trim();
    if (!cleanEmail) {
      setError('Please enter your registered Gmail or email address');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email format (e.g. user@gmail.com)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.requestPasswordReset(cleanEmail);
      setSentEmail(response.email);
      setRecipientName(`${response.user.first_name} ${response.user.last_name}`.trim() || 'Valued Member');
      setVerificationCode(response.verificationCode);
      setResetToken(response.resetToken);
      setStep('GMAIL_SENT');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 2 -> Stage 3: Click link inside Gmail message to change password
  const handleOpenChangePassword = () => {
    setError(null);
    setNewPassword('');
    setConfirmPassword('');
    setStep('CHANGE_PASSWORD');
  };

  // Stage 3: Submit New Password
  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.resetPassword(sentEmail, newPassword, resetToken);
      setUpdatedUser(result.user);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 25;
    if (/\d/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength();
  const strengthLabel = 
    strengthScore >= 75 ? 'Strong' : strengthScore >= 50 ? 'Medium' : strengthScore > 0 ? 'Weak' : '';
  const strengthColor = 
    strengthScore >= 75 ? 'bg-emerald-500' : strengthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Brand & Progress Bar */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 text-white font-black text-xl mb-2 border border-white/40">
          X
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Insure<span className="text-blue-600">X</span> Account Recovery
        </h1>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
          Secure Password Reset Service
        </p>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-center gap-2 mt-4 max-w-xs mx-auto">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${
            step === 'ASK_GMAIL' ? 'bg-blue-600' : 'bg-emerald-500'
          }`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${
            step === 'GMAIL_SENT' ? 'bg-blue-600' : step === 'CHANGE_PASSWORD' || step === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-200'
          }`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${
            step === 'CHANGE_PASSWORD' ? 'bg-blue-600' : step === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-200'
          }`} />
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl p-6 sm:p-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1: ASK GMAIL PAGE                                                  */}
        {/* ========================================================================= */}
        {step === 'ASK_GMAIL' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBackToLogin}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>Step 1 of 3</span>
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Forgot Your Password?
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Enter your Gmail or registered email address. We will immediately deliver a secure password reset message to your Gmail inbox.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enter Your Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={gmail}
                    onChange={(e) => {
                      setGmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. name@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Your reset instructions will be sent securely to this Gmail inbox.</span>
                </p>
              </div>

              {/* Quick Preset Accounts */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <span>Quick demo account suggestion:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {presetAccounts.map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => {
                        setGmail(acc);
                        setError(null);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors"
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Reset Message to Gmail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Message to Gmail</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  Remembered your password? <span className="text-blue-600 underline">Sign in instead</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: GMAIL RECEIVED MESSAGE SCREEN                                   */}
        {/* ========================================================================= */}
        {step === 'GMAIL_SENT' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('ASK_GMAIL')}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Step 2: Message Sent to Gmail</span>
              </span>
            </div>

            {/* Delivery Alert */}
            <div className="mb-4 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Inbox className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Password Reset Message Sent
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  An official reset message has been delivered to your Gmail inbox: <strong className="font-bold underline text-emerald-950">{sentEmail}</strong>
                </p>
              </div>
            </div>

            {/* Simulated Live Gmail Inbox Message Card */}
            <div className="mb-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-blue-200/80 shadow-md overflow-hidden">
              {/* Gmail-style Webmail Titlebar */}
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-rose-600 flex items-center justify-center font-black text-[11px] text-white">
                    M
                  </div>
                  <span className="text-xs font-bold tracking-tight">Gmail Inbox</span>
                  <span className="px-1.5 py-0.5 bg-rose-500/30 text-rose-300 text-[9px] font-extrabold rounded">
                    1 New Message
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Just received</span>
                </div>
              </div>

              {/* Message Header */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      InsureX Security: Reset your account password
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      <span className="font-bold text-slate-700">From:</span> InsureX Underwriters &lt;security@insurex.com&gt;
                    </p>
                    <p className="text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700">To:</span> {sentEmail}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                    Priority
                  </span>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-5 space-y-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    X
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">InsureX Security Operations</p>
                    <p className="text-[10px] text-slate-500">Official Automated Notice</p>
                  </div>
                </div>

                <p className="font-semibold text-slate-800">
                  Hello {recipientName},
                </p>

                <p className="text-slate-600 leading-relaxed">
                  We received a request to reset the password for your InsureX account (<span className="font-medium text-slate-800">{sentEmail}</span>).
                  Click the button below to choose your new password.
                </p>

                {/* Primary CTA in Email: Click to Change Password */}
                <div className="py-2 text-center">
                  <button
                    type="button"
                    onClick={handleOpenChangePassword}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-blue-200" />
                    <span>Click Here to Change Your Password</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
                  </button>
                </div>

                {/* Verification Code Box */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                      One-Time Security Verification Code
                    </span>
                    <span className="text-lg font-mono font-black text-blue-900 tracking-widest">
                      {verificationCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">Valid for 15 mins</span>
                </div>

                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-100">
                  If you did not request this password reset, please disregard this email. Your InsureX account remains completely secure.
                </p>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOpenChangePassword}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Change Password Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  handleRequestReset(new Event('submit') as any);
                }}
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resend Reset Message to Gmail</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: CHANGE PASSWORD SCREEN                                          */}
        {/* ========================================================================= */}
        {step === 'CHANGE_PASSWORD' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('GMAIL_SENT')}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Email Message</span>
              </button>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                <KeyRound className="w-3 h-3 text-blue-600" />
                <span>Step 3 of 3</span>
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Setting new password for: <strong className="text-slate-800 font-bold">{sentEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitNewPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-500">Password Strength</span>
                      <span className={strengthScore >= 75 ? 'text-emerald-600' : strengthScore >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strengthScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Re-enter your new password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      confirmPassword && confirmPassword === newPassword
                        ? 'border-emerald-500 ring-1 ring-emerald-500'
                        : confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    confirmPassword === newPassword ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {confirmPassword === newPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passwords match!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Passwords do not match yet</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save New Password & Complete</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: SUCCESS CONFIRMATION                                            */}
        {/* ========================================================================= */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/15">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Password Changed Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your InsureX account password for <strong className="font-bold text-slate-800">{sentEmail}</strong> has been updated. You can now log into your account securely.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (updatedUser) {
                    onPasswordResetSuccess(updatedUser, newPassword);
                  } else {
                    onBackToLogin();
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Sign In with New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Back to Sign In Page
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
