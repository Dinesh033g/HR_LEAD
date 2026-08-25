import React from 'react';
import { 
  LayoutGrid, 
  GitPullRequest, 
  Users, 
  BarChart3, 
  User, 
  HelpCircle, 
  LogOut, 
  AlertTriangle, 
  Calendar, 
  History,
  MessageSquare,
  Send,
  FileCheck,
  Zap,
  Boxes,
  ShieldCheck,
  Clock,
  Sparkles,
  Building,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, userRole, onLogout, onOpenHelp, isOpen, onClose }) => {

  const getMenuItems = () => {
    switch (userRole) {
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, category: 'Core' },
          { id: 'pipeline', label: 'Lead status', icon: GitPullRequest, category: 'Core' },
          { id: 'interviews', label: 'Interview Calendar', icon: Calendar, category: 'Operations' },
          { id: 'doc-hub', label: 'Document & Ingestion Hub', icon: FileCheck, category: 'Operations' },
          { id: 'team', label: 'Manage Employees', icon: Users, category: 'Team' },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, category: 'Analytics' },
          { id: 'workflows', label: 'Automation & Workflows', icon: Zap, category: 'System' },
          { id: 'integrations', label: 'Integrations & API', icon: Boxes, category: 'System' },
          { id: 'audit-logs', label: 'System Audit Logs', icon: ShieldCheck, category: 'System' },
          { id: 'profile', label: 'Company Profile', icon: Building, category: 'System' },
        ];
      case 'TL':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, category: 'Core' },
          { id: 'pipeline', label: 'Lead Status', icon: GitPullRequest, category: 'Core' },
          { id: 'interviews', label: 'Interview Calendar', icon: Calendar, category: 'Operations' },
          { id: 'leftover', label: 'Lead Overflow Pool', icon: AlertTriangle, category: 'Operations' },
          { id: 'roster', label: 'Shift Roster & Availability', icon: Clock, category: 'Team & Roster' },
          { id: 'performance', label: 'HR Performance', icon: Users, category: 'Team & Roster' },
          { id: 'matching-rules', label: 'Matching Rules Engine', icon: Zap, category: 'Automation & Logic' },
          { id: 'templates', label: 'Communication Templates', icon: MessageSquare, category: 'Engagement' },
          { id: 'ingestion-map', label: 'Ingestion Field Mapping', icon: FileCheck, category: 'Data Control' },
          { id: 'routing-audit', label: 'Assignment Audit Trail', icon: ShieldCheck, category: 'Data Control' },
          { id: 'profile', label: 'Profile & Organization', icon: User, category: 'System' },
        ];
      case 'HR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
          { id: 'pipeline', label: 'Assigned Leads', icon: GitPullRequest },
          { id: 'interviews', label: 'Scheduled Interviews', icon: Calendar },
          { id: 'activity', label: 'Activity Audit', icon: History },
          { id: 'profile', label: 'Recruiter Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`w-64 border-r border-white/10 h-screen fixed lg:sticky top-0 left-0 z-50 flex flex-col justify-between p-5 select-none text-slate-100 shadow-2xl overflow-y-auto aura-sidebar-bg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 hidden lg:flex'
        }`}
      >
        {/* Decorative Aura Blend Layers */}
        <div className="aura-sidebar-layer-1" aria-hidden="true" />
        <div className="aura-sidebar-layer-2" aria-hidden="true" />
        <div className="aura-sidebar-layer-3" aria-hidden="true" />

        {/* Content wrapper sitting above absolute layers */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Brand Header with Forge India Connect Logo */}
          <div>
            <div className="flex items-center justify-between mb-6 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-amber-500/20 border border-amber-300 shrink-0">
                  <img src="/forge_logo.jpg" alt="Forge India Connect Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <h1 className="font-extrabold text-base text-white tracking-tight leading-tight font-['Outfit'] drop-shadow-sm">
                  Forge India
                </h1>
              </div>

              {/* Close Button for Mobile Screens */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Navigation Items */}
            <nav className="space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/25 text-white font-extrabold shadow-lg backdrop-blur-md border border-white/30'
                        : 'text-slate-200/80 hover:text-white hover:bg-white/15 font-bold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Footer Section */}
          <div className="space-y-1.5 pt-6 border-t border-white/15">
            <button
              onClick={() => {
                onOpenHelp();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-200/80 hover:bg-white/15 hover:text-white font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-300" />
              <span>Help Center</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-200/80 hover:text-rose-300 hover:bg-rose-500/20 font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
