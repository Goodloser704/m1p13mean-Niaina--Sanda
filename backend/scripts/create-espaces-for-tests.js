/**
 * 🏗️ Script pour créer 10 espaces pour les tests de demandes de location
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

async function createEspaces() {
  try {
    log('\n🚀 Connexion à MongoDB...', 'cyan');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');

    // Récupérer un espace existant pour obtenir l'étage et le centre commercial
    log('\n🔍 Recherche d\'un espace existant...', 'cyan');
    const espaceExistant = await Espace.findOne().populate('etage');
    
    if (!espaceExistant || !espaceExistant.etage) {
      log('❌ Aucun espace existant trouvé avec un étage', 'red');
      process.exit(1);
    }
    
    const etageId = espaceExistant.etage._id;
    const centreCommercialId = espaceExistant.centreCommercial;
    log(`✅ Étage trouvé: ${espaceExistant.etage.nom} (ID: ${etageId})`, 'green');
    log(`✅ Centre commercial ID: ${centreCommercialId}`, 'green');

    // Compter les espaces existants
    const espacesCount = await Espace.countDocuments({ etage: etageId });
    log(`\n📊 Espaces existants sur cet étage: ${espacesCount}`, 'blue');

    // Créer 10 nouveaux espaces
    log('\n🏗️  Création de 10 nouveaux espaces pour les tests...', 'cyan');
    
    const espacesToCreate = [];
    
    for (let i = 1; i <= 10; i++) {
      const code = `DL${i}`;
      espacesToCreate.push({
        code,
        centreCommercial: centreCommercialId,
        etage: etageId,
        surface: 40 + (i * 5), // 45m², 50m², 55m², etc.
        loyer: 1000 + (i * 100), // 1100€, 1200€, 1300€, etc.
        statut: 'Disponible',
        description: `Espace de test ${i} pour les tests de demandes de location`,
        isActive: true
      });
    }

    const espacesCreated = await Espace.insertMany(espacesToCreate);
    
    log(`✅ ${espacesCreated.length} espaces créés avec succès`, 'green');
    
    espacesCreated.forEach((espace, index) => {
      log(`   ${index + 1}. ${espace.code} - ${espace.surface}m² - ${espace.loyer}€/mois`, 'blue');
    });

    // Mettre à jour les statistiques de l'étage
    const totalEspaces = await Espace.countDocuments({ etage: etageId, isActive: true });
    const espacesDisponibles = await Espace.countDocuments({ 
      etage: etageId, 
      statut: 'Disponible',
      isActive: true 
    });
    const espacesOccupes = await Espace.countDocuments({ 
      etage: etageId, 
      statut: 'Occupee',
      isActive: true 
    });

    await Etage.findByIdAndUpdate(etageId, {
      nombreEspaces: totalEspaces,
      espacesDisponibles,
      espacesOccupes
    });

    log('\n📊 Statistiques mises à jour:', 'cyan');
    log(`   Total espaces: ${totalEspaces}`, 'blue');
    log(`   Disponibles: ${espacesDisponibles}`, 'green');
    log(`   Occupés: ${espacesOccupes}`, 'yellow');

    log('\n✅ Script terminé avec succès', 'green');
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Connexion MongoDB fermée', 'cyan');
  }
}

createEspaces();
