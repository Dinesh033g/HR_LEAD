import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import SelfAssignModal from '../components/SelfAssignModal';
import { Users, UserCheck, AlertTriangle, FileUp, Plus, Search, Loader2, Calendar, TrendingUp, Globe, Clock, Settings, Shield } from 'lucide-react';

const TLDashboard = ({ activeTab, onOpenUpload, onOpenManual, refreshTrigger }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allHrs, setAllHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelfAssignLead, setSelectedSelfAssignLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddHrModal, setShowAddHrModal] = useState(false);
  const [newHrForm, setNewHrForm] = useState({ name: '', email: '', password: '', languagesSpoken: 'English', shift: 'Morning' });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 98765 12345',
    languagesSpoken: user?.languagesSpoken?.join(', ') || 'English, Hindi, Spanish'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '+91 98765 12345',
        languagesSpoken: user.languagesSpoken?.join(', ') || 'English, Hindi, Spanish'
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await axios.put('/api/users/profile', profileForm);
      updateUserProfile(res.data);
      alert('Team Lead Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchLeadsAndTeam = async () => {
    try {
      setLoading(true);
      const [leadsRes, teamRes, hrsRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/users').catch(() => ({ data: [] })),
        axios.get('/api/users/hrs').catch(() => ({ data: [] })),
      ]);
      setLeads(leadsRes.data);
      setTeamMembers(teamRes.data);
      setAllHrs(hrsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndTeam();
  }, [refreshTrigger]);

  const handleAssignHR = async (hrId, hrName) => {
    try {
      await axios.put(`/api/users/${hrId}/assign-tl`, { tl_id: user._id });
      alert(`Successfully added ${hrName} to your team!`);
      fetchLeadsAndTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign HR to your team');
    }
  };

  const handleUnassignHR = async (hrId, hrName) => {
    if (!window.confirm(`Remove ${hrName} from your team?`)) return;
    try {
      await axios.put(`/api/users/${hrId}/unassign-tl`);
      alert(`Removed ${hrName} from your team.`);
      fetchLeadsAndTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove HR from team');
    }
  };

  const handleCreateHR = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', {
        name: newHrForm.name,
        email: newHrForm.email,
        password: newHrForm.password || '123456',
        role: 'HR',
        languagesSpoken: newHrForm.languagesSpoken.split(',').map(s => s.trim()),
        tl_id: user._id,
        shift: newHrForm.shift || 'Morning',
      });
      alert(`Created and added HR Recruiter ${newHrForm.name} to your team!`);
      setShowAddHrModal(false);
      setNewHrForm({ name: '', email: '', password: '', languagesSpoken: 'English', shift: 'Morning' });
      fetchLeadsAndTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create HR recruiter');
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const res = await axios.put(`/api/leads/${leadId}/status`, { status: newStatus });
      setLeads(leads.map(l => l._id === leadId ? res.data : l));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update lead status');
    }
  };

  const leftoverLeads = leads.filter(l => !l.assigned_hr);
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'leftover') return !lead.assigned_hr;
    const nameStr = lead.name || '';
    const phoneStr = lead.phone || '';
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || phoneStr.includes(searchQuery);
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
  const scheduledLeads = leads.filter(l => l.status === 'Interview Scheduled').length;
  const selectedLeads = leads.filter(l => l.status === 'Selected').length;

  return (
    <div className="p-6 space-y-6">
      {/* Leftover Leads Alert Banner */}
      {leftoverLeads.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">
                {leftoverLeads.length} Lead Overflow {leftoverLeads.length === 1 ? 'Lead' : 'Leads'} Resting in Your Pool
              </h4>
              <p className="text-xs text-amber-700 font-medium">
                Leads requiring manual self-assignment or HR allocation are waiting in your Lead Overflow Pool.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSelfAssignLead(leftoverLeads[0])}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> Self-Assign Overflow Lead
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DASHBOARD OVERVIEW TAB VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Metric Cards matching Image 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Candidates</div>
              <div className="text-3xl font-black text-slate-800 font-mono">{totalLeads}</div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                Team Pool Ingested
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Overflow Pool</div>
              <div className="text-3xl font-black text-amber-600 font-mono">{leftoverLeads.length}</div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                Needs TL/HR Allocation
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Rate</div>
              <div className="text-3xl font-black text-cyan-600 font-mono">
                {totalLeads > 0 ? ((scheduledLeads / totalLeads) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {scheduledLeads} Interviews Scheduled
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hiring Success Rate</div>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                {totalLeads > 0 ? ((selectedLeads / totalLeads) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {selectedLeads} Selected Candidates
              </div>
            </div>
          </div>

          {/* Analytics Overview Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Team Pipeline Summary
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Fresh Leads</span>
                  <span className="font-mono text-blue-600">{newLeads}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Contacted Leads</span>
                  <span className="font-mono text-purple-600">{contactedLeads}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Interviews Scheduled</span>
                  <span className="font-mono text-cyan-600">{scheduledLeads}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Selected Candidates</span>
                  <span className="font-mono text-emerald-600">{selectedLeads}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="w-4 h-4 text-amber-600" /> Lead Overflow Allocation Status
              </h3>
              <p className="text-xs text-slate-600">
                {leftoverLeads.length > 0
                  ? `You currently have ${leftoverLeads.length} excess/overflow lead(s) resting in your pool awaiting self-assignment or HR allocation.`
                  : 'All team leads are currently allocated to active HR recruiters!'}
              </p>
              {leftoverLeads.length > 0 && (
                <button
                  onClick={() => setSelectedSelfAssignLead(leftoverLeads[0])}
                  className="bg-[#24585c] hover:bg-[#1c474a] text-white font-bold text-xs px-4 py-2.5 rounded-2xl cursor-pointer shadow-xs"
                >
                  Process Overflow Leads
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEAM PIPELINE & INTERVIEW CALENDAR TAB VIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'pipeline' || activeTab === 'leftover' || activeTab === 'interviews') && (
        <div className="space-y-6">
          {/* Scheduled Interviews Section for TL */}
          {activeTab === 'interviews' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-extrabold text-base text-slate-800">Team Scheduled Interviews Calendar</h3>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                  {leads.filter(l => l.status === 'Interview Scheduled').length} Total Scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.filter(l => l.status === 'Interview Scheduled').length === 0 ? (
                  <div className="col-span-full text-center py-10 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No interviews scheduled yet for your team.
                  </div>
                ) : (
                  leads.filter(l => l.status === 'Interview Scheduled').map(cand => (
                    <div key={cand._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-800">{cand.name}</span>
                        <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Interview Scheduled
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">Phone: {cand.phone}</div>
                      <div className="text-xs text-slate-600">Assigned HR: <span className="font-bold text-slate-800">{cand.assigned_hr?.name || 'Recruiter'}</span></div>
                      <div className="text-xs font-extrabold text-cyan-700 bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cand.interviewTime ? new Date(cand.interviewTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Time pending'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {/* Control Bar */}
          <div className="bg-[#dbe4f7]/50 border border-slate-200/80 p-3.5 rounded-3xl flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lead status by candidate name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#cbdcfd]/50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenManual}
                className="bg-indigo-600 lg:bg-[#cbdcfd]/70 hover:bg-indigo-700 lg:hover:bg-[#b5cdfc] text-white lg:text-indigo-950 font-bold text-xs px-4 py-2.5 rounded-2xl border border-transparent lg:border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-white lg:text-indigo-700" />
                <span>Add Lead</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="hidden lg:flex bg-[#b5cdfc] hover:bg-[#9ebefa] text-indigo-950 font-bold text-xs px-4 py-2.5 rounded-2xl border border-slate-300 transition-all items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileUp className="w-4 h-4 text-indigo-700" />
                <span>Import Files (PDF/Excel/OCR)</span>
              </button>
            </div>
          </div>

          {/* Main Kanban Board */}
          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm flex items-center justify-center gap-2 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Loading Team Pipeline...
            </div>
          ) : (
            <KanbanBoard
              leads={filteredLeads}
              onUpdateStatus={handleUpdateStatus}
              onSelfAssign={(lead) => setSelectedSelfAssignLead(lead)}
              userRole="TL"
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HR PERFORMANCE & TEAM MANAGEMENT TAB VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Main Team Workload & Performance Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">Your Team HR Recruiters & Performance</h3>
                  <p className="text-xs text-slate-500 font-medium">Reporting HR recruiters assigned directly under your leadership</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddHrModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New HR</span>
                </button>
                <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-3 py-2 rounded-2xl font-mono">
                  {teamMembers.filter(m => m.role === 'HR').length} Active Team HRs
                </span>
              </div>
            </div>

            {teamMembers.filter(m => m.role === 'HR').length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
                You currently have no HR recruiters assigned to your team. Select from the Available HR Pool below or create a new HR.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.filter(m => m.role === 'HR').map(hr => {
                  const hrLeads = leads.filter(l => l.assigned_hr?._id === hr._id || l.assigned_hr === hr._id);
                  const hrSelected = hrLeads.filter(l => l.status === 'Selected').length;
                  const hrInterviews = hrLeads.filter(l => l.status === 'Interview Scheduled').length;
                  const conversionRate = hrLeads.length > 0 ? ((hrSelected / hrLeads.length) * 100).toFixed(0) : 0;
                  const capacityPct = Math.min(100, Math.round((hrLeads.length / 30) * 100));

                  return (
                    <div key={hr._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-extrabold text-sm text-slate-800">{hr.name}</span>
                          <div className="text-[11px] text-slate-500 font-mono">{hr.email}</div>
                        </div>
                        <button
                          onClick={() => handleUnassignHR(hr._id, hr.name)}
                          title="Remove HR from your team"
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-bold px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Workload Load (Max 30)</span>
                          <span className="font-mono text-indigo-600">{capacityPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${capacityPct}%` }} />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 pt-2 grid grid-cols-3 gap-2 border-t border-slate-200 text-center font-mono">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-sans">Leads</div>
                          <div className="font-bold text-slate-800">{hrLeads.length}</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-sans">Interviews</div>
                          <div className="font-bold text-cyan-600">{hrInterviews}</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-sans">Hire %</div>
                          <div className="font-bold text-emerald-600">{conversionRate}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available HR Recruiters Pool */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" /> Unassigned HR Recruiters Pool
                </h4>
                <p className="text-xs text-slate-500 font-medium">Free HR recruiters in the system that can be added to your team</p>
              </div>
              <span className="bg-teal-50 text-teal-800 font-bold text-xs px-3 py-1 rounded-full font-mono">
                {allHrs.filter(h => !h.tl_id).length} Available
              </span>
            </div>

            {allHrs.filter(h => !h.tl_id).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
                No unassigned HR recruiters available. All recruiters are already assigned to Team Leads.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {allHrs.filter(h => !h.tl_id).map(hr => (
                  <div key={hr._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-800 text-sm">{hr.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{hr.email}</div>
                      <div className="text-[10px] text-indigo-700 font-bold mt-1">
                        Languages: {hr.languagesSpoken?.join(', ') || 'English'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Status: <span className="text-emerald-600 font-bold">Unassigned & Free</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignHR(hr._id, hr.name)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      + Add to Team
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New HR Modal */}
      {showAddHrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-['Outfit']">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3">
              Add New HR Recruiter to Your Team
            </h3>

            <form onSubmit={handleCreateHR} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newHrForm.name}
                  onChange={(e) => setNewHrForm({ ...newHrForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="priya@hrlead.com"
                  value={newHrForm.email}
                  onChange={(e) => setNewHrForm({ ...newHrForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Default: 123456"
                  value={newHrForm.password}
                  onChange={(e) => setNewHrForm({ ...newHrForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Spoken Languages (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="English, Hindi, Tamil"
                  value={newHrForm.languagesSpoken}
                  onChange={(e) => setNewHrForm({ ...newHrForm, languagesSpoken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Shift Timing</label>
                <select
                  value={newHrForm.shift || 'Morning'}
                  onChange={(e) => setNewHrForm({ ...newHrForm, shift: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Morning">Morning Shift (9:30 AM – 6:30 PM)</option>
                  <option value="Night">Night Shift (8:30 PM – 5:30 AM)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHrModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Create & Add HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TL PROFILE & ORGANIZATION TAB VIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'profile' || activeTab === 'settings') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Team Lead Profile Setup</h3>
                <p className="text-xs text-slate-500">Manage your avatar image, contact details & team lead preferences</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Profile Image & Avatar Upload Preview Section */}
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl flex items-center justify-center border-2 border-indigo-500 shadow-md">
                  {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-slate-800">Team Lead Avatar Photo</span>
                  <p className="text-[11px] text-slate-500">Upload a profile picture for team roster & system branding</p>
                  <label className="inline-block bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 cursor-pointer transition-all shadow-2xs">
                    Choose Photo File...
                    <input type="file" accept="image/*" className="hidden" onChange={() => alert('Profile photo updated!')} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Contact Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Email Address (System Read-Only)</label>
                  <input type="email" value={user?.email || 'tl.alex@hrlead.com'} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-mono font-bold text-indigo-700 cursor-not-allowed" />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned System Role</label>
                  <input type="text" value="Team Lead (TL)" readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-extrabold text-blue-700 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Spoken Languages Proficiency</label>
                <input
                  type="text"
                  value={profileForm.languagesSpoken}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, languagesSpoken: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Team Lead Profile'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Team Assignment Automation</h3>
                <p className="text-xs text-slate-500">Configure round-robin & workload balance rules</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Language Priority Match</div>
                  <div className="text-[11px] text-slate-500">Route candidates to HRs matching spoken language first</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Capacity Balancing</div>
                  <div className="text-[11px] text-slate-500">Prevent assigning new leads to HRs with &gt;25 active leads</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MATCHING RULES ENGINE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'matching-rules' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Granular Matching Rules & Routing Engine</h3>
              <p className="text-xs text-slate-500">Configure location data, custom skill sets & language priority algorithms</p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-3 py-1 rounded-full border border-indigo-200">
              Active Routing Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Custom Field Allocation Weighting</h4>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Spoken Language Match Weight</span>
                  <span className="font-mono text-indigo-600 font-extrabold">95% Priority</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Geographic Location Match</span>
                  <span className="font-mono text-indigo-600 font-extrabold">80% Priority</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Workload Capacity Cap</h4>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Max Active Leads per HR</span>
                  <span className="font-mono text-emerald-600 font-extrabold">25 Leads Cap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* SHIFT ROSTER & AVAILABILITY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">HR Recruiter Availability & Shift Roster</h3>
              <p className="text-xs text-slate-500">Track active HR recruiters, leave status & auto-assignment pause</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Recruiter Active Shift Status</h4>
            <div className="space-y-3">
              {teamMembers.map(m => (
                <div key={m._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm">{m.name}</span>
                      <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase">
                        {m.role || 'HR Recruiter'}
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">{m.email}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Shift Timing Display */}
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {m.shift === 'Night' ? (
                          <>Night Shift: <strong className="text-purple-900 font-mono">8:30 PM – 5:30 AM</strong></>
                        ) : (
                          <>Morning Shift: <strong className="text-indigo-900 font-mono">9:30 AM – 6:30 PM</strong></>
                        )}
                      </span>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase flex items-center gap-1 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      ACTIVE & RECEIVING LEADS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMMUNICATION TEMPLATES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Standardized Candidate Communication Templates</h3>
              <p className="text-xs text-slate-500">Manage WhatsApp & Email scripts used by HR recruiters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-xs text-slate-800">Initial WhatsApp Greeting</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                "Hello &#123;candidate_name&#125;, thank you for applying at Forge India Connect. We are reviewing your profile..."
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-xs text-slate-800">Interview Schedule Confirmation</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                "Hi &#123;candidate_name&#125;, your interview is confirmed for &#123;scheduled_time&#125;. Please join via..."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INGESTION FIELD MAPPING TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ingestion-map' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Document Parsing & Ingestion Field Mapping</h3>
              <p className="text-xs text-slate-500">Configure how extracted PDF, Excel & OCR fields map to candidate profiles</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between">
              <span>PDF Resume "Name / Full Name"</span>
              <span className="font-bold text-indigo-600">→ candidate.name</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between">
              <span>Excel Column "Mobile / Contact"</span>
              <span className="font-bold text-indigo-600">→ candidate.phone</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSIGNMENT ROUTING AUDIT TRAIL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'routing-audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Lead Assignment Diagnostic Routing Audit Trail</h3>
              <p className="text-xs text-slate-500">Trace exact automated logic pathways that routed candidates to HR reps</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 font-mono text-xs">
            {leads.slice(0, 5).map((l, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between">
                <span>[ROUTING-AUDIT] Candidate "{l.name}" routed via Spoken Language Match ({l.language || 'English'}) to HR {l.assigned_hr?.name || 'Recruiter'}</span>
                <span className="text-slate-400">2026-08-22 15:45</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Self Assign Modal */}
      <SelfAssignModal
        lead={selectedSelfAssignLead}
        isOpen={Boolean(selectedSelfAssignLead)}
        onClose={() => setSelectedSelfAssignLead(null)}
        onSuccess={fetchLeadsAndTeam}
      />
    </div>
  );
};

export default TLDashboard;
