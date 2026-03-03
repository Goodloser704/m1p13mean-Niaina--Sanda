/**
 * 🔔 Script pour créer des notifications de test dans MongoDB
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

async function createTestNotifications() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les utilisateurs
    const admin = await User.findOne({ email: 'admin@mallapp.com' });
    const client = await User.findOne({ email: 'client@test.com' });

    if (!admin || !client) {
      console.log('❌ Utilisateurs non trouvés');
      process.exit(1);
    }

    console.log(`👤 Admin ID: ${admin._id}`);
    console.log(`👤 Client ID: ${client._id}\n`);

    // Supprimer les anciennes notifications de test
    await Notification.deleteMany({
      recipient: { $in: [admin._id, client._id] }
    });
    console.log('🗑️  Anciennes notifications supprimées\n');

    // Créer des notifications pour l'admin
    console.log('📝 Création de notifications pour Admin...');
    await Notification.create([
      {
        receveur: admin._id,
        recipient: admin._id,
        title: 'Test Notification 1',
        message: 'Première notification de test pour l\'admin',
        type: 'Paiement',
        estLu: false,
        isRead: false
      },
      {
        receveur: admin._id,
        recipient: admin._id,
        title: 'Test Notification 2',
        message: 'Deuxième notification de test',
        type: 'Achat',
        estLu: false,
        isRead: false
      },
      {
        receveur: admin._id,
        recipient: admin._id,
        title: 'Test Notification 3',
        message: 'Troisième notification de test',
        type: 'Vente',
        estLu: false,
        isRead: false
      }
    ]);
    console.log('✅ 3 notifications créées pour Admin\n');

    // Créer des notifications pour le client
    console.log('📝 Création de notifications pour Client...');
    await Notification.create([
      {
        receveur: client._id,
        recipient: client._id,
        title: 'Bienvenue',
        message: 'Bienvenue sur Mall App!',
        type: 'Achat',
        estLu: false,
        isRead: false
      },
      {
        receveur: client._id,
        recipient: client._id,
        title: 'Nouvelle offre',
        message: 'Découvrez nos nouvelles boutiques',
        type: 'Paiement',
        estLu: false,
        isRead: false
      }
    ]);
    console.log('✅ 2 notifications créées pour Client\n');

    // Vérifier les counts
    const adminCount = await Notification.countDocuments({ receveur: admin._id, estLu: false });
    const clientCount = await Notification.countDocuments({ receveur: client._id, estLu: false });

    console.log('📊 Résumé:');
    console.log(`   Admin: ${adminCount} notifications non lues`);
    console.log(`   Client: ${clientCount} notifications non lues`);

    console.log('\n✅ Notifications de test créées avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

createTestNotifications();
