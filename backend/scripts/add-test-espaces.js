/**
 * 🏗️ Script pour ajouter des espaces de test
 * Ajoute 5 espaces disponibles pour les tests
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');
const CentreCommercial = require('../models/CentreCommercial');

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

async function addTestEspaces() {
  try {
    log('\n🚀 Connexion à MongoDB...', 'cyan');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');

    // Récupérer le centre commercial
    log('\n📍 Recherche du centre commercial...', 'cyan');
    const centre = await CentreCommercial.findOne();
    
    if (!centre) {
      log('❌ Aucun centre commercial trouvé', 'red');
      process.exit(1);
    }
    
    log(`✅ Centre trouvé: ${centre.nom}`, 'green');

    // Récupérer un étage
    log('\n🏢 Recherche d\'un étage...', 'cyan');
    let etage = await Etage.findOne({ centreCommercial: centre._id });
    
    if (!etage) {
      log('⚠️  Aucun étage trouvé, création d\'un étage de test...', 'yellow');
      etage = await Etage.create({
        nom: 'Étage Test',
        niveau: 1,
        centreCommercial: centre._id,
        nombreEspaces: 0,
        espacesDisponibles: 0,
        espacesOccupes: 0,
        isActive: true
      });
      log(`✅ Étage créé: ${etage.nom}`, 'green');
    } else {
      log(`✅ Étage trouvé: ${etage.nom}`, 'green');
    }

    // Compter les espaces existants
    const espacesCount = await Espace.countDocuments({ etage: etage._id });
    log(`\n📊 Espaces existants sur cet étage: ${espacesCount}`, 'blue');

    // Créer 10 nouveaux espaces pour les tests
    log('\n🏗️  Création de 10 nouveaux espaces pour les tests...', 'cyan');
    
    const espacesToCreate = [];
    const timestamp = Date.now();
    
    for (let i = 1; i <= 10; i++) {
      const code = `TEST-DL-${timestamp}-${i}`;
      espacesToCreate.push({
        code,
        etage: etage._id,
        surface: 40 + (i * 5), // 45m², 50m², 55m², etc.
        loyerMensuel: 1000 + (i * 100), // 1100€, 1200€, 1300€, etc.
        statut: 'Disponible',
        description: `Espace de test ${i} pour les tests de demandes de location`,
        isActive: true
      });
    }

    const espacesCreated = await Espace.insertMany(espacesToCreate);
    
    log(`✅ ${espacesCreated.length} espaces créés avec succès`, 'green');
    
    espacesCreated.forEach((espace, index) => {
      log(`   ${index + 1}. ${espace.code} - ${espace.surface}m² - ${espace.loyerMensuel}€/mois`, 'blue');
    });

    // Mettre à jour les statistiques de l'étage
    const totalEspaces = await Espace.countDocuments({ etage: etage._id, isActive: true });
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

addTestEspaces();
