/**
 * 🌱 Script de création de données de test pour Notifications et Orders/Achats
 * Crée des produits, achats, notifications et commandes de test
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Achat = require('../models/Achat');
const Facture = require('../models/Facture');
const Notification = require('../models/Notification');
const PorteFeuille = require('../models/PorteFeuille');
const CategorieBoutique = require('../models/CategorieBoutique');
const TypeProduit = require('../models/TypeProduit');
const Espace = require('../models/Espace');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function seedData() {
  try {
    log('\n🌱 CRÉATION DES DONNÉES DE TEST - NOTIFICATIONS & ORDERS/ACHATS', 'cyan');
    log('='.repeat(70), 'cyan');

    // Connexion à MongoDB
    log('\n📡 Connexion à MongoDB...', 'yellow');
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    log('✅ Connecté à MongoDB\n', 'green');

    // 1. Vérifier les comptes
    log('👤 1. Vérification des comptes...', 'cyan');
    const admin = await User.findOne({ email: 'admin@mall.com' });
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    const client = await User.findOne({ email: 'client@test.com' });
    
    if (!admin || !commercant || !client) {
      log('❌ Comptes manquants', 'red');
      log('   Exécutez: node scripts/create-local-accounts.js', 'yellow');
      return;
    }
    
    log(`✅ Admin: ${admin._id}`, 'green');
    log(`✅ Commercant: ${commercant._id}`, 'green');
    log(`✅ Client: ${client._id}`, 'green');

    // 2. Vérifier/créer les portefeuilles
    log('\n💰 2. Vérification des portefeuilles...', 'cyan');
    let portefeuilleClient = await PorteFeuille.findOne({ owner: client._id });
    if (!portefeuilleClient) {
      portefeuilleClient = await PorteFeuille.create({
        owner: client._id,
        balance: 10000 // Solde initial pour les tests
      });
      log('✅ Portefeuille client créé avec 10000€', 'green');
    } else {
      portefeuilleClient.balance = Math.max(portefeuilleClient.balance, 10000);
      await portefeuilleClient.save();
      log(`✅ Portefeuille client: ${portefeuilleClient.balance}€`, 'green');
    }

    let portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
    if (!portefeuilleCommercant) {
      portefeuilleCommercant = await PorteFeuille.create({
        owner: commercant._id,
        balance: 0
      });
      log('✅ Portefeuille commercant créé', 'green');
    } else {
      log(`✅ Portefeuille commercant: ${portefeuilleCommercant.balance}€`, 'green');
    }

    // 3. Créer catégorie
    log('\n📦 3. Création catégorie...', 'cyan');
    let categorie = await CategorieBoutique.findOne({ nom: 'Électronique' });
    if (!categorie) {
      categorie = await CategorieBoutique.create({
        nom: 'Électronique',
        description: 'Produits électroniques'
      });
      log('✅ Catégorie créée: Électronique', 'green');
    } else {
      log('✅ Catégorie existante: Électronique', 'green');
    }

    // 4. Créer/récupérer boutique
    log('\n🏪 4. Création boutique de test...', 'cyan');
    let boutique = await Boutique.findOne({ 
      nom: 'Boutique Test Orders',
      commercant: commercant._id 
    });
    
    if (!boutique) {
      // Récupérer un espace disponible
      let espace = await Espace.findOne({ statut: 'Disponible' });
      
      boutique = await Boutique.create({
        nom: 'Boutique Test Orders',
        commercant: commercant._id,
        description: 'Boutique de test pour orders et achats',
        statutBoutique: 'Actif',
        categorie: categorie._id,
        espace: espace?._id
      });
      
      if (espace) {
        await Espace.findByIdAndUpdate(espace._id, {
          statut: 'Occupee',
          boutique: boutique._id
        });
      }
      
      log(`✅ Boutique créée: ${boutique.nom}`, 'green');
    } else {
      log(`✅ Boutique existante: ${boutique.nom}`, 'green');
    }

    // 5. Créer type produit pour la boutique
    log('\n📦 5. Création type produit...', 'cyan');
    let typeProduit = await TypeProduit.findOne({ 
      boutique: boutique._id,
      type: 'Accessoires'
    });
    
    if (!typeProduit) {
      typeProduit = await TypeProduit.create({
        type: 'Accessoires',
        boutique: boutique._id,
        description: 'Accessoires divers',
        icone: '🔌',
        couleur: '#ff9800'
      });
      log('✅ Type produit créé: Accessoires', 'green');
    } else {
      log('✅ Type produit existant: Accessoires', 'green');
    }

    // 6. Créer des produits
    log('\n📱 6. Création des produits...', 'cyan');
    const produitsData = [
      { nom: 'Smartphone Test', prix: 299.99, stock: 10, tempsPreparation: '00:30:00' },
      { nom: 'Écouteurs Test', prix: 49.99, stock: 20, tempsPreparation: '00:15:00' },
      { nom: 'Chargeur Test', prix: 19.99, stock: 50, tempsPreparation: null }
    ];

    const produits = [];
    for (const produitData of produitsData) {
      let produit = await Produit.findOne({ 
        nom: produitData.nom,
        boutique: boutique._id 
      });
      
      if (!produit) {
        produit = await Produit.create({
          ...produitData,
          boutique: boutique._id,
          description: `Produit de test: ${produitData.nom}`,
          typeProduit: typeProduit._id,
          stock: {
            nombreDispo: produitData.stock,
            updatedAt: new Date()
          },
          isActive: true
        });
        log(`✅ Produit créé: ${produit.nom} (${produit.prix}€)`, 'green');
      } else {
        // Mettre à jour le stock
        produit.stock.nombreDispo = produitData.stock;
        produit.isActive = true;
        await produit.save();
        log(`✅ Produit existant: ${produit.nom}`, 'green');
      }
      produits.push(produit);
    }

    // 7. Créer des notifications de test
    log('\n🔔 7. Création des notifications...', 'cyan');
    const notificationsData = [
      {
        type: 'Achat',
        message: 'Votre commande a été validée',
        receveur: client._id,
        estLu: false
      },
      {
        type: 'Demande',
        message: 'Nouvelle demande de location',
        receveur: commercant._id,
        estLu: false
      },
      {
        type: 'Paiement',
        message: 'Rappel: Loyer à payer',
        receveur: commercant._id,
        estLu: true
      },
      {
        type: 'Achat',
        message: 'Commande en préparation',
        receveur: client._id,
        estLu: false
      },
      {
        type: 'Vente',
        message: 'Nouvelle vente dans votre boutique',
        receveur: commercant._id,
        estLu: true
      }
    ];

    let notificationsCreated = 0;
    for (const notifData of notificationsData) {
      const notif = await Notification.create({
        ...notifData,
        title: notifData.message.substring(0, 30),
        urlRoute: '/notifications'
      });
      notificationsCreated++;
    }
    log(`✅ ${notificationsCreated} notifications créées`, 'green');

    // 8. Créer des achats de test
    log('\n🛒 8. Création des achats...', 'cyan');
    
    // Créer une facture
    const facture = new Facture({
      acheteur: client._id,
      description: 'Achat de test',
      montantTotal: 369.97,
      tauxTVA: 20
    });
    facture.calculerMontantTTC();
    await facture.save();
    log(`✅ Facture créée: ${facture._id}`, 'green');

    // Créer des achats
    const achatsData = [
      {
        produit: produits[0]._id,
        quantite: 1,
        prixUnitaire: 299.99,
        typeAchat: 'Recuperer'
      },
      {
        produit: produits[1]._id,
        quantite: 1,
        prixUnitaire: 49.99,
        typeAchat: 'Recuperer'
      },
      {
        produit: produits[2]._id,
        quantite: 1,
        prixUnitaire: 19.99,
        typeAchat: 'Livrer'
      }
    ];

    let achatsCreated = 0;
    for (const achatData of achatsData) {
      const montantTotal = achatData.prixUnitaire * achatData.quantite;
      const dateDebut = new Date();
      
      const achat = await Achat.create({
        acheteur: client._id,
        produit: achatData.produit,
        facture: facture._id,
        quantite: achatData.quantite,
        prixUnitaire: achatData.prixUnitaire,
        montantTotal: montantTotal,
        typeAchat: {
          type: achatData.typeAchat,
          dateDebut: dateDebut,
          dateFin: new Date(dateDebut.getTime() + 3600000) // +1h
        },
        etat: achatData.typeAchat === 'Livrer' ? 'EnAttente' : 'Validee'
      });
      
      achatsCreated++;
      log(`✅ Achat créé: ${achatData.quantite}x produit (${montantTotal}€)`, 'green');
    }

    // 9. Résumé
    log('\n📊 RÉSUMÉ', 'cyan');
    log('='.repeat(70), 'cyan');
    log(`Boutique: ${boutique.nom}`, 'blue');
    log(`Produits créés: ${produits.length}`, 'blue');
    log(`Notifications créées: ${notificationsCreated}`, 'blue');
    log(`Achats créés: ${achatsCreated}`, 'blue');
    log(`Facture: ${facture._id}`, 'blue');
    log(`Portefeuille client: ${portefeuilleClient.balance}€`, 'blue');
    
    log('\n✅ Données de test créées avec succès!', 'green');
    log('='.repeat(70), 'cyan');

  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Connexion MongoDB fermée', 'yellow');
  }
}

// Exécuter le script
seedData();
