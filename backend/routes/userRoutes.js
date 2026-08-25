const express = require('express');
const router = express.Router();
const {
  getEmployees,
  addEmployee,
  promoteToTL,
  demoteToHR,
  removeEmployee,
  getTLs,
  getHRs,
  assignHRToTL,
  unassignHRFromTL,
  updateProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.put('/profile', updateProfile);
router.get('/', authorize('Admin', 'TL'), getEmployees);
router.post('/', authorize('Admin', 'TL'), addEmployee);
router.get('/tls', getTLs);
router.get('/hrs', authorize('Admin', 'TL'), getHRs);
router.put('/:id/assign-tl', authorize('Admin', 'TL'), assignHRToTL);
router.put('/:id/unassign-tl', authorize('Admin', 'TL'), unassignHRFromTL);
router.put('/:id/promote', authorize('Admin'), promoteToTL);
router.put('/:id/demote', authorize('Admin'), demoteToHR);
router.delete('/:id', authorize('Admin'), removeEmployee);

module.exports = router;
