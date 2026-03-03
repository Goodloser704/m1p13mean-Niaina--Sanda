/**
 * 🧪 Test Final - Routes utilisant le modèle Produit
 * Vérifie que toutes les routes fonctionnent après les modifications
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Comptes de test
const ADMIN = { email: 'admin@mallapp.com', mdp: 'admin123' };
const COMMERCANT = { email: 'commercant@test.com', mdp: 'Commercant123456!' };
const CLIENT = { email: 'client@test.com', mdp: 'Client123456!' };

let adminToken = '';
let commercantToken = '';
let clientToken = '';
let testBoutiqueId = '';
let testProduitId = '';
let testTypeProduitId = '';

// Utilitaires
const log = (emoji, message, data = null) => {
  console.log(`${emoji} ${message}`);
  if (data) console.log('   ', JSON.stringify(data, null, 2));
};

const login = async (credentials, role) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    log('✅', `Login ${role} réussi`);
    return response.data.token;
  } catch (error) {
    log('❌', `Erreur login ${role}:`, error.response?.data || error.message);
    throw error;
  }
};

// Tests
const tests = {
  passed: 0,
  failed: 0,
  total: 0
};

const test = async (name, fn) => {
  tests.total++;
  try {
    await fn();
    tests.passed++;
    log('✅', `TEST RÉUSSI: ${name}`);
  } catch (error) {
    tests.failed++;
    log('❌', `TEST ÉCHOUÉ: ${name}`, error.response?.data || error.message);
  }
};

// ========================================
// PHASE 1: Authentification
// ========================================
const testLogin = async () => {
  log('🔐', '=== PHASE 1: Authentification ===');
  adminToken = await login(ADMIN, 'Admin');
  commercantToken = await login(COMMERCANT, 'Commerçant');
  clientToken = await login(CLIENT, 'Client');
};

// ========================================
// PHASE 2: Routes /api/produits
// ========================================
const testRoutesProduits = async () => {
  log('📦', '=== PHASE 2: Routes /api/produits ===');
  
  // Récupérer boutique
  const boutiqueResponse = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
    headers: { Authorization: `Bearer ${commercantToken}` }
  });
  testBoutiqueId = boutiqueResponse.data.boutiques[0]._id;
  
  // Créer type produit
  const typeResponse = await axios.post(
    `${BASE_URL}/types-produit`,
    {
      type: `Type Test ${Date.now()}`,
      description: 'Test final',
      boutique: testBoutiqueId
    },
    { headers: { Authorization: `Bearer ${commercantToken}` } }
  );
  testTypeProduitId = typeResponse.data.typeProduit._id;
  
  await test('POST /api/produits - Créer produit', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: `Produit Test Final ${Date.now()}`,
        description: 'Test après modifications',
        photo: 'https://example.com/photo.jpg',
        prix: 29.99,
        typeProduit: testTypeProduitId,
        boutique: testBoutiqueId,
        stock: { nombreDispo: 20 }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    testProduitId = response.data.produit._id;
    if (!testProduitId) throw new Error('Produit non créé');
    log('✨', `Produit créé: ${testProduitId}`);
  });
  
  await test('GET /api/produits - Liste produits', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    if (!response.data.produits) throw new Error('Liste non retournée');
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) throw new Error('Produit créé non trouvé');
    log('📋', `${response.data.produits.length} produits trouvés`);
  });
  
  await test('GET /api/produits/:id - Détail produit', async () => {
    const response = await axios.get(`${BASE_URL}/produits/${testProduitId}`);
    if (!response.data.produit) throw new Error('Produit non trouvé');
    if (response.data.produit._id !== testProduitId) throw new Error('Mauvais produit');
    log('✅', `Produit: ${response.data.produit.nom}`);
  });
  
  await test('GET /api/produits/boutique/:id - Produits par boutique', async () => {
    const response = await axios.get(`${BASE_URL}/produits/boutique/${testBoutiqueId}`);
    if (!response.data.produits) throw new Error('Produits non retournés');
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) throw new Error('Produit non trouvé');
    log('✅', `${response.data.produits.length} produits de la boutique`);
  });
  
  await test('GET /api/produits/me - Mes produits', async () => {
    const response = await axios.get(`${BASE_URL}/produits/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.produits) throw new Error('Mes produits non retournés');
    log('✅', `${response.data.produits.length} produits du commerçant`);
  });
  
  await test('PUT /api/produits/:id - Modifier produit', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}`,
      { prix: 34.99, description: 'Modifié' },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) throw new Error('Produit non modifié');
    if (response.data.produit.prix !== 34.99) throw new Error('Prix non modifié');
    log('✅', 'Produit modifié');
  });
  
  await test('PUT /api/produits/:id/stock - Modifier stock', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}/stock`,
      { nombreDispo: 50 },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) throw new Error('Stock non modifié');
    if (response.data.produit.stock.nombreDispo !== 50) throw new Error('Stock incorrect');
    log('✅', 'Stock modifié: 50 unités');
  });
};

// ========================================
// PHASE 3: Routes /api/boutiques/:id/produits
// ========================================
const testRoutesBoutiques = async () => {
  log('🏪', '=== PHASE 3: Routes /api/boutiques/:id/produits ===');
  
  await test('GET /api/boutiques/:id/produits - getBoutiqueProduits', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/${testBoutiqueId}/produits`);
    if (!response.data.produits) throw new Error('Produits non retournés');
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) throw new Error('Produit non trouvé');
    log('✅', `${response.data.produits.length} produits via getBoutiqueProduits`);
  });
};

// ========================================
// PHASE 4: Routes /api/client (utilise Produit)
// ========================================
const testRoutesClient = async () => {
  log('👥', '=== PHASE 4: Routes /api/client ===');
  
  await test('GET /api/client/boutiques - Liste boutiques', async () => {
    const response = await axios.get(`${BASE_URL}/client/boutiques`);
    if (!response.data.boutiques) throw new Error('Boutiques non retournées');
    log('✅', `${response.data.boutiques.length} boutiques publiques`);
  });
  
  await test('GET /api/client/boutiques/:id - Détail boutique avec produits', async () => {
    const response = await axios.get(`${BASE_URL}/client/boutiques/${testBoutiqueId}`);
    if (!response.data._id) throw new Error('Boutique non trouvée');
    // Les produits sont optionnels dans cette route
    log('✅', `Boutique: ${response.data.nom}`);
  });
  
  await test('GET /api/client/boutiques/:id/products - Produits boutique', async () => {
    const response = await axios.get(`${BASE_URL}/client/boutiques/${testBoutiqueId}/products`);
    if (!response.data.products) throw new Error('Produits non retournés');
    log('✅', `${response.data.products.length} produits de la boutique`);
  });
  
  await test('GET /api/client/search?q=test - Recherche globale', async () => {
    const response = await axios.get(`${BASE_URL}/client/search?q=test`);
    // La recherche peut retourner des résultats vides, c'est OK
    log('✅', 'Recherche effectuée');
  });
};

// ========================================
// PHASE 5: Soft Delete et Réactivation
// ========================================
const testSoftDelete = async () => {
  log('🗑️', '=== PHASE 5: Soft Delete et Réactivation ===');
  
  await test('DELETE /api/produits/:id - Soft delete', async () => {
    const response = await axios.delete(`${BASE_URL}/produits/${testProduitId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.message.includes('supprimé')) throw new Error('Message incorrect');
    log('✅', 'Produit supprimé (soft delete)');
  });
  
  await test('GET /api/produits/:id après suppression - 404 attendu', async () => {
    try {
      await axios.get(`${BASE_URL}/produits/${testProduitId}`);
      throw new Error('Le produit supprimé ne devrait pas être accessible');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Status attendu: 404, reçu: ${error.response?.status}`);
      }
      log('✅', 'Produit inaccessible (404)');
    }
  });
  
  await test('GET /api/produits - Produit absent de la liste', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (produit) throw new Error('Le produit supprimé ne devrait pas apparaître');
    log('✅', 'Produit absent de la liste');
  });
  
  await test('PUT /api/produits/:id avec isActive=true - Réactivation', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}`,
      { isActive: true },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) throw new Error('Produit non réactivé');
    log('✅', 'Produit réactivé');
  });
  
  await test('GET /api/produits/:id après réactivation - Accessible', async () => {
    const response = await axios.get(`${BASE_URL}/produits/${testProduitId}`);
    if (!response.data.produit) throw new Error('Produit non accessible');
    log('✅', 'Produit accessible après réactivation');
  });
};

// ========================================
// PHASE 6: Vérifier que /api/products n'existe plus
// ========================================
const testRouteObsolete = async () => {
  log('🚫', '=== PHASE 6: Vérification route obsolète ===');
  
  await test('GET /api/products - 404 attendu (route supprimée)', async () => {
    try {
      await axios.get(`${BASE_URL}/products`);
      throw new Error('La route /api/products devrait être supprimée');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Status attendu: 404, reçu: ${error.response?.status}`);
      }
      log('✅', 'Route /api/products bien supprimée (404)');
    }
  });
};

// ========================================
// Exécution
// ========================================
const run = async () => {
  console.log('\n🧪 ========================================');
  console.log('🧪  TEST FINAL - Routes Produit');
  console.log('🧪  Après modifications isActive + nettoyage');
  console.log('🧪 ========================================\n');
  
  try {
    await testLogin();
    await testRoutesProduits();
    await testRoutesBoutiques();
    await testRoutesClient();
    await testSoftDelete();
    await testRouteObsolete();
    
    console.log('\n📊 ========================================');
    console.log('📊  RÉSULTATS DES TESTS');
    console.log('📊 ========================================');
    console.log(`✅ Tests réussis: ${tests.passed}/${tests.total}`);
    console.log(`❌ Tests échoués: ${tests.failed}/${tests.total}`);
    console.log(`📈 Taux de réussite: ${((tests.passed / tests.total) * 100).toFixed(1)}%`);
    
    if (tests.failed === 0) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! 🎉');
      console.log('✅ Routes /api/produits fonctionnent');
      console.log('✅ Routes /api/boutiques/:id/produits fonctionnent');
      console.log('✅ Routes /api/client fonctionnent');
      console.log('✅ Soft delete fonctionne');
      console.log('✅ Réactivation fonctionne');
      console.log('✅ Route obsolète /api/products bien supprimée');
      console.log('\n🚀 PRÊT POUR COMMIT ET PUSH !');
      process.exit(0);
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('⚠️ Vérifier les erreurs ci-dessus');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    process.exit(1);
  }
};

run();
