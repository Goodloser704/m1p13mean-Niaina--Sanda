/**
 * Test de la logique de suppression (soft delete) - RENDER
 * 
 * Ce test vérifie que la logique de suppression est cohérente pour toutes les entités:
 * - TypeProduit: Vérifier qu'on ne peut pas supprimer un type avec des produits actifs
 * - Produit: Vérifier la suppression de produits
 * - Notification: Vérifier la suppression de notifications
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let commercantToken = '';
let commercantId = '';
let boutiqueId = '';

// Fonction pour se connecter en tant qu'admin
async function loginAdmin() {
  console.log('\n🔐 === CONNEXION ADMIN ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });

    adminToken = response.data.token;
    console.log('✅ Connexion admin réussie');
    console.log('👤 Utilisateur:', response.data.user?.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour obtenir un commerçant existant avec une boutique
async function obtenirCommercantAvecBoutique() {
  console.log('\n👤 === RECHERCHE COMMERÇANT AVEC BOUTIQUE ===');
  
  try {
    // Obtenir toutes les boutiques
    const response = await axios.get(`${BASE_URL}/boutique`);
    
    if (response.data.boutiques && response.data.boutiques.length > 0) {
      const boutique = response.data.boutiques[0];
      boutiqueId = boutique._id;
      
      // Obtenir les détails du commerçant
      if (boutique.commercant) {
        commercantId = typeof boutique.commercant === 'object' ? boutique.commercant._id : boutique.commercant;
        console.log('✅ Boutique trouvée:', boutique.nom);
        console.log('🆔 Boutique ID:', boutiqueId);
        console.log('👤 Commerçant ID:', commercantId);
        
        return { boutique, commercantId };
      }
    }
    
    throw new Error('Aucune boutique trouvée');
  } catch (error) {
    console.error('❌ Erreur recherche commerçant:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour se connecter en tant que commerçant (créer un nouveau)
async function loginCommercant() {
  console.log('\n🔐 === CRÉATION ET CONNEXION COMMERÇANT ===');
  
  const timestamp = Date.now();
  const COMMERCANT_EMAIL = `commercant${timestamp}@test.com`;
  const COMMERCANT_PASSWORD = 'Test123456!';
  
  try {
    // Créer le commerçant
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestCommercant${timestamp}`,
      prenoms: 'Test',
      email: COMMERCANT_EMAIL,
      mdp: COMMERCANT_PASSWORD,
      role: 'Commercant',
      telephone: '0340000000',
      adresse: 'Test Address'
    });
    
    console.log('✅ Commerçant créé:', COMMERCANT_EMAIL);
    
    // Se connecter
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: COMMERCANT_EMAIL,
      mdp: COMMERCANT_PASSWORD
    });
    
    commercantToken = loginResponse.data.token;
    commercantId = loginResponse.data.user._id;
    console.log('✅ Connexion commerçant réussie');
    console.log('🆔 ID:', commercantId);
    
    return loginResponse.data;
  } catch (error) {
    console.error('❌ Erreur création/connexion commerçant:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour obtenir les boutiques du commerçant
async function obtenirBoutiquesCommercant() {
  console.log('\n🏪 === OBTENTION/CRÉATION BOUTIQUE ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/commercant/boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    if (response.data.boutiques && response.data.boutiques.length > 0) {
      boutiqueId = response.data.boutiques[0]._id;
      console.log('✅ Boutique trouvée:', response.data.boutiques[0].nom);
      console.log('🆔 ID:', boutiqueId);
      
      return response.data.boutiques[0];
    }
    
    // Aucune boutique, en créer une
    console.log('⚠️ Aucune boutique trouvée, création...');
    return await creerBoutique();
  } catch (error) {
    console.error('❌ Erreur obtention boutiques:', error.response?.data || error.message);
    // Essayer de créer une boutique
    return await creerBoutique();
  }
}

// Fonction pour créer une boutique
async function creerBoutique() {
  console.log('\n🏪 === CRÉATION BOUTIQUE ===');
  
  // D'abord, obtenir une catégorie
  let categorieId;
  try {
    const catResponse = await axios.get(`${BASE_URL}/categories-boutique`);
    if (catResponse.data.categories && catResponse.data.categories.length > 0) {
      categorieId = catResponse.data.categories[0]._id;
      console.log('✅ Catégorie trouvée:', catResponse.data.categories[0].nom);
    } else {
      throw new Error('Aucune catégorie disponible');
    }
  } catch (error) {
    console.error('❌ Erreur obtention catégorie:', error.response?.data || error.message);
    throw error;
  }
  
  const timestamp = Date.now();
  const boutiqueData = {
    nom: `Boutique Test ${timestamp}`,
    description: 'Boutique pour tests de suppression',
    categorie: categorieId,
    commercant: commercantId
  };

  try {
    const response = await axios.post(`${BASE_URL}/boutique/register`, boutiqueData, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    boutiqueId = response.data.boutique._id;
    console.log('✅ Boutique créée:', response.data.boutique.nom);
    console.log('🆔 ID:', boutiqueId);
    
    return response.data.boutique;
  } catch (error) {
    console.error('❌ Erreur création boutique:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un type de produit
async function creerTypeProduit() {
  console.log('\n📋 === CRÉATION TYPE PRODUIT ===');
  
  const timestamp = Date.now();
  const typeData = {
    type: `Type Test ${timestamp}`,
    boutique: boutiqueId
  };

  try {
    const response = await axios.post(`${BASE_URL}/types-produit`, typeData, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Type produit créé:', response.data.typeProduit.type);
    console.log('🆔 ID:', response.data.typeProduit._id);
    
    return response.data.typeProduit;
  } catch (error) {
    console.error('❌ Erreur création type produit:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un produit
async function creerProduit(typeProduitId) {
  console.log('\n📦 === CRÉATION PRODUIT ===');
  
  const timestamp = Date.now();
  const produitData = {
    nom: `Produit Test ${timestamp}`,
    description: 'Produit pour tests de suppression',
    prix: 1000,
    typeProduit: typeProduitId,
    boutique: boutiqueId,
    stock: {
      nombreDispo: 10
    }
  };

  try {
    const response = await axios.post(`${BASE_URL}/produits`, produitData, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Produit créé:', response.data.produit.nom);
    console.log('🆔 ID:', response.data.produit._id);
    console.log('💰 Prix:', response.data.produit.prix);
    
    return response.data.produit;
  } catch (error) {
    console.error('❌ Erreur création produit:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour supprimer un produit
async function supprimerProduit(produitId) {
  console.log('\n🗑️ === SUPPRESSION PRODUIT ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/produits/${produitId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Produit supprimé');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour supprimer un type de produit
async function supprimerTypeProduit(typeId) {
  console.log('\n🗑️ === SUPPRESSION TYPE PRODUIT ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/types-produit/${typeId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Type produit supprimé');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression type produit:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer une notification de test
async function creerNotification(userId) {
  console.log('\n🔔 === CRÉATION NOTIFICATION ===');
  
  const notificationData = {
    type: 'Achat',
    message: `Test notification ${Date.now()}`,
    receveur: userId
  };

  try {
    const response = await axios.post(`${BASE_URL}/notifications`, notificationData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Notification créée');
    console.log('🆔 ID:', response.data.notification._id);
    
    return response.data.notification;
  } catch (error) {
    console.error('❌ Erreur création notification:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour supprimer une notification
async function supprimerNotification(notificationId) {
  console.log('\n🗑️ === SUPPRESSION NOTIFICATION ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Notification supprimée');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression notification:', error.response?.data || error.message);
    throw error;
  }
}

// Test principal
async function runTests() {
  console.log('🧪 ========================================');
  console.log('🧪 TEST LOGIQUE DE SUPPRESSION - RENDER');
  console.log('🧪 ========================================');
  console.log('🌐 URL:', BASE_URL);
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
  
  let testsPassed = 0;
  let testsFailed = 0;
  let typeProduit = null;
  let produit = null;
  let notification = null;

  try {
    // 1. Connexion admin
    await loginAdmin();

    // 2. Connexion commerçant
    await loginCommercant();

    // 3. Obtenir les boutiques du commerçant
    await obtenirBoutiquesCommercant();

    // 4. Créer un type de produit
    typeProduit = await creerTypeProduit();

    // 5. Créer un produit
    produit = await creerProduit(typeProduit._id);

    // TEST 1: Tenter de supprimer un type de produit avec des produits actifs
    console.log('\n📊 === TEST 1: Suppression type produit avec produits actifs ===');
    try {
      await supprimerTypeProduit(typeProduit._id);
      console.log('❌ TEST 1 ÉCHOUÉ: Le type devrait être protégé');
      testsFailed++;
    } catch (error) {
      if (error.response?.data?.message?.includes('produits') || 
          error.response?.data?.message?.includes('Impossible')) {
        console.log('✅ TEST 1 PASSÉ: Type protégé (contient des produits)');
        testsPassed++;
      } else {
        console.log('❌ TEST 1 ÉCHOUÉ: Erreur inattendue:', error.response?.data?.message);
        testsFailed++;
      }
    }

    // TEST 2: Supprimer le produit
    console.log('\n📊 === TEST 2: Suppression du produit ===');
    try {
      await supprimerProduit(produit._id);
      console.log('✅ TEST 2 PASSÉ: Produit supprimé');
      testsPassed++;
    } catch (error) {
      console.log('❌ TEST 2 ÉCHOUÉ:', error.response?.data?.message);
      testsFailed++;
    }

    // TEST 3: Supprimer le type de produit après suppression du produit
    console.log('\n📊 === TEST 3: Suppression type produit après suppression produit ===');
    try {
      await supprimerTypeProduit(typeProduit._id);
      console.log('✅ TEST 3 PASSÉ: Type supprimé après suppression des produits');
      testsPassed++;
    } catch (error) {
      console.log('❌ TEST 3 ÉCHOUÉ:', error.response?.data?.message);
      testsFailed++;
    }

    // TEST 4: Créer et supprimer une notification
    console.log('\n📊 === TEST 4: Création et suppression notification ===');
    try {
      notification = await creerNotification(commercantId);
      await supprimerNotification(notification._id);
      console.log('✅ TEST 4 PASSÉ: Notification créée et supprimée');
      testsPassed++;
    } catch (error) {
      console.log('❌ TEST 4 ÉCHOUÉ:', error.response?.data?.message);
      testsFailed++;
    }

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error.message);
    testsFailed++;
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${testsPassed}`);
  console.log(`❌ Tests échoués: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log(`🎯 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('✅ La logique de suppression est cohérente');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
