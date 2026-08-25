import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import { Users, PhoneCall, Calendar, CheckCircle2, Globe, Search, Loader2, TrendingUp, Clock, History, Settings, Shield, User, MessageSquare, Send } from 'lucide-react';

const HRDashboard = ({ activeTab }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    languagesSpoken: user?.languagesSpoken?.join(', ') || 'Hindi, English, Tamil'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [editingInterviewLead, setEditingInterviewLead] = useState(null);
  const [editInterviewDateTime, setEditInterviewDateTime] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '+91 98765 43210',
        languagesSpoken: user.languagesSpoken?.join(', ') || 'Hindi, English, Tamil'
      });
    }
  }, [user]);

  const handleUpdateInterviewTimeSubmit = async (e) => {
    e.preventDefault();
    if (!editInterviewDateTime) {
      alert('Please select date and time for the interview');
      return;
    }
    const leadToUpdate = editingInterviewLead;
    const timeToSet = editInterviewDateTime;
    try {
      setLeads(prevLeads => prevLeads.map(l => l._id === leadToUpdate._id ? { ...l, interviewTime: timeToSet } : l));
      await handleUpdateStatus(
        leadToUpdate._id,
        'Interview Scheduled',
        `Interview date & time updated to: ${new Date(timeToSet).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}`,
        timeToSet
      );
      setEditingInterviewLead(null);
      setEditInterviewDateTime('');
      alert('Interview Date & Time saved successfully!');
    } catch (err) {
      fetchLeads();
      alert('Failed to update interview date & time');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await axios.put('/api/users/profile', profileForm);
      updateUserProfile(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leads');
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (leadId, newStatus, note, interviewTime) => {
    try {
      await axios.put(`/api/leads/${leadId}/status`, { status: newStatus, note, interviewTime });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update lead status');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'interviews') return lead.status === 'Interview Scheduled';
    return lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery);
  });

  const totalAssigned = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedCount = leads.filter(l => l.status !== 'New').length;
  const interviewsCount = leads.filter(l => l.status === 'Interview Scheduled').length;
  const selectedCount = leads.filter(l => l.status === 'Selected').length;

  // Audit activity trail for HR's candidates
  const activityLogs = [];
  leads.forEach(l => {
    if (l.history) {
      l.history.forEach(h => {
        activityLogs.push({
          candidateName: l.name,
          phone: l.phone,
          status: h.status,
          note: h.note,
          timestamp: new Date(h.timestamp),
          updatedBy: h.updatedBy?.name || user?.name || 'Recruiter',
        });
      });
    }
  });
  activityLogs.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. DASHBOARD OVERVIEW TAB VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Metric Cards matching Image */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Candidates</div>
              <div className="text-3xl font-black text-slate-800 font-mono">{totalAssigned}</div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                Assigned Recruiter Pool
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Rate</div>
              <div className="text-3xl font-black text-purple-600 font-mono">
                {totalAssigned > 0 ? ((contactedCount / totalAssigned) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {contactedCount} Candidates Contacted
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Rate</div>
              <div className="text-3xl font-black text-cyan-600 font-mono">
                {totalAssigned > 0 ? ((interviewsCount / totalAssigned) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {interviewsCount} Interviews Scheduled
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hiring Success Rate</div>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                {totalAssigned > 0 ? ((selectedCount / totalAssigned) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {selectedCount} Selected Candidates
              </div>
            </div>
          </div>

          {/* Recruiter Overview Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Progress Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Your Candidate Progress Summary
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Fresh Uncontacted</span>
                  <span className="font-mono text-blue-600">{newLeads}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Contacted / In Progress</span>
                  <span className="font-mono text-purple-600">{contactedCount}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Interviews Scheduled</span>
                  <span className="font-mono text-cyan-600">{interviewsCount}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Successfully Selected</span>
                  <span className="font-mono text-emerald-600">{selectedCount}</span>
                </div>
              </div>
            </div>

            {/* Daily Target & Call Goal Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" /> Daily Outreach Goal
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {totalAssigned > 0 ? Math.min(100, Math.round((contactedCount / totalAssigned) * 100)) : 0}% Completed
                </span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Calls Completed Today</span>
                  <span className="font-mono text-emerald-600">{contactedCount} / {totalAssigned || 25} Calls</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${totalAssigned > 0 ? Math.min(100, (contactedCount / totalAssigned) * 100) : 0}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Target: {totalAssigned || 25} assigned candidate outreach calls. Keep up the high velocity!
                </p>
              </div>
            </div>

            {/* Language Routing Profile */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="w-4 h-4 text-teal-600" /> Language Routing Profile
              </h3>
              <p className="text-xs text-slate-600">
                You are registered to receive leads matching your language skills:
              </p>
              <div className="inline-block bg-indigo-100 text-indigo-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-indigo-200 font-mono">
                {user?.languagesSpoken?.join(', ') || 'English'}
              </div>
            </div>
          </div>

          {/* Pending Follow-up Action Items */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Action Items & Priority Follow-ups
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">3 Tasks Pending</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl space-y-1">
                <div className="flex justify-between font-bold text-amber-900">
                  <span>Resume Review</span>
                  <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded font-mono">Urgent</span>
                </div>
                <p className="text-amber-800">Review updated CV for candidate Aarav Patel before technical interview.</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl space-y-1">
                <div className="flex justify-between font-bold text-blue-900">
                  <span>Schedule Round 2</span>
                  <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded font-mono">Medium</span>
                </div>
                <p className="text-blue-800">Confirm availability for Sneha Desai with Team Lead Alex Johnson.</p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Offer Letter Audit</span>
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">Completed</span>
                </div>
                <p className="text-emerald-800">Offer letter signed and verified for candidate Rahul Verma.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RECRUITER PIPELINE & INTERVIEWS TAB VIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'pipeline' || activeTab === 'interviews') && (
        <div className="space-y-6">
          {/* Scheduled Interviews Detailed Cards Grid when activeTab === 'interviews' */}
          {activeTab === 'interviews' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-extrabold text-base text-slate-800">Upcoming Scheduled Candidate Interviews</h3>
                </div>
                <span className="bg-cyan-100 text-cyan-800 font-extrabold text-xs px-3 py-1 rounded-full font-mono">
                  {interviewsCount} Confirmed Sessions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {leads.filter(l => l.status === 'Interview Scheduled').length === 0 ? (
                  <div className="col-span-full text-center py-10 text-slate-400 italic">No interviews scheduled at this time.</div>
                ) : (
                  leads.filter(l => l.status === 'Interview Scheduled').map((cand, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{cand.name}</h4>
                          <p className="text-slate-500 font-mono text-[11px]">{cand.phone}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Scheduled</span>
                      </div>

                      <div className="p-3 bg-cyan-50/80 border border-cyan-200/80 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-cyan-900 flex items-center justify-between">
                          <span>Interview Schedule Time:</span>
                          <Clock className="w-3.5 h-3.5 text-cyan-700" />
                        </div>
                        <p className="text-xs font-mono font-extrabold text-indigo-900">
                          {cand.interviewTime ? (
                            isNaN(new Date(cand.interviewTime).getTime()) 
                              ? cand.interviewTime 
                              : new Date(cand.interviewTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
                          ) : 'Not set (Select below)'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setEditingInterviewLead(cand);
                            setEditInterviewDateTime(cand.interviewTime || '');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{cand.interviewTime ? 'Reschedule Time' : 'Set Date & Time'}</span>
                        </button>

                        <span className="text-indigo-600 font-bold text-[11px] underline cursor-pointer hover:text-indigo-800">
                          Join Meet
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Control Bar */}
          <div className="bg-[#dbe4f7]/50 border border-slate-200/80 p-3.5 rounded-3xl flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search your assigned candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#cbdcfd]/50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div className="text-xs text-slate-600 font-semibold px-3.5 py-2 bg-[#cbdcfd]/60 rounded-2xl border border-slate-300">
              Language Matching: <span className="text-indigo-800 font-bold">{user?.languagesSpoken?.join(', ') || 'English'}</span>
            </div>
          </div>

          {/* Recruiter Kanban Board */}
          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm flex items-center justify-center gap-2 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Loading Candidate Pipeline...
            </div>
          ) : (
            <KanbanBoard
              leads={filteredLeads}
              onUpdateStatus={handleUpdateStatus}
              userRole="HR"
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 OMNICHANNEL MESSAGING INBOX TAB VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Conversation List Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> Active Candidate Chats
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  WhatsApp Live
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter candidate chats..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {leads.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">No assigned candidate conversations yet</div>
              ) : (
                leads.slice(0, 6).map((cand, i) => (
                  <div key={cand._id || i} className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${i === 0 ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'}`}>
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {cand.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-extrabold text-xs text-slate-800 truncate">{cand.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">15:42</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {i === 0 ? 'Thank you! I will join the interview call.' : `Interested in ${cand.language || 'English'} speaking role.`}
                      </p>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded mt-1">
                        {cand.source || 'WhatsApp'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Window Area */}
          <div className="flex-1 flex flex-col bg-white">
            {leads.length > 0 ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center">
                      {leads[0].name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">{leads[0].name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{leads[0].phone} • Language: {leads[0].language || 'English'}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                    Stage: {leads[0].status}
                  </span>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20 text-xs">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl max-w-md border border-slate-200">
                      Hi, I submitted my resume via WhatsApp for the position.
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono pl-1">Candidate • 15:30</span>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl max-w-md shadow-xs font-medium">
                      Hello {leads[0].name}! We have received your application. Would you be available for an interview call today?
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono pr-1">Recruiter ({user?.name}) • 15:35</span>
                  </div>

                  <div className="flex flex-col items-start space-y-1">
                    <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl max-w-md border border-slate-200">
                      Yes, I am available. Please send me the details.
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono pl-1">Candidate • 15:42</span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type candidate reply (WhatsApp / SMS)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                  <button
                    onClick={() => alert('Message sent to candidate!')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic">Select a candidate conversation</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVITY AUDIT TAB VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Recruiter Activity & Audit Log</h3>
                <p className="text-xs text-slate-500">History of candidate updates and status transitions</p>
              </div>
            </div>
            <span className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1.5 rounded-full font-mono">
              {activityLogs.length} Total Logs
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 italic">No activity recorded yet</div>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                      <span>{log.candidateName}</span>
                      <span className="text-slate-400 text-xs font-mono font-normal">({log.phone})</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.note || 'Status updated'}</p>
                    <div className="text-[11px] text-slate-400">
                      Updated by: <span className="font-semibold text-slate-700">{log.updatedBy}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="bg-indigo-100 text-indigo-700 font-extrabold text-xs px-3 py-1 rounded-full inline-block">
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECRUITER PROFILE TAB VIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'profile' || activeTab === 'settings') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">HR Recruiter Personal Profile Setup</h3>
                <p className="text-xs text-slate-500">Manage your avatar image, contact phone, full name and spoken languages</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Profile Image & Avatar Upload Preview Section */}
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl flex items-center justify-center border-2 border-indigo-500 shadow-md">
                  {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'H'}
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-slate-800">Recruiter Avatar Photo</span>
                  <p className="text-[11px] text-slate-500">Upload a profile picture for candidate communication branding</p>
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
                  <input type="email" value={user?.email || 'hr.rohan@hrlead.com'} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-mono font-bold text-indigo-700 cursor-not-allowed" />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned System Role</label>
                  <input type="text" value="HR Recruiter" readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-extrabold text-emerald-700 cursor-not-allowed" />
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
                  {savingProfile ? 'Saving...' : 'Save Recruiter Profile'}
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
                <h3 className="font-extrabold text-base text-slate-800">Recruiter Capacity & Notifications</h3>
                <p className="text-xs text-slate-500">Configure daily outreach targets and alerts</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Daily Target Outreach Limit</label>
                <input type="number" defaultValue={25} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs font-bold" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Max Active Pipeline Capacity</label>
                <input type="number" defaultValue={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs font-bold" />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="font-bold text-slate-700">Email Notifications for New Assigned Leads</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule / Edit Interview Date & Time Modal */}
      {editingInterviewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Update Interview Schedule</h3>
                <p className="text-xs text-slate-500">Candidate: {editingInterviewLead.name} ({editingInterviewLead.phone})</p>
              </div>
              <button
                onClick={() => setEditingInterviewLead(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateInterviewTimeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={editInterviewDateTime}
                  onChange={(e) => setEditInterviewDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInterviewLead(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Date & Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
