/**
 * 🧪 SCRIPT DE TEST COMPLET - MALL MANAGEMENT APP
 * 
 * Ce script teste toutes les fonctionnalités de l'application
 * sur l'environnement de production (Vercel + Render + MongoDB Atlas)
 * 
 * Usage: node test-production-complet.js
 */

const https = require('https');

// Configuration
const CONFIG = {
  BACKEND_URL: 'https://m1p13mean-niaina-1.onrender.com',
  FRONTEND_URL: 'https://m1p13mean-niaina-xjl4.vercel.app',
  TEST_USER: {
    email: 'testuser@example.com',
    password: 'Test123456!',
    nom: 'Test User'
  },
  TEST_ADMIN: {
    email: 'admin@mall.com',
    password: 'Admin123456!',
    nom: 'Admin Mall'
  }
};

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Compteurs de résultats
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// Token d'authentification
let authToken = null;
let adminToken = null;
let testUserId = null;
let testBoutiqueId = null;
let testProduitId = null;


/**
 * Fonction utilitaire pour faire des requêtes HTTP
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Afficher un résultat de test
 */
function logTest(name, passed, message = '') {
  stats.total++;
  if (passed) {
    stats.passed++;
    console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
  } else {
    stats.failed++;
    console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}`);
    if (message) {
      console.log(`   ${colors.yellow}→ ${message}${colors.reset}`);
    }
  }
}

/**
 * Afficher un titre de section
 */
function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Attendre un délai
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================================================
// TESTS MODULE 1: AUTHENTIFICATION
// ============================================================================

async function testAuthentification() {
  logSection('MODULE 1: AUTHENTIFICATION & GESTION UTILISATEURS');

  // Test 1.1: Health Check
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/health`);
    logTest(
      '1.1 - Health Check Backend',
      response.statusCode === 200 && response.data.status === 'OK',
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('1.1 - Health Check Backend', false, error.message);
  }

  // Test 1.2: Inscription utilisateur
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      body: {
        nom: CONFIG.TEST_USER.nom,
        email: CONFIG.TEST_USER.email,
        password: CONFIG.TEST_USER.password,
        role: 'client'
      }
    });
    
    const passed = response.statusCode === 201 || response.statusCode === 200;
    if (passed && response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user?._id;
    }
    
    logTest(
      '1.2 - Inscription Utilisateur',
      passed,
      !passed ? `Status: ${response.statusCode} - ${JSON.stringify(response.data)}` : ''
    );
  } catch (error) {
    logTest('1.2 - Inscription Utilisateur', false, error.message);
  }

  await sleep(1000);

  // Test 1.3: Connexion utilisateur
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: CONFIG.TEST_USER.email,
        password: CONFIG.TEST_USER.password
      }
    });
    
    const passed = response.statusCode === 200 && response.data.token;
    if (passed) {
      authToken = response.data.token;
      testUserId = response.data.user?._id;
    }
    
    logTest(
      '1.3 - Connexion Utilisateur',
      passed,
      !passed ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('1.3 - Connexion Utilisateur', false, error.message);
  }

  // Test 1.4: Récupération profil
  if (authToken) {
    try {
      const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      logTest(
        '1.4 - Récupération Profil',
        response.statusCode === 200 && response.data.email === CONFIG.TEST_USER.email,
        response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
      );
    } catch (error) {
      logTest('1.4 - Récupération Profil', false, error.message);
    }
  } else {
    logTest('1.4 - Récupération Profil', false, 'Pas de token disponible');
  }

  // Test 1.5: Connexion Admin
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: CONFIG.TEST_ADMIN.email,
        password: CONFIG.TEST_ADMIN.password
      }
    });
    
    const passed = response.statusCode === 200 && response.data.token;
    if (passed) {
      adminToken = response.data.token;
    }
    
    logTest(
      '1.5 - Connexion Admin',
      passed,
      !passed ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('1.5 - Connexion Admin', false, error.message);
  }
}


// ============================================================================
// TESTS MODULE 2: GESTION DES BOUTIQUES
// ============================================================================

async function testBoutiques() {
  logSection('MODULE 2: GESTION DES BOUTIQUES');

  // Test 2.1: Liste des boutiques (public)
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/boutique`);
    
    logTest(
      '2.1 - Liste Boutiques (Public)',
      response.statusCode === 200 && Array.isArray(response.data),
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('2.1 - Liste Boutiques (Public)', false, error.message);
  }

  // Test 2.2: Catégories de boutiques
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/categories-boutique`);
    
    logTest(
      '2.2 - Catégories Boutiques',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('2.2 - Catégories Boutiques', false, error.message);
  }

  // Test 2.3: Mes boutiques (commerçant)
  if (authToken) {
    try {
      const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/boutique/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      logTest(
        '2.3 - Mes Boutiques',
        response.statusCode === 200 || response.statusCode === 404,
        response.statusCode !== 200 && response.statusCode !== 404 ? `Status: ${response.statusCode}` : ''
      );
    } catch (error) {
      logTest('2.3 - Mes Boutiques', false, error.message);
    }
  }
}

// ============================================================================
// TESTS MODULE 3: GESTION DES PRODUITS
// ============================================================================

async function testProduits() {
  logSection('MODULE 3: GESTION DES PRODUITS');

  // Test 3.1: Liste des produits
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/produits`);
    
    const passed = response.statusCode === 200;
    if (passed && response.data.length > 0) {
      testProduitId = response.data[0]._id;
    }
    
    logTest(
      '3.1 - Liste Produits',
      passed,
      !passed ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('3.1 - Liste Produits', false, error.message);
  }

  // Test 3.2: Types de produits
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/types-produit`);
    
    logTest(
      '3.2 - Types de Produits',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('3.2 - Types de Produits', false, error.message);
  }

  // Test 3.3: Détails d'un produit
  if (testProduitId) {
    try {
      const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/produits/${testProduitId}`);
      
      logTest(
        '3.3 - Détails Produit',
        response.statusCode === 200,
        response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
      );
    } catch (error) {
      logTest('3.3 - Détails Produit', false, error.message);
    }
  }

  // Test 3.4: Recherche de produits
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/produits?search=test`);
    
    logTest(
      '3.4 - Recherche Produits',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('3.4 - Recherche Produits', false, error.message);
  }
}


// ============================================================================
// TESTS MODULE 4: PORTEFEUILLE
// ============================================================================

async function testPortefeuille() {
  logSection('MODULE 4: GESTION DU PORTEFEUILLE');

  if (!authToken) {
    logTest('4.x - Tests Portefeuille', false, 'Pas de token disponible');
    return;
  }

  // Test 4.1: Consultation portefeuille
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/portefeuille/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '4.1 - Consultation Portefeuille',
      response.statusCode === 200 && typeof response.data.solde !== 'undefined',
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('4.1 - Consultation Portefeuille', false, error.message);
  }

  // Test 4.2: Historique transactions
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/portefeuille/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '4.2 - Historique Transactions',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('4.2 - Historique Transactions', false, error.message);
  }

  // Test 4.3: Statistiques portefeuille
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/portefeuille/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '4.3 - Statistiques Portefeuille',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('4.3 - Statistiques Portefeuille', false, error.message);
  }
}

// ============================================================================
// TESTS MODULE 5: NOTIFICATIONS
// ============================================================================

async function testNotifications() {
  logSection('MODULE 5: GESTION DES NOTIFICATIONS');

  if (!authToken) {
    logTest('5.x - Tests Notifications', false, 'Pas de token disponible');
    return;
  }

  // Test 5.1: Liste des notifications
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '5.1 - Liste Notifications',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('5.1 - Liste Notifications', false, error.message);
  }

  // Test 5.2: Compteur notifications non lues
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/notifications/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '5.2 - Compteur Non Lues',
      response.statusCode === 200 && typeof response.data.unreadCount !== 'undefined',
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('5.2 - Compteur Non Lues', false, error.message);
  }
}


// ============================================================================
// TESTS MODULE 6: INFRASTRUCTURE (ADMIN)
// ============================================================================

async function testInfrastructure() {
  logSection('MODULE 6: GESTION INFRASTRUCTURE (ADMIN)');

  if (!adminToken) {
    logTest('6.x - Tests Infrastructure', false, 'Pas de token admin disponible');
    return;
  }

  // Test 6.1: Liste des étages
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/etages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logTest(
      '6.1 - Liste Étages',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('6.1 - Liste Étages', false, error.message);
  }

  // Test 6.2: Statistiques étages
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/etages/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logTest(
      '6.2 - Statistiques Étages',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('6.2 - Statistiques Étages', false, error.message);
  }

  // Test 6.3: Liste des espaces
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/espaces`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logTest(
      '6.3 - Liste Espaces',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('6.3 - Liste Espaces', false, error.message);
  }

  // Test 6.4: Centre commercial
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/centre-commercial`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logTest(
      '6.4 - Centre Commercial',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('6.4 - Centre Commercial', false, error.message);
  }
}

// ============================================================================
// TESTS MODULE 7: DEMANDES DE LOCATION
// ============================================================================

async function testDemandesLocation() {
  logSection('MODULE 7: GESTION DEMANDES DE LOCATION');

  if (!authToken) {
    logTest('7.x - Tests Demandes', false, 'Pas de token disponible');
    return;
  }

  // Test 7.1: Mes demandes
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/demandes-location/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '7.1 - Mes Demandes',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('7.1 - Mes Demandes', false, error.message);
  }

  // Test 7.2: Liste toutes demandes (admin)
  if (adminToken) {
    try {
      const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/demandes-location`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      logTest(
        '7.2 - Liste Toutes Demandes (Admin)',
        response.statusCode === 200,
        response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
      );
    } catch (error) {
      logTest('7.2 - Liste Toutes Demandes (Admin)', false, error.message);
    }
  }
}


// ============================================================================
// TESTS MODULE 8: ACHATS
// ============================================================================

async function testAchats() {
  logSection('MODULE 8: GESTION DES ACHATS');

  if (!authToken) {
    logTest('8.x - Tests Achats', false, 'Pas de token disponible');
    return;
  }

  // Test 8.1: Mes achats
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/achats/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '8.1 - Mes Achats',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('8.1 - Mes Achats', false, error.message);
  }

  // Test 8.2: Historique achats
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/achats/historique`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest(
      '8.2 - Historique Achats',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('8.2 - Historique Achats', false, error.message);
  }
}

// ============================================================================
// TESTS MODULE 9: FRONTEND
// ============================================================================

async function testFrontend() {
  logSection('MODULE 9: TESTS FRONTEND');

  // Test 9.1: Page d'accueil
  try {
    const response = await makeRequest(CONFIG.FRONTEND_URL);
    
    logTest(
      '9.1 - Page Accueil Frontend',
      response.statusCode === 200,
      response.statusCode !== 200 ? `Status: ${response.statusCode}` : ''
    );
  } catch (error) {
    logTest('9.1 - Page Accueil Frontend', false, error.message);
  }
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}🧪 TESTS COMPLETS - MALL MANAGEMENT APP${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}Backend:${colors.reset} ${CONFIG.BACKEND_URL}`);
  console.log(`${colors.yellow}Frontend:${colors.reset} ${CONFIG.FRONTEND_URL}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  const startTime = Date.now();

  // Exécuter tous les tests
  await testAuthentification();
  await sleep(1000);
  
  await testBoutiques();
  await sleep(1000);
  
  await testProduits();
  await sleep(1000);
  
  await testPortefeuille();
  await sleep(1000);
  
  await testNotifications();
  await sleep(1000);
  
  await testInfrastructure();
  await sleep(1000);
  
  await testDemandesLocation();
  await sleep(1000);
  
  await testAchats();
  await sleep(1000);
  
  await testFrontend();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Afficher le résumé
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}📊 RÉSUMÉ DES TESTS${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  
  console.log(`${colors.blue}Total de tests:${colors.reset} ${stats.total}`);
  console.log(`${colors.green}✅ Réussis:${colors.reset} ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`${colors.red}❌ Échoués:${colors.reset} ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`${colors.yellow}⏱️  Durée:${colors.reset} ${duration}s`);
  
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Statut final
  if (stats.failed === 0) {
    console.log(`${colors.green}🎉 TOUS LES TESTS SONT PASSÉS !${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${colors.reset}\n`);
    process.exit(1);
  }
}

// Lancer les tests
runAllTests().catch(error => {
  console.error(`${colors.red}❌ Erreur fatale:${colors.reset}`, error);
  process.exit(1);
});
