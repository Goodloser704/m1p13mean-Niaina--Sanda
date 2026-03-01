/**
 * 🌱 Script de création de données de test pour Espaces et Étages
 * Crée un centre commercial avec plusieurs étages et espaces
 */

const mongoose = require('mongoose');
const CentreCommercial = require('../models/CentreCommercial');
const Etage = require('../models/Etage');
const Espace = require('../models/Espace');

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

async function seedData() {
  try {
    log('\n🌱 CRÉATION DES DONNÉES DE TEST - ESPACES & ÉTAGES', 'cyan');
    log('='.repeat(60), 'cyan');

    // Connexion à MongoDB
    log('\n📡 Connexion à MongoDB...', 'yellow');
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    log('✅ Connecté à MongoDB\n', 'green');

    // 1. Récupérer ou créer le centre commercial
    log('🏢 1. Vérification du centre commercial...', 'cyan');
    let centreCommercial = await CentreCommercial.findOne();
    
    if (!centreCommercial) {
      centreCommercial = await CentreCommercial.create({
        nom: 'Centre Commercial Test',
        adresse: '123 Rue Test',
        ville: 'Antananarivo',
        telephone: '+261340000000',
        email: 'contact@mall-test.com',
        description: 'Centre commercial de test',
        horairesOuverture: {
          lundi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '20:00' },
          mardi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '20:00' },
          mercredi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '20:00' },
          jeudi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '20:00' },
          vendredi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '20:00' },
          samedi: { ouvert: true, heureOuverture: '10:00', heureFermeture: '22:00' },
          dimanche: { ouvert: true, heureOuverture: '10:00', heureFermeture: '18:00' }
        }
      });
      log('✅ Centre commercial créé', 'green');
    } else {
      log('✅ Centre commercial existant trouvé', 'green');
    }
    log(`   ID: ${centreCommercial._id}`, 'blue');
    log(`   Nom: ${centreCommercial.nom}`, 'blue');

    // 2. Nettoyer les anciennes données de test
    log('\n🧹 2. Nettoyage des anciennes données de test...', 'cyan');
    const deletedEspaces = await Espace.deleteMany({ 
      code: { $regex: /^TEST/ } 
    });
    const deletedEtages = await Etage.deleteMany({ 
      nom: { $regex: /^Test/ } 
    });
    log(`✅ ${deletedEspaces.deletedCount} espaces de test supprimés`, 'green');
    log(`✅ ${deletedEtages.deletedCount} étages de test supprimés`, 'green');

    // 3. Créer les étages de test
    log('\n🏢 3. Création des étages de test...', 'cyan');
    const etages = [];
    
    const etagesData = [
      { niveau: 10, nom: 'Test Niveau 10', description: 'Étage de test niveau 10' },
      { niveau: 11, nom: 'Test Niveau 11', description: 'Étage de test niveau 11' },
      { niveau: 12, nom: 'Test Niveau 12', description: 'Étage de test niveau 12' }
    ];

    for (const etageData of etagesData) {
      const etage = await Etage.create({
        ...etageData,
        centreCommercial: centreCommercial._id
      });
      etages.push(etage);
      log(`✅ Étage créé: ${etage.nom} (Niveau ${etage.niveau})`, 'green');
      log(`   ID: ${etage._id}`, 'blue');
    }

    // 4. Créer les espaces de test
    log('\n🏬 4. Création des espaces de test...', 'cyan');
    let espacesCreated = 0;

    for (const etage of etages) {
      // Créer 5 espaces par étage
      for (let i = 1; i <= 5; i++) {
        const code = `TEST${etage.niveau}${i}`;
        const surface = 20 + (i * 10); // 30, 40, 50, 60, 70 m²
        const loyer = 500 + (i * 100); // 600, 700, 800, 900, 1000
        
        const espace = await Espace.create({
          code: code,
          etage: etage._id,
          centreCommercial: centreCommercial._id,
          surface: surface,
          loyer: loyer,
          statut: i <= 3 ? 'Disponible' : 'Occupee',
          description: `Espace de test ${code} - ${surface}m²`
        });
        
        espacesCreated++;
        log(`✅ Espace créé: ${espace.code} (${espace.statut})`, 'green');
      }
    }

    log(`\n✅ ${espacesCreated} espaces créés au total`, 'green');

    // 5. Afficher le résumé
    log('\n📊 RÉSUMÉ', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Centre Commercial: ${centreCommercial.nom}`, 'blue');
    log(`Étages créés: ${etages.length}`, 'blue');
    log(`Espaces créés: ${espacesCreated}`, 'blue');
    
    log('\n📋 Détails des espaces par statut:', 'yellow');
    const stats = await Espace.aggregate([
      { $match: { code: { $regex: /^TEST/ } } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);
    
    stats.forEach(stat => {
      log(`   ${stat._id}: ${stat.count}`, 'blue');
    });

    log('\n✅ Données de test créées avec succès!', 'green');
    log('='.repeat(60), 'cyan');

  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Connexion MongoDB fermée', 'yellow');
  }
}

// Exécuter le script
seedData();
