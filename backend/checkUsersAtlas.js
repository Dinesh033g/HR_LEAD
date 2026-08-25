require('dotenv').config();
const mongoose = require('mongoose');

const checkUsersAtlas = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected DB: ${conn.connection.name}`);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('All Users in current DB collection:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsersAtlas();
