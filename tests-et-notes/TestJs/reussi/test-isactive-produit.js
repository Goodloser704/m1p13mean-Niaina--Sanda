/**
 * 🧪 Test du champ isActive pour les produits
 * Vérifie que le soft delete et les filtres fonctionnent correctement
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Comptes de test
const ADMIN = { email: 'admin@mallapp.com', mdp: 'admin123' };
const COMMERCANT = { email: 'commercant@test.com', mdp: 'Commercant123456!' };

let adminToken = '';
let commercantToken = '';
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

// 1. Login
const testLogin = async () => {
  log('🔐', '=== PHASE 1: Authentification ===');
  adminToken = await login(ADMIN, 'Admin');
  commercantToken = await login(COMMERCANT, 'Commerçant');
};

// 2. Récupérer une boutique existante
const testGetBoutique = async () => {
  log('🏪', '=== PHASE 2: Récupération boutique ===');
  
  await test('Récupérer les boutiques du commerçant', async () => {
    const response = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    if (response.data.boutiques.length === 0) {
      throw new Error('Aucune boutique trouvée pour le commerçant');
    }
    
    testBoutiqueId = response.data.boutiques[0]._id;
    log('📋', `Boutique trouvée: ${testBoutiqueId}`);
  });
};

// 3. Récupérer ou créer un type de produit
const testGetTypeProduit = async () => {
  log('📦', '=== PHASE 3: Type de produit ===');
  
  await test('Récupérer les types de produits', async () => {
    const response = await axios.get(`${BASE_URL}/types-produit`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    // Chercher un type actif pour cette boutique
    const typeActif = response.data.typesProduits?.find(
      t => t.boutique === testBoutiqueId && t.isActive !== false
    );
    
    if (typeActif) {
      testTypeProduitId = typeActif._id;
      log('📋', `Type de produit trouvé: ${testTypeProduitId}`);
    } else {
      // Créer un type de produit de test
      const createResponse = await axios.post(
        `${BASE_URL}/types-produit`,
        {
          type: `Test Type ${Date.now()}`,
          description: 'Type de test pour isActive',
          boutique: testBoutiqueId
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      testTypeProduitId = createResponse.data.typeProduit._id;
      log('✨', `Type de produit créé: ${testTypeProduitId}`);
    }
  });
};

// 4. Créer un produit de test
const testCreateProduit = async () => {
  log('🛍️', '=== PHASE 4: Création produit ===');
  
  await test('Créer un produit avec isActive=true par défaut', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: `Produit Test isActive ${Date.now()}`,
        description: 'Test du champ isActive',
        photo: 'https://example.com/photo.jpg',
        prix: 25.99,
        typeProduit: testTypeProduitId,
        boutique: testBoutiqueId,
        stock: { nombreDispo: 10 }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    testProduitId = response.data.produit._id;
    log('✨', `Produit créé: ${testProduitId}`);
    
    // Vérifier que isActive n'est pas dans la réponse (mais devrait être true par défaut)
    if (response.data.produit.isActive === false) {
      throw new Error('Le produit devrait être actif par défaut');
    }
  });
};

// 5. Vérifier que le produit apparaît dans les listes
const testProduitVisible = async () => {
  log('👁️', '=== PHASE 5: Visibilité produit actif ===');
  
  await test('Le produit apparaît dans GET /api/produits', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (!produit) {
      throw new Error('Le produit actif devrait apparaître dans la liste');
    }
    log('✅', 'Produit trouvé dans la liste publique');
  });
  
  await test('Le produit apparaît dans GET /api/produits/boutique/:id', async () => {
    const response = await axios.get(`${BASE_URL}/produits/boutique/${testBoutiqueId}`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (!produit) {
      throw new Error('Le produit actif devrait apparaître dans la liste de la boutique');
    }
    log('✅', 'Produit trouvé dans la liste de la boutique');
  });
  
  await test('Le produit apparaît dans GET /api/boutiques/:id/produits', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/${testBoutiqueId}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (!produit) {
      throw new Error('Le produit actif devrait apparaître dans getBoutiqueProduits');
    }
    log('✅', 'Produit trouvé dans getBoutiqueProduits');
  });
  
  await test('Le produit apparaît dans GET /api/produits/:id', async () => {
    const response = await axios.get(`${BASE_URL}/produits/${testProduitId}`);
    
    if (!response.data.produit) {
      throw new Error('Le produit actif devrait être accessible par ID');
    }
    log('✅', 'Produit accessible par ID');
  });
};

// 6. Supprimer le produit (soft delete)
const testSoftDelete = async () => {
  log('🗑️', '=== PHASE 6: Soft delete (isActive=false) ===');
  
  await test('Supprimer le produit avec DELETE /api/produits/:id', async () => {
    const response = await axios.delete(`${BASE_URL}/produits/${testProduitId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    if (!response.data.message.includes('supprimé')) {
      throw new Error('La suppression devrait retourner un message de succès');
    }
    log('✅', 'Produit supprimé (soft delete)');
  });
};

// 7. Vérifier que le produit n'apparaît plus dans les listes
const testProduitInvisible = async () => {
  log('🚫', '=== PHASE 7: Invisibilité produit inactif ===');
  
  await test('Le produit N\'apparaît PAS dans GET /api/produits', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (produit) {
      throw new Error('Le produit inactif ne devrait PAS apparaître dans la liste');
    }
    log('✅', 'Produit invisible dans la liste publique');
  });
  
  await test('Le produit N\'apparaît PAS dans GET /api/produits/boutique/:id', async () => {
    const response = await axios.get(`${BASE_URL}/produits/boutique/${testBoutiqueId}`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (produit) {
      throw new Error('Le produit inactif ne devrait PAS apparaître dans la liste de la boutique');
    }
    log('✅', 'Produit invisible dans la liste de la boutique');
  });
  
  await test('Le produit N\'apparaît PAS dans GET /api/boutiques/:id/produits', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/${testBoutiqueId}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (produit) {
      throw new Error('Le produit inactif ne devrait PAS apparaître dans getBoutiqueProduits');
    }
    log('✅', 'Produit invisible dans getBoutiqueProduits');
  });
  
  await test('Le produit N\'est PAS accessible dans GET /api/produits/:id', async () => {
    try {
      await axios.get(`${BASE_URL}/produits/${testProduitId}`);
      throw new Error('Le produit inactif ne devrait PAS être accessible par ID');
    } catch (error) {
      if (error.response?.status === 404) {
        log('✅', 'Produit inaccessible par ID (404)');
      } else {
        throw error;
      }
    }
  });
};

// 8. Vérifier qu'on peut réactiver le produit
const testReactivation = async () => {
  log('♻️', '=== PHASE 8: Réactivation produit ===');
  
  await test('Réactiver le produit avec PUT /api/produits/:id', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}`,
      { isActive: true },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (!response.data.message.includes('mis à jour')) {
      throw new Error('La réactivation devrait retourner un message de succès');
    }
    log('✅', 'Produit réactivé');
  });
  
  await test('Le produit réactivé apparaît à nouveau dans GET /api/produits', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    
    if (!produit) {
      throw new Error('Le produit réactivé devrait apparaître dans la liste');
    }
    log('✅', 'Produit réactivé visible dans la liste');
  });
};

// Exécution
const run = async () => {
  console.log('\n🧪 ========================================');
  console.log('🧪  TEST CHAMP isActive POUR PRODUITS');
  console.log('🧪 ========================================\n');
  
  try {
    await testLogin();
    await testGetBoutique();
    await testGetTypeProduit();
    await testCreateProduit();
    await testProduitVisible();
    await testSoftDelete();
    await testProduitInvisible();
    await testReactivation();
    
    console.log('\n📊 ========================================');
    console.log('📊  RÉSULTATS DES TESTS');
    console.log('📊 ========================================');
    console.log(`✅ Tests réussis: ${tests.passed}/${tests.total}`);
    console.log(`❌ Tests échoués: ${tests.failed}/${tests.total}`);
    console.log(`📈 Taux de réussite: ${((tests.passed / tests.total) * 100).toFixed(1)}%`);
    
    if (tests.failed === 0) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! 🎉');
      console.log('✅ Le champ isActive fonctionne correctement');
      console.log('✅ Le soft delete fonctionne');
      console.log('✅ Les filtres sont appliqués partout');
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    process.exit(1);
  }
};

run();
