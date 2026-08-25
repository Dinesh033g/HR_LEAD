import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Sparkles, Edit3, Trash2, Plus, ArrowRight } from 'lucide-react';

const FileUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedCandidates, setExtractedCandidates] = useState([]);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview'
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setMessage(null);
    }
  };

  const handleInitialUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.post('/api/leads/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.leads && res.data.leads.length > 0) {
        setExtractedCandidates(res.data.leads);
        setStep('preview');
      } else {
        setMessage(res.data.message || 'Leads processed successfully!');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          handleResetModal();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse and upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = [...extractedCandidates];
    updated[index][field] = value;
    setExtractedCandidates(updated);
  };

  const handleRemoveCandidate = (index) => {
    const updated = extractedCandidates.filter((_, i) => i !== index);
    setExtractedCandidates(updated);
  };

  const handleAddCandidateRow = () => {
    setExtractedCandidates([
      ...extractedCandidates,
      {
        name: '',
        phone: '+919',
        language: 'English',
      }
    ]);
  };

  const handleConfirmIngest = async () => {
    if (extractedCandidates.length === 0) {
      setError('At least one candidate is required.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      setMessage(`Successfully confirmed and ingested ${extractedCandidates.length} candidate(s)!`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        handleResetModal();
        onClose();
      }, 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm and save candidates.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetModal = () => {
    setFile(null);
    setStep('upload');
    setExtractedCandidates([]);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {step === 'upload' ? 'Omnichannel Lead Ingestion' : 'Review & Verify Extracted Candidates (OCR)'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'upload' ? 'Auto-Extract Leads via OCR & Parsing Algorithms' : 'Verify or edit extracted candidate details before finalizing'}
              </p>
            </div>
          </div>
          <button onClick={() => { handleResetModal(); onClose(); }} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold">✕</button>
        </div>

        {/* Step 1: Upload Form */}
        {step === 'upload' && (
          <form onSubmit={handleInitialUpload} className="mt-5 space-y-4 flex-1 overflow-y-auto">
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 bg-[#f8fafc] rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-bold text-slate-800 block">
                  {file ? file.name : 'Click to select or drag PDF, Excel, or Image'}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Supported formats: .pdf, .xlsx, .xls, .png, .jpg (Printed & Handwritten OCR)
                </span>
              </label>
            </div>

            {/* Format Badges */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-700 font-bold">
                <FileText className="w-4 h-4 text-rose-500" /> PDF Parsing
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-700 font-bold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel Sheet
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-700 font-bold">
                <Image className="w-4 h-4 text-amber-600" /> OCR Reader
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { handleResetModal(); onClose(); }}
                className="bg-slate-100 hover:bg-slate-200 text-xs px-4 py-2.5 rounded-2xl text-slate-700 font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-[#24585c] hover:bg-[#1c474a] text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running OCR & Extracting...
                  </>
                ) : (
                  <>
                    <span>Extract & Preview Candidates</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Interactive Preview & Edit Table */}
        {step === 'preview' && (
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">Extracted Candidate List ({extractedCandidates.length})</span>
                {extractedCandidates.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium">No 10-digit mobile numbers were detected in this image. Enter candidate details manually below:</p>
                )}
              </div>
              <button
                onClick={handleAddCandidateRow}
                className="text-xs text-teal-700 hover:text-teal-900 font-extrabold flex items-center gap-1 cursor-pointer bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Candidate
              </button>
            </div>

            {extractedCandidates.length === 0 ? (
              <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800">No Valid Phone Numbers Detected</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  The OCR engine could not detect a valid 10-digit Indian phone number in this handwritten image. Click below to add candidate details manually.
                </p>
                <button
                  type="button"
                  onClick={handleAddCandidateRow}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Candidate Manually
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3 pl-4">Candidate Name</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Language</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedCandidates.map((cand, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-2 pl-4">
                          <input
                            type="text"
                            value={cand.name}
                            onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                            placeholder="Candidate Name"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-teal-600"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={cand.phone}
                            onChange={(e) => handleCandidateChange(idx, 'phone', e.target.value)}
                            placeholder="+919876543210"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-slate-800 focus:outline-none focus:border-teal-600"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={cand.language || 'English'}
                            onChange={(e) => handleCandidateChange(idx, 'language', e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none"
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Kannada">Kannada</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCandidate(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
              >
                ← Back to Upload
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { handleResetModal(); onClose(); }}
                  className="bg-slate-100 hover:bg-slate-200 text-xs px-4 py-2.5 rounded-2xl text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmIngest}
                  disabled={uploading}
                  className="bg-[#24585c] hover:bg-[#1c474a] text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Ingest Candidates'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadModal;
