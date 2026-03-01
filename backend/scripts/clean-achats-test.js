require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Achat = require('../models/Achat');
const Facture = require('../models/Facture');
const Produit = require('../models/Produit');
const TypeProduit = require('../models/TypeProduit');
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const PFTransaction = require('../models/PFTransaction');
const PorteFeuille = require('../models/PorteFeuille');

/**
 * 🧹 Script de nettoyage des données de test pour les achats
 * Supprime les achats, factures, produits et boutiques de test
 */

async function cleanAchatsTest() {
  try {
    console.log('🧹 Nettoyage des données de test achats...\n');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📊 État avant nettoyage:');
    const achatsBefore = await Achat.countDocuments();
    const facturesBefore = await Facture.countDocuments();
    const produitsBefore = await Produit.countDocuments();
    const transactionsBefore = await PFTransaction.countDocuments();
    
    console.log(`  - Achats: ${achatsBefore}`);
    console.log(`  - Factures: ${facturesBefore}`);
    console.log(`  - Produits: ${produitsBefore}`);
    console.log(`  - Transactions: ${transactionsBefore}\n`);

    // Récupérer le commerçant de test
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    if (!commercant) {
      console.log('⚠️  Commerçant de test non trouvé');
      await mongoose.disconnect();
      return;
    }

    // Trouver la boutique de test
    const boutique = await Boutique.findOne({ commercant: commercant._id });
    if (!boutique) {
      console.log('⚠️  Boutique de test non trouvée');
      await mongoose.disconnect();
      return;
    }

    console.log(`🏪 Boutique trouvée: ${boutique.nom} (ID: ${boutique._id})\n`);

    // Supprimer les achats liés aux produits de cette boutique
    const produits = await Produit.find({ boutique: boutique._id });
    const produitIds = produits.map(p => p._id);

    console.log(`📦 ${produits.length} produits trouvés\n`);

    // Supprimer les achats
    const achatsResult = await Achat.deleteMany({ produit: { $in: produitIds } });
    console.log(`✅ ${achatsResult.deletedCount} achats supprimés`);

    // Supprimer les factures (celles qui n'ont plus d'achats)
    const facturesResult = await Facture.deleteMany({
      _id: { $nin: await Achat.distinct('facture') }
    });
    console.log(`✅ ${facturesResult.deletedCount} factures supprimées`);

    // Supprimer les transactions liées aux achats
    const transactionsResult = await PFTransaction.deleteMany({
      'relatedEntity.entityType': 'Achat'
    });
    console.log(`✅ ${transactionsResult.deletedCount} transactions supprimées`);

    // Supprimer les produits
    const produitsResult = await Produit.deleteMany({ boutique: boutique._id });
    console.log(`✅ ${produitsResult.deletedCount} produits supprimés`);

    // Supprimer les types de produits de cette boutique
    const typesResult = await TypeProduit.deleteMany({ boutique: boutique._id });
    console.log(`✅ ${typesResult.deletedCount} types de produits supprimés`);

    // Réinitialiser les soldes des portefeuilles
    const acheteur = await User.findOne({ email: 'client@test.com' });
    if (acheteur) {
      const portefeuilleAcheteur = await PorteFeuille.findOne({ owner: acheteur._id });
      if (portefeuilleAcheteur) {
        portefeuilleAcheteur.balance = 1000; // Réinitialiser à 1000€
        await portefeuilleAcheteur.save();
        console.log(`✅ Portefeuille acheteur réinitialisé à 1000€`);
      }
    }

    const portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
    if (portefeuilleCommercant) {
      portefeuilleCommercant.balance = 0; // Réinitialiser à 0€
      await portefeuilleCommercant.save();
      console.log(`✅ Portefeuille commerçant réinitialisé à 0€`);
    }

    console.log('\n📊 État après nettoyage:');
    const achatsAfter = await Achat.countDocuments();
    const facturesAfter = await Facture.countDocuments();
    const produitsAfter = await Produit.countDocuments();
    const transactionsAfter = await PFTransaction.countDocuments();
    
    console.log(`  - Achats: ${achatsAfter} (${achatsBefore - achatsAfter} supprimés)`);
    console.log(`  - Factures: ${facturesAfter} (${facturesBefore - facturesAfter} supprimées)`);
    console.log(`  - Produits: ${produitsAfter} (${produitsBefore - produitsAfter} supprimés)`);
    console.log(`  - Transactions: ${transactionsAfter} (${transactionsBefore - transactionsAfter} supprimées)\n`);

    console.log('🔌 Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanAchatsTest();
