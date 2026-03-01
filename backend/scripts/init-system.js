/**
 * 🚀 Script d'initialisation du système
 * 
 * Ce script initialise le système avec :
 * - Un centre commercial par défaut
 * - Un admin par défaut
 * - Les catégories de boutiques par défaut
 * - Les portefeuilles pour les utilisateurs existants
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { RoleEnum } = require('../utils/enums');

// Modèles
const User = require('../models/User');
const CentreCommercial = require('../models/CentreCommercial');
const CategorieBoutique = require('../models/CategorieBoutique');
const PorteFeuille = require('../models/PorteFeuille');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall-app';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}

async function creerCentreCommercial() {
  console.log('\n🏢 Création du centre commercial...');
  
  try {
    const centreExistant = await CentreCommercial.findOne();
    
    if (centreExistant) {
      console.log('ℹ️  Centre commercial déjà existant:', centreExistant.nom);
      return centreExistant;
    }
    
    const centreCommercial = new CentreCommercial({
      nom: 'Centre Commercial Moderne',
      description: 'Un centre commercial moderne avec de nombreuses boutiques et services',
      adresse: '123 Avenue du Commerce, 75001 Paris, France',
      email: 'contact@centre-moderne.fr',
      telephone: '+33 1 23 45 67 89',
      horairesGeneraux: {
        lundi: { ouverture: '09:00', fermeture: '20:00' },
        mardi: { ouverture: '09:00', fermeture: '20:00' },
        mercredi: { ouverture: '09:00', fermeture: '20:00' },
        jeudi: { ouverture: '09:00', fermeture: '20:00' },
        vendredi: { ouverture: '09:00', fermeture: '21:00' },
        samedi: { ouverture: '09:00', fermeture: '21:00' },
        dimanche: { ouverture: '10:00', fermeture: '19:00' }
      },
      siteWeb: 'https://www.centre-moderne.fr',
      reseauxSociaux: {
        facebook: 'https://facebook.com/centre-moderne',
        instagram: 'https://instagram.com/centre_moderne',
        twitter: 'https://twitter.com/centre_moderne'
      }
    });
    
    await centreCommercial.save();
    console.log('✅ Centre commercial créé:', centreCommercial.nom);
    return centreCommercial;
  } catch (error) {
    console.error('❌ Erreur lors de la création du centre commercial:', error);
    throw error;
  }
}

async function creerAdminParDefaut() {
  console.log('\n👨‍💼 Création de l\'admin par défaut...');
  
  try {
    const adminExistant = await User.findOne({ role: RoleEnum.Admin });
    
    if (adminExistant) {
      console.log('ℹ️  Admin déjà existant:', adminExistant.email);
      return adminExistant;
    }
    
    const motDePasseHash = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      email: 'admin@mall-app.com',
      password: motDePasseHash,
      mdp: motDePasseHash,
      role: RoleEnum.Admin,
      nom: 'Administrateur',
      prenom: 'Système',
      prenoms: 'Système',
      telephone: '+33 1 23 45 67 89',
      isActive: true,
      status: 'active',
      dateCreation: new Date()
    });
    
    await admin.save();
    console.log('✅ Admin créé:', admin.email);
    console.log('🔑 Mot de passe:', 'admin123');
    
    return admin;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    throw error;
  }
}

async function creerCategoriesParDefaut() {
  console.log('\n🏷️  Création des catégories de boutiques...');
  
  try {
    await CategorieBoutique.creerCategoriesParDefaut();
    console.log('✅ Catégories de boutiques créées');
    
    const categories = await CategorieBoutique.obtenirCategoriesActives();
    console.log('📋 Catégories disponibles:');
    categories.forEach(cat => {
      console.log(`   ${cat.icone} ${cat.categorie} - ${cat.description}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création des catégories:', error);
    throw error;
  }
}

async function creerPortefeuillesPourUtilisateursExistants() {
  console.log('\n💰 Création des portefeuilles pour les utilisateurs existants...');
  
  try {
    const utilisateurs = await User.find();
    let portefeuillesCrees = 0;
    
    for (const utilisateur of utilisateurs) {
      const portefeuilleExistant = await PorteFeuille.findOne({ owner: utilisateur._id });
      
      if (!portefeuilleExistant) {
        // Balance initiale selon le rôle
        let balanceInitiale = 0;
        if (utilisateur.role === RoleEnum.Admin) {
          balanceInitiale = 10000; // 10,000€ pour l'admin
        } else if (utilisateur.role === RoleEnum.Acheteur) {
          balanceInitiale = 500; // 500€ pour les acheteurs
        } else if (utilisateur.role === RoleEnum.Commercant) {
          balanceInitiale = 1000; // 1,000€ pour les commerçants
        }
        
        await PorteFeuille.creerPourUtilisateur(utilisateur._id, balanceInitiale);
        portefeuillesCrees++;
        console.log(`   ✅ Portefeuille créé pour ${utilisateur.email} (${utilisateur.role}) - Balance: ${balanceInitiale}€`);
      }
    }
    
    if (portefeuillesCrees === 0) {
      console.log('ℹ️  Tous les utilisateurs ont déjà un portefeuille');
    } else {
      console.log(`✅ ${portefeuillesCrees} portefeuilles créés`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des portefeuilles:', error);
    throw error;
  }
}

async function afficherResume() {
  console.log('\n📊 Résumé du système:');
  
  try {
    const centreCommercial = await CentreCommercial.getPrincipal();
    const nombreUtilisateurs = await User.countDocuments();
    const nombreAdmins = await User.countDocuments({ role: RoleEnum.Admin });
    const nombreCommercants = await User.countDocuments({ role: RoleEnum.Commercant });
    const nombreAcheteurs = await User.countDocuments({ role: RoleEnum.Acheteur });
    const nombreCategories = await CategorieBoutique.countDocuments({ isActive: true });
    const nombrePortefeuilles = await PorteFeuille.countDocuments({ isActive: true });
    
    console.log(`🏢 Centre Commercial: ${centreCommercial?.nom || 'Non défini'}`);
    console.log(`👥 Utilisateurs: ${nombreUtilisateurs} total`);
    console.log(`   👨‍💼 Admins: ${nombreAdmins}`);
    console.log(`   🏪 Commerçants: ${nombreCommercants}`);
    console.log(`   🛍️  Acheteurs: ${nombreAcheteurs}`);
    console.log(`🏷️  Catégories: ${nombreCategories}`);
    console.log(`💰 Portefeuilles: ${nombrePortefeuilles}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage du résumé:', error);
  }
}

async function main() {
  console.log('🚀 Initialisation du système Mall-App...\n');
  
  try {
    await connectDB();
    
    await creerCentreCommercial();
    await creerAdminParDefaut();
    await creerCategoriesParDefaut();
    await creerPortefeuillesPourUtilisateursExistants();
    
    await afficherResume();
    
    console.log('\n✅ Initialisation terminée avec succès!');
    console.log('\n🔐 Informations de connexion admin:');
    console.log('   Email: admin@mall-app.com');
    console.log('   Mot de passe: admin123');
    console.log('\n⚠️  N\'oubliez pas de changer le mot de passe admin en production!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  creerCentreCommercial,
  creerAdminParDefaut,
  creerCategoriesParDefaut,
  creerPortefeuillesPourUtilisateursExistants
};