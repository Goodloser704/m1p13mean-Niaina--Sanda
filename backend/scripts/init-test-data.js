const mongoose = require('mongoose');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');
const CentreCommercial = require('../models/CentreCommercial');
const CategorieBoutique = require('../models/CategorieBoutique');

async function initTestData() {
  try {
    console.log('🚀 Initialisation des données de test...\n');
    
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    console.log('✅ Connecté à MongoDB\n');
    
    // Créer le centre commercial si nécessaire
    let centreCommercial = await CentreCommercial.findOne();
    if (!centreCommercial) {
      console.log('🏢 Création du centre commercial...');
      centreCommercial = await CentreCommercial.create({
        nom: 'Centre Commercial Test',
        adresse: '123 Rue Test',
        ville: 'Antananarivo',
        codePostal: '101',
        telephone: '+261340000000',
        email: 'contact@mall-test.com',
        horaires: [
          { jour: 'Lundi', debut: '08:00', fin: '20:00' },
          { jour: 'Mardi', debut: '08:00', fin: '20:00' },
          { jour: 'Mercredi', debut: '08:00', fin: '20:00' },
          { jour: 'Jeudi', debut: '08:00', fin: '20:00' },
          { jour: 'Vendredi', debut: '08:00', fin: '20:00' },
          { jour: 'Samedi', debut: '09:00', fin: '21:00' },
          { jour: 'Dimanche', debut: '10:00', fin: '18:00' }
        ]
      });
      console.log(`✅ Centre commercial créé: ${centreCommercial.nom}\n`);
    } else {
      console.log(`⏭️  Centre commercial existe déjà: ${centreCommercial.nom}\n`);
    }
    
    // Créer des catégories si nécessaire
    let categorie = await CategorieBoutique.findOne();
    if (!categorie) {
      console.log('🏷️  Création des catégories...');
      const categories = [
        { nom: 'Mode', description: 'Vêtements et accessoires' },
        { nom: 'Électronique', description: 'Téléphones et gadgets' },
        { nom: 'Alimentation', description: 'Restaurants et épiceries' }
      ];
      
      for (const cat of categories) {
        await CategorieBoutique.create(cat);
        console.log(`✅ Catégorie créée: ${cat.nom}`);
      }
      
      categorie = await CategorieBoutique.findOne();
      console.log('');
    } else {
      console.log(`⏭️  Catégories existent déjà\n`);
    }
    
    // Récupérer les utilisateurs
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    
    if (!commercant) {
      console.log('❌ Commerçant non trouvé');
      return;
    }
    
    // Créer un étage
    console.log('🏢 Création d\'un étage...');
    let etage = await Etage.findOne({ niveau: 1 });
    if (!etage) {
      etage = await Etage.create({
        niveau: 1,
        nom: 'Rez-de-chaussée',
        description: 'Étage principal'
      });
      console.log(`✅ Étage créé: ${etage.nom}`);
    } else {
      console.log(`⏭️  Étage existe déjà: ${etage.nom}`);
    }
    
    // Créer des espaces
    console.log('\n📦 Création des espaces...');
    const espacesToCreate = [
      { code: 'A1', surface: 50, loyer: 1000 },
      { code: 'A2', surface: 60, loyer: 1200 },
      { code: 'A3', surface: 70, loyer: 1400 },
      { code: 'B1', surface: 80, loyer: 1600 },
      { code: 'B2', surface: 90, loyer: 1800 }
    ];
    
    for (const espaceData of espacesToCreate) {
      const existing = await Espace.findOne({ code: espaceData.code });
      if (!existing) {
        await Espace.create({
          ...espaceData,
          etage: etage._id,
          centreCommercial: centreCommercial._id,
          statut: 'Disponible'
        });
        console.log(`✅ Espace créé: ${espaceData.code}`);
      } else {
        console.log(`⏭️  Espace existe déjà: ${espaceData.code}`);
      }
    }
    
    // Créer une boutique pour le commerçant
    console.log('\n🏪 Création d\'une boutique...');
    const existingBoutique = await Boutique.findOne({ commercant: commercant._id });
    if (!existingBoutique) {
      const boutique = await Boutique.create({
        nom: 'Boutique Test',
        description: 'Boutique de test pour les tests automatisés',
        commercant: commercant._id,
        categorie: categorie._id,
        horaires: [
          { jour: 'Lundi', debut: '09:00', fin: '18:00' },
          { jour: 'Mardi', debut: '09:00', fin: '18:00' },
          { jour: 'Mercredi', debut: '09:00', fin: '18:00' },
          { jour: 'Jeudi', debut: '09:00', fin: '18:00' },
          { jour: 'Vendredi', debut: '09:00', fin: '18:00' }
        ],
        statutBoutique: 'Actif',
        isActive: true
      });
      console.log(`✅ Boutique créée: ${boutique.nom} (ID: ${boutique._id})`);
    } else {
      console.log(`⏭️  Boutique existe déjà: ${existingBoutique.nom}`);
    }
    
    console.log('\n✅ Initialisation terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

initTestData();
