import React from 'react';
import { Bell, Sparkles, Plus, Search, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentUser: User;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentUser,
  onQuickAction,
  quickActionLabel,
  onLogout,
  onEditProfile,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            currentUser.role === 'ADMIN'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : currentUser.role === 'AGENT'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            {currentUser.role} CONSOLE
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* User Account Info Chip with Edit trigger */}
        <button
          onClick={onEditProfile}
          type="button"
          title={onEditProfile ? "Click to view and edit profile details" : undefined}
          className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm text-xs text-left transition-all ${
            onEditProfile ? 'hover:bg-white hover:border-blue-300 hover:shadow-md cursor-pointer group' : ''
          }`}
        >
          <div className="relative">
            {currentUser.profile_picture ? (
              <img src={currentUser.profile_picture} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.first_name ? currentUser.first_name[0] : 'U'}
              </div>
            )}
            {onEditProfile && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              {onEditProfile && (
                <span className="text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
              {currentUser.role === 'AGENT' ? 'Code: AGT-2026-001' : currentUser.email}
            </p>
          </div>
        </button>

        {/* Quick Action button if provided */}
        {onQuickAction && quickActionLabel && (
          <button
            onClick={onQuickAction}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{quickActionLabel}</span>
          </button>
        )}

        {/* Header Sign Out button */}
        {onLogout && (
          <button 
            onClick={onLogout}
            title="Sign Out of Session"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/70 hover:bg-rose-50 border border-white/80 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
