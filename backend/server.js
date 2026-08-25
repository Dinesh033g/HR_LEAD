const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

// Connect strictly to local MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/webhook', require('./routes/webhookRoutes'));

app.get('/', (req, res) => {
  res.send('HR Lead Management API Server Running');
});

// Seed default users if database is empty
const seedDefaultData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial Admin, TLs, and HRs...');

      const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@hrlead.com',
        password: 'adminpassword',
        role: 'Admin',
        languagesSpoken: ['English', 'Hindi', 'Tamil', 'Telugu', 'Spanish'],
      });

      const tl1 = await User.create({
        name: 'Alex Johnson',
        email: 'tl.alex@hrlead.com',
        password: 'tlpassword',
        role: 'TL',
        languagesSpoken: ['English', 'Hindi', 'Spanish'],
      });

      const tl2 = await User.create({
        name: 'Sarah Connor',
        email: 'tl.sarah@hrlead.com',
        password: 'tlpassword',
        role: 'TL',
        languagesSpoken: ['English', 'Tamil', 'Telugu'],
      });

      await User.create({
        name: 'Rohan Sharma',
        email: 'hr.rohan@hrlead.com',
        password: 'hrpassword',
        role: 'HR',
        languagesSpoken: ['Hindi', 'English'],
        tl_id: tl1._id,
      });

      await User.create({
        name: 'Elena Garcia',
        email: 'hr.elena@hrlead.com',
        password: 'hrpassword',
        role: 'HR',
        languagesSpoken: ['Spanish', 'English'],
        tl_id: tl1._id,
      });

      await User.create({
        name: 'Kavitha Raman',
        email: 'hr.kavitha@hrlead.com',
        password: 'hrpassword',
        role: 'HR',
        languagesSpoken: ['Tamil', 'English'],
        tl_id: tl2._id,
      });

      await User.create({
        name: 'Suresh Kumar',
        email: 'hr.suresh@hrlead.com',
        password: 'hrpassword',
        role: 'HR',
        languagesSpoken: ['Telugu', 'English'],
        tl_id: tl2._id,
      });

      console.log('Default seed users created successfully!');
      console.log('Admin Login: admin@hrlead.com / adminpassword');
      console.log('TL Login: tl.alex@hrlead.com / tlpassword');
      console.log('HR Login: hr.rohan@hrlead.com / hrpassword');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

seedDefaultData();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HR Lead Management Server running on http://0.0.0.0:${PORT}`);
});
