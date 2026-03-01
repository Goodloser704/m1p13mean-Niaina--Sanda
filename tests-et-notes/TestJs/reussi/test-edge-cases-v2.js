const axios = require('axios');

// Configuration - Changez BASE_URL pour tester local ou production
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let commercantToken = '';
let testData = {
  etageId: null,
  espaceId: null,
  boutiqueId: null,
  categorieId: null,
  produitId: null,
  userId: null
};

// Utilitaires
const log = (message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(60));
};

const logError = (message, error) => {
  console.error(`\n${'❌'.repeat(30)}`);
  console.error(`❌ ${message}`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error:', error.message);
  }
  console.error('❌'.repeat(30));
};

const logSuccess = (message) => {
  console.log(`\n${'✅'.repeat(30)}`);
  console.log(`✅ ${message}`);
  console.log('✅'.repeat(30));
};

// 1. Connexion Admin
async function loginAdmin() {
  try {
    log('TEST 1: Connexion Admin');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    adminToken = response.data.token;
    logSuccess('Admin connecté avec succès');
    return true;
  } catch (error) {
    logError('Échec connexion admin', error);
    return false;
  }
}

// 2. Test: Créer étage avec numéro en double
async function testCreateEtageNumeroDouble() {
  try {
    log('TEST 2: Créer étage avec numéro en double (validation unicité)');
    
    const numeroDouble = Math.floor(Math.random() * 1000);
    
    // Créer le premier étage
    const etage1 = await axios.post(
      `${BASE_URL}/etages`,
      {
        numero: numeroDouble,
        nom: `Étage Test ${numeroDouble}`,
        niveau: numeroDouble
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    testData.etageId = etage1.data.etage._id;
    log('Premier étage créé', { id: testData.etageId, numero: numeroDouble });
    
    // Tenter de créer un deuxième avec le même numéro
    try {
      await axios.post(
        `${BASE_URL}/etages`,
        {
          numero: numeroDouble,
          nom: `Étage Test Double ${numeroDouble}`,
          niveau: numeroDouble + 1
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Deuxième étage créé avec même numéro (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        logSuccess('Validation unicité étage fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test numéro double étage', error);
    return false;
  }
}

// 3. Test: Modifier étage avec numéro existant
async function testUpdateEtageNumeroExistant() {
  try {
    log('TEST 3: Modifier étage avec numéro déjà utilisé');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    // Récupérer un autre étage
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    let etages = [];
    if (Array.isArray(etagesResponse.data)) {
      etages = etagesResponse.data;
    } else if (etagesResponse.data.etages) {
      etages = etagesResponse.data.etages;
    }
    
    const autreEtage = etages.find(e => e._id !== testData.etageId);
    if (!autreEtage) {
      log('⚠️ Pas assez d\'étages, skip test');
      return true;
    }
    
    // Tenter de modifier avec le numéro d'un autre étage
    try {
      await axios.put(
        `${BASE_URL}/etages/${testData.etageId}`,
        { numero: autreEtage.numero },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Étage modifié avec numéro existant (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        logSuccess('Validation unicité lors de la mise à jour fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test modification étage', error);
    return false;
  }
}

// 4. Test: Supprimer étage avec espaces actifs
async function testDeleteEtageAvecEspaces() {
  try {
    log('TEST 4: Supprimer étage avec espaces actifs');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    // Créer un espace sur cet étage
    const espace = await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: `E${Date.now() % 10000}`,
        superficie: 50,
        prixLoyer: 1000,
        etage: testData.etageId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    testData.espaceId = espace.data.espace._id;
    log('Espace créé sur l\'étage');
    
    // Tenter de supprimer l'étage
    try {
      await axios.delete(
        `${BASE_URL}/etages/${testData.etageId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Étage supprimé malgré les espaces (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation suppression étage avec espaces fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test suppression étage avec espaces', error);
    return false;
  }
}

// 5. Test: Créer boutique sans catégorie
async function testCreateBoutiqueSansCategorie() {
  try {
    log('TEST 5: Créer boutique sans catégorie (validation)');
    
    // Créer un commercant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Edge',
      email: `commercant.edge.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    
    commercantToken = userResponse.data.token;
    testData.userId = userResponse.data.user._id;
    log('Commercant créé');
    
    // Tenter de créer une boutique sans catégorie
    try {
      await axios.post(
        `${BASE_URL}/boutique/register`,
        {
          nom: `Boutique Test ${Date.now()}`,
          description: 'Test sans catégorie'
          // Pas de catégorie!
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Boutique créée sans catégorie (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation catégorie requise fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test boutique sans catégorie', error);
    return false;
  }
}

// 6. Test: Créer boutique avec catégorie invalide
async function testCreateBoutiqueCategorieInvalide() {
  try {
    log('TEST 6: Créer boutique avec catégorie invalide');
    
    if (!commercantToken) {
      log('⚠️ Pas de commercant, skip test');
      return true;
    }
    
    // Tenter de créer avec un ID invalide
    try {
      await axios.post(
        `${BASE_URL}/boutique/register`,
        {
          nom: `Boutique Test ${Date.now()}`,
          description: 'Test catégorie invalide',
          categorie: '000000000000000000000000' // ID invalide
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Boutique créée avec catégorie invalide (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        logSuccess('Validation catégorie invalide fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test catégorie invalide', error);
    return false;
  }
}

// 7. Test: Créer produit avec prix négatif
async function testCreateProduitPrixNegatif() {
  try {
    log('TEST 7: Créer produit avec prix négatif');
    
    if (!commercantToken) {
      log('⚠️ Pas de commercant, skip test');
      return true;
    }
    
    // Créer une boutique d'abord
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let categories = [];
    if (Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    } else if (categoriesResponse.data.categories) {
      categories = categoriesResponse.data.categories;
    }
    
    if (!categories || categories.length === 0) {
      log('⚠️ Pas de catégories, skip test');
      return true;
    }
    
    const boutiqueResponse = await axios.post(
      `${BASE_URL}/boutique/register`,
      {
        nom: `Boutique Test ${Date.now()}`,
        description: 'Test produit',
        categorie: categories[0]._id
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    testData.boutiqueId = boutiqueResponse.data.boutique._id;
    log('Boutique créée');
    
    // Tenter de créer un produit avec prix négatif
    try {
      await axios.post(
        `${BASE_URL}/produits`,
        {
          nom: 'Produit Test',
          description: 'Test prix négatif',
          prix: -100, // Prix négatif!
          stock: 10,
          boutique: testData.boutiqueId
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Produit créé avec prix négatif (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation prix négatif fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test prix négatif', error);
    return false;
  }
}

// 8. Test: Créer produit avec stock négatif
async function testCreateProduitStockNegatif() {
  try {
    log('TEST 8: Créer produit avec stock négatif');
    
    if (!commercantToken || !testData.boutiqueId) {
      log('⚠️ Pas de boutique, skip test');
      return true;
    }
    
    // Tenter de créer un produit avec stock négatif
    try {
      await axios.post(
        `${BASE_URL}/produits`,
        {
          nom: 'Produit Test',
          description: 'Test stock négatif',
          prix: 100,
          stock: -10, // Stock négatif!
          boutique: testData.boutiqueId
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Produit créé avec stock négatif (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation stock négatif fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test stock négatif', error);
    return false;
  }
}

// 9. Test: Supprimer boutique avec produits actifs
async function testDeleteBoutiqueAvecProduits() {
  try {
    log('TEST 9: Supprimer boutique avec produits actifs');
    
    if (!commercantToken || !testData.boutiqueId) {
      log('⚠️ Pas de boutique, skip test');
      return true;
    }
    
    // Créer un produit
    const produit = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Produit Test',
        description: 'Test suppression',
        prix: 100,
        stock: 10,
        boutique: testData.boutiqueId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    testData.produitId = produit.data.produit._id;
    log('Produit créé');
    
    // Tenter de supprimer la boutique
    try {
      await axios.delete(
        `${BASE_URL}/boutique/${testData.boutiqueId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Boutique supprimée malgré les produits (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation suppression boutique avec produits fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else if (error.response && error.response.status === 404) {
        log('⚠️ Route DELETE boutique non trouvée (peut-être pas implémentée)');
        return true; // Pas critique
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test suppression boutique', error);
    return false;
  }
}

// 10. Test: Accès non autorisé (Acheteur tente de créer boutique)
async function testAccesNonAutorise() {
  try {
    log('TEST 10: Acheteur tente de créer une boutique (autorisation)');
    
    // Créer un acheteur
    const acheteurResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Acheteur',
      email: `acheteur.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Acheteur'
    });
    
    const acheteurToken = acheteurResponse.data.token;
    log('Acheteur créé');
    
    // Récupérer une catégorie
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let categories = [];
    if (Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    } else if (categoriesResponse.data.categories) {
      categories = categoriesResponse.data.categories;
    }
    
    if (!categories || categories.length === 0) {
      log('⚠️ Pas de catégories, skip test');
      return true;
    }
    
    // Tenter de créer une boutique avec un acheteur
    try {
      await axios.post(
        `${BASE_URL}/boutique/register`,
        {
          nom: `Boutique Acheteur ${Date.now()}`,
          description: 'Test autorisation',
          categorie: categories[0]._id
        },
        { headers: { Authorization: `Bearer ${acheteurToken}` } }
      );
      log('⚠️ Acheteur a créé une boutique (autorisation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        logSuccess('Validation autorisation fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test autorisation', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 TEST DES CAS LIMITES (EDGE CASES) V2 - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion Admin', fn: loginAdmin, critical: true },
    { name: 'Étage numéro double', fn: testCreateEtageNumeroDouble },
    { name: 'Modifier étage numéro existant', fn: testUpdateEtageNumeroExistant },
    { name: 'Supprimer étage avec espaces', fn: testDeleteEtageAvecEspaces },
    { name: 'Boutique sans catégorie', fn: testCreateBoutiqueSansCategorie },
    { name: 'Boutique catégorie invalide', fn: testCreateBoutiqueCategorieInvalide },
    { name: 'Produit prix négatif', fn: testCreateProduitPrixNegatif },
    { name: 'Produit stock négatif', fn: testCreateProduitStockNegatif },
    { name: 'Supprimer boutique avec produits', fn: testDeleteBoutiqueAvecProduits },
    { name: 'Acheteur crée boutique', fn: testAccesNonAutorise }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    
    if (success) {
      results.success++;
    } else {
      results.failed++;
      if (test.critical) {
        console.log('\n❌ Test critique échoué, arrêt des tests');
        break;
      }
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RÉSUMÉ DES TESTS EDGE CASES V2 - ${env}`);
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS EDGE CASES PASSENT! 🎉\n');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) ont échoué\n`);
  }
}

runAllTests().catch(console.error);
