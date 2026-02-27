/**
 * 🌱 Script de création de données de test pour Loyers et Factures
 * Crée des boutiques actives avec espaces et des transactions de test
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');
const CentreCommercial = require('../models/CentreCommercial');
const PorteFeuille = require('../models/PorteFeuille');

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
    log('\n🌱 CRÉATION DES DONNÉES DE TEST - LOYERS & FACTURES', 'cyan');
    log('='.repeat(60), 'cyan');

    // Connexion à MongoDB
    log('\n📡 Connexion à MongoDB...', 'yellow');
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    log('✅ Connecté à MongoDB\n', 'green');

    // 1. Vérifier les comptes
    log('👤 1. Vérification des comptes...', 'cyan');
    const admin = await User.findOne({ email: 'admin@mall.com' });
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    
    if (!admin || !commercant) {
      log('❌ Comptes admin ou commercant manquants', 'red');
      log('   Exécutez: node scripts/create-local-accounts.js', 'yellow');
      return;
    }
    
    log(`✅ Admin trouvé: ${admin._id}`, 'green');
    log(`✅ Commercant trouvé: ${commercant._id}`, 'green');

    // 2. Vérifier/créer les portefeuilles
    log('\n💰 2. Vérification des portefeuilles...', 'cyan');
    let portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
    if (!portefeuilleCommercant) {
      portefeuilleCommercant = await PorteFeuille.create({
        owner: commercant._id,
        balance: 5000 // Solde initial pour les tests
      });
      log('✅ Portefeuille commercant créé avec 5000€', 'green');
    } else {
      // Créditer le portefeuille pour les tests
      portefeuilleCommercant.balance = Math.max(portefeuilleCommercant.balance, 5000);
      await portefeuilleCommercant.save();
      log(`✅ Portefeuille commercant: ${portefeuilleCommercant.balance}€`, 'green');
    }

    let portefeuilleAdmin = await PorteFeuille.findOne({ owner: admin._id });
    if (!portefeuilleAdmin) {
      portefeuilleAdmin = await PorteFeuille.create({
        owner: admin._id,
        balance: 0
      });
      log('✅ Portefeuille admin créé', 'green');
    } else {
      log(`✅ Portefeuille admin: ${portefeuilleAdmin.balance}€`, 'green');
    }

    // 3. Récupérer un étage existant
    log('\n🏢 3. Vérification étage...', 'cyan');
    
    // Trouver un étage existant
    let etage = await Etage.findOne();
    if (!etage) {
      log('❌ Aucun étage trouvé dans la base', 'red');
      log('   Exécutez: node scripts/seed-espaces-etages-test.js', 'yellow');
      return;
    }
    
    log(`✅ Étage: ${etage.nom} (Niveau ${etage.niveau})`, 'green');
    
    // Récupérer le centre commercial
    const centreCommercial = await CentreCommercial.findById(etage.centreCommercial);
    if (centreCommercial) {
      log(`✅ Centre commercial: ${centreCommercial.nom}`, 'green');
    }

    // 4. Créer des espaces de test
    log('\n🏬 4. Création des espaces de test...', 'cyan');
    const espacesData = [
      { code: 'LOYER1', surface: 50, loyer: 800 },
      { code: 'LOYER2', surface: 60, loyer: 1000 },
      { code: 'LOYER3', surface: 40, loyer: 600 }
    ];

    const espaces = [];
    for (const espaceData of espacesData) {
      let espace = await Espace.findOne({ code: espaceData.code });
      if (!espace) {
        espace = await Espace.create({
          ...espaceData,
          etage: etage._id,
          centreCommercial: centreCommercial._id,
          statut: 'Disponible'
        });
        log(`✅ Espace créé: ${espace.code} (${espace.loyer}€/mois)`, 'green');
      } else {
        log(`✅ Espace existant: ${espace.code}`, 'green');
      }
      espaces.push(espace);
    }

    // 5. Créer des boutiques de test
    log('\n🏪 5. Création des boutiques de test...', 'cyan');
    
    // Récupérer une catégorie existante
    const CategorieBoutique = require('../models/CategorieBoutique');
    let categorie = await CategorieBoutique.findOne();
    if (!categorie) {
      categorie = await CategorieBoutique.create({
        nom: 'Mode',
        description: 'Catégorie Mode'
      });
      log('✅ Catégorie créée', 'green');
    }
    
    const boutiquesData = [
      { nom: 'Boutique Test Loyer 1', espace: espaces[0]._id },
      { nom: 'Boutique Test Loyer 2', espace: espaces[1]._id }
    ];

    let boutiquesCreated = 0;
    for (const boutiqueData of boutiquesData) {
      const existing = await Boutique.findOne({ 
        nom: boutiqueData.nom,
        commercant: commercant._id 
      });
      
      if (!existing) {
        const boutique = await Boutique.create({
          ...boutiqueData,
          commercant: commercant._id,
          description: 'Boutique de test pour loyers',
          statutBoutique: 'Actif',
          categorie: categorie._id
        });
        
        // Mettre à jour l'espace
        await Espace.findByIdAndUpdate(boutiqueData.espace, {
          statut: 'Occupee',
          boutique: boutique._id
        });
        
        boutiquesCreated++;
        log(`✅ Boutique créée: ${boutique.nom}`, 'green');
      } else {
        log(`✅ Boutique existante: ${existing.nom}`, 'green');
      }
    }

    // 6. Résumé
    log('\n📊 RÉSUMÉ', 'cyan');
    log('='.repeat(60), 'cyan');
    if (centreCommercial) {
      log(`Centre Commercial: ${centreCommercial.nom}`, 'blue');
    }
    log(`Étage: ${etage.nom}`, 'blue');
    log(`Espaces créés: ${espaces.length}`, 'blue');
    log(`Boutiques actives: ${boutiquesCreated > 0 ? boutiquesCreated : 'existantes'}`, 'blue');
    log(`Portefeuille commercant: ${portefeuilleCommercant.balance}€`, 'blue');
    
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
