const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');

async function checkEspaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Lister tous les espaces (actifs et inactifs)
    const espaces = await Espace.find({}).select('code statut isActive etage');
    console.log(`Total espaces: ${espaces.length}\n`);
    
    espaces.forEach(e => {
      console.log(`- ${e.code} | isActive: ${e.isActive} | statut: ${e.statut}`);
    });

    // Vérifier les index
    console.log('\n📋 Index sur la collection Espace:');
    const indexes = await Espace.collection.getIndexes();
    Object.keys(indexes).forEach(key => {
      console.log(`  - ${key}:`, indexes[key]);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkEspaces();
