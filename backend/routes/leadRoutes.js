const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getLeads,
  createLead,
  uploadLeads,
  selfAssignLead,
  updateLeadStatus,
  deleteLead,
  deleteAllLeads,
  deduplicateLeads,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(protect);

router.get('/', getLeads);
router.post('/', authorize('Admin', 'TL'), createLead);
router.post('/upload', authorize('Admin', 'TL'), upload.single('file'), uploadLeads);
router.post('/deduplicate', authorize('Admin', 'TL'), deduplicateLeads);
router.put('/:id/self-assign', authorize('Admin', 'TL'), selfAssignLead);
router.put('/:id/status', updateLeadStatus);
router.delete('/clear-all', authorize('Admin'), deleteAllLeads);
router.delete('/:id', authorize('Admin'), deleteLead);

module.exports = router;
