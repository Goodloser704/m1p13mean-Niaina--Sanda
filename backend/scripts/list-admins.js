const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function listAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const admins = await User.find({ role: 'Admin' });
    console.log(`\n👥 Admins trouvés: ${admins.length}\n`);
    
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.email}`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Nom: ${admin.nom} ${admin.prenoms}`);
      console.log(`   Créé: ${admin.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

listAdmins();
