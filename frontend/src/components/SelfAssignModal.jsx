import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const SelfAssignModal = ({ lead, isOpen, onClose, onSuccess }) => {
  const [hrs, setHrs] = useState([]);
  const [selectedHr, setSelectedHr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && lead) {
      axios.get('/api/users').then(res => {
        const teamHrs = res.data.filter(u => u.role === 'HR');
        setHrs(teamHrs);
      }).catch(console.error);
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.put(`/api/leads/${lead._id}/self-assign`, {
        hr_id: selectedHr || null,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Assign Leftover Lead</h3>
              <p className="text-xs text-slate-500 font-medium">Lead: {lead.name} ({lead.language})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold">✕</button>
        </div>

        <form onSubmit={handleAssign} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Select Assignee</label>
            <select
              value={selectedHr}
              onChange={(e) => setSelectedHr(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-300 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="">⚡ Assign to Myself (TL Self-Ownership)</option>
              {hrs.map(hr => (
                <option key={hr._id} value={hr._id}>
                  Assign to {hr.name} (Speaks: {hr.languagesSpoken ? hr.languagesSpoken.join(', ') : 'English'})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-xs px-4 py-2.5 rounded-2xl text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfAssignModal;
