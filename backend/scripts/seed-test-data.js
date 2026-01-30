const mongoose = require('mongoose');
require('dotenv').config();

// Importer les modèles
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Notification = require('../models/Notification');

/**
 * 🌱 Script de peuplement de données de test
 * Crée des utilisateurs, boutiques et notifications pour tester le système
 */

const testUsers = [
  // Admins
  {
    nom: 'Dubois',
    prenom: 'Pierre',
    email: 'admin@mall.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'admin2@mall.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },

  // Commerçants (multi-boutiques)
  {
    nom: 'Leroy',
    prenom: 'Marie',
    email: 'marie.leroy@boutique.com',
    password: 'boutique123',
    role: 'boutique',
    telephone: '01 23 45 67 89',
    adresse: '15 rue du Commerce, 75001 Paris',
    isActive: true
  },
  {
    nom: 'Moreau',
    prenom: 'Jean',
    email: 'jean.moreau@boutique.com',
    password: 'boutique123',
    role: 'boutique',
    telephone: '01 34 56 78 90',
    adresse: '28 avenue des Boutiques, 75002 Paris',
    isActive: true
  },
  {
    nom: 'Garcia',
    prenom: 'Carmen',
    email: 'carmen.garcia@boutique.com',
    password: 'boutique123',
    role: 'boutique',
    telephone: '01 45 67 89 01',
    adresse: '42 boulevard du Shopping, 75003 Paris',
    isActive: true
  },

  // Clients
  {
    nom: 'Dupont',
    prenom: 'Paul',
    email: 'paul.dupont@client.com',
    password: 'client123',
    role: 'client',
    telephone: '01 56 78 90 12',
    isActive: true
  },
  {
    nom: 'Bernard',
    prenom: 'Julie',
    email: 'julie.bernard@client.com',
    password: 'client123',
    role: 'client',
    telephone: '01 67 89 01 23',
    isActive: true
  }
];

const testBoutiques = [
  // Boutiques de Marie Leroy (3 boutiques)
  {
    nom: 'Fashion Élégance',
    description: 'Vêtements haut de gamme pour femmes et hommes. Collections exclusives et tendances actuelles.',
    categorie: 'Mode',
    emplacement: {
      zone: 'Centre',
      numeroLocal: 'A12',
      etage: 1
    },
    contact: {
      telephone: '01 23 45 67 89',
      email: 'contact@fashion-elegance.com',
      siteWeb: 'https://fashion-elegance.com'
    },
    horaires: {
      lundi: { ouverture: '10:00', fermeture: '19:00' },
      mardi: { ouverture: '10:00', fermeture: '19:00' },
      mercredi: { ouverture: '10:00', fermeture: '19:00' },
      jeudi: { ouverture: '10:00', fermeture: '20:00' },
      vendredi: { ouverture: '10:00', fermeture: '20:00' },
      samedi: { ouverture: '09:00', fermeture: '20:00' },
      dimanche: { ouverture: '14:00', fermeture: '18:00' }
    },
    statut: 'approuve'
  },
  {
    nom: 'Beauté Divine',
    description: 'Institut de beauté et parfumerie. Soins du visage, manucure, et cosmétiques de luxe.',
    categorie: 'Beauté',
    emplacement: {
      zone: 'Nord',
      numeroLocal: 'B05',
      etage: 0
    },
    contact: {
      telephone: '01 23 45 67 89',
      email: 'contact@beaute-divine.com',
      siteWeb: 'https://beaute-divine.com'
    },
    horaires: {
      lundi: { ouverture: '09:00', fermeture: '18:00' },
      mardi: { ouverture: '09:00', fermeture: '18:00' },
      mercredi: { ouverture: '09:00', fermeture: '18:00' },
      jeudi: { ouverture: '09:00', fermeture: '19:00' },
      vendredi: { ouverture: '09:00', fermeture: '19:00' },
      samedi: { ouverture: '08:00', fermeture: '19:00' },
      dimanche: { ouverture: '', fermeture: '' }
    },
    statut: 'approuve'
  },
  {
    nom: 'Accessoires Chic',
    description: 'Bijoux, sacs à main, foulards et accessoires de mode pour compléter votre style.',
    categorie: 'Mode',
    emplacement: {
      zone: 'Centre',
      numeroLocal: 'A18',
      etage: 1
    },
    contact: {
      telephone: '01 23 45 67 89',
      email: 'contact@accessoires-chic.com'
    },
    horaires: {
      lundi: { ouverture: '10:00', fermeture: '19:00' },
      mardi: { ouverture: '10:00', fermeture: '19:00' },
      mercredi: { ouverture: '10:00', fermeture: '19:00' },
      jeudi: { ouverture: '10:00', fermeture: '19:00' },
      vendredi: { ouverture: '10:00', fermeture: '19:00' },
      samedi: { ouverture: '10:00', fermeture: '19:00' },
      dimanche: { ouverture: '14:00', fermeture: '18:00' }
    },
    statut: 'en_attente'
  },

  // Boutiques de Jean Moreau (2 boutiques)
  {
    nom: 'Tech Innovation',
    description: 'Smartphones, ordinateurs, tablettes et accessoires high-tech. Service de réparation inclus.',
    categorie: 'Électronique',
    emplacement: {
      zone: 'Est',
      numeroLocal: 'C22',
      etage: 0
    },
    contact: {
      telephone: '01 34 56 78 90',
      email: 'contact@tech-innovation.com',
      siteWeb: 'https://tech-innovation.com'
    },
    horaires: {
      lundi: { ouverture: '09:00', fermeture: '19:00' },
      mardi: { ouverture: '09:00', fermeture: '19:00' },
      mercredi: { ouverture: '09:00', fermeture: '19:00' },
      jeudi: { ouverture: '09:00', fermeture: '20:00' },
      vendredi: { ouverture: '09:00', fermeture: '20:00' },
      samedi: { ouverture: '09:00', fermeture: '20:00' },
      dimanche: { ouverture: '10:00', fermeture: '18:00' }
    },
    statut: 'approuve'
  },
  {
    nom: 'Gaming Zone',
    description: 'Jeux vidéo, consoles, accessoires gaming et figurines. Paradise des gamers !',
    categorie: 'Électronique',
    emplacement: {
      zone: 'Est',
      numeroLocal: 'C25',
      etage: 1
    },
    contact: {
      telephone: '01 34 56 78 90',
      email: 'contact@gaming-zone.com',
      siteWeb: 'https://gaming-zone.com'
    },
    horaires: {
      lundi: { ouverture: '10:00', fermeture: '20:00' },
      mardi: { ouverture: '10:00', fermeture: '20:00' },
      mercredi: { ouverture: '10:00', fermeture: '20:00' },
      jeudi: { ouverture: '10:00', fermeture: '21:00' },
      vendredi: { ouverture: '10:00', fermeture: '21:00' },
      samedi: { ouverture: '09:00', fermeture: '21:00' },
      dimanche: { ouverture: '10:00', fermeture: '19:00' }
    },
    statut: 'en_attente'
  },

  // Boutiques de Carmen Garcia (2 boutiques)
  {
    nom: 'Saveurs du Monde',
    description: 'Épicerie fine internationale. Produits exotiques, spécialités régionales et délicatesses.',
    categorie: 'Alimentation',
    emplacement: {
      zone: 'Sud',
      numeroLocal: 'D08',
      etage: 0
    },
    contact: {
      telephone: '01 45 67 89 01',
      email: 'contact@saveurs-monde.com'
    },
    horaires: {
      lundi: { ouverture: '08:00', fermeture: '20:00' },
      mardi: { ouverture: '08:00', fermeture: '20:00' },
      mercredi: { ouverture: '08:00', fermeture: '20:00' },
      jeudi: { ouverture: '08:00', fermeture: '20:00' },
      vendredi: { ouverture: '08:00', fermeture: '20:00' },
      samedi: { ouverture: '07:00', fermeture: '21:00' },
      dimanche: { ouverture: '08:00', fermeture: '19:00' }
    },
    statut: 'approuve'
  },
  {
    nom: 'Déco Maison Plus',
    description: 'Décoration intérieure, meubles design, luminaires et objets déco pour embellir votre maison.',
    categorie: 'Maison',
    emplacement: {
      zone: 'Ouest',
      numeroLocal: 'E15',
      etage: 2
    },
    contact: {
      telephone: '01 45 67 89 01',
      email: 'contact@deco-maison-plus.com',
      siteWeb: 'https://deco-maison-plus.com'
    },
    horaires: {
      lundi: { ouverture: '10:00', fermeture: '18:00' },
      mardi: { ouverture: '10:00', fermeture: '18:00' },
      mercredi: { ouverture: '10:00', fermeture: '18:00' },
      jeudi: { ouverture: '10:00', fermeture: '19:00' },
      vendredi: { ouverture: '10:00', fermeture: '19:00' },
      samedi: { ouverture: '09:00', fermeture: '19:00' },
      dimanche: { ouverture: '14:00', fermeture: '18:00' }
    },
    statut: 'en_attente'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Démarrage du peuplement de la base de données...\n');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    // Nettoyer les données existantes
    console.log('\n🧹 Nettoyage des données existantes...');
    await User.deleteMany({});
    await Boutique.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Données existantes supprimées');

    // Créer les utilisateurs
    console.log('\n👥 Création des utilisateurs...');
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ ${user.role}: ${user.prenom} ${user.nom} (${user.email})`);
    }

    // Récupérer les IDs des commerçants
    const marie = createdUsers.find(u => u.email === 'marie.leroy@boutique.com');
    const jean = createdUsers.find(u => u.email === 'jean.moreau@boutique.com');
    const carmen = createdUsers.find(u => u.email === 'carmen.garcia@boutique.com');

    // Créer les boutiques
    console.log('\n🏪 Création des boutiques...');
    const createdBoutiques = [];
    
    // Boutiques de Marie (3)
    for (let i = 0; i < 3; i++) {
      const boutiqueData = { ...testBoutiques[i], proprietaire: marie._id };
      const boutique = new Boutique(boutiqueData);
      await boutique.save();
      createdBoutiques.push(boutique);
      console.log(`   ✅ ${boutique.nom} (${boutique.statut}) - Propriétaire: ${marie.prenom} ${marie.nom}`);
    }

    // Boutiques de Jean (2)
    for (let i = 3; i < 5; i++) {
      const boutiqueData = { ...testBoutiques[i], proprietaire: jean._id };
      const boutique = new Boutique(boutiqueData);
      await boutique.save();
      createdBoutiques.push(boutique);
      console.log(`   ✅ ${boutique.nom} (${boutique.statut}) - Propriétaire: ${jean.prenom} ${jean.nom}`);
    }

    // Boutiques de Carmen (2)
    for (let i = 5; i < 7; i++) {
      const boutiqueData = { ...testBoutiques[i], proprietaire: carmen._id };
      const boutique = new Boutique(boutiqueData);
      await boutique.save();
      createdBoutiques.push(boutique);
      console.log(`   ✅ ${boutique.nom} (${boutique.statut}) - Propriétaire: ${carmen.prenom} ${carmen.nom}`);
    }

    // Créer des notifications pour les boutiques en attente
    console.log('\n🔔 Création des notifications...');
    const admins = createdUsers.filter(u => u.role === 'admin');
    const boutiquesEnAttente = createdBoutiques.filter(b => b.statut === 'en_attente');

    let notificationCount = 0;
    for (const boutique of boutiquesEnAttente) {
      const proprietaire = createdUsers.find(u => u._id.equals(boutique.proprietaire));
      
      for (const admin of admins) {
        const notification = new Notification({
          type: 'boutique_registration',
          title: '🏪 Nouvelle inscription boutique',
          message: `${proprietaire.prenom} ${proprietaire.nom} a inscrit sa boutique "${boutique.nom}" et attend votre validation.`,
          recipient: admin._id,
          recipientRole: 'admin',
          relatedEntity: {
            entityType: 'Boutique',
            entityId: boutique._id
          },
          data: {
            boutiqueId: boutique._id,
            boutiqueName: boutique.nom,
            ownerName: `${proprietaire.prenom} ${proprietaire.nom}`,
            ownerEmail: proprietaire.email,
            category: boutique.categorie,
            registrationDate: new Date()
          },
          priority: 'high',
          actionRequired: true,
          actionType: 'approve_boutique',
          actionUrl: `/admin/boutiques/pending/${boutique._id}`
        });
        
        await notification.save();
        notificationCount++;
      }
      
      console.log(`   ✅ Notifications créées pour: ${boutique.nom}`);
    }

    // Résumé final
    console.log('\n📊 Résumé du peuplement:');
    console.log(`   👥 Utilisateurs créés: ${createdUsers.length}`);
    console.log(`      - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`      - Commerçants: ${createdUsers.filter(u => u.role === 'boutique').length}`);
    console.log(`      - Clients: ${createdUsers.filter(u => u.role === 'client').length}`);
    console.log(`   🏪 Boutiques créées: ${createdBoutiques.length}`);
    console.log(`      - Approuvées: ${createdBoutiques.filter(b => b.statut === 'approuve').length}`);
    console.log(`      - En attente: ${createdBoutiques.filter(b => b.statut === 'en_attente').length}`);
    console.log(`   🔔 Notifications créées: ${notificationCount}`);

    console.log('\n🎉 Peuplement terminé avec succès !');
    console.log('\n📋 Comptes de test disponibles:');
    console.log('   👨‍💼 Admin: admin@mall.com / admin123');
    console.log('   👨‍💼 Admin: admin2@mall.com / admin123');
    console.log('   🏪 Marie (3 boutiques): marie.leroy@boutique.com / boutique123');
    console.log('   🏪 Jean (2 boutiques): jean.moreau@boutique.com / boutique123');
    console.log('   🏪 Carmen (2 boutiques): carmen.garcia@boutique.com / boutique123');
    console.log('   🛍️ Client: paul.dupont@client.com / client123');
    console.log('   🛍️ Client: julie.bernard@client.com / client123');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
seedDatabase();