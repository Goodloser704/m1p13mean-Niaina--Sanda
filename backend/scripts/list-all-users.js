const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({});
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  ID:', user._id);
      console.log('  Email:', user.email, `(length: ${user.email.length})`);
      console.log('  Email bytes:', Buffer.from(user.email).toString('hex'));
      console.log('  Role:', user.role);
      console.log('  Nom:', user.nom);
      console.log('  Prenoms:', user.prenoms);
      console.log('  isActive:', user.isActive);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
