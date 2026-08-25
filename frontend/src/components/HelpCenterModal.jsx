import React, { useState } from 'react';
import { HelpCircle, X, Search, BookOpen, MessageSquare, FileUp, Shield, Zap, Mail, Phone, ChevronRight, CheckCircle2 } from 'lucide-react';

const HelpCenterModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      id: 1,
      category: 'Ingestion',
      icon: FileUp,
      question: 'How do I bulk ingest candidates via PDF, Excel, or OCR?',
      answer: 'Click the "Ingest Files" button in the top header. Drag and drop your file (PDF, Excel .xlsx, or JPG/PNG image). The AI parsing engine extracts candidate names, phone numbers, and language skills, automatically deduplicating records against existing database leads.',
    },
    {
      id: 2,
      category: 'Assignment',
      icon: Zap,
      question: 'How does the intelligent auto-assignment algorithm work?',
      answer: 'When new candidates enter the system, the routing algorithm evaluates spoken language matches first (e.g. Hindi, Tamil, English). If multiple recruiters match, it uses Round-Robin capacity balancing to distribute workload evenly without overloading any single recruiter.',
    },
    {
      id: 3,
      category: 'Leftovers',
      icon: Shield,
      question: 'How do Team Leads (TLs) handle unassigned leftover leads?',
      answer: 'Leads that require manual routing or fallback handling appear in the "Leftover Pool". Team Leads can click "Self-Assign Next Lead" or open the Leftover Pool tab to assign candidate leads directly to themselves or downstream HR recruiters.',
    },
    {
      id: 4,
      category: 'Roles',
      icon: BookOpen,
      question: 'What are the permission differences between Admin, TL, and HR?',
      answer: 'Super Admins have master pipeline control, employee roster creation, and data reset privileges. Team Leads manage team pipelines, leftover pools, and HR performance metrics. HR Recruiters manage their assigned candidate pipeline, schedule interviews, and log call outcomes.',
    },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-['Outfit'] select-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">System Help & Knowledge Base</h3>
              <p className="text-xs text-slate-500 font-medium">Forge India Connect HR Lead Management Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs, ingestion guides, auto-assignment rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Quick Topic Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-500">Popular Topics:</span>
          <button onClick={() => setSearchQuery('ingest')} className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            Bulk Ingest
          </button>
          <button onClick={() => setSearchQuery('assignment')} className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
            Auto-Assignment
          </button>
          <button onClick={() => setSearchQuery('leftover')} className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
            Leftover Pool
          </button>
          <button onClick={() => setSearchQuery('')} className="text-indigo-600 font-bold underline ml-auto cursor-pointer">
            Show All
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Frequently Asked Questions
          </h4>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
              No matching help topics found. Try searching another keyword.
            </div>
          ) : (
            filteredFaqs.map(faq => {
              const Icon = faq.icon;
              const isOpenItem = activeFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpenItem ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-xs text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{faq.question}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpenItem ? 'rotate-90 text-indigo-600' : ''}`} />
                  </button>

                  {isOpenItem && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Contact Panel */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 rounded-2xl text-white flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
          <div>
            <h5 className="font-extrabold text-sm tracking-tight">Need Admin Support?</h5>
            <p className="text-xs text-indigo-200/80">Our support engineering team is available 24/7 for system assistance.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="mailto:support@forgeindiaconnect.com"
              className="bg-white text-indigo-950 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-700" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-right pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Close Help Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;
