const Lead = require('../models/Lead');
const User = require('../models/User');
const { assignLeads } = require('../services/assignmentService');
const { parsePDF, parseExcel, parseImageOCR } = require('../services/parsingService');

// @desc    Get leads based on user role and permissions
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    let query = {};
    const role = req.user.role;

    if (role === 'TL') {
      // TL can see leads assigned to them as TL, leads assigned directly to them as HR, OR assigned to downstream HRs under them
      const downstreamHrs = await User.find({ tl_id: req.user._id }).select('_id');
      const hrIds = downstreamHrs.map(h => h._id);
      
      query = {
        $or: [
          { assigned_tl: req.user._id },
          { assigned_hr: req.user._id },
          { assigned_hr: { $in: hrIds } }
        ]
      };
    } else if (role === 'HR') {
      // HR can see ONLY leads assigned directly to them
      query = { assigned_hr: req.user._id };
    }

    const leads = await Lead.find(query)
      .populate('assigned_tl', 'name email')
      .populate('assigned_hr', 'name email languagesSpoken')
      .populate('history.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually create a single lead
// @route   POST /api/leads
// @access  Private (Admin, TL)
const createLead = async (req, res) => {
  try {
    const { name, phone, language, source } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and Phone number are required' });
    }

    const last10 = phone.replace(/\D/g, '').slice(-10);
    if (last10) {
      const existing = await Lead.findOne({ phone: { $regex: last10 } });
      if (existing) {
        return res.status(400).json({ message: `Candidate lead with phone ${phone} already exists in pipeline.` });
      }
    }

    // Run intelligent assignment logic
    const leadData = [{
      name,
      phone,
      language: language || 'English',
      source: source || 'Manual',
      status: 'New',
    }];

    const [assigned] = await assignLeads(leadData);

    const lead = await Lead.create({
      ...assigned,
      history: [{
        status: 'New',
        updatedBy: req.user._id,
        note: 'Lead created manually',
      }]
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assigned_tl', 'name email')
      .populate('assigned_hr', 'name email languagesSpoken');

    res.status(201).json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk ingest leads via file upload (PDF, Excel, Image OCR)
// @route   POST /api/leads/upload
// @access  Private (Admin, TL)
const uploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document or image file' });
    }

    const { mimetype, originalname, buffer } = req.file;
    let extractedLeads = [];
    let sourceType = 'Manual';

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      sourceType = 'PDF';
      extractedLeads = await parsePDF(buffer, originalname);
    } else if (
      mimetype.includes('excel') ||
      mimetype.includes('spreadsheetml') ||
      originalname.endsWith('.xlsx') ||
      originalname.endsWith('.xls')
    ) {
      sourceType = 'Excel';
      extractedLeads = await parseExcel(buffer, originalname);
    } else if (mimetype.startsWith('image/')) {
      sourceType = 'Image';
      extractedLeads = await parseImageOCR(buffer, originalname);
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Upload PDF, Excel, or Image file.' });
    }

    if (extractedLeads.length === 0) {
      return res.status(400).json({ message: 'Could not extract any leads from the uploaded file. Ensure it contains phone numbers.' });
    }

    // Deduplicate within the batch first by last 10 digits
    const uniqueBatchLeads = [];
    const seenBatchPhones = new Set();

    for (const l of extractedLeads) {
      const last10 = l.phone ? l.phone.replace(/\D/g, '').slice(-10) : '';
      if (last10 && !seenBatchPhones.has(last10)) {
        seenBatchPhones.add(last10);
        uniqueBatchLeads.push(l);
      }
    }

    // Fetch existing database leads to prevent duplicate uploads
    const existingLeads = await Lead.find({}, 'phone');
    const existingPhonesSet = new Set(
      existingLeads.map(l => (l.phone ? l.phone.replace(/\D/g, '').slice(-10) : ''))
    );

    // Filter out candidates already present in MongoDB
    const newExtractedLeads = uniqueBatchLeads.filter(l => {
      const last10 = l.phone ? l.phone.replace(/\D/g, '').slice(-10) : '';
      return !existingPhonesSet.has(last10);
    });

    if (newExtractedLeads.length === 0) {
      return res.status(200).json({
        message: `All ${uniqueBatchLeads.length} candidate leads from ${originalname} are already present in the database! No duplicate entries were created.`,
        count: 0,
        leads: [],
      });
    }

    // Attach source
    const rawLeads = newExtractedLeads.map(l => ({
      ...l,
      source: sourceType,
      status: 'New',
    }));

    // Perform intelligent assignment
    const assignedLeads = await assignLeads(rawLeads);

    // Attach history
    const finalLeads = assignedLeads.map(l => ({
      ...l,
      history: [{
        status: 'New',
        updatedBy: req.user._id,
        note: `Bulk imported from ${sourceType} (${originalname})`,
      }]
    }));

    const savedLeads = await Lead.insertMany(finalLeads);

    const duplicateCount = uniqueBatchLeads.length - newExtractedLeads.length;
    const msg = duplicateCount > 0
      ? `Extracted ${savedLeads.length} new leads from ${originalname} (${duplicateCount} duplicate ${duplicateCount === 1 ? 'lead was' : 'leads were'} skipped).`
      : `Successfully extracted and assigned ${savedLeads.length} leads from ${originalname}`;

    res.status(201).json({
      message: msg,
      count: savedLeads.length,
      leads: savedLeads,
    });
  } catch (error) {
    console.error('File parsing error:', error);
    res.status(500).json({ message: `Failed to process document: ${error.message}` });
  }
};

// @desc    Self-assign leftover lead to HR or TL self
// @route   PUT /api/leads/:id/self-assign
// @access  Private (TL only)
const selfAssignLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Verify permission: lead must be assigned to this TL (or unassigned TL)
    if (lead.assigned_tl && lead.assigned_tl.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to self-assign leads outside your TL pool' });
    }

    const { hr_id } = req.body;
    
    // Assign to specified HR or to TL self
    const targetHrId = hr_id || req.user._id;

    lead.assigned_tl = req.user._id;
    lead.assigned_hr = targetHrId;
    lead.history.push({
      status: lead.status,
      updatedBy: req.user._id,
      note: hr_id ? `Assigned to HR by TL` : `Self-assigned by Team Lead ${req.user.name}`,
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assigned_tl', 'name email')
      .populate('assigned_hr', 'name email languagesSpoken');

    res.json({ message: 'Lead successfully assigned', lead: updatedLead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lead status (Pipeline movement)
// @route   PUT /api/leads/:id/status
// @access  Private (HR, TL, Admin)
const updateLeadStatus = async (req, res) => {
  try {
    const { status, note, interviewTime } = req.body;
    const validStatuses = ['New', 'Contacted', 'Call Accepted', 'Call Rejected', 'Interview Scheduled', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Role check: HR can only update lead assigned directly to them
    if (req.user.role === 'HR' && lead.assigned_hr && lead.assigned_hr.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update leads not assigned to you' });
    }

    lead.status = status;
    if (interviewTime !== undefined) {
      lead.interviewTime = interviewTime;
    }
    lead.history.push({
      status,
      updatedBy: req.user._id,
      note: note || (interviewTime ? `Interview scheduled for: ${interviewTime}` : `Status updated to ${status}`),
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assigned_tl', 'name email')
      .populate('assigned_hr', 'name email languagesSpoken')
      .populate('history.updatedBy', 'name role');

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all leads (Admin reset)
// @route   DELETE /api/leads/clear-all
// @access  Private (Admin only)
const deleteAllLeads = async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ message: 'All pipeline leads cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deduplicate existing database leads by phone number
// @route   POST /api/leads/deduplicate
// @access  Private (Admin, TL)
const deduplicateLeads = async (req, res) => {
  try {
    const allLeads = await Lead.find({}).sort({ createdAt: -1 });
    const seen = new Set();
    const idsToDelete = [];

    for (const lead of allLeads) {
      const last10 = lead.phone ? lead.phone.replace(/\D/g, '').slice(-10) : '';
      if (last10) {
        if (seen.has(last10)) {
          idsToDelete.push(lead._id);
        } else {
          seen.add(last10);
        }
      }
    }

    if (idsToDelete.length > 0) {
      await Lead.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.json({
      message: `Cleaned up ${idsToDelete.length} duplicate leads from pipeline`,
      removedCount: idsToDelete.length,
      remainingCount: allLeads.length - idsToDelete.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeads,
  createLead,
  uploadLeads,
  selfAssignLead,
  updateLeadStatus,
  deleteLead,
  deleteAllLeads,
  deduplicateLeads,
};
