const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const cleanDatabase = async () => {
  try {
    await mongoose.connect('mongodb+srv://dinesh033g:dinesh033g@cluster0.vf1gxya.mongodb.net/hr_lead_management?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB Atlas');

    // Delete all TL and HR users
    const result = await User.deleteMany({ role: { $in: ['TL', 'HR'] } });
    console.log(`Successfully deleted ${result.deletedCount} TL & HR users.`);

    // Clear assignments from leads so they can be assigned to newly added employees
    await Lead.updateMany({}, { assigned_tl: null, assigned_hr: null });
    console.log('Cleared lead assignments for fresh team setup.');

    const remaining = await User.find({}).select('name email role');
    console.log('Remaining Database Users (Super Admin):', remaining);

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

cleanDatabase();
