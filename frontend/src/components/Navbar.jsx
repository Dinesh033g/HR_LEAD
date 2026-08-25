import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserCheck, LogOut, Shield, Users, User, PhoneCall, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenUpload, onOpenManual, onOpenTeam }) => {
  const { user, logout } = useContext(AuthContext);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Admin (Superuser)</span>;
      case 'TL':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Team Lead (TL)</span>;
      case 'HR':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><User className="w-3.5 h-3.5" /> HR Recruiter</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
            LeadFlow <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">HR v2.0</span>
          </h1>
          <p className="text-xs text-slate-400">Omnichannel HR Lead Management & Automated Pipeline</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {(user.role === 'Admin' || user.role === 'TL') && (
              <>
                <button
                  onClick={onOpenUpload}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Ingest Files (PDF/Excel/OCR)
                </button>
                <button
                  onClick={onOpenManual}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  + Add Lead
                </button>
              </>
            )}

            {user.role === 'Admin' && (
              <button
                onClick={onOpenTeam}
                className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" /> Manage Team
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white flex items-center justify-end gap-1.5">
                {user.name}
              </div>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
