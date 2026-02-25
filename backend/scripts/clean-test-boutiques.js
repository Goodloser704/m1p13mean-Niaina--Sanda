/**
 * 🧹 Script de nettoyage des boutiques de test
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Boutique = require('../models/Boutique');
const TypeProduit = require('../models/TypeProduit');
const Produit = require('../models/Produit');

async function cleanTestBoutiques() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Supprimer les boutiques de test
    console.log('🧹 Suppression des boutiques de test...');
    const boutiquesResult = await Boutique.deleteMany({
      nom: { $regex: /test|sanda/i }
    });
    console.log(`✅ ${boutiquesResult.deletedCount} boutiques de test supprimées`);

    // Supprimer les types de produits de test
    console.log('\n🧹 Suppression des types de produits de test...');
    const typesResult = await TypeProduit.deleteMany({
      type: { $regex: /test|électronique test|réactivation/i }
    });
    console.log(`✅ ${typesResult.deletedCount} types de produits de test supprimés`);

    // Supprimer les produits de test
    console.log('\n🧹 Suppression des produits de test...');
    const produitsResult = await Produit.deleteMany({
      nom: { $regex: /test|smartphone test/i }
    });
    console.log(`✅ ${produitsResult.deletedCount} produits de test supprimés`);

    console.log('\n✅ Nettoyage terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

cleanTestBoutiques();
