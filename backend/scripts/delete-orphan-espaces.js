/**
 * 🗑️ Supprimer les espaces orphelins (sans étage)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');

async function deleteOrphanEspaces() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🗑️ Suppression des espaces orphelins (sans étage)...');
    const result = await Espace.deleteMany({
      $or: [
        { etage: null },
        { etage: { $exists: false } }
      ]
    });
    
    console.log(`✅ ${result.deletedCount} espaces orphelins supprimés\n`);
    
    const remaining = await Espace.countDocuments();
    console.log(`📊 Espaces restants: ${remaining}`);
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

deleteOrphanEspaces();
