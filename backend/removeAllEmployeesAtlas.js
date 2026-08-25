require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const removeAllTLAndHR = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Delete all TL and HR users from MongoDB Atlas
    const deleteResult = await User.deleteMany({ role: { $in: ['TL', 'HR'] } });
    console.log(`Deleted ${deleteResult.deletedCount} TL and HR employees from MongoDB Atlas.`);

    // Clear assignments from all leads so they can be assigned to newly added employees
    const updateResult = await Lead.updateMany({}, { assigned_tl: null, assigned_hr: null });
    console.log(`Cleared assigned TL & HR on ${updateResult.modifiedCount} leads.`);

    // List remaining users
    const remaining = await User.find({}).select('name email role');
    console.log('Remaining Database Users:', remaining);

    process.exit(0);
  } catch (error) {
    console.error('Error removing TL and HR employees:', error);
    process.exit(1);
  }
};

removeAllTLAndHR();
