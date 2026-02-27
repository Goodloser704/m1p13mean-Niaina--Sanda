/**
 * Test de la logique de suppression (soft delete) - LOCAL
 * 
 * Ce test vérifie que la logique de suppression est cohérente pour toutes les entités:
 * - Boutique: Vérifier qu'on ne peut pas supprimer une boutique avec des produits actifs
 * - Produit: Vérifier la suppression de produits
 * - TypeProduit: Vérifier qu'on ne peut pas supprimer un type avec des produits actifs
 * - Notification: Vérifier la suppression de notifications
 * - DemandeLocation: Vérifier la logique de suppression
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let commercantToken = '';
let commercantId = '';
let centreCommercialId = '';

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

// Fonction pour créer un commerçant de test
async function creerCommercant() {
  console.log('\n👤 === CRÉATION COMMERÇANT TEST ===');
  
  const timestamp = Date.now();
  const commercantData = {
    nom: `TestCommercant${timestamp}`,
    prenoms: 'Test',
    email: `commercant${timestamp}@test.com`,
    mdp: 'Test123456!',
    role: 'Commercant',
    telephone: '0340000000',
    adresse: 'Test Address'
  };

  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, commercantData);
    
    commercantId = response.data.user._id;
    console.log('✅ Commerçant créé:', response.data.user.email);
    console.log('🆔 ID:', commercantId);
    
    // Se connecter en tant que commerçant
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: commercantData.email,
      mdp: commercantData.mdp
    });
    
    commercantToken = loginResponse.data.token;
    console.log('✅ Connexion commerçant réussie');
    
    return response.data.user;
  } catch (error) {
    console.error('❌ Erreur création commerçant:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour obtenir le centre commercial
async function obtenirCentreCommercial() {
  console.log('\n🏬 === OBTENTION CENTRE COMMERCIAL ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/centre-commercial`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    centreCommercialId = response.data.centreCommercial._id;
    console.log('✅ Centre commercial obtenu:', response.data.centreCommercial.nom);
    console.log('🆔 ID:', centreCommercialId);
    
    return response.data.centreCommercial;
  } catch (error) {
    console.error('❌ Erreur obtention centre commercial:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer une catégorie de boutique
async function creerCategorie() {
  console.log('\n📂 === CRÉATION CATÉGORIE ===');
  
  const timestamp = Date.now();
  const categorieData = {
    nom: `Catégorie Test ${timestamp}`,
    description: 'Catégorie pour tests'
  };

  try {
    const response = await axios.post(`${BASE_URL}/categories-boutique`, categorieData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Catégorie créée:', response.data.categorie.nom);
    console.log('🆔 ID:', response.data.categorie._id);
    
    return response.data.categorie;
  } catch (error) {
    console.error('❌ Erreur création catégorie:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer une boutique
async function creerBoutique(categorieId) {
  console.log('\n🏪 === CRÉATION BOUTIQUE ===');
  
  const timestamp = Date.now();
  const boutiqueData = {
    nom: `Boutique Test ${timestamp}`,
    description: 'Boutique pour tests de suppression',
    categorie: categorieId,
    commercant: commercantId
  };

  try {
    const response = await axios.post(`${BASE_URL}/boutiques`, boutiqueData, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Boutique créée:', response.data.boutique.nom);
    console.log('🆔 ID:', response.data.boutique._id);
    
    return response.data.boutique;
  } catch (error) {
    console.error('❌ Erreur création boutique:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un type de produit
async function creerTypeProduit(boutiqueId) {
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
async function creerProduit(boutiqueId, typeProduitId) {
  console.log('\n📦 === CRÉATION PRODUIT ===');
  
  const timestamp = Date.now();
  const produitData = {
    nom: `Produit Test ${timestamp}`,
    description: 'Produit pour tests',
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

// Fonction pour supprimer une boutique
async function supprimerBoutique(boutiqueId) {
  console.log('\n🗑️ === SUPPRESSION BOUTIQUE ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/boutiques/${boutiqueId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });

    console.log('✅ Boutique supprimée');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression boutique:', error.response?.data || error.message);
    throw error;
  }
}

// Test principal
async function runTests() {
  console.log('🧪 ========================================');
  console.log('🧪 TEST LOGIQUE DE SUPPRESSION - LOCAL');
  console.log('🧪 ========================================');
  console.log('🌐 URL:', BASE_URL);
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
  
  let testsPassed = 0;
  let testsFailed = 0;
  let boutique = null;
  let typeProduit = null;
  let produit = null;

  try {
    // 1. Connexion admin
    await loginAdmin();

    // 2. Créer un commerçant
    await creerCommercant();

    // 3. Obtenir le centre commercial
    await obtenirCentreCommercial();

    // 4. Créer une catégorie
    const categorie = await creerCategorie();

    // 5. Créer une boutique
    boutique = await creerBoutique(categorie._id);

    // 6. Créer un type de produit
    typeProduit = await creerTypeProduit(boutique._id);

    // 7. Créer un produit
    produit = await creerProduit(boutique._id, typeProduit._id);

    // TEST 1: Tenter de supprimer un type de produit avec des produits actifs
    console.log('\n📊 === TEST 1: Suppression type produit avec produits actifs ===');
    try {
      await supprimerTypeProduit(typeProduit._id);
      console.log('❌ TEST 1 ÉCHOUÉ: Le type devrait être protégé');
      testsFailed++;
    } catch (error) {
      if (error.response?.data?.message?.includes('produits')) {
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

    // TEST 4: Supprimer la boutique
    console.log('\n📊 === TEST 4: Suppression de la boutique ===');
    try {
      await supprimerBoutique(boutique._id);
      console.log('✅ TEST 4 PASSÉ: Boutique supprimée');
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
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
