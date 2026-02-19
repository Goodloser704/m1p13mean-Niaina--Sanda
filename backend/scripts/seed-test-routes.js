/**
 * Script pour créer des données de test COMPLÈTES pour les routes
 * Crée: Utilisateurs, Centre Commercial, Etages, Espaces, Boutiques, Produits, Achats, Factures
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const Notification = require('../models/Notification');
const CentreCommercial = require('../models/CentreCommercial');
const Etage = require('../models/Etage');
const Espace = require('../models/Espace');
const Boutique = require('../models/Boutique');
const CategorieBoutique = require('../models/CategorieBoutique');
const Produit = require('../models/Produit');
const TypeProduit = require('../models/TypeProduit');
const Achat = require('../models/Achat');
const Facture = require('../models/Facture');
const DemandeLocation = require('../models/DemandeLocation');
const { RoleEnum, StatutBoutiqueEnum, TypeAchatEnum, EtatAchatEnum } = require('../utils/enums');

let testData = {
  adminId: null,
  commercantId: null,
  acheteurId: null
};

async function seedTestData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 0. Récupérer l'admin existant
    console.log('👤 Récupération admin...');
    const admin = await User.findOne({ email: 'admin@mall.com' });
    if (admin) {
      testData.adminId = admin._id;
      console.log(`✅ Admin trouvé (ID: ${admin._id})`);
    } else {
      console.log('⚠️  Admin non trouvé - certains tests seront limités');
    }

    // 1. Vérifier/Créer un acheteur de test
    console.log('👤 Création/Vérification acheteur de test...');
    let acheteur = await User.findOne({ email: 'acheteur@test.com' });
    
    if (!acheteur) {
      acheteur = new User({
        nom: 'Test',
        prenoms: 'Acheteur',
        email: 'acheteur@test.com',
        mdp: 'Test123456!',
        role: RoleEnum.Acheteur,
        telephone: '0123456789'
      });
      await acheteur.save();
      console.log('✅ Acheteur créé');
    } else {
      console.log('ℹ️  Acheteur existe déjà');
    }
    
    // Créer/Vérifier portefeuille acheteur
    let pfAcheteur = await PorteFeuille.findOne({ owner: acheteur._id });
    if (!pfAcheteur) {
      pfAcheteur = new PorteFeuille({
        owner: acheteur._id,
        balance: 1000
      });
      await pfAcheteur.save();
      console.log('✅ Portefeuille acheteur créé (balance: 1000€)');
    }

    // 2. Vérifier/Créer un commercant de test
    console.log('\n👤 Création/Vérification commercant de test...');
    let commercant = await User.findOne({ email: 'commercant@test.com' });
    
    if (!commercant) {
      commercant = new User({
        nom: 'Test',
        prenoms: 'Commercant',
        email: 'commercant@test.com',
        mdp: 'Commercant123456!',
        role: RoleEnum.Commercant,
        telephone: '0987654321'
      });
      await commercant.save();
      console.log('✅ Commercant créé');
    } else {
      console.log('ℹ️  Commercant existe déjà');
    }
    
    // Créer/Vérifier portefeuille commercant
    let pfCommercant = await PorteFeuille.findOne({ owner: commercant._id });
    if (!pfCommercant) {
      pfCommercant = new PorteFeuille({
        owner: commercant._id,
        balance: 500
      });
      await pfCommercant.save();
      console.log('✅ Portefeuille commercant créé (balance: 500€)');
    }

    // 3. Créer Centre Commercial
    console.log('\n🏢 Création/Vérification Centre Commercial...');
    let centre = await CentreCommercial.findOne({ nom: 'Centre Test' });
    if (!centre) {
      centre = new CentreCommercial({
        nom: 'Centre Test',
        description: 'Centre commercial de test',
        adresse: '123 Rue Test, 75001 Paris',
        email: 'contact@centretest.com',
        telephone: '0140000000'
      });
      await centre.save();
      console.log('✅ Centre commercial créé');
    } else {
      console.log('ℹ️  Centre commercial existe déjà');
    }

    // 4. Créer/Récupérer Etage
    console.log('\n🏗️  Création/Vérification Etage...');
    let etage = await Etage.findOne({});
    if (!etage) {
      try {
        etage = new Etage({
          centreCommercial: centre._id,
          niveau: 1,
          nom: 'Rez-de-chaussée'
        });
        await etage.save();
        console.log('✅ Etage créé');
      } catch (error) {
        // Si erreur de duplication, récupérer n'importe quel étage existant
        if (error.code === 11000) {
          etage = await Etage.findOne({});
          console.log(`ℹ️  Etage récupéré après erreur (niveau: ${etage?.niveau || 'N/A'})`);
        } else {
          throw error;
        }
      }
    } else {
      console.log(`ℹ️  Etage existe déjà (niveau: ${etage.niveau})`);
    }

    // 5. Créer/Récupérer Espace
    console.log('\n📦 Création/Vérification Espace...');
    let espace = await Espace.findOne({ code: 'TEST01' });
    if (!espace) {
      try {
        espace = new Espace({
          centreCommercial: centre._id,
          code: 'TEST01',
          surface: 50,
          etage: etage._id,
          loyer: 1500,
          statut: 'Disponible' // Sera mis à Occupee après création boutique
        });
        await espace.save();
        console.log('✅ Espace créé');
      } catch (error) {
        if (error.code === 11000) {
          // Récupérer un espace disponible existant
          espace = await Espace.findOne({ statut: 'Disponible' });
          if (!espace) {
            // Si aucun espace disponible, prendre n'importe lequel
            espace = await Espace.findOne({});
          }
          console.log(`ℹ️  Espace récupéré après erreur (code: ${espace?.code || 'N/A'})`);
        } else {
          throw error;
        }
      }
    } else {
      console.log('ℹ️  Espace existe déjà');
    }

    // 6. Créer Catégorie Boutique
    console.log('\n🏷️  Création/Vérification Catégorie Boutique...');
    let categorie = await CategorieBoutique.findOne({ nom: 'Alimentation' });
    if (!categorie) {
      categorie = new CategorieBoutique({
        nom: 'Alimentation',
        description: 'Produits alimentaires'
      });
      await categorie.save();
      console.log('✅ Catégorie créée');
    } else {
      console.log('ℹ️  Catégorie existe déjà');
    }

    // 7. Créer Boutique
    console.log('\n🏪 Création/Vérification Boutique...');
    let boutique = await Boutique.findOne({ commercant: commercant._id });
    if (!boutique) {
      boutique = new Boutique({
        nom: 'Boutique Test',
        description: 'Boutique de test pour les routes',
        commercant: commercant._id,
        categorie: categorie._id,
        statutBoutique: StatutBoutiqueEnum.Actif,
        espace: espace._id,
        horairesHebdo: [
          { jour: 'Lundi', debut: '09:00', fin: '18:00' },
          { jour: 'Mardi', debut: '09:00', fin: '18:00' }
        ]
      });
      await boutique.save();
      
      // Mettre à jour l'espace
      espace.boutique = boutique._id;
      espace.statut = 'Occupee';
      await espace.save();
      
      console.log('✅ Boutique créée et liée à l\'espace');
    } else {
      // S'assurer que la boutique a un espace et est active
      if (!boutique.espace || boutique.statutBoutique !== StatutBoutiqueEnum.Actif) {
        boutique.espace = espace._id;
        boutique.statutBoutique = StatutBoutiqueEnum.Actif;
        await boutique.save();
        
        espace.boutique = boutique._id;
        espace.statut = 'Occupee';
        await espace.save();
        
        console.log('✅ Boutique mise à jour (Actif + espace lié)');
      } else {
        console.log('ℹ️  Boutique existe déjà');
      }
    }

    // 8. Créer Type Produit
    console.log('\n🏷️  Création/Vérification Type Produit...');
    let typeProduit = await TypeProduit.findOne({ boutique: boutique._id, type: 'Snacks' });
    if (!typeProduit) {
      typeProduit = new TypeProduit({
        type: 'Snacks',
        description: 'Produits à grignoter',
        boutique: boutique._id
      });
      await typeProduit.save();
      console.log('✅ Type produit créé');
    } else {
      console.log('ℹ️  Type produit existe déjà');
    }

    // 9. Créer Produits
    console.log('\n📦 Création/Vérification Produits...');
    const produitsCount = await Produit.countDocuments({ boutique: boutique._id });
    let produit1, produit2;
    
    if (produitsCount === 0) {
      produit1 = new Produit({
        nom: 'Sandwich Jambon',
        description: 'Sandwich frais au jambon',
        prix: 5.50,
        stock: {
          nombreDispo: 20
        },
        boutique: boutique._id,
        typeProduit: typeProduit._id,
        tempsPreparation: '00:15:00' // 15 minutes
      });
      await produit1.save();
      
      produit2 = new Produit({
        nom: 'Croissant',
        description: 'Croissant au beurre',
        prix: 1.50,
        stock: {
          nombreDispo: 50
        },
        boutique: boutique._id,
        typeProduit: typeProduit._id,
        tempsPreparation: null // Disponible immédiatement
      });
      await produit2.save();
      
      console.log('✅ 2 produits créés');
    } else {
      produit1 = await Produit.findOne({ boutique: boutique._id, nom: 'Sandwich Jambon' });
      produit2 = await Produit.findOne({ boutique: boutique._id, nom: 'Croissant' });
      if (!produit1) produit1 = await Produit.findOne({ boutique: boutique._id });
      if (!produit2) produit2 = produit1;
      console.log(`ℹ️  ${produitsCount} produits existent déjà`);
    }

    // 10. Créer Factures et Achats
    console.log('\n🧾 Création/Vérification Factures et Achats...');
    const facturesCount = await Facture.countDocuments({ acheteur: acheteur._id });
    
    if (facturesCount === 0) {
      // Facture 1 - Payée (historique)
      const facture1 = new Facture({
        acheteur: acheteur._id,
        description: 'Achat de 2 sandwichs',
        montantTotal: 11.00,
        statut: 'Payee',
        dateEmission: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        datePaiement: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });
      facture1.calculerMontantTTC();
      await facture1.save();
      
      // Achat 1 - Validé (historique)
      const achat1 = new Achat({
        acheteur: acheteur._id,
        produit: produit1._id,
        facture: facture1._id,
        typeAchat: {
          type: TypeAchatEnum.Recuperer,
          dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dateFin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000)
        },
        etat: EtatAchatEnum.Validee
      });
      await achat1.save();
      
      // Facture 2 - En cours
      const facture2 = new Facture({
        acheteur: acheteur._id,
        description: 'Achat de 3 croissants',
        montantTotal: 4.50,
        statut: 'Emise',
        dateEmission: new Date()
      });
      facture2.calculerMontantTTC();
      await facture2.save();
      
      // Achat 2 - En attente (en cours)
      const achat2 = new Achat({
        acheteur: acheteur._id,
        produit: produit2._id,
        facture: facture2._id,
        typeAchat: {
          type: TypeAchatEnum.Livrer,
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 2 * 60 * 60 * 1000) // Dans 2h
        },
        etat: EtatAchatEnum.EnAttente
      });
      await achat2.save();
      
      console.log('✅ 2 factures et 2 achats créés');
    } else {
      console.log(`ℹ️  ${facturesCount} factures existent déjà`);
    }

    // 11. Créer notifications pour admin et acheteur
    console.log('\n🔔 Création/Vérification Notifications...');
    const notifCountAdmin = await Notification.countDocuments({ receveur: testData.adminId });
    const notifCountAcheteur = await Notification.countDocuments({ receveur: acheteur._id });
    
    if (notifCountAdmin === 0) {
      await Notification.create([
        {
          type: 'Systeme',
          message: 'Bienvenue sur le système de gestion du centre commercial',
          receveur: testData.adminId,
          estLu: false
        },
        {
          type: 'Demande',
          message: 'Une nouvelle demande de location est en attente de validation',
          receveur: testData.adminId,
          estLu: false
        }
      ]);
      console.log('✅ 2 notifications créées pour l\'admin');
    } else {
      console.log(`ℹ️  ${notifCountAdmin} notifications admin existent déjà`);
    }
    
    if (notifCountAcheteur === 0) {
      await Notification.create([
        {
          type: 'Achat',
          message: 'Votre commande de sandwichs a été confirmée',
          receveur: acheteur._id,
          estLu: false
        },
        {
          type: 'Achat',
          message: 'Votre commande de croissants est prête',
          receveur: acheteur._id,
          estLu: true
        }
      ]);
      console.log('✅ 2 notifications créées pour l\'acheteur');
    } else {
      console.log(`ℹ️  ${notifCountAcheteur} notifications acheteur existent déjà`);
    }

    // 12. Créer une demande de location en attente
    console.log('\n📋 Création/Vérification Demande de Location...');
    
    // Créer une deuxième boutique pour la demande
    let boutique2 = await Boutique.findOne({ nom: 'Boutique Test Demande' });
    if (!boutique2) {
      boutique2 = new Boutique({
        nom: 'Boutique Test Demande',
        description: 'Boutique pour tester les demandes de location',
        commercant: commercant._id,
        categorie: categorie._id,
        statutBoutique: StatutBoutiqueEnum.Inactif, // Pas encore d'espace
        horairesHebdo: [
          { jour: 'Lundi', debut: '10:00', fin: '19:00' }
        ]
      });
      await boutique2.save();
      console.log('✅ Boutique 2 créée pour demande');
    }
    
    // Créer un espace disponible pour la demande
    let espaceDisponible = await Espace.findOne({ statut: 'Disponible', code: 'TEST02' });
    if (!espaceDisponible) {
      try {
        espaceDisponible = new Espace({
          centreCommercial: centre._id,
          code: 'TEST02',
          surface: 40,
          etage: etage._id,
          loyer: 1200,
          statut: 'Disponible'
        });
        await espaceDisponible.save();
        console.log('✅ Espace disponible créé');
      } catch (error) {
        if (error.code === 11000) {
          espaceDisponible = await Espace.findOne({ statut: 'Disponible' });
          console.log('ℹ️  Espace disponible récupéré');
        } else {
          throw error;
        }
      }
    }
    
    const demandeCount = await DemandeLocation.countDocuments({ boutique: boutique2._id });
    if (demandeCount === 0 && espaceDisponible) {
      const demande = new DemandeLocation({
        boutique: boutique2._id,
        espace: espaceDisponible._id,
        etatDemande: 'EnAttente',
        dateDebutSouhaitee: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        dureeContrat: 12, // 12 mois
        messageCommercant: 'Je souhaite louer cet espace pour ouvrir ma boutique'
      });
      await demande.save();
      console.log('✅ Demande de location créée');
    } else {
      console.log(`ℹ️  ${demandeCount} demandes existent déjà`);
    }

    // 13. Mettre à jour les portefeuilles avec des balances
    console.log('\n💰 Mise à jour des portefeuilles...');
    await PorteFeuille.findOneAndUpdate(
      { owner: testData.adminId },
      { balance: 5000 },
      { upsert: true }
    );
    console.log('✅ Portefeuille admin: 5000€');
    
    await PorteFeuille.findOneAndUpdate(
      { owner: acheteur._id },
      { balance: 1000 },
      { upsert: true }
    );
    console.log('✅ Portefeuille acheteur: 1000€');
    
    await PorteFeuille.findOneAndUpdate(
      { owner: commercant._id },
      { balance: 500 },
      { upsert: true }
    );
    console.log('✅ Portefeuille commercant: 500€');

    // Résumé final
    console.log('\n✅ Données de test COMPLÈTES créées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Admin: admin@mall.com (ID: ${testData.adminId})`);
    console.log(`   - Acheteur: ${acheteur.email} (ID: ${acheteur._id})`);
    console.log(`   - Commercant: ${commercant.email} (ID: ${commercant._id})`);
    console.log(`   - Boutique active: ${boutique.nom} (ID: ${boutique._id})`);
    console.log(`   - Espace occupé: ${espace.code} (ID: ${espace._id})`);
    console.log(`   - Produits: ${await Produit.countDocuments({ boutique: boutique._id })}`);
    console.log(`   - Factures: ${await Facture.countDocuments({ acheteur: acheteur._id })}`);
    console.log(`   - Achats: ${await Achat.countDocuments({ acheteur: acheteur._id })}`);
    console.log(`   - Notifications admin: ${await Notification.countDocuments({ receveur: testData.adminId })}`);
    console.log(`   - Notifications acheteur: ${await Notification.countDocuments({ receveur: acheteur._id })}`);
    console.log(`   - Demandes location: ${await DemandeLocation.countDocuments({})}`);
    console.log(`   - Portefeuille admin: ${(await PorteFeuille.findOne({ owner: testData.adminId }))?.balance || 0}€`);
    console.log(`   - Portefeuille acheteur: ${pfAcheteur.balance}€`);
    console.log(`   - Portefeuille commercant: ${pfCommercant.balance}€`);
    
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTestData();
