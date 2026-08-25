require('dotenv').config();
const mongoose = require('mongoose');

const checkOtherDatabases = async () => {
  try {
    const client = await mongoose.connect(process.env.MONGO_URI);
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases in Cluster:', dbs.databases.map(d => d.name));

    for (let dbObj of dbs.databases) {
      const dbName = dbObj.name;
      if (['admin', 'local'].includes(dbName)) continue;
      const db = mongoose.connection.client.db(dbName);
      const userDoc = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6a8bd09136f06a7f1dae00d2') });
      if (userDoc) {
        console.log(`FOUND Rohan Sharma in Database: "${dbName}"! Deleting now...`);
        const res = await db.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId('6a8bd09136f06a7f1dae00d2') });
        console.log(`Delete result from database "${dbName}":`, res.deletedCount);
      } else {
        console.log(`Not found in Database: "${dbName}"`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkOtherDatabases();
