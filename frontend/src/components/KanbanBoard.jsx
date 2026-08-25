import React, { useState } from 'react';
import { Phone, MessageSquare, Globe, Clock, CheckCircle2, XCircle, ArrowRight, UserCheck, FileText, Image, FileSpreadsheet, User, Trash2, ChevronDown, LayoutGrid, List } from 'lucide-react';
import ColorBends from './ColorBends';

const PIPELINE_STATUSES = [
  { id: 'New', label: 'NEW LEAD', color: 'bg-blue-500', bgBadge: 'bg-blue-100 text-blue-700' },
  { id: 'Contacted', label: 'CONTACTED', color: 'bg-purple-500', bgBadge: 'bg-purple-100 text-purple-700' },
  { id: 'Call Accepted', label: 'CALL ACCEPTED', color: 'bg-teal-500', bgBadge: 'bg-teal-100 text-teal-700' },
  { id: 'Call Rejected', label: 'CALL REJECTED', color: 'bg-amber-500', bgBadge: 'bg-amber-100 text-amber-700' },
  { id: 'Interview Scheduled', label: 'INTERVIEW SCHEDULED', color: 'bg-cyan-500', bgBadge: 'bg-cyan-100 text-cyan-700' },
  { id: 'Selected', label: 'SELECTED', color: 'bg-emerald-500', bgBadge: 'bg-emerald-100 text-emerald-700' },
  { id: 'Rejected', label: 'REJECTED', color: 'bg-rose-500', bgBadge: 'bg-rose-100 text-rose-700' },
];

const getSourceBadge = (source) => {
  switch (source) {
    case 'WhatsApp':
      return <span className="bg-[#48a58a] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase"><MessageSquare className="w-3 h-3" /> WHATSAPP</span>;
    case 'PDF':
      return <span className="bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase"><FileText className="w-3 h-3" /> PDF</span>;
    case 'Excel':
      return <span className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase"><FileSpreadsheet className="w-3 h-3" /> EXCEL</span>;
    case 'Image':
      return <span className="bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase"><Image className="w-3 h-3" /> IMAGE OCR</span>;
    default:
      return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase"><User className="w-3 h-3" /> MANUAL</span>;
  }
};

const KanbanBoard = ({ leads, onUpdateStatus, userRole, onDeleteLead, onSelfAssign }) => {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('kanban_view_mode') || 'grid';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('kanban_view_mode', mode);
  };
  const [selectedLeadHistory, setSelectedLeadHistory] = useState(null);
  const [interviewModalLead, setInterviewModalLead] = useState(null);
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLeads = statusFilter === 'ALL'
    ? leads
    : leads.filter(l => l.status === statusFilter);

  const visibleStatuses = statusFilter === 'ALL'
    ? PIPELINE_STATUSES
    : PIPELINE_STATUSES.filter(s => s.id === statusFilter);

  const getLeadsForStatus = (statusId) => {
    return filteredLeads.filter(l => l.status === statusId);
  };

  const handleStatusChange = (lead, newStatus) => {
    if (newStatus === 'Interview Scheduled') {
      setInterviewModalLead(lead);
      setInterviewDateTime(lead.interviewTime || '');
    } else {
      onUpdateStatus(lead._id, newStatus);
    }
  };

  const handleConfirmInterviewSchedule = (e) => {
    e.preventDefault();
    if (!interviewDateTime) {
      alert('Please select date and time for the interview');
      return;
    }
    onUpdateStatus(interviewModalLead._id, 'Interview Scheduled', `Interview scheduled for ${new Date(interviewDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`, interviewDateTime);
    setInterviewModalLead(null);
    setInterviewDateTime('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header Bar with Status Filter & Grid / List View Toggle Switch */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-extrabold text-slate-700">Pipeline View Mode:</span>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {filteredLeads.length} / {leads.length} Candidates
          </span>

          {/* Pipeline Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs font-bold text-slate-500">Filter Status:</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 pl-3 pr-7 rounded-xl border border-slate-300 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Statuses ({leads.length})</option>
                {PIPELINE_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({leads.filter(l => l.status === s.id).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* View Toggle Segmented Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => handleSetViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Board</span>
          </button>

          <button
            onClick={() => handleSetViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GRID / BOARD VIEW (KANBAN COLUMNS) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' ? (
        <div className="w-full overflow-hidden">
          <div className="flex gap-5 overflow-x-auto pb-6 pt-1 px-1">
            {visibleStatuses.map(col => {
              const colLeads = getLeadsForStatus(col.id);

              return (
                <div key={col.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col w-[300px] shrink-0 max-h-[calc(100vh-230px)] shadow-xs">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <h3 className="font-extrabold text-[11px] text-slate-700 tracking-wider uppercase">{col.label}</h3>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${col.bgBadge}`}>
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Column Lead Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colLeads.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-400 font-medium italic border-2 border-dashed border-slate-200/80 rounded-2xl">
                        No leads in this stage
                      </div>
                    ) : (
                      colLeads.map(lead => (
                        <div
                          key={lead._id}
                          className="bg-[#dbe7fd]/70 border border-[#c6d7fa] hover:border-indigo-400 rounded-2xl p-4 transition-all shadow-xs relative group"
                        >
                          {/* Candidate Name */}
                          <div className="mb-1.5">
                            <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">
                              {lead.name}
                            </h4>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium font-mono mb-3">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{lead.phone}</span>
                          </div>

                          {/* Assignment Grid */}
                          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-300/50">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">TL:</span>
                              <span className="text-slate-800 font-bold text-[11px]">
                                {lead.assigned_tl ? lead.assigned_tl.name : <span className="text-amber-600">Unassigned</span>}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">HR:</span>
                              <span>
                                {lead.assigned_hr ? (
                                  <span className="text-slate-800 font-bold text-[11px]">{lead.assigned_hr.name}</span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase border border-amber-300">
                                    NEEDS HR
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Leftover Lead Self-Assign Button for TL */}
                          {!lead.assigned_hr && userRole === 'TL' && onSelfAssign && (
                            <button
                              onClick={() => onSelfAssign(lead)}
                              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Self-Assign Lead
                            </button>
                          )}

                          {/* Status Selector Dropdown Box */}
                          <div className="mt-3 pt-2.5 border-t border-slate-300/50 flex items-center gap-2">
                            <div className="relative flex-1">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead, e.target.value)}
                                className="w-full text-xs font-bold bg-white text-indigo-900 border border-slate-300 rounded-xl px-2.5 py-2 pr-7 cursor-pointer appearance-none shadow-2xs hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              >
                                {PIPELINE_STATUSES.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-indigo-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <button
                              onClick={() => setSelectedLeadHistory(lead)}
                              title="View History Logs"
                              className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
                            >
                              <Clock className="w-4 h-4" />
                            </button>

                            {userRole === 'Admin' && onDeleteLead && (
                              <button
                                onClick={() => onDeleteLead(lead._id)}
                                title="Delete Lead"
                                className="p-2.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-300 rounded-xl hover:bg-rose-50 cursor-pointer shadow-2xs shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. LIST / TABULAR ROSTER VIEW */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Candidate Name</th>
                  <th className="pb-3">Phone Number</th>
                  <th className="pb-3">Assigned TL</th>
                  <th className="pb-3">Assigned HR</th>
                  <th className="pb-3 text-center">Pipeline Status Action</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 italic">No candidates matching selected status filter</td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-extrabold text-slate-800">{lead.name}</td>
                      <td className="py-3.5 font-mono text-slate-600 font-medium">{lead.phone}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{lead.assigned_tl?.name || 'Unassigned'}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">
                        {lead.assigned_hr ? (
                          lead.assigned_hr.name
                        ) : (
                          <span className="bg-amber-100 text-amber-700 font-extrabold text-[10px] px-2 py-0.5 rounded">Needs HR</span>
                        )}
                      </td>

                      {/* Status Dropdown Selector */}
                      <td className="py-3.5 text-center">
                        <div className="relative inline-block w-48">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value)}
                            className="w-full bg-[#dbe7fd] hover:bg-[#c6d7fa] text-indigo-950 font-bold text-xs py-2 pl-3 pr-7 rounded-xl transition-all appearance-none cursor-pointer border border-indigo-200 focus:outline-none shadow-2xs"
                          >
                            {PIPELINE_STATUSES.map(s => (
                              <option key={s.id} value={s.id} className="bg-white text-slate-800 font-medium py-1">
                                {s.id === lead.status ? `Current: ${s.label}` : `Set Status to ${s.label}`}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {!lead.assigned_hr && userRole === 'TL' && onSelfAssign && (
                            <button
                              onClick={() => onSelfAssign(lead)}
                              title="Self-Assign Lead"
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer shadow-2xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLeadHistory(lead)}
                            title="View History Logs"
                            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer shadow-2xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {userRole === 'Admin' && onDeleteLead && (
                            <button
                              onClick={() => onDeleteLead(lead._id)}
                              title="Delete Lead"
                              className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 rounded-xl hover:bg-rose-100 cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal with Date & Time Picker */}
      {interviewModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Schedule Interview Session</h3>
                <p className="text-xs text-slate-500">Candidate: {interviewModalLead.name} ({interviewModalLead.phone})</p>
              </div>
              <button
                onClick={() => setInterviewModalLead(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmInterviewSchedule} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalLead(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Confirm & Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log Modal */}
      {selectedLeadHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-800">Lead Audit Trail</h3>
                <p className="text-xs text-slate-500">{selectedLeadHistory.name} ({selectedLeadHistory.phone})</p>
              </div>
              <button
                onClick={() => setSelectedLeadHistory(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2.5">
              {selectedLeadHistory.history && selectedLeadHistory.history.length > 0 ? (
                selectedLeadHistory.history.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="text-indigo-600">Status: {item.status}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{item.note || 'No note attached'}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No status history recorded yet.</p>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedLeadHistory(null)}
                className="bg-slate-200 hover:bg-slate-300 text-xs px-4 py-2 rounded-xl text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
