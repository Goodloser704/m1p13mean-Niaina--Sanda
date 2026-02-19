/**
 * Script pour nettoyer les collections Espace et Etage
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');

async function cleanCollections() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🗑️  Suppression des espaces...');
    const espacesDeleted = await Espace.deleteMany({});
    console.log(`✅ ${espacesDeleted.deletedCount} espaces supprimés`);

    console.log('\n🗑️  Suppression des étages...');
    const etagesDeleted = await Etage.deleteMany({});
    console.log(`✅ ${etagesDeleted.deletedCount} étages supprimés`);

    console.log('\n✅ Nettoyage terminé avec succès!');
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanCollections();
