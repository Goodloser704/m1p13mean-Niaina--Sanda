const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import des modèles
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Product = require('../models/Product');

const initDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mall_db');
    console.log('✅ Connexion MongoDB réussie');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Boutique.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Base de données nettoyée');

    // Créer un admin
    const admin = new User({
      email: 'admin@mall.com',
      password: 'admin123', // Le modèle va hasher automatiquement
      nom: 'Admin',
      prenom: 'Centre',
      role: 'admin'
    });
    await admin.save();
    console.log('👤 Admin créé: admin@mall.com / admin123');

    // Créer des utilisateurs boutique
    const boutiqueUsers = [];
    const boutiques = [
      {
        email: 'fashion@mall.com',
        nom: 'Martin',
        prenom: 'Sophie',
        boutique: {
          nom: 'Fashion Store',
          description: 'Les dernières tendances mode pour tous',
          categorie: 'Mode',
          emplacement: { zone: 'A', numeroLocal: '12', etage: 1 },
          contact: { telephone: '0123456789', email: 'fashion@mall.com' },
          statut: 'approuve'
        }
      },
      {
        email: 'tech@mall.com',
        nom: 'Dubois',
        prenom: 'Pierre',
        boutique: {
          nom: 'Tech Corner',
          description: 'Électronique et gadgets high-tech',
          categorie: 'Électronique',
          emplacement: { zone: 'B', numeroLocal: '25', etage: 2 },
          contact: { telephone: '0123456790', email: 'tech@mall.com' },
          statut: 'approuve'
        }
      },
      {
        email: 'gourmet@mall.com',
        nom: 'Leroy',
        prenom: 'Marie',
        boutique: {
          nom: 'Gourmet Délices',
          description: 'Produits gastronomiques et spécialités',
          categorie: 'Alimentation',
          emplacement: { zone: 'C', numeroLocal: '8', etage: 0 },
          contact: { telephone: '0123456791', email: 'gourmet@mall.com' },
          statut: 'approuve'
        }
      }
    ];

    for (const boutiqueData of boutiques) {
      const user = new User({
        email: boutiqueData.email,
        password: 'boutique123', // Le modèle va hasher automatiquement
        nom: boutiqueData.nom,
        prenom: boutiqueData.prenom,
        role: 'boutique'
      });
      await user.save();
      boutiqueUsers.push({ user, boutiqueInfo: boutiqueData.boutique });
    }
    console.log('🏪 Utilisateurs boutique créés');

    // Créer les boutiques
    const createdBoutiques = [];
    for (const { user, boutiqueInfo } of boutiqueUsers) {
      const boutique = new Boutique({
        ...boutiqueInfo,
        proprietaire: user._id,
        note: { moyenne: 4 + Math.random(), nombreAvis: Math.floor(Math.random() * 100) + 10 }
      });
      await boutique.save();
      createdBoutiques.push(boutique);
    }
    console.log('🏪 Boutiques créées');

    // Créer des produits
    const produits = [
      // Fashion Store
      {
        nom: 'Robe d\'été fleurie',
        description: 'Robe légère parfaite pour l\'été',
        prix: 49.99,
        categorie: 'Mode',
        stock: { quantite: 15, seuil: 3 },
        caracteristiques: { taille: ['S', 'M', 'L', 'XL'], couleur: ['Bleu', 'Rouge', 'Vert'] }
      },
      {
        nom: 'Jean slim homme',
        description: 'Jean coupe slim, confortable et moderne',
        prix: 79.99,
        prixPromo: 59.99,
        categorie: 'Mode',
        stock: { quantite: 25, seuil: 5 },
        caracteristiques: { taille: ['30', '32', '34', '36', '38'], couleur: ['Bleu', 'Noir'] }
      },
      // Tech Corner
      {
        nom: 'Smartphone Galaxy Pro',
        description: 'Dernier smartphone avec appareil photo 108MP',
        prix: 899.99,
        categorie: 'Électronique',
        stock: { quantite: 8, seuil: 2 },
        caracteristiques: { couleur: ['Noir', 'Blanc', 'Bleu'], marque: 'Samsung' }
      },
      {
        nom: 'Écouteurs Bluetooth',
        description: 'Écouteurs sans fil avec réduction de bruit',
        prix: 149.99,
        prixPromo: 119.99,
        categorie: 'Électronique',
        stock: { quantite: 20, seuil: 5 },
        caracteristiques: { couleur: ['Noir', 'Blanc'], marque: 'TechSound' }
      },
      // Gourmet Délices
      {
        nom: 'Chocolats artisanaux',
        description: 'Assortiment de chocolats fins faits maison',
        prix: 24.99,
        categorie: 'Alimentation',
        stock: { quantite: 30, seuil: 8 },
        caracteristiques: { autres: { poids: '250g', origine: 'Belgique' } }
      },
      {
        nom: 'Confiture de fraises bio',
        description: 'Confiture artisanale aux fraises biologiques',
        prix: 8.99,
        categorie: 'Alimentation',
        stock: { quantite: 45, seuil: 10 },
        caracteristiques: { autres: { poids: '350g', bio: true } }
      }
    ];

    let productIndex = 0;
    for (const boutique of createdBoutiques) {
      // 2 produits par boutique
      for (let i = 0; i < 2; i++) {
        if (productIndex < produits.length) {
          const produit = new Product({
            ...produits[productIndex],
            boutique: boutique._id,
            note: { moyenne: 3.5 + Math.random() * 1.5, nombreAvis: Math.floor(Math.random() * 50) + 5 }
          });
          await produit.save();
          productIndex++;
        }
      }
    }
    console.log('📦 Produits créés');

    // Créer des clients de test
    const clients = [
      {
        email: 'client1@test.com',
        password: 'client123', // Le modèle va hasher automatiquement
        nom: 'Dupont',
        prenom: 'Jean',
        role: 'client',
        telephone: '0123456792',
        adresse: {
          rue: '123 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France'
        }
      },
      {
        email: 'client2@test.com',
        password: 'client123', // Le modèle va hasher automatiquement
        nom: 'Bernard',
        prenom: 'Marie',
        role: 'client',
        telephone: '0123456793',
        adresse: {
          rue: '456 Avenue des Champs',
          ville: 'Lyon',
          codePostal: '69001',
          pays: 'France'
        }
      }
    ];

    for (const clientData of clients) {
      const client = new User(clientData);
      await client.save();
    }
    console.log('👥 Clients créés');

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n📋 Comptes de test créés :');
    console.log('Admin: admin@mall.com / admin123');
    console.log('Boutiques: fashion@mall.com, tech@mall.com, gourmet@mall.com / boutique123');
    console.log('Clients: client1@test.com, client2@test.com / client123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter le script
initDatabase();