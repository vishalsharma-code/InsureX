import React from 'react';
import { FileCode, ExternalLink, Key, Database, Shield, Server, Check } from 'lucide-react';

export const ApiDocsModal: React.FC = () => {
  const endpoints = [
    { method: 'POST', path: '/api/accounts/token/', desc: 'JWT Obtain Token Pair (access & refresh)' },
    { method: 'POST', path: '/api/accounts/token/refresh/', desc: 'JWT Refresh Token' },
    { method: 'POST', path: '/api/accounts/register/', desc: 'User Registration with role assignment' },
    { method: 'GET', path: '/api/policies/plans/', desc: 'List insurance plans (Search & Filter)' },
    { method: 'POST', path: '/api/policies/plans/', desc: 'Create new insurance plan [Admin only]' },
    { method: 'GET', path: '/api/policies/applications/', desc: 'List policy applications [Role filtered]' },
    { method: 'POST', path: '/api/policies/applications/', desc: 'Submit new policy application' },
    { method: 'POST', path: '/api/policies/applications/{id}/approve/', desc: 'Approve policy & generate policy number [Admin]' },
    { method: 'POST', path: '/api/policies/applications/{id}/reject/', desc: 'Reject policy with remarks [Admin]' },
    { method: 'GET', path: '/api/claims/', desc: 'List insurance claims [Role filtered]' },
    { method: 'POST', path: '/api/claims/', desc: 'File new claim against active policy' },
    { method: 'POST', path: '/api/claims/{id}/update-status/', desc: 'Adjudicate claim [Admin/Surveyor]' },
    { method: 'GET', path: '/api/payments/', desc: 'List premium payment transactions' },
    { method: 'POST', path: '/api/payments/pay/', desc: 'Record premium payment & generate receipt' },
    { method: 'GET', path: '/api/dashboard/admin-stats/', desc: 'Admin aggregated analytics & portfolio metrics' },
    { method: 'GET', path: '/api/dashboard/agent-stats/', desc: 'Agent commission & assigned policy stats' },
    { method: 'GET', path: '/api/dashboard/customer-stats/', desc: 'Customer coverage & claim status' },
  ];

  const credentials = [
    { role: 'ADMIN', user: 'admin', pass: 'Admin@123', scope: 'Full system management, underwriting approval, claims adjudication' },
    { role: 'AGENT', user: 'agent_vikram', pass: 'Agent@123', scope: 'Assigned customer policies, sales portfolio tracking' },
    { role: 'CUSTOMER', user: 'rajesh_sharma', pass: 'Cust@123', scope: 'Personal policy applications, premium payment, claims filing' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card with Frosted Glass */}
      <div className="bg-white/45 backdrop-blur-md border border-white/70 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                Swagger / OpenAPI 3.0
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                drf-spectacular Engine
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              InsureX REST API Documentation
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Specification for Django REST Framework + MySQL/SQLite Backend Architecture
            </p>
          </div>

          <a
            href="/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* System Architecture summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-white/60 rounded-2xl border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Backend Framework</span>
            </div>
            <p className="text-xs text-slate-600">Django 5.0 + Django REST Framework</p>
          </div>

          <div className="p-4 bg-white/60 rounded-2xl border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Authentication</span>
            </div>
            <p className="text-xs text-slate-600">SimpleJWT (Bearer Token in Header)</p>
          </div>

          <div className="p-4 bg-white/60 rounded-2xl border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database</span>
            </div>
            <p className="text-xs text-slate-600">MySQL (with fallback to SQLite)</p>
          </div>

          <div className="p-4 bg-white/60 rounded-2xl border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <Shield className="w-4 h-4 text-orange-600" />
              <span>Authorization</span>
            </div>
            <p className="text-xs text-slate-600">RBAC (Admin, Agent, Customer)</p>
          </div>
        </div>

        {/* Demo Credentials Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            System Demo & Testing Credentials
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-600 font-bold uppercase rounded-xl">
                <tr>
                  <th className="p-3 rounded-l-xl">Role</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Password</th>
                  <th className="p-3 rounded-r-xl">Privileges & Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {credentials.map((c) => (
                  <tr key={c.role} className="hover:bg-white/40 transition-colors">
                    <td className="p-3 font-bold text-blue-700">{c.role}</td>
                    <td className="p-3 font-mono font-semibold text-slate-800">{c.user}</td>
                    <td className="p-3 font-mono text-slate-600">{c.pass}</td>
                    <td className="p-3 text-slate-600">{c.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Schema Specification */}
        <div className="mt-8 pt-6 border-t border-white/40">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Database Schema: Login Credentials & Authentication
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Relational table specifications for identity, encrypted credentials, access management, and security audits.
          </p>

          <div className="space-y-4">
            {/* Table 1: login_credentials */}
            <div className="bg-white/70 border border-white/80 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3">
                <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  TABLE: auth_login_credentials
                </span>
                <span className="text-[11px] text-slate-500 font-medium">1:1 with auth_users</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-2 rounded-l-lg">Column</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Constraints</th>
                      <th className="p-2 rounded-r-lg">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">id</td>
                      <td className="p-2 text-blue-600">VARCHAR(36)</td>
                      <td className="p-2 text-rose-600">PRIMARY KEY</td>
                      <td className="p-2 text-slate-600 font-sans">Unique credential record UUID</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">user_id</td>
                      <td className="p-2 text-blue-600">BIGINT</td>
                      <td className="p-2 text-amber-600">FK REFERENCES users(id) ON DELETE CASCADE, UNIQUE</td>
                      <td className="p-2 text-slate-600 font-sans">Foreign key linking directly to user entity</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">identifier</td>
                      <td className="p-2 text-blue-600">VARCHAR(254)</td>
                      <td className="p-2 text-purple-600">INDEX, NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">Normalized username or email for rapid login lookup</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">password_hash</td>
                      <td className="p-2 text-blue-600">VARCHAR(255)</td>
                      <td className="p-2 text-rose-600">NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">Bcrypt / Argon2 salted cryptographic hash</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">role</td>
                      <td className="p-2 text-blue-600">VARCHAR(20)</td>
                      <td className="p-2 text-slate-700">CHECK (role IN ('ADMIN','AGENT','CUSTOMER'))</td>
                      <td className="p-2 text-slate-600 font-sans">Assigned authorization role</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">failed_attempts</td>
                      <td className="p-2 text-blue-600">INTEGER</td>
                      <td className="p-2 text-slate-700">DEFAULT 0, NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">Consecutive failed login counter for brute-force protection</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">locked_until</td>
                      <td className="p-2 text-blue-600">TIMESTAMP</td>
                      <td className="p-2 text-slate-500">NULLABLE</td>
                      <td className="p-2 text-slate-600 font-sans">Temporary lockout expiration after multiple failed attempts</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">last_login_at</td>
                      <td className="p-2 text-blue-600">TIMESTAMP</td>
                      <td className="p-2 text-slate-500">NULLABLE</td>
                      <td className="p-2 text-slate-600 font-sans">Timestamp of most recent successful session</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">password_changed_at</td>
                      <td className="p-2 text-blue-600">TIMESTAMP</td>
                      <td className="p-2 text-slate-700">DEFAULT CURRENT_TIMESTAMP</td>
                      <td className="p-2 text-slate-600 font-sans">Timestamp of last password reset/rotation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: password_resets */}
            <div className="bg-white/70 border border-white/80 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3">
                <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  TABLE: auth_password_resets
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Self-Service Recovery OTPs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-2 rounded-l-lg">Column</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Constraints</th>
                      <th className="p-2 rounded-r-lg">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">id</td>
                      <td className="p-2 text-blue-600">VARCHAR(36)</td>
                      <td className="p-2 text-rose-600">PRIMARY KEY</td>
                      <td className="p-2 text-slate-600 font-sans">Reset session identifier</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">email</td>
                      <td className="p-2 text-blue-600">VARCHAR(254)</td>
                      <td className="p-2 text-purple-600">INDEX, NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">Target registered email account</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">verification_code</td>
                      <td className="p-2 text-blue-600">VARCHAR(6)</td>
                      <td className="p-2 text-slate-700">NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">6-digit secure numeric OTP token</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">status</td>
                      <td className="p-2 text-blue-600">VARCHAR(20)</td>
                      <td className="p-2 text-slate-700">CHECK (status IN ('PENDING','COMPLETED','EXPIRED'))</td>
                      <td className="p-2 text-slate-600 font-sans">Lifecycle status of the recovery request</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">expires_at</td>
                      <td className="p-2 text-blue-600">TIMESTAMP</td>
                      <td className="p-2 text-rose-600">NOT NULL</td>
                      <td className="p-2 text-slate-600 font-sans">Strict 15-minute time-to-live expiration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Uniqueness & Validation Integrity Note */}
            <div className="p-3 bg-blue-50/80 border border-blue-200/70 rounded-xl text-[11px] text-blue-900 space-y-1.5">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  <strong>Data Integrity Enforced:</strong> <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">username</code>, <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">email</code>, and <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">mobile</code> have strict <code className="font-bold">UNIQUE</code> database constraints across all accounts to prevent duplication.
                </span>
              </div>
              <p className="text-[10px] text-blue-800/90 pl-5">
                <strong>Format Rules:</strong> <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">username</code> requires at least 1 uppercase (A-Z), 1 lowercase (a-z), 1 numeric digit (0-9), and 1 special character (!@#$%...). <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">first_name</code> and <code className="bg-blue-100/70 px-1 py-0.5 rounded font-mono">last_name</code> accept both uppercase and lowercase letters.
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            REST API Endpoints Specification
          </h3>
          <div className="space-y-2">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white/60 hover:bg-white/90 rounded-2xl border border-white/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-black px-2.5 py-1 rounded-lg text-[10px] uppercase ${
                      ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{ep.path}</span>
                </div>
                <span className="text-slate-500 hidden sm:inline">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
