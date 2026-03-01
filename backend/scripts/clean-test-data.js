const mongoose = require('mongoose');
require('dotenv').config();

// Importer les modèles
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function cleanTestData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Compter les données existantes
    const boutiqueCount = await Boutique.countDocuments();
    const userCount = await User.countDocuments();
    const notificationCount = await Notification.countDocuments();

    console.log('\n📊 Données actuelles:');
    console.log(`   🏪 Boutiques: ${boutiqueCount}`);
    console.log(`   👤 Utilisateurs: ${userCount}`);
    console.log(`   🔔 Notifications: ${notificationCount}`);

    // Lister les boutiques existantes
    const boutiques = await Boutique.find().populate('proprietaire', 'nom prenom email');
    console.log('\n🏪 Boutiques existantes:');
    boutiques.forEach(boutique => {
      console.log(`   - ${boutique.nom} (${boutique.statut}) - Propriétaire: ${boutique.proprietaire?.prenom} ${boutique.proprietaire?.nom}`);
    });

    // Demander confirmation pour supprimer
    console.log('\n⚠️  ATTENTION: Cette opération va supprimer TOUTES les données de test');
    console.log('   Pour continuer, modifiez le script et décommentez les lignes de suppression');

    // Décommenter ces lignes pour effectuer la suppression
    
    console.log('\n🧹 Suppression des données de test...');
    
    // Supprimer toutes les boutiques
    const deletedBoutiques = await Boutique.deleteMany({});
    console.log(`✅ ${deletedBoutiques.deletedCount} boutiques supprimées`);
    
    // Supprimer toutes les notifications
    const deletedNotifications = await Notification.deleteMany({});
    console.log(`✅ ${deletedNotifications.deletedCount} notifications supprimées`);
    
    // Optionnel: Supprimer tous les utilisateurs (ATTENTION!)
    // const deletedUsers = await User.deleteMany({});
    // console.log(`✅ ${deletedUsers.deletedCount} utilisateurs supprimés`);
    
    console.log('\n🎉 Nettoyage terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

cleanTestData();