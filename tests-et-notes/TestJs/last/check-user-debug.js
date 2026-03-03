const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'mall-app/backend/.env') });

const User = require('../../../mall-app/backend/models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const user = await User.findOne({ email: 'admin@mall.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Nom:', user.nom);
    console.log('Prenoms:', user.prenoms);
    console.log('Password hash:', user.mdp ? user.mdp.substring(0, 20) + '...' : 'NO PASSWORD');
    console.log('isActive:', user.isActive);
    
    // Test password comparison
    const testPassword = 'Admin123456!';
    console.log('\nTesting password:', testPassword);
    const isMatch = await user.comparePassword(testPassword);
    console.log('Password match:', isMatch);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
