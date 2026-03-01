require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const CategorieBoutique = require('../models/CategorieBoutique');
const TypeProduit = require('../models/TypeProduit');
const PorteFeuille = require('../models/PorteFeuille');

/**
 * 🛒 Script de seed pour les tests d'achats
 * Crée une boutique avec des produits pour tester les achats
 */

async function seedAchatsTest() {
  try {
    console.log('🛒 Seed des données pour tests d\'achats...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le commerçant de test
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    if (!commercant) {
      throw new Error('Commerçant de test non trouvé');
    }
    console.log(`✅ Commerçant trouvé: ${commercant.email}`);

    // Récupérer ou créer une catégorie
    let categorie = await CategorieBoutique.findOne({ nom: 'Vêtements' });
    if (!categorie) {
      categorie = new CategorieBoutique({
        nom: 'Vêtements',
        description: 'Boutique de vêtements',
        isActive: true
      });
      await categorie.save();
      console.log('✅ Catégorie créée: Vêtements');
    } else {
      console.log('⏭️  Catégorie existe: Vêtements');
    }

    // Créer ou récupérer une boutique
    let boutique = await Boutique.findOne({ commercant: commercant._id });
    if (!boutique) {
      boutique = new Boutique({
        nom: 'Boutique Test Achats',
        description: 'Boutique pour tester les achats',
        commercant: commercant._id,
        categorie: categorie._id,
        contact: {
          telephone: '0340000001',
          email: 'boutique@test.com'
        },
        horaires: [
          {
            jour: 'Lundi',
            ouverture: '08:00',
            fermeture: '18:00',
            estOuvert: true
          }
        ],
        statut: 'Actif',
        isActive: true
      });
      await boutique.save();
      console.log(`✅ Boutique créée: ${boutique.nom} (ID: ${boutique._id})`);
    } else {
      console.log(`⏭️  Boutique existe: ${boutique.nom} (ID: ${boutique._id})`);
    }

    // Récupérer ou créer un type de produit
    let typeProduit = await TypeProduit.findOne({ type: 'T-Shirts', boutique: boutique._id });
    if (!typeProduit) {
      typeProduit = new TypeProduit({
        type: 'T-Shirts',
        boutique: boutique._id,
        description: 'T-Shirts en coton',
        icone: '👕',
        couleur: '#9c27b0',
        isActive: true
      });
      await typeProduit.save();
      console.log('✅ Type de produit créé: T-Shirts');
    } else {
      console.log('⏭️  Type de produit existe: T-Shirts');
    }

    // Créer des produits
    const produitsData = [
      {
        nom: 'T-Shirt Blanc',
        description: 'T-Shirt blanc en coton',
        prix: 15.99,
        stock: { nombreDispo: 50, nombreTotal: 50 },
        tempsPreparation: '00:15:00'
      },
      {
        nom: 'T-Shirt Noir',
        description: 'T-Shirt noir en coton',
        prix: 17.99,
        stock: { nombreDispo: 30, nombreTotal: 30 },
        tempsPreparation: '00:15:00'
      },
      {
        nom: 'T-Shirt Rouge',
        description: 'T-Shirt rouge en coton',
        prix: 16.99,
        stock: { nombreDispo: 40, nombreTotal: 40 },
        tempsPreparation: '00:20:00'
      },
      {
        nom: 'T-Shirt Bleu',
        description: 'T-Shirt bleu en coton',
        prix: 18.99,
        stock: { nombreDispo: 25, nombreTotal: 25 },
        tempsPreparation: '00:10:00'
      },
      {
        nom: 'T-Shirt Vert',
        description: 'T-Shirt vert en coton',
        prix: 19.99,
        stock: { nombreDispo: 20, nombreTotal: 20 },
        tempsPreparation: '00:30:00'
      }
    ];

    let produitsCreees = 0;
    const produits = [];

    for (const produitData of produitsData) {
      let produit = await Produit.findOne({
        nom: produitData.nom,
        boutique: boutique._id
      });

      if (!produit) {
        produit = new Produit({
          ...produitData,
          boutique: boutique._id,
          typeProduit: typeProduit._id,
          tags: ['coton', 'casual', 'unisexe'],
          isActive: true
        });
        await produit.save();
        produitsCreees++;
        console.log(`✅ Produit créé: ${produit.nom} - ${produit.prix}€ (Stock: ${produit.stock.nombreDispo})`);
      } else {
        console.log(`⏭️  Produit existe: ${produit.nom}`);
      }

      produits.push(produit);
    }

    // Vérifier/créer le portefeuille du commerçant
    let portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
    if (!portefeuilleCommercant) {
      portefeuilleCommercant = new PorteFeuille({
        owner: commercant._id,
        balance: 0
      });
      await portefeuilleCommercant.save();
      console.log('✅ Portefeuille commerçant créé');
    } else {
      console.log('⏭️  Portefeuille commerçant existe');
    }

    // Vérifier/créer le portefeuille de l'acheteur
    const acheteur = await User.findOne({ email: 'client@test.com' });
    if (acheteur) {
      let portefeuilleAcheteur = await PorteFeuille.findOne({ owner: acheteur._id });
      if (!portefeuilleAcheteur) {
        portefeuilleAcheteur = new PorteFeuille({
          owner: acheteur._id,
          balance: 1000 // Donner 1000€ pour les tests
        });
        await portefeuilleAcheteur.save();
        console.log('✅ Portefeuille acheteur créé avec 1000€');
      } else {
        // Ajouter du solde si nécessaire
        if (portefeuilleAcheteur.balance < 500) {
          portefeuilleAcheteur.balance = 1000;
          await portefeuilleAcheteur.save();
          console.log('✅ Portefeuille acheteur rechargé à 1000€');
        } else {
          console.log(`⏭️  Portefeuille acheteur existe: ${portefeuilleAcheteur.balance}€`);
        }
      }
    }

    console.log(`\n📊 === RÉSUMÉ ===`);
    console.log(`✅ Boutique: ${boutique.nom}`);
    console.log(`✅ Nouveaux produits: ${produitsCreees}`);
    console.log(`✅ Total produits: ${produits.length}`);
    console.log(`✅ Stock total disponible: ${produits.reduce((sum, p) => sum + p.stock.nombreDispo, 0)} unités`);

    console.log('\n🔌 Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le seed
seedAchatsTest();
