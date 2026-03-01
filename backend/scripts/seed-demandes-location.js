/**
 * 🌱 Script de Génération de Données - Demandes de Location
 * Crée des données de test complètes pour tester le système de location
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');
const CentreCommercial = require('../models/CentreCommercial');
const DemandeLocation = require('../models/DemandeLocation');

async function seedDemandesLocation() {
  try {
    console.log('🌱 Génération des données de test pour les demandes de location...\n');
    
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    // 1. Créer ou récupérer le centre commercial
    console.log('📍 1. Centre Commercial...');
    let centreCommercial = await CentreCommercial.findOne();
    if (!centreCommercial) {
      centreCommercial = await CentreCommercial.create({
        nom: 'Mall Test Center',
        adresse: '123 Rue du Commerce',
        ville: 'Antananarivo',
        codePostal: '101',
        telephone: '0340000000',
        email: 'contact@malltest.com'
      });
      console.log('   ✅ Centre commercial créé');
    } else {
      console.log('   ⏭️  Centre commercial existe déjà');
    }
    
    // 2. Créer des étages
    console.log('\n🏢 2. Étages...');
    const etages = [];
    for (let i = 0; i <= 2; i++) {
      let etage = await Etage.findOne({ niveau: i });
      if (!etage) {
        etage = await Etage.create({
          nom: i === 0 ? 'Rez-de-chaussée' : `Étage ${i}`,
          niveau: i,
          centreCommercial: centreCommercial._id,
          surface: 1000 + (i * 200)
        });
        console.log(`   ✅ Étage ${i} créé`);
      } else {
        console.log(`   ⏭️  Étage ${i} existe déjà`);
      }
      etages.push(etage);
    }
    
    // 3. Créer des espaces disponibles
    console.log('\n🏪 3. Espaces disponibles...');
    const espaces = [];
    const espacesData = [
      { code: 'A1', surface: 50, loyer: 1200, etage: 0 },
      { code: 'A2', surface: 75, loyer: 1800, etage: 0 },
      { code: 'A3', surface: 100, loyer: 2500, etage: 0 },
      { code: 'B1', surface: 60, loyer: 1500, etage: 1 },
      { code: 'B2', surface: 80, loyer: 2000, etage: 1 },
      { code: 'C1', surface: 120, loyer: 3000, etage: 2 },
    ];
    
    for (const espaceData of espacesData) {
      let espace = await Espace.findOne({ code: espaceData.code });
      if (!espace) {
        espace = await Espace.create({
          code: espaceData.code,
          surface: espaceData.surface,
          loyer: espaceData.loyer,
          etage: etages[espaceData.etage]._id,
          statut: 'Disponible',
          description: `Espace commercial ${espaceData.code} - ${espaceData.surface}m²`
        });
        console.log(`   ✅ Espace ${espaceData.code} créé (${espaceData.surface}m², ${espaceData.loyer}€/mois)`);
      } else {
        // Remettre disponible si occupé
        if (espace.statut === 'Occupee') {
          espace.statut = 'Disponible';
          espace.boutique = null;
          await espace.save();
          console.log(`   🔄 Espace ${espaceData.code} remis disponible`);
        } else {
          console.log(`   ⏭️  Espace ${espaceData.code} existe déjà`);
        }
      }
      espaces.push(espace);
    }
    
    // 4. Créer des commerçants
    console.log('\n👥 4. Commerçants...');
    const commercants = [];
    const commercantsData = [
      { nom: 'Dupont', prenoms: 'Jean', email: 'jean.dupont@test.com' },
      { nom: 'Martin', prenoms: 'Marie', email: 'marie.martin@test.com' },
      { nom: 'Bernard', prenoms: 'Pierre', email: 'pierre.bernard@test.com' },
      { nom: 'Dubois', prenoms: 'Sophie', email: 'sophie.dubois@test.com' },
    ];
    
    for (const commercantData of commercantsData) {
      let commercant = await User.findOne({ email: commercantData.email });
      if (!commercant) {
        commercant = await User.create({
          nom: commercantData.nom,
          prenoms: commercantData.prenoms,
          email: commercantData.email,
          mdp: 'Test123456!',
          role: 'Commercant',
          telephone: `034${Math.floor(Math.random() * 10000000)}`,
          genre: 'Masculin',
          isActive: true
        });
        console.log(`   ✅ Commerçant ${commercantData.prenoms} ${commercantData.nom} créé`);
      } else {
        console.log(`   ⏭️  Commerçant ${commercantData.prenoms} ${commercantData.nom} existe déjà`);
      }
      commercants.push(commercant);
    }
    
    // 5. Créer des boutiques
    console.log('\n🏬 5. Boutiques...');
    const boutiques = [];
    const boutiquesData = [
      { nom: 'Mode & Style', categorie: 'Mode', commercant: 0 },
      { nom: 'Tech Store', categorie: 'Électronique', commercant: 1 },
      { nom: 'Bio Market', categorie: 'Alimentation', commercant: 2 },
      { nom: 'Beauty Corner', categorie: 'Beauté', commercant: 3 },
    ];
    
    for (const boutiqueData of boutiquesData) {
      let boutique = await Boutique.findOne({ 
        nom: boutiqueData.nom,
        commercant: commercants[boutiqueData.commercant]._id 
      });
      
      if (!boutique) {
        boutique = await Boutique.create({
          nom: boutiqueData.nom,
          description: `Boutique de ${boutiqueData.categorie.toLowerCase()}`,
          categorie: boutiqueData.categorie,
          commercant: commercants[boutiqueData.commercant]._id,
          proprietaire: commercants[boutiqueData.commercant]._id,
          statutBoutique: 'EnAttente',
          contact: {
            telephone: commercants[boutiqueData.commercant].telephone,
            email: commercants[boutiqueData.commercant].email
          }
        });
        console.log(`   ✅ Boutique "${boutiqueData.nom}" créée`);
      } else {
        console.log(`   ⏭️  Boutique "${boutiqueData.nom}" existe déjà`);
      }
      boutiques.push(boutique);
    }
    
    // 6. Créer des demandes de location
    console.log('\n📝 6. Demandes de location...');
    
    // Supprimer les anciennes demandes de test
    await DemandeLocation.deleteMany({
      boutique: { $in: boutiques.map(b => b._id) }
    });
    console.log('   🗑️  Anciennes demandes supprimées');
    
    const demandes = [];
    const demandesData = [
      { 
        boutique: 0, 
        espace: 0, 
        duree: 12, 
        message: 'Nous souhaitons ouvrir une boutique de mode au rez-de-chaussée pour bénéficier du passage.' 
      },
      { 
        boutique: 1, 
        espace: 1, 
        duree: 24, 
        message: 'Espace idéal pour notre magasin d\'électronique. Nous avons déjà 3 boutiques dans d\'autres centres.' 
      },
      { 
        boutique: 2, 
        espace: 3, 
        duree: 36, 
        message: 'Parfait pour notre concept de magasin bio. Surface adaptée à nos besoins.' 
      },
      { 
        boutique: 3, 
        espace: 4, 
        duree: 18, 
        message: 'Nous recherchons un espace lumineux pour notre institut de beauté.' 
      },
    ];
    
    for (const demandeData of demandesData) {
      const dateDebut = new Date();
      dateDebut.setDate(dateDebut.getDate() + 30); // Dans 30 jours
      
      const demande = await DemandeLocation.create({
        boutique: boutiques[demandeData.boutique]._id,
        espace: espaces[demandeData.espace]._id,
        etatDemande: 'EnAttente',
        dateDebutSouhaitee: dateDebut,
        dureeContrat: demandeData.duree,
        messageCommercant: demandeData.message
      });
      
      demandes.push(demande);
      console.log(`   ✅ Demande créée: ${boutiques[demandeData.boutique].nom} → Espace ${espaces[demandeData.espace].code}`);
    }
    
    // Résumé
    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`✅ Centre commercial: 1`);
    console.log(`✅ Étages: ${etages.length}`);
    console.log(`✅ Espaces disponibles: ${espaces.length}`);
    console.log(`✅ Commerçants: ${commercants.length}`);
    console.log(`✅ Boutiques: ${boutiques.length}`);
    console.log(`✅ Demandes de location: ${demandes.length}`);
    
    console.log('\n🎯 Données prêtes pour les tests !');
    console.log('\n📝 Comptes de test:');
    console.log('   Admin: admin@mall.com / Admin123456!');
    commercants.forEach((c, i) => {
      console.log(`   Commerçant ${i + 1}: ${c.email} / Test123456!`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedDemandesLocation();
