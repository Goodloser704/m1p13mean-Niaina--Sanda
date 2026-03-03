/**
 * 🔐 SCRIPT DE CRÉATION DU COMPTE ADMIN POUR LES TESTS
 * 
 * Ce script crée un compte admin avec les identifiants suivants:
 * - Email: admin@mallapp.com
 * - Mot de passe: admin123
 * 
 * Usage: node create-admin-for-tests.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './mall-app/backend/.env' });

// Modèle User simplifié
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenoms: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: String,
  mdp: { type: String, required: true },
  photo: String,
  role: { 
    type: String, 
    required: true, 
    enum: ['Admin', 'Commercant', 'Acheteur'] 
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Modèle PorteFeuille simplifié
const portefeuilleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const PorteFeuille = mongoose.model('PorteFeuille', portefeuilleSchema);

async function createAdminAccount() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    // Utiliser la variable d'environnement de production
    const mongoUri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || 'mongodb://localhost:27017/mall_db';
    console.log(`📍 URI: ${mongoUri.includes('mongodb.net') ? 'MongoDB Atlas (Production)' : 'Local'}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@mallapp.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Un compte admin existe déjà avec cet email');
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Nom: ${existingAdmin.nom} ${existingAdmin.prenoms}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Vérifier le portefeuille
      const wallet = await PorteFeuille.findOne({ owner: existingAdmin._id });
      if (wallet) {
        console.log(`   Portefeuille: ${wallet._id} (Balance: ${wallet.balance}Ar)`);
      } else {
        console.log('   ⚠️  Portefeuille manquant, création...');
        const newWallet = new PorteFeuille({
          owner: existingAdmin._id,
          balance: 10000 // Balance initiale pour l'admin
        });
        await newWallet.save();
        console.log(`   ✅ Portefeuille créé: ${newWallet._id}`);
      }
      
      console.log('\n💡 Pour réinitialiser le mot de passe, supprimez d\'abord ce compte.');
      return;
    }

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Créer l'admin
    console.log('👤 Création du compte admin...');
    const admin = new User({
      nom: 'Admin',
      prenoms: 'Système',
      email: 'admin@mallapp.com',
      mdp: hashedPassword,
      role: 'Admin',
      telephone: '0123456789'
    });

    await admin.save();
    console.log('✅ Compte admin créé avec succès!');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);

    // Créer le portefeuille
    console.log('\n💰 Création du portefeuille admin...');
    const wallet = new PorteFeuille({
      owner: admin._id,
      balance: 10000 // Balance initiale pour l'admin
    });

    await wallet.save();
    console.log('✅ Portefeuille créé avec succès!');
    console.log(`   ID: ${wallet._id}`);
    console.log(`   Balance: ${wallet.balance}Ar`);

    console.log('\n🎉 COMPTE ADMIN CRÉÉ AVEC SUCCÈS!');
    console.log('\n📋 Identifiants de connexion:');
    console.log('   Email: admin@mallapp.com');
    console.log('   Mot de passe: admin123');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte admin:');
    console.error(error.message);
    if (error.code === 11000) {
      console.error('\n💡 Un compte avec cet email existe déjà.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
createAdminAccount();
