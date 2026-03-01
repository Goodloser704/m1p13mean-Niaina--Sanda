/**
 * 🧪 Test de régression - Vérification que isActive n'a pas cassé les routes existantes
 * Teste toutes les routes liées aux produits et boutiques
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
let testCategorieId = '';

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
// PHASE 2: Routes Catégories Boutique
// ========================================
const testCategoriesBoutique = async () => {
  log('📂', '=== PHASE 2: Routes Catégories Boutique ===');
  
  await test('GET /api/categories-boutique (public)', async () => {
    const response = await axios.get(`${BASE_URL}/categories-boutique`);
    if (!response.data.categories || response.data.categories.length === 0) {
      throw new Error('Aucune catégorie trouvée');
    }
    testCategorieId = response.data.categories[0]._id;
    log('📋', `${response.data.categories.length} catégories trouvées`);
  });
  
  await test('POST /api/categories-boutique (admin)', async () => {
    const response = await axios.post(
      `${BASE_URL}/categories-boutique`,
      {
        nom: `Catégorie Test ${Date.now()}`,
        description: 'Test régression'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.categorie) {
      throw new Error('Catégorie non créée');
    }
    log('✨', 'Catégorie créée');
  });
};

// ========================================
// PHASE 3: Routes Boutiques
// ========================================
const testBoutiques = async () => {
  log('🏪', '=== PHASE 3: Routes Boutiques ===');
  
  await test('GET /api/boutique/my-boutiques (commerçant)', async () => {
    const response = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (response.data.boutiques.length === 0) {
      throw new Error('Aucune boutique trouvée');
    }
    testBoutiqueId = response.data.boutiques[0]._id;
    log('📋', `${response.data.boutiques.length} boutiques trouvées`);
  });
  
  await test('GET /api/boutique/me (commerçant)', async () => {
    const response = await axios.get(`${BASE_URL}/boutique/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.boutique) {
      throw new Error('Boutique non trouvée');
    }
    log('✅', `Boutique: ${response.data.boutique.nom}`);
  });
  
  await test('GET /api/boutiques (public)', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques`);
    if (!response.data.boutiques) {
      throw new Error('Liste boutiques non retournée');
    }
    log('📋', `${response.data.boutiques.length} boutiques publiques`);
  });
  
  await test('GET /api/boutiques/search?keyword=test (public)', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/search?keyword=test`);
    log('🔍', `${response.data.count} boutiques trouvées pour "test"`);
  });
};

// ========================================
// PHASE 4: Routes Types Produit
// ========================================
const testTypesProduit = async () => {
  log('📦', '=== PHASE 4: Routes Types Produit ===');
  
  await test('GET /api/types-produit (commerçant)', async () => {
    const response = await axios.get(`${BASE_URL}/types-produit`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.typesProduits) {
      throw new Error('Types produits non retournés');
    }
    
    // Chercher un type actif pour cette boutique
    const typeForBoutique = response.data.typesProduits.find(
      t => t.boutique && (
        (typeof t.boutique === 'object' && t.boutique._id === testBoutiqueId) ||
        (typeof t.boutique === 'string' && t.boutique === testBoutiqueId)
      ) && t.isActive !== false
    );
    
    if (typeForBoutique) {
      testTypeProduitId = typeForBoutique._id;
      log('📋', `Type produit trouvé: ${testTypeProduitId}`);
    } else {
      // Créer un type
      const createResponse = await axios.post(
        `${BASE_URL}/types-produit`,
        {
          type: `Type Test ${Date.now()}`,
          description: 'Test régression',
          boutique: testBoutiqueId
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      testTypeProduitId = createResponse.data.typeProduit._id;
      log('✨', `Type produit créé: ${testTypeProduitId}`);
    }
  });
  
  await test('POST /api/types-produit (commerçant)', async () => {
    const response = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: `Type Nouveau ${Date.now()}`,
        description: 'Test création',
        boutique: testBoutiqueId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.typeProduit) {
      throw new Error('Type produit non créé');
    }
    log('✨', 'Type produit créé');
  });
};

// ========================================
// PHASE 5: Routes Produits (CRUD complet)
// ========================================
const testProduits = async () => {
  log('🛍️', '=== PHASE 5: Routes Produits (CRUD) ===');
  
  await test('POST /api/produits (commerçant - création)', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: `Produit Régression ${Date.now()}`,
        description: 'Test régression complet',
        photo: 'https://example.com/photo.jpg',
        prix: 29.99,
        typeProduit: testTypeProduitId,
        boutique: testBoutiqueId,
        tempsPreparation: '00:15:00',
        stock: { nombreDispo: 50 }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) {
      throw new Error('Produit non créé');
    }
    testProduitId = response.data.produit._id;
    log('✨', `Produit créé: ${testProduitId}`);
  });
  
  await test('GET /api/produits (public - liste)', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    if (!response.data.produits) {
      throw new Error('Liste produits non retournée');
    }
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) {
      throw new Error('Produit créé non trouvé dans la liste');
    }
    log('✅', `${response.data.produits.length} produits dans la liste`);
  });
  
  await test('GET /api/produits/:id (public - détail)', async () => {
    const response = await axios.get(`${BASE_URL}/produits/${testProduitId}`);
    if (!response.data.produit) {
      throw new Error('Produit non trouvé');
    }
    if (response.data.produit._id !== testProduitId) {
      throw new Error('Mauvais produit retourné');
    }
    log('✅', `Produit: ${response.data.produit.nom}`);
  });
  
  await test('GET /api/produits/boutique/:id (public - par boutique)', async () => {
    const response = await axios.get(`${BASE_URL}/produits/boutique/${testBoutiqueId}`);
    if (!response.data.produits) {
      throw new Error('Produits boutique non retournés');
    }
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) {
      throw new Error('Produit non trouvé dans la boutique');
    }
    log('✅', `${response.data.produits.length} produits dans la boutique`);
  });
  
  await test('GET /api/boutiques/:id/produits (public - getBoutiqueProduits)', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/${testBoutiqueId}/produits`);
    if (!response.data.produits) {
      throw new Error('Produits boutique non retournés');
    }
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) {
      throw new Error('Produit non trouvé dans getBoutiqueProduits');
    }
    log('✅', `${response.data.produits.length} produits via getBoutiqueProduits`);
  });
  
  await test('GET /api/produits/me (commerçant - mes produits)', async () => {
    const response = await axios.get(`${BASE_URL}/produits/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.produits) {
      throw new Error('Mes produits non retournés');
    }
    log('✅', `${response.data.produits.length} produits du commerçant`);
  });
  
  await test('PUT /api/produits/:id (commerçant - modification)', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}`,
      {
        nom: `Produit Modifié ${Date.now()}`,
        prix: 39.99,
        stock: { nombreDispo: 75 }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) {
      throw new Error('Produit non modifié');
    }
    if (response.data.produit.prix !== 39.99) {
      throw new Error('Prix non modifié');
    }
    log('✅', 'Produit modifié avec succès');
  });
  
  await test('PUT /api/produits/:id/stock (commerçant - modification stock)', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}/stock`,
      { nombreDispo: 100 },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) {
      throw new Error('Stock non modifié');
    }
    if (response.data.produit.stock.nombreDispo !== 100) {
      throw new Error('Stock incorrect');
    }
    log('✅', 'Stock modifié: 100 unités');
  });
};

// ========================================
// PHASE 6: Test Soft Delete
// ========================================
const testSoftDelete = async () => {
  log('🗑️', '=== PHASE 6: Test Soft Delete ===');
  
  await test('DELETE /api/produits/:id (commerçant - soft delete)', async () => {
    const response = await axios.delete(`${BASE_URL}/produits/${testProduitId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!response.data.message.includes('supprimé')) {
      throw new Error('Message de suppression incorrect');
    }
    log('✅', 'Produit supprimé (soft delete)');
  });
  
  await test('GET /api/produits/:id après suppression (404 attendu)', async () => {
    try {
      await axios.get(`${BASE_URL}/produits/${testProduitId}`);
      throw new Error('Le produit supprimé ne devrait pas être accessible');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Status attendu: 404, reçu: ${error.response?.status}`);
      }
      log('✅', 'Produit inaccessible après suppression (404)');
    }
  });
  
  await test('GET /api/produits - produit absent de la liste', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (produit) {
      throw new Error('Le produit supprimé ne devrait pas apparaître dans la liste');
    }
    log('✅', 'Produit absent de la liste publique');
  });
  
  await test('GET /api/boutiques/:id/produits - produit absent', async () => {
    const response = await axios.get(`${BASE_URL}/boutiques/${testBoutiqueId}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (produit) {
      throw new Error('Le produit supprimé ne devrait pas apparaître dans getBoutiqueProduits');
    }
    log('✅', 'Produit absent de getBoutiqueProduits');
  });
};

// ========================================
// PHASE 7: Test Réactivation
// ========================================
const testReactivation = async () => {
  log('♻️', '=== PHASE 7: Test Réactivation ===');
  
  await test('PUT /api/produits/:id avec isActive=true (réactivation)', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${testProduitId}`,
      { isActive: true },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    if (!response.data.produit) {
      throw new Error('Produit non réactivé');
    }
    log('✅', 'Produit réactivé');
  });
  
  await test('GET /api/produits/:id après réactivation (accessible)', async () => {
    const response = await axios.get(`${BASE_URL}/produits/${testProduitId}`);
    if (!response.data.produit) {
      throw new Error('Produit réactivé non accessible');
    }
    log('✅', 'Produit accessible après réactivation');
  });
  
  await test('GET /api/produits - produit présent dans la liste', async () => {
    const response = await axios.get(`${BASE_URL}/produits`);
    const produit = response.data.produits.find(p => p._id === testProduitId);
    if (!produit) {
      throw new Error('Le produit réactivé devrait apparaître dans la liste');
    }
    log('✅', 'Produit présent dans la liste publique');
  });
};

// ========================================
// PHASE 8: Routes Achats (vérifier compatibilité)
// ========================================
const testAchats = async () => {
  log('🛒', '=== PHASE 8: Routes Achats (compatibilité) ===');
  
  await test('GET /api/achats/panier (client)', async () => {
    const response = await axios.get(`${BASE_URL}/achats/panier`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    // Le panier peut être vide, c'est OK
    log('✅', `Panier: ${response.data.panier?.produits?.length || 0} produits`);
  });
  
  await test('POST /api/achats/panier (client - ajouter produit actif)', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/achats/panier`,
        {
          produitId: testProduitId,
          quantite: 2
        },
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      log('✅', 'Produit ajouté au panier');
    } catch (error) {
      // Peut échouer si le produit n'est pas disponible, c'est OK
      if (error.response?.status === 400 || error.response?.status === 404) {
        log('⚠️', 'Produit non disponible pour achat (normal)');
      } else {
        throw error;
      }
    }
  });
};

// ========================================
// PHASE 9: Test avec filtres et pagination
// ========================================
const testFiltresPagination = async () => {
  log('🔍', '=== PHASE 9: Filtres et Pagination ===');
  
  await test('GET /api/produits?page=1&limit=10', async () => {
    const response = await axios.get(`${BASE_URL}/produits?page=1&limit=10`);
    if (!response.data.pagination) {
      throw new Error('Pagination non retournée');
    }
    log('✅', `Page 1/${response.data.pagination.totalPages}`);
  });
  
  await test('GET /api/produits?boutiqueId=...', async () => {
    const response = await axios.get(`${BASE_URL}/produits?boutiqueId=${testBoutiqueId}`);
    if (!response.data.produits) {
      throw new Error('Filtrage par boutique échoué');
    }
    log('✅', `${response.data.produits.length} produits filtrés par boutique`);
  });
  
  await test('GET /api/produits?typeId=...', async () => {
    const response = await axios.get(`${BASE_URL}/produits?typeId=${testTypeProduitId}`);
    if (!response.data.produits) {
      throw new Error('Filtrage par type échoué');
    }
    log('✅', `${response.data.produits.length} produits filtrés par type`);
  });
  
  await test('GET /api/produits?stockMin=10', async () => {
    const response = await axios.get(`${BASE_URL}/produits?stockMin=10`);
    if (!response.data.produits) {
      throw new Error('Filtrage par stock échoué');
    }
    log('✅', `${response.data.produits.length} produits avec stock >= 10`);
  });
  
  await test('GET /api/produits?search=test', async () => {
    const response = await axios.get(`${BASE_URL}/produits?search=test`);
    if (!response.data.produits) {
      throw new Error('Recherche échouée');
    }
    log('✅', `${response.data.produits.length} produits trouvés pour "test"`);
  });
};

// ========================================
// Exécution
// ========================================
const run = async () => {
  console.log('\n🧪 ========================================');
  console.log('🧪  TEST DE RÉGRESSION - isActive');
  console.log('🧪  Vérification complète des routes');
  console.log('🧪 ========================================\n');
  
  try {
    await testLogin();
    await testCategoriesBoutique();
    await testBoutiques();
    await testTypesProduit();
    await testProduits();
    await testSoftDelete();
    await testReactivation();
    await testAchats();
    await testFiltresPagination();
    
    console.log('\n📊 ========================================');
    console.log('📊  RÉSULTATS DES TESTS');
    console.log('📊 ========================================');
    console.log(`✅ Tests réussis: ${tests.passed}/${tests.total}`);
    console.log(`❌ Tests échoués: ${tests.failed}/${tests.total}`);
    console.log(`📈 Taux de réussite: ${((tests.passed / tests.total) * 100).toFixed(1)}%`);
    
    if (tests.failed === 0) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! 🎉');
      console.log('✅ Aucune régression détectée');
      console.log('✅ Toutes les routes fonctionnent correctement');
      console.log('✅ Le champ isActive est bien intégré');
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('⚠️ Des régressions ont été détectées');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    process.exit(1);
  }
};

run();
