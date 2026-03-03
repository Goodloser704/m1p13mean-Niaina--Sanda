/**
 * 🔓 Script pour libérer les espaces occupés
 * Remet tous les espaces occupés en statut Disponible
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');

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

async function libererEspaces() {
  try {
    log('\n🚀 Connexion à MongoDB...', 'cyan');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');

    // Compter les espaces occupés
    const espacesOccupes = await Espace.countDocuments({ statut: 'Occupee' });
    log(`\n📊 Espaces occupés: ${espacesOccupes}`, 'yellow');

    if (espacesOccupes === 0) {
      log('✅ Aucun espace à libérer', 'green');
      return;
    }

    // Libérer tous les espaces occupés
    log('\n🔓 Libération des espaces...', 'cyan');
    const result = await Espace.updateMany(
      { statut: 'Occupee' },
      { $set: { statut: 'Disponible' } }
    );

    log(`✅ ${result.modifiedCount} espace(s) libéré(s)`, 'green');

    // Mettre à jour les statistiques des étages
    log('\n📊 Mise à jour des statistiques des étages...', 'cyan');
    const etages = await Etage.find();

    for (const etage of etages) {
      const totalEspaces = await Espace.countDocuments({ 
        etage: etage._id, 
        isActive: true 
      });
      const espacesDisponibles = await Espace.countDocuments({ 
        etage: etage._id, 
        statut: 'Disponible',
        isActive: true 
      });
      const espacesOccupes = await Espace.countDocuments({ 
        etage: etage._id, 
        statut: 'Occupee',
        isActive: true 
      });

      await Etage.findByIdAndUpdate(etage._id, {
        nombreEspaces: totalEspaces,
        espacesDisponibles,
        espacesOccupes
      });

      log(`   ${etage.nom}: ${espacesDisponibles}/${totalEspaces} disponibles`, 'blue');
    }

    log('\n✅ Script terminé avec succès', 'green');
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Connexion MongoDB fermée', 'cyan');
  }
}

libererEspaces();
