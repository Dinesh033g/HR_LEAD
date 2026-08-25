import React, { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TLDashboard from './pages/TLDashboard';
import HRDashboard from './pages/HRDashboard';
import FileUploadModal from './components/FileUploadModal';
import ManualLeadModal from './components/ManualLeadModal';
import TeamManagementModal from './components/TeamManagementModal';
import HelpCenterModal from './components/HelpCenterModal';
import { Loader2 } from 'lucide-react';

const MainApp = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenTeam = () => {
    setIsTeamOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center text-slate-500 text-sm gap-2 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> Initializing HR Lead System...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Control Center';
      case 'pipeline':
        return 'Omnichannel Leads Pipeline';
      case 'inbox':
        return 'Omnichannel Messaging Inbox';
      case 'campaigns':
        return 'Candidate Outreach Campaigns';
      case 'interviews':
        return 'Interview Calendar & Scheduling';
      case 'doc-hub':
        return 'Document & Parsing Ingestion Hub';
      case 'team':
        return 'Employee & Recruiter Roster';
      case 'reports':
      case 'performance':
        return 'Reports & Performance Analytics';
      case 'workflows':
        return 'Automation & Auto-Routing Workflows';
      case 'integrations':
        return 'Integrations & API Marketplace';
      case 'audit-logs':
      case 'matching-rules':
        return 'Matching Rules & Capacity Engine';
      case 'roster':
        return 'HR Recruiter Shift Roster & Availability';
      case 'templates':
        return 'Standardized Outreach Communication Templates';
      case 'ingestion-map':
        return 'Ingestion Parsing & Field Mapping';
      case 'routing-audit':
        return 'Lead Assignment Routing Audit Trail';
      case 'profile':
        return 'Company & User Profile Setup';
      case 'leftover':
        return 'Leftover Candidate Leads Pool';
      case 'settings':
        return 'System Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f4f7fe] text-slate-800">
      {/* Dynamic Role-Based Sidebar with Mobile Overlay Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'team') setIsTeamOpen(true);
        }}
        userRole={user.role}
        onLogout={logout}
        onOpenHelp={() => setIsHelpOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area with Mint Cloud Aura background */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden aura-bg relative">
        <div className="aura-layer-1" aria-hidden="true" />
        <div className="aura-layer-2" aria-hidden="true" />
        <div className="aura-layer-3" aria-hidden="true" />
        
        <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            title={getHeaderTitle()}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenTeam={handleOpenTeam}
            onOpenHelp={() => setIsHelpOpen(true)}
            onLogout={logout}
            onNavigateProfile={() => setActiveTab('profile')}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          />

          <main className="flex-1 overflow-y-auto">
            {user.role === 'Admin' && (
              <AdminDashboard
                activeTab={activeTab}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenManual={() => setIsManualOpen(true)}
                onOpenTeam={handleOpenTeam}
                refreshTrigger={refreshTrigger}
              />
            )}
            {user.role === 'TL' && (
              <TLDashboard
                activeTab={activeTab}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenManual={() => setIsManualOpen(true)}
                onOpenTeam={handleOpenTeam}
                refreshTrigger={refreshTrigger}
              />
            )}
            {user.role === 'HR' && (
              <HRDashboard activeTab={activeTab} />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleRefresh}
      />
      <ManualLeadModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={handleRefresh}
      />
      <TeamManagementModal
        isOpen={isTeamOpen}
        onClose={() => setIsTeamOpen(false)}
        onRefresh={handleRefresh}
      />
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
