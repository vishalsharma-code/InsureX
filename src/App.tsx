import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PlansView } from './components/PlansView';
import { PoliciesView } from './components/PoliciesView';
import { ClaimsView } from './components/ClaimsView';
import { PaymentsView } from './components/PaymentsView';
import { ApplyPolicyView } from './components/ApplyPolicyView';
import { CustomerHistoryView } from './components/CustomerHistoryView';
import { AskQuestionView } from './components/AskQuestionView';
import { QuestionHistoryView } from './components/QuestionHistoryView';
import { CalculatorModal } from './components/CalculatorModal';
import { ApplyModal } from './components/ApplyModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { LoginScreen } from './components/LoginScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { EditProfileModal } from './components/EditProfileModal';
import { UserManagementView } from './components/UserManagementView';
import { api } from './api';
import { 
  User, 
  InsurancePlan, 
  Policy, 
  Claim, 
  Payment, 
  UserRole, 
  Customer, 
  ClaimType, 
  ClaimStatus, 
  PaymentMethod 
} from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => api.isLoggedIn());
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [loginInitialPortal, setLoginInitialPortal] = useState<'ADMIN' | 'AGENT' | 'CUSTOMER'>('ADMIN');
  const [loginInitialCustomerMode, setLoginInitialCustomerMode] = useState<'SIGNUP' | 'LOGIN'>('LOGIN');
  const [isViewingWelcomePreview, setIsViewingWelcomePreview] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & workflows
  const [selectedPlanForCalc, setSelectedPlanForCalc] = useState<InsurancePlan | null>(null);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  const [selectedPlanForApply, setSelectedPlanForApply] = useState<InsurancePlan | null>(null);
  const [applyCoverage, setApplyCoverage] = useState<number>(1000000);
  const [applyPremium, setApplyPremium] = useState<number>(9500);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Profile Edit modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLogin(false);
    setIsViewingWelcomePreview(false);
    setActiveTab('dashboard');
    showToast(`Welcome back, ${user.first_name}! Logged into ${user.role} Portal.`, 'success');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setShowLogin(false);
    setIsViewingWelcomePreview(false);
    showToast('You have been securely signed out of InsureX.', 'info');
  };

  const handleEnterPortal = (
    role: 'ADMIN' | 'AGENT' | 'CUSTOMER' = 'ADMIN',
    customerMode: 'SIGNUP' | 'LOGIN' = 'LOGIN'
  ) => {
    setLoginInitialPortal(role);
    setLoginInitialCustomerMode(customerMode);
    setShowLogin(true);
    setIsViewingWelcomePreview(false);
  };

  const handleQuickLoginFromWelcome = async (role: UserRole) => {
    try {
      let targetId = 'admin@insurex.com';
      if (role === 'AGENT') targetId = 'agent@insurex.com';
      if (role === 'CUSTOMER') targetId = 'customer@insurex.com';
      const user = await api.login(targetId, 'demo2026');
      handleLoginSuccess(user);
    } catch (err: any) {
      showToast(err?.message || 'Failed to authenticate demo account', 'error');
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo policies, plans, claims, and payments back to the default seed state?')) {
      const initial = api.resetDemoData();
      setPlans(initial.plans);
      setPolicies(initial.policies);
      setClaims(initial.claims);
      setPayments(initial.payments);
      showToast('Demo sandbox reset to pristine initial state.', 'info');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        const initial = api.getInitialData();
        setPlans(initial.plans);
        setPolicies(initial.policies);
        setClaims(initial.claims);
        setPayments(initial.payments);
      } catch (err) {
        console.error('Failed to load initial seed data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const demoCustomer: Customer = {
    id: 1,
    user: currentUser,
    phone: '+91 98765 43210',
    address: '42, Sunrise Enclave, Park Street',
    city: 'Bengaluru',
  };

  // Switch Role
  const handleSwitchRole = (role: UserRole) => {
    const user = api.switchUser(role);
    setCurrentUser(user);
    showToast(`Switched active perspective to ${role} (${user.first_name} ${user.last_name})`, 'info');
  };

  // Plan Handlers
  const handleCreatePlan = async (planData: Omit<InsurancePlan, 'id'>) => {
    try {
      const created = await api.createPlan(planData);
      setPlans(prev => [created, ...prev]);
      showToast(`Insurance plan "${created.plan_name}" created successfully.`);
    } catch (e) {
      showToast('Failed to create plan', 'error');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!window.confirm('Are you sure you want to retire this insurance plan?')) return;
    try {
      await api.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      showToast('Plan removed from catalogue.', 'info');
    } catch (e) {
      showToast('Failed to delete plan', 'error');
    }
  };

  // Open Calculator
  const handleSelectPlanForCalc = (plan: InsurancePlan) => {
    setSelectedPlanForCalc(plan);
    setIsCalcModalOpen(true);
  };

  // Open Apply modal
  const handleApplyPlan = (plan: InsurancePlan, coverage?: number, premium?: number) => {
    setSelectedPlanForApply(plan);
    setApplyCoverage(coverage || plan.coverage_amount);
    setApplyPremium(premium || plan.base_premium);
    setIsApplyModalOpen(true);
  };

  // Submit Application
  const handleApplySubmit = async (data: {
    planId: number;
    coverageAmount: number;
    premiumAmount: number;
    nomineeName: string;
    nomineeRelation: string;
    role: UserRole;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCity?: string;
    agentCode?: string;
    directActivate?: boolean;
    remarks?: string;
  }) => {
    try {
      const newPolicy = await api.applyForPolicy(data);
      setPolicies(prev => [newPolicy, ...prev]);
      setIsApplyModalOpen(false);
      
      if (data.directActivate && newPolicy.policy_number) {
        showToast(`⚡ Master Underwriter: Policy #${newPolicy.policy_number} issued and activated immediately!`);
      } else if (data.role === 'AGENT') {
        showToast(`✓ Agent Submission: Client ${data.clientName} enrolled under code ${data.agentCode || 'AGT-2026-001'}. Queued for underwriting.`);
      } else {
        showToast(`✓ Application submitted! Reference #${newPolicy.id} is queued for underwriter review.`);
      }
      setActiveTab('policies');
    } catch (e) {
      showToast('Failed to submit application', 'error');
    }
  };

  // Approve Policy (Admin)
  const handleApprovePolicy = async (id: number, remarks?: string) => {
    try {
      const updated = await api.approvePolicy(id, remarks);
      setPolicies(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Policy #${updated.policy_number} has been approved! Certificate generated.`);
    } catch (e) {
      showToast('Failed to approve policy', 'error');
    }
  };

  // Reject Policy (Admin)
  const handleRejectPolicy = async (id: number, remarks?: string) => {
    try {
      const updated = await api.rejectPolicy(id, remarks);
      setPolicies(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Policy application #${id} has been declined.`, 'info');
    } catch (e) {
      showToast('Failed to reject policy', 'error');
    }
  };

  // File Claim
  const handleSubmitClaim = async (
    policyId: number,
    claimType: ClaimType,
    claimAmount: number,
    incidentDate: string,
    description: string
  ) => {
    try {
      const newClaim = await api.fileClaim(policyId, claimType, claimAmount, incidentDate, description);
      setClaims(prev => [newClaim, ...prev]);
      showToast(`Claim filed successfully under reference ${newClaim.claim_number}`);
    } catch (e) {
      showToast('Failed to file claim', 'error');
    }
  };

  // Update Claim Status
  const handleUpdateClaimStatus = async (
    id: number,
    status: ClaimStatus,
    approvedAmount?: number,
    remarks?: string
  ) => {
    try {
      const updated = await api.updateClaimStatus(id, status, approvedAmount, remarks);
      setClaims(prev => prev.map(c => c.id === id ? updated : c));
      showToast(`Claim ${updated.claim_number} status updated to ${status}.`);
    } catch (e) {
      showToast('Failed to update claim status', 'error');
    }
  };

  // Record Payment
  const handleRecordPayment = async (policyId: number, amount: number, method: PaymentMethod) => {
    try {
      const newPayment = await api.recordPayment(policyId, amount, method);
      setPayments(prev => [newPayment, ...prev]);
      showToast(`Payment of ₹${amount.toLocaleString()} processed via ${method}. Receipt generated!`);
    } catch (e) {
      showToast('Failed to record payment', 'error');
    }
  };

  // Update Customer Profile
  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    try {
      const updatedUser = await api.updateUserProfile(updatedData);
      setCurrentUser(updatedUser);
      // Synchronize state with updated user information
      const refreshedData = api.getInitialData();
      setPolicies(refreshedData.policies);
      showToast('Profile & details updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
      throw err;
    }
  };

  // Header Titles
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: currentUser.role === 'CUSTOMER' ? 'My Coverage Vault' : 'Insurance Executive Overview',
          subtitle: currentUser.role === 'CUSTOMER'
            ? `Personal protection portfolio, active certificates, and risk analysis for ${currentUser.first_name} ${currentUser.last_name}`
            : 'Real-time policy underwriting, actuarial reserves, and settlement metrics',
          quickLabel: currentUser.role === 'CUSTOMER' ? '+ Apply Policy' : 'New Policy',
          quickAction: () => {
            if (currentUser.role === 'CUSTOMER') {
              setActiveTab('apply_policy');
            } else if (plans.length > 0) {
              handleApplyPlan(plans[0]);
            }
          },
        };
      case 'apply_policy':
        return {
          title: 'Apply for Insurance Policy',
          subtitle: 'Select an authorized plan, configure coverage & term, and submit for instant underwriting',
          quickLabel: 'Browse All Plans',
          quickAction: () => {
            setActiveTab('plans');
          },
        };
      case 'history':
        return {
          title: 'My Coverage & Transaction History',
          subtitle: 'Comprehensive ledger of your active policies, premium payments, and submitted claims',
          quickLabel: '+ Apply Policy',
          quickAction: () => {
            setActiveTab('apply_policy');
          },
        };
      case 'ask_question':
        return {
          title: 'Ask Question / Underwriting Inquiries',
          subtitle: 'Submit inquiries regarding plan benefits, claim processes, endorsements, and tax certificates',
          quickLabel: 'View Question History',
          quickAction: () => {
            setActiveTab('question_history');
          },
        };
      case 'question_history':
        return {
          title: 'My Question History & Resolutions',
          subtitle: 'Track responses and resolution status from insurance underwriters and support officers',
          quickLabel: '+ Ask New Question',
          quickAction: () => {
            setActiveTab('ask_question');
          },
        };
      case 'users':
        return {
          title: 'User & Agent Directory',
          subtitle: 'Full detail access of new users, established accounts, and certified agent dossiers',
        };
      case 'plans':
        return {
          title: 'Insurance Plan Products',
          subtitle: 'Standardized underwriting plans, coverage benefits, and eligibility rules',
          quickLabel: 'Calculate Rate',
          quickAction: () => {
            if (plans.length > 0) handleSelectPlanForCalc(plans[0]);
          },
        };
      case 'policies':
        return {
          title: currentUser.role === 'ADMIN' 
            ? 'Global Policy & Underwriting Ledger'
            : currentUser.role === 'AGENT'
            ? 'Agency Client Policies & Submissions'
            : 'My Insurance Policies & Certificates',
          subtitle: currentUser.role === 'ADMIN'
            ? 'Adjudicate pending applications, directly issue coverage, and monitor portfolios'
            : currentUser.role === 'AGENT'
            ? 'Track policy submissions, verify client statuses, and view commissions'
            : 'Access active certificates, verify coverage limits, and track applications',
          quickLabel: currentUser.role === 'ADMIN'
            ? '⚡ Direct Issue Policy'
            : currentUser.role === 'AGENT'
            ? '+ Enroll Client'
            : '+ Apply for Insurance',
          quickAction: () => {
            if (plans.length > 0) handleApplyPlan(plans[0]);
          },
        };
      case 'claims':
        return {
          title: 'Claims Processing Center',
          subtitle: 'Settlement adjudication, surveyor incident validation, and payouts',
          quickLabel: 'File Claim',
          quickAction: () => {
            setActiveTab('claims');
          },
        };
      case 'payments':
        return {
          title: 'Premium Collections & Receipts',
          subtitle: 'Financial ledger, reconciliation, and customer payment vouchers',
          quickLabel: 'Pay Premium',
          quickAction: () => {
            setActiveTab('payments');
          },
        };
      case 'calculator':
        return {
          title: 'Actuarial Premium Calculator',
          subtitle: 'Mathematical rating engine with age, sum assured, and duration factors',
        };
      case 'api_docs':
        return {
          title: 'OpenAPI & Swagger Documentation',
          subtitle: 'REST endpoints, JWT authentication schema, and Django backend architecture',
        };
      default:
        return {
          title: 'InsureX Management',
          subtitle: 'Insurance Management System',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <>
          <WelcomeScreen
            onEnterPortal={handleEnterPortal}
            onQuickLogin={handleQuickLoginFromWelcome}
            plans={plans}
          />
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400'
                : toast.type === 'info'
                ? 'bg-blue-600/90 text-white border-blue-400'
                : 'bg-slate-900/90 text-white border-white/20'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          initialPortal={loginInitialPortal}
          initialCustomerMode={loginInitialCustomerMode}
          onBackToWelcome={() => setShowLogin(false)}
        />
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400'
              : toast.type === 'info'
              ? 'bg-blue-600/90 text-white border-blue-400'
              : 'bg-slate-900/90 text-white border-white/20'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  if (isViewingWelcomePreview) {
    return (
      <>
        <WelcomeScreen
          onEnterPortal={handleEnterPortal}
          onQuickLogin={handleQuickLoginFromWelcome}
          plans={plans}
          currentUser={currentUser}
          onReturnToDashboard={() => setIsViewingWelcomePreview(false)}
        />
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400'
              : toast.type === 'info'
              ? 'bg-blue-600/90 text-white border-blue-400'
              : 'bg-slate-900/90 text-white border-white/20'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#dbeafe] text-slate-800 font-sans flex">
      {/* Frosted Glass Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetDemoData={handleResetDemoData}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onViewWelcome={() => setIsViewingWelcomePreview(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {/* Header */}
          <Header
            title={headerMeta.title}
            subtitle={headerMeta.subtitle}
            currentUser={currentUser}
            onQuickAction={headerMeta.quickAction}
            quickActionLabel={headerMeta.quickLabel}
            onLogout={handleLogout}
            onEditProfile={() => setIsEditProfileOpen(true)}
          />

          {/* Toast Notification */}
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400'
                : toast.type === 'info'
                ? 'bg-blue-600/90 text-white border-blue-400'
                : 'bg-slate-900/90 text-white border-white/20'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          )}

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              policies={policies}
              claims={claims}
              onNavigate={setActiveTab}
              onApprovePolicy={handleApprovePolicy}
              onRejectPolicy={handleRejectPolicy}
              onEditProfile={() => setIsEditProfileOpen(true)}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'plans' && (
            <PlansView
              currentUser={currentUser}
              plans={plans}
              onSelectPlanForCalc={handleSelectPlanForCalc}
              onApplyPlan={(plan) => handleApplyPlan(plan)}
              onCreatePlan={handleCreatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeTab === 'policies' && (
            <PoliciesView
              currentUser={currentUser}
              policies={policies}
              onApprove={handleApprovePolicy}
              onReject={handleRejectPolicy}
              onPayForPolicy={(policy) => {
                setActiveTab('payments');
              }}
              onOpenApplyModal={() => {
                if (plans.length > 0) handleApplyPlan(plans[0]);
              }}
            />
          )}

          {activeTab === 'claims' && (
            <ClaimsView
              currentUser={currentUser}
              claims={claims}
              policies={policies}
              onSubmitClaim={handleSubmitClaim}
              onUpdateClaimStatus={handleUpdateClaimStatus}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              currentUser={currentUser}
              payments={payments}
              policies={policies}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {activeTab === 'apply_policy' && (
            <ApplyPolicyView
              currentUser={currentUser}
              plans={plans}
              onApplyPolicy={async (plan, coverage, premium, termYears, nomineeName, nomineeRelation) => {
                await handleApplySubmit({
                  planId: plan.id,
                  coverageAmount: coverage,
                  premiumAmount: premium,
                  nomineeName,
                  nomineeRelation,
                  role: currentUser.role,
                  clientName: `${currentUser.first_name} ${currentUser.last_name}`,
                  clientEmail: currentUser.email,
                  clientPhone: currentUser.phone,
                  remarks: `Direct Application (${termYears} Yrs Term)`,
                });
                setActiveTab('history');
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'history' && (
            <CustomerHistoryView
              currentUser={currentUser}
              policies={policies}
              claims={claims}
              payments={payments}
              onNavigate={setActiveTab}
              onMakePayment={() => {
                setActiveTab('payments');
              }}
              onFileClaim={() => {
                setActiveTab('claims');
              }}
            />
          )}

          {activeTab === 'ask_question' && (
            <AskQuestionView
              currentUser={currentUser}
              policies={policies}
              onQuestionSubmitted={() => {
                showToast('Inquiry submitted to underwriters desk successfully!');
                setActiveTab('question_history');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'question_history' && (
            <QuestionHistoryView
              currentUser={currentUser}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'calculator' && (
            <CalculatorModal
              plans={plans}
              isStandaloneTab={true}
              onApplyWithPremium={(plan, coverage, premium) => {
                handleApplyPlan(plan, coverage, premium);
              }}
            />
          )}

          {activeTab === 'api_docs' && (
            <ApiDocsModal />
          )}
        </div>
      </main>

      {/* Floating Modals */}
      {isCalcModalOpen && selectedPlanForCalc && (
        <CalculatorModal
          plans={plans}
          initialPlan={selectedPlanForCalc}
          onClose={() => setIsCalcModalOpen(false)}
          onApplyWithPremium={(plan, coverage, premium) => {
            setIsCalcModalOpen(false);
            handleApplyPlan(plan, coverage, premium);
          }}
        />
      )}

      {isApplyModalOpen && selectedPlanForApply && (
        <ApplyModal
          plan={selectedPlanForApply}
          coverageAmount={applyCoverage}
          premiumAmount={applyPremium}
          customer={demoCustomer}
          currentUser={currentUser}
          onSubmit={handleApplySubmit}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
