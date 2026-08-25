require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const deleteEmployeeFromAtlas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const emailToDelete = 'hr.rohan@hrlead.com';
    const user = await User.findOne({ email: emailToDelete });

    if (!user) {
      console.log(`User ${emailToDelete} not found in database.`);
    } else {
      // Unassign leads handling by this employee
      if (user.role === 'TL') {
        await Lead.updateMany({ assigned_tl: user._id }, { assigned_tl: null, assigned_hr: null });
        await User.updateMany({ tl_id: user._id }, { tl_id: null });
      } else if (user.role === 'HR') {
        await Lead.updateMany({ assigned_hr: user._id }, { assigned_hr: null });
      }

      await User.findByIdAndDelete(user._id);
      console.log(`Successfully deleted employee ${user.name} (${emailToDelete}) from MongoDB Atlas!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error deleting employee:', error);
    process.exit(1);
  }
};

deleteEmployeeFromAtlas();
