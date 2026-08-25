import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, UserPlus, Trash2, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const LANGUAGES_LIST = ['English', 'Hindi', 'Spanish', 'Tamil', 'Telugu', 'Kannada', 'French', 'German', 'Marathi', 'Bengali'];

const TeamManagementModal = ({ isOpen, onClose, onRefresh }) => {
  const { refreshUser } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [tls, setTls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'HR',
    languagesSpoken: ['English'],
    tl_id: '',
    shift: 'Morning',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const [empRes, tlRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/users/tls'),
      ]);
      setEmployees(empRes.data);
      setTls(tlRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post('/api/users', formData);
      setSuccess(`Employee ${formData.name} added successfully`);
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', role: 'HR', languagesSpoken: ['English'], tl_id: '' });
      fetchEmployees();
      if (onRefresh) onRefresh();
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handlePromote = async (id, name) => {
    if (!window.confirm(`Promote HR ${name} to Team Lead (TL)?`)) return;
    setError(null);
    try {
      await axios.put(`/api/users/${id}/promote`);
      setSuccess(`Promoted ${name} to Team Lead`);
      fetchEmployees();
      if (onRefresh) onRefresh();
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Promotion failed');
    }
  };

  const handleDemote = async (id, name) => {
    const targetTlId = window.prompt(`Demote TL ${name} to HR. Enter new TL ID for this employee (Leave blank for none):`);
    setError(null);
    try {
      await axios.put(`/api/users/${id}/demote`, { target_tl_id: targetTlId || null });
      setSuccess(`Demoted ${name} to HR`);
      fetchEmployees();
      if (onRefresh) onRefresh();
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Demotion failed');
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove (fire) ${name}? Their leads will be unassigned.`)) return;
    setError(null);
    try {
      await axios.delete(`/api/users/${id}`);
      setSuccess(`Removed employee ${name}`);
      fetchEmployees();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Remove employee failed');
    }
  };

  const toggleLanguage = (lang) => {
    let updated = [...formData.languagesSpoken];
    if (updated.includes(lang)) {
      if (updated.length > 1) updated = updated.filter(l => l !== lang);
    } else {
      updated.push(lang);
    }
    setFormData({ ...formData, languagesSpoken: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Employee & Team Management</h3>
              <p className="text-xs text-slate-500 font-medium">Add, promote, demote, or remove team leads and recruiters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" /> {showAddForm ? 'View Roster' : 'Add Employee'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold">✕</button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {showAddForm ? (
            <form onSubmit={handleAddEmployee} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800">Register New Team Member</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@hrlead.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Default: 123456"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 cursor-pointer font-medium"
                  >
                    <option value="HR">HR Recruiter</option>
                    <option value="TL">Team Lead (TL)</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {formData.role === 'HR' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reporting TL</label>
                    <select
                      value={formData.tl_id}
                      onChange={(e) => setFormData({ ...formData, tl_id: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 cursor-pointer font-medium"
                    >
                      <option value="">-- Select TL --</option>
                      {tls.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Shift</label>
                  <select
                    value={formData.shift || 'Morning'}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 cursor-pointer font-bold"
                  >
                    <option value="Morning">Morning Shift (9:30 AM – 6:30 PM)</option>
                    <option value="Night">Night Shift (8:30 PM – 5:30 AM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken (Click to toggle)</label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES_LIST.map(lang => {
                    const isSelected = formData.languagesSpoken.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer font-medium transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer shadow-xs hover:bg-purple-700"
                >
                  Save Employee
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {loading ? (
                <div className="text-center py-8 text-slate-500 text-xs flex justify-center items-center gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Loading team roster...
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-medium">No employees registered yet.</div>
              ) : (
                employees.map(emp => (
                  <div key={emp._id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800">{emp.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                          emp.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          emp.role === 'TL' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {emp.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.email}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                        <span className="font-semibold text-slate-500">Languages:</span>
                        <span className="text-indigo-700 font-bold">
                          {emp.languagesSpoken && emp.languagesSpoken.length > 0 ? emp.languagesSpoken.join(', ') : 'English'}
                        </span>
                        {emp.tl_id && (
                          <span className="text-slate-500 ml-2 italic">
                            (Reports to: {emp.tl_id.name})
                          </span>
                        )}
                      </div>
                    </div>

                    {emp.role !== 'Admin' && (
                      <div className="flex items-center gap-2">
                        {emp.role === 'HR' && (
                          <button
                            onClick={() => handlePromote(emp._id, emp.name)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" /> Promote to TL
                          </button>
                        )}
                        {emp.role === 'TL' && (
                          <button
                            onClick={() => handleDemote(emp._id, emp.name)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" /> Demote to HR
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(emp._id, emp.name)}
                          title="Remove/Fire Employee"
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
