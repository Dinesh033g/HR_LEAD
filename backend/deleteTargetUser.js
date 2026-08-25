require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkById = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const targetId = '6a8bd09136f06a7f1dae00d2';
    const deleted = await User.findByIdAndDelete(targetId);
    if (deleted) {
      console.log(`Successfully deleted user with ID ${targetId} (${deleted.name} / ${deleted.email})`);
    } else {
      console.log(`User ID ${targetId} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkById();
