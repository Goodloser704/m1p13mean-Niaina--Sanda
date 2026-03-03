const mongoose = require('mongoose');
const User = require('../../../mall-app/backend/models/User');

async function checkClientRole() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    console.log('✅ Connecté à MongoDB\n');
    
    const client = await User.findOne({ email: 'client@test.com' });
    
    if (!client) {
      console.log('❌ Compte client@test.com non trouvé');
    } else {
      console.log('✅ Compte trouvé:');
      console.log(`   ID: ${client._id}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Rôle: ${client.role}`);
      console.log(`   Actif: ${client.isActive}`);
      console.log(`   Nom: ${client.nom} ${client.prenoms}`);
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkClientRole();
