/**
 * 🔍 TEST DES ERREURS UNIQUEMENT
 * Script pour tester uniquement les endpoints qui échouent
 * avec détails complets des erreurs
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Tokens et IDs (à récupérer au début)
let tokens = {
  admin: null,
  commercant: null,
  acheteur: null
};

let testIds = {
  centreCommercialId: null,
  etageId: null,
  espaceId: null,
  categorieId: null,
  boutiqueId: null,
  produitId: null
};

// Statistiques
let stats = {
  total: 0,
  passed: 0,
  failed: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function testEndpoint(config) {
  const { name, method, url, data, headers, expectedStatus = 200 } = config;
  
  stats.total++;
  
  try {
    const fullUrl = `${API_URL}${url}`;
    log(`\n🧪 Test: ${name}`, 'cyan');
    log(`   URL: ${method} ${fullUrl}`, 'reset');
    if (data) {
      log(`   Data: ${JSON.stringify(data, null, 2)}`, 'reset');
    }
    
    const response = await axios({
      method,
      url: fullUrl,
      data,
      headers,
      validateStatus: () => true
    });

    if (response.status === expectedStatus) {
      stats.passed++;
      log(`✅ SUCCÈS - Status: ${response.status}`, 'green');
      
      // Afficher les données importantes de la réponse
      if (response.data) {
        if (response.data._id) {
          log(`   ID créé: ${response.data._id}`, 'green');
        }
        if (response.data.categorie?._id) {
          log(`   Catégorie ID: ${response.data.categorie._id}`, 'green');
        }
        if (response.data.boutique?._id) {
          log(`   Boutique ID: ${response.data.boutique._id}`, 'green');
        }
      }
      
      return { success: true, data: response.data, status: response.status };
    } else {
      stats.failed++;
      log(`❌ ÉCHEC - Status: ${response.status} (attendu: ${expectedStatus})`, 'red');
      
      // Détails de l'erreur
      if (response.data) {
        if (response.data.message) {
          log(`   ❌ Message: ${response.data.message}`, 'red');
        }
        
        if (response.data.errors && Array.isArray(response.data.errors)) {
          log(`   ❌ Erreurs de validation:`, 'red');
          response.data.errors.forEach(err => {
            log(`      - ${err.msg || err.message} (champ: ${err.param || err.path})`, 'red');
          });
        }
        
        // Afficher la réponse complète si elle est courte
        const responseStr = JSON.stringify(response.data, null, 2);
        if (responseStr.length < 500) {
          log(`   📄 Réponse complète:`, 'yellow');
          log(responseStr, 'yellow');
        }
      }
      
      return { success: false, data: response.data, status: response.status };
    }
  } catch (error) {
    stats.failed++;
    log(`❌ ERREUR RÉSEAU: ${error.message}`, 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      if (error.response.data) {
        log(`   Réponse: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      }
    }
    
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ÉTAPE 1: AUTHENTIFICATION
// ============================================================================

async function setupAuthentication() {
  logSection('ÉTAPE 1: AUTHENTIFICATION');

  // Login Admin
  const loginAdmin = await testEndpoint({
    name: 'Login Admin',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    },
    expectedStatus: 200
  });

  if (loginAdmin.success) {
    tokens.admin = loginAdmin.data.token;
    log(`✅ Token Admin récupéré`, 'green');
  }

  // Créer Commercant
  const registerCommercant = await testEndpoint({
    name: 'Register Commercant',
    method: 'POST',
    url: '/auth/register',
    data: {
      nom: 'TestCommercant',
      prenoms: 'Test',
      email: `commercant.${Date.now()}@test.com`,
      mdp: 'password123',
      role: 'Commercant',
      telephone: '0612345678'
    },
    expectedStatus: 201
  });

  if (registerCommercant.success) {
    tokens.commercant = registerCommercant.data.token;
    log(`✅ Token Commercant récupéré`, 'green');
  }
}

// ============================================================================
// ÉTAPE 2: CRÉER LES RESSOURCES NÉCESSAIRES
// ============================================================================

async function setupResources() {
  logSection('ÉTAPE 2: CRÉATION DES RESSOURCES');

  // Récupérer Centre Commercial
  const getCC = await testEndpoint({
    name: 'Get Centre Commercial',
    method: 'PUT',
    url: '/centre-commercial',
    data: {
      nom: 'Centre Test',
      description: 'Test',
      adresse: '123 Test',
      email: 'test@test.com',
      telephone: '0123456789'
    },
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  if (getCC.success) {
    testIds.centreCommercialId = getCC.data.centreCommercial?._id || getCC.data._id;
    log(`✅ Centre Commercial ID: ${testIds.centreCommercialId}`, 'green');
  }

  // Créer ou récupérer Étage
  // D'abord essayer de récupérer un étage existant
  const getEtages = await testEndpoint({
    name: 'Get Étages existants',
    method: 'GET',
    url: '/etages',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  let etageId = null;
  if (getEtages.success && getEtages.data.etages && getEtages.data.etages.length > 0) {
    etageId = getEtages.data.etages[0]._id;
    log(`✅ Étage existant utilisé: ${etageId}`, 'green');
  } else {
    // Créer un nouvel étage si aucun n'existe
    const numeroEtage = Math.floor(Math.random() * 50) + 1;
    const nomEtage = `Étage Test ${Date.now()}`;
    const createEtage = await testEndpoint({
      name: 'Create Étage',
      method: 'POST',
      url: '/etages',
      data: {
        numero: numeroEtage,
        nom: nomEtage,
        description: 'Test'
      },
      headers: { Authorization: `Bearer ${tokens.admin}` },
      expectedStatus: 201
    });

    if (createEtage.success) {
      etageId = createEtage.data.etage?._id || createEtage.data._id;
      log(`✅ Étage ID: ${etageId}`, 'green');
    }
  }
  
  testIds.etageId = etageId;

  // Créer Espace
  const codeEspace = `T${Date.now().toString().slice(-3)}`;
  const createEspace = await testEndpoint({
    name: 'Create Espace',
    method: 'POST',
    url: '/espaces',
    data: {
      centreCommercial: testIds.centreCommercialId,
      code: codeEspace,
      codeEspace: codeEspace,
      surface: 50,
      etage: testIds.etageId,
      loyer: 1500,
      description: 'Test'
    },
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 201
  });

  if (createEspace.success) {
    testIds.espaceId = createEspace.data.espace?._id || createEspace.data._id;
    log(`✅ Espace ID: ${testIds.espaceId}`, 'green');
  }

  // Créer Catégorie
  const createCategorie = await testEndpoint({
    name: 'Create Catégorie',
    method: 'POST',
    url: '/categories-boutique',
    data: {
      nom: `Cat_${Date.now()}`,
      description: 'Test'
    },
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 201
  });

  if (createCategorie.success) {
    testIds.categorieId = createCategorie.data.categorie?._id || createCategorie.data._id;
    log(`✅ Catégorie ID: ${testIds.categorieId}`, 'green');
  }
}

// ============================================================================
// ÉTAPE 3: TESTER LES ENDPOINTS QUI ÉCHOUENT
// ============================================================================

async function testFailingEndpoints() {
  logSection('ÉTAPE 3: TEST DES ENDPOINTS EN ERREUR');

  // ========== ERREUR 403 - Dashboard ==========
  log('\n🔴 TEST ERREUR 403 - Dashboard', 'magenta');

  await testEndpoint({
    name: '403: GET /api/admin/dashboard',
    method: 'GET',
    url: '/admin/dashboard',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  // ========== ERREUR 401 - Categories ==========
  log('\n🟡 TEST ERREUR 401 - Categories', 'magenta');

  // Test sans token (devrait être public)
  await testEndpoint({
    name: '401: GET /api/categories-boutique (sans token)',
    method: 'GET',
    url: '/categories-boutique',
    expectedStatus: 200
  });

  // Test avec token (pour voir si ça marche)
  await testEndpoint({
    name: 'GET /api/categories-boutique (avec token)',
    method: 'GET',
    url: '/categories-boutique',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  // ========== ERREUR 500 - BOUTIQUE ==========
  log('\n� TEST ERREUR 500 - Boutique', 'magenta');

  const createBoutique = await testEndpoint({
    name: '500: POST /api/boutique/commercant/boutique',
    method: 'POST',
    url: '/boutique/commercant/boutique',
    data: {
      nom: `Boutique Test ${Date.now()}`,
      description: 'Test boutique',
      categorie: testIds.categorieId,
      horairesHebdo: [
        { jour: 'Lundi', debut: '09:00', fin: '18:00' }
      ]
    },
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 201
  });

  // Si la boutique est créée, sauvegarder l'ID
  if (createBoutique.success) {
    testIds.boutiqueId = createBoutique.data.boutique?._id || createBoutique.data._id;
    log(`✅ Boutique ID: ${testIds.boutiqueId}`, 'green');
  }

  // ========== ERREUR 404 - Types et Produits ==========
  log('\n🔵 TESTS ERREURS 404 - Types et Produits', 'magenta');

  const createTypeProduit = await testEndpoint({
    name: '404: POST /api/types-produit',
    method: 'POST',
    url: '/types-produit',
    data: {
      type: `Type_${Date.now()}`,
      boutique: testIds.boutiqueId // Ajouter l'ID de la boutique
    },
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 201
  });

  if (createTypeProduit.success) {
    testIds.typeProduitId = createTypeProduit.data.typeProduit?._id || createTypeProduit.data._id;
    log(`✅ Type Produit ID: ${testIds.typeProduitId}`, 'green');
  }

  const createProduit = await testEndpoint({
    name: '404: POST /api/produits',
    method: 'POST',
    url: '/produits',
    data: {
      nom: `Produit Test ${Date.now()}`,
      description: 'Test',
      prix: 29.99,
      typeProduit: testIds.typeProduitId,
      boutique: testIds.boutiqueId,
      tempsPreparation: '00:30:00',
      stock: { nombreDispo: 10 }
    },
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 201
  });

  if (createProduit.success) {
    testIds.produitId = createProduit.data.produit?._id || createProduit.data._id;
    log(`✅ Produit ID: ${testIds.produitId}`, 'green');
  }

  // ========== ERREUR 500 - Stock ==========
  log('\n🟣 TEST ERREUR 500 - Stock', 'magenta');

  await testEndpoint({
    name: '500: PUT /api/produits/:id/stock',
    method: 'PUT',
    url: `/produits/${testIds.produitId || 'null'}/stock`,
    data: { nombreDispo: 15 },
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 200
  });
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function runTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🔍 TEST DES ERREURS UNIQUEMENT - DIAGNOSTIC DÉTAILLÉ                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  const startTime = Date.now();

  try {
    await setupAuthentication();
    await setupResources();
    await testFailingEndpoints();
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Résumé
  logSection('📊 RÉSUMÉ');
  
  console.log(`Total de tests:     ${stats.total}`);
  log(`✅ Réussis:         ${stats.passed}`, 'green');
  log(`❌ Échoués:         ${stats.failed}`, 'red');
  console.log(`⏱️  Durée:           ${duration}s`);
  
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  log(`\n📈 Taux de réussite: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // IDs générés
  logSection('📝 IDs GÉNÉRÉS');
  console.log(JSON.stringify(testIds, null, 2));

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
