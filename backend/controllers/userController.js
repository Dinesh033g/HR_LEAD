const User = require('../models/User');
const Lead = require('../models/Lead');

// @desc    Get all employees
// @route   GET /api/users
// @access  Private (Admin, TL)
const getEmployees = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'TL') {
      // TL can view themselves and downstream HRs
      query = { $or: [{ _id: req.user._id }, { tl_id: req.user._id }] };
    }
    const employees = await User.find(query)
      .select('-password')
      .populate('tl_id', 'name email');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new employee
// @route   POST /api/users
// @access  Private (Admin only)
const addEmployee = async (req, res) => {
  try {
    const { name, email, password, role, languagesSpoken, tl_id, shift } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const newRole = req.user.role === 'TL' ? 'HR' : (role || 'HR');
    const newTlId = req.user.role === 'TL' ? req.user._id : (newRole === 'HR' ? (tl_id || null) : null);

    const employee = await User.create({
      name,
      email,
      password: password || '123456',
      role: newRole,
      languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : (languagesSpoken ? languagesSpoken.split(',').map(s => s.trim()) : ['English']),
      tl_id: newTlId,
      shift: shift || 'Morning',
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote HR to TL
// @route   PUT /api/users/:id/promote
// @access  Private (Admin only)
const promoteToTL = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'TL' || user.role === 'Admin') {
      return res.status(400).json({ message: `User is already an ${user.role}` });
    }

    user.role = 'TL';
    user.tl_id = null; // TLs don't have a downstream tl_id
    user.name = user.name.replace(/\s*\((HR|TL|Admin)\)/gi, '').trim();
    await user.save();

    // Elevate existing assigned leads so assigned_tl is set to this new TL
    await Lead.updateMany({ assigned_hr: user._id }, { assigned_tl: user._id });

    res.json({ message: `Successfully promoted ${user.name} to Team Lead`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Demote TL to HR
// @route   PUT /api/users/:id/demote
// @access  Private (Admin only)
const demoteToHR = async (req, res) => {
  try {
    const { target_tl_id } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'TL') {
      return res.status(400).json({ message: 'Only Team Leads can be demoted to HR' });
    }

    // Reassign downstream HRs of this TL to another TL or unassign
    await User.updateMany({ tl_id: user._id }, { tl_id: target_tl_id || null });

    user.role = 'HR';
    user.tl_id = target_tl_id || null;
    user.name = user.name.replace(/\s*\((HR|TL|Admin)\)/gi, '').trim();
    await user.save();

    res.json({ message: `Successfully demoted ${user.name} to HR`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove (Fire) Employee
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const removeEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Unassign leads handling by this employee
    if (user.role === 'TL') {
      await Lead.updateMany({ assigned_tl: user._id }, { assigned_tl: null, assigned_hr: null });
      // Clear tl_id for downstream HRs
      await User.updateMany({ tl_id: user._id }, { tl_id: null });
    } else if (user.role === 'HR') {
      await Lead.updateMany({ assigned_hr: user._id }, { assigned_hr: null });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: `Employee ${user.name} removed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Team Leads for selection dropdowns
// @route   GET /api/users/tls
// @access  Private
const getTLs = async (req, res) => {
  try {
    const tls = await User.find({ role: 'TL' }).select('_id name email languagesSpoken');
    res.json(tls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all HR recruiters for selection / assignment
// @route   GET /api/users/hrs
// @access  Private (Admin, TL)
const getHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: 'HR' })
      .select('_id name email languagesSpoken tl_id shift')
      .populate('tl_id', 'name email');
    res.json(hrs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign an HR recruiter to a TL (or self if caller is TL)
// @route   PUT /api/users/:id/assign-tl
// @access  Private (Admin, TL)
const assignHRToTL = async (req, res) => {
  try {
    const { tl_id } = req.body;
    const targetTlId = req.user.role === 'TL' ? req.user._id : tl_id;

    const hrUser = await User.findById(req.params.id);
    if (!hrUser || hrUser.role !== 'HR') {
      return res.status(400).json({ message: 'User must be an HR recruiter' });
    }

    hrUser.tl_id = targetTlId || null;
    await hrUser.save();

    res.json({ message: `Successfully assigned ${hrUser.name} to Team Lead`, hrUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an HR recruiter from a TL's team
// @route   PUT /api/users/:id/unassign-tl
// @access  Private (Admin, TL)
const unassignHRFromTL = async (req, res) => {
  try {
    const hrUser = await User.findById(req.params.id);
    if (!hrUser || hrUser.role !== 'HR') {
      return res.status(400).json({ message: 'User must be an HR recruiter' });
    }

    hrUser.tl_id = null;
    await hrUser.save();

    res.json({ message: `Successfully removed ${hrUser.name} from team`, hrUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile (Name, Phone, Languages Spoken)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const { name, phone, languagesSpoken } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (languagesSpoken) {
      user.languagesSpoken = Array.isArray(languagesSpoken) 
        ? languagesSpoken 
        : languagesSpoken.split(',').map(s => s.trim());
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      languagesSpoken: updatedUser.languagesSpoken,
      tl_id: updatedUser.tl_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
