import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FileUp, Plus, Bell, HelpCircle, User, LogOut, Menu } from 'lucide-react';

const Header = ({ title, onOpenUpload, onOpenManual, onOpenTeam, onOpenHelp, onLogout, onNavigateProfile, onToggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const getRoleTitleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'Admin':
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">SUPER ADMIN</span>;
      case 'TL':
        return <span className="bg-[#dbe7fd] text-blue-900 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border border-blue-200">TEAM LEAD</span>;
      case 'HR':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">HR RECRUITER</span>;
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DK';
    const clean = name.replace(/\s*\((HR|TL|Admin)\)/gi, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  };

  return (
    <header className="px-4 sm:px-8 py-3.5 sm:py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200/60 bg-[#f4f7fe] gap-3">
      {/* Page Title with Mobile Hamburger Toggle & Title Badge */}
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu Toggle Button for Mobile */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-800 hover:bg-slate-200/60 bg-white rounded-xl border border-slate-200 cursor-pointer shadow-2xs"
            title="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-['Outfit']">{title || 'Executive Control Center'}</h2>
        </div>

        {user?.role === 'TL' ? (
          <span className="bg-[#dbe7fd] text-indigo-900 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border border-indigo-200">TEAM LEAD</span>
        ) : (
          getRoleTitleBadge()
        )}
      </div>

      {/* Action Buttons & User Profile (Hidden on mobile or simplified) */}
      <div className="hidden lg:flex items-center gap-3">
        {(user?.role === 'Admin' || user?.role === 'TL') && (
          <>
            {/* Dark teal filled button for Ingest Files */}
            <button
              onClick={onOpenUpload}
              className="bg-[#24585c] hover:bg-[#1c474a] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-white" />
              <span>Ingest Files (PDF/Excel/OCR)</span>
            </button>

            {/* Soft ice blue pill button for Add Lead */}
            <button
              onClick={onOpenManual}
              className="bg-[#dbe4f7] hover:bg-[#d0ddf5] text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-700" />
              <span>Add Lead</span>
            </button>
          </>
        )}

        <div className="h-6 w-px bg-slate-300 mx-1" />

        {/* Bell & Help Icons */}
        <button className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-2xs">
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenHelp}
          title="Open Help Center & FAQ"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-2xs"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Top Header Logout Action Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log Out of HR System"
            className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 cursor-pointer shadow-2xs transition-colors flex items-center gap-1 text-xs font-bold px-3"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-300 mx-1" />

        {/* User Info & Avatar (Clicking navigates to Profile tab) */}
        <button
          onClick={onNavigateProfile}
          title="View Profile & Company Details"
          className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-200/50 transition-all cursor-pointer text-left"
        >
          <div className="text-right">
            <div className="text-xs font-extrabold text-slate-800 leading-tight">
              {user?.name ? user.name.replace(/\s*\((HR|TL|Admin)\)/gi, '').trim() : 'User'}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              {user?.role === 'Admin' ? 'Super Admin' : user?.role === 'TL' ? 'Team Lead (TL)' : 'HR Recruiter'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-300 shadow-xs group-hover:bg-indigo-600 transition-colors">
            {user?.name ? user.name.replace(/\s*\((HR|TL|Admin)\)/gi, '').trim().charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
