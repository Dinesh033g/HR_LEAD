require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdminToAtlas = async () => {
  try {
    console.log('Connecting to MongoDB Atlas:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    // Delete any existing user with admin@gmail.com in MongoDB Atlas
    await User.deleteOne({ email: 'admin@gmail.com' });

    // Create the admin user in MongoDB Atlas (password '123456' will be automatically hashed by bcrypt)
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'Admin',
      languagesSpoken: ['English']
    });

    console.log('Successfully created Admin user in MongoDB Atlas database!');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Hashed Password stored in Atlas:', adminUser.password);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin to MongoDB Atlas:', error);
    process.exit(1);
  }
};

seedAdminToAtlas();
