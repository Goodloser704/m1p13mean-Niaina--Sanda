/**
 * 🧹 Script pour nettoyer les demandes de test
 * Supprime toutes les demandes de location
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const DemandeLocation = require('../models/DemandeLocation');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanDemandes() {
  try {
    log('\n🚀 Connexion à MongoDB...', 'cyan');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');

    // Compter les demandes
    const count = await DemandeLocation.countDocuments();
    log(`\n📊 Demandes existantes: ${count}`, 'yellow');

    if (count === 0) {
      log('✅ Aucune demande à nettoyer', 'green');
      return;
    }

    // Supprimer toutes les demandes
    log('\n🧹 Suppression des demandes...', 'cyan');
    const result = await DemandeLocation.deleteMany({});

    log(`✅ ${result.deletedCount} demande(s) supprimée(s)`, 'green');
    log('\n✅ Script terminé avec succès', 'green');
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Connexion MongoDB fermée', 'cyan');
  }
}

cleanDemandes();
