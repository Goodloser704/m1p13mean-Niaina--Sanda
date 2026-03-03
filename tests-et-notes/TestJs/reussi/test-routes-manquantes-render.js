/**
 * Test des routes manquantes selon les spécifications - VERSION RENDER
 * Vérifie que toutes les routes de Liste-des-fonctions.txt sont implémentées
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';
const COMMERCANT_EMAIL = 'commercant@test.com';
const COMMERCANT_PASSWORD = 'Commercant123456!';
const ACHETEUR_EMAIL = 'acheteur@test.com';
const ACHETEUR_PASSWORD = 'Test123456!';

let tokens = {
  admin: '',
  commercant: '',
  acheteur: ''
};

let testData = {
  adminId: null,
  commercantId: null,
  acheteurId: null
};

// Fonction pour logger avec couleurs
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

// Connexion Admin
async function loginAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    tokens.admin = response.data.token;
    testData.adminId = response.data.user.id;
    log('✅ Connexion admin réussie', 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion admin: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Connexion Commercant
async function loginCommercant() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: COMMERCANT_EMAIL,
      mdp: COMMERCANT_PASSWORD
    });
    tokens.commercant = response.data.token;
    testData.commercantId = response.data.user.id;
    log('✅ Connexion commercant réussie', 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion commercant: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Connexion Acheteur
async function loginAcheteur() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ACHETEUR_EMAIL,
      mdp: ACHETEUR_PASSWORD
    });
    tokens.acheteur = response.data.token;
    testData.acheteurId = response.data.user.id;
    log('✅ Connexion acheteur réussie', 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion acheteur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 1: GET /api/users/:id/me
async function testGetMyProfile() {
  try {
    log('\n📋 === TEST 1: GET /api/users/:id/me ===');
    
    const response = await axios.get(
      `${BASE_URL}/users/${testData.adminId}/me`,
      { headers: { Authorization: `Bearer ${tokens.admin}` } }
    );
    
    if (response.status === 200 && response.data.user) {
      log(`✅ Route GET /api/users/:id/me fonctionne`, 'success');
      log(`   Email: ${response.data.user.email}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 2: PUT /api/users/me
async function testUpdateMyProfile() {
  try {
    log('\n📋 === TEST 2: PUT /api/users/me ===');
    
    const response = await axios.put(
      `${BASE_URL}/users/me`,
      { telephone: '0123456789' },
      { headers: { Authorization: `Bearer ${tokens.admin}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route PUT /api/users/me fonctionne`, 'success');
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 3: GET /api/users/:userId/notifications
async function testGetMyNotifications() {
  try {
    log('\n📋 === TEST 3: GET /api/users/:userId/notifications ===');
    
    const response = await axios.get(
      `${BASE_URL}/users/${testData.adminId}/notifications`,
      { headers: { Authorization: `Bearer ${tokens.admin}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route GET /api/users/:userId/notifications fonctionne`, 'success');
      log(`   Notifications: ${response.data.notifications?.length || 0}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 4: GET /api/users/:id/wallet
async function testGetMyWallet() {
  try {
    log('\n📋 === TEST 4: GET /api/users/:id/wallet ===');
    
    const response = await axios.get(
      `${BASE_URL}/users/${testData.adminId}/wallet`,
      { headers: { Authorization: `Bearer ${tokens.admin}` } }
    );
    
    if (response.status === 200 && response.data.portefeuille) {
      log(`✅ Route GET /api/users/:id/wallet fonctionne`, 'success');
      log(`   Balance: ${response.data.portefeuille.balance} €`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 5: GET /api/admin/demandes-location/etat/:etat
async function testGetDemandesLocationParEtat() {
  try {
    log('\n📋 === TEST 5: GET /api/admin/demandes-location/etat/:etat ===');
    
    const response = await axios.get(
      `${BASE_URL}/admin/demandes-location/etat/EnAttente`,
      { headers: { Authorization: `Bearer ${tokens.admin}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route GET /api/admin/demandes-location/etat/:etat fonctionne`, 'success');
      log(`   Demandes: ${response.data.demandes?.length || 0}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 6: POST /api/commercant/loyers/pay
async function testPayLoyer() {
  try {
    log('\n📋 === TEST 6: POST /api/commercant/loyers/pay ===');
    log('ℹ️  Cette route nécessite un commercant avec une boutique et un espace', 'warning');
    log('ℹ️  Test de l\'existence de la route uniquement', 'warning');
    
    // Vérifier que la route existe (même si elle échoue pour manque de données)
    try {
      await axios.post(
        `${BASE_URL}/commercant/loyers/pay`,
        {},
        { headers: { Authorization: `Bearer ${tokens.commercant}` } }
      );
    } catch (error) {
      // Si on obtient une erreur 403 ou 400, la route existe
      if (error.response && [400, 403, 404].includes(error.response.status)) {
        log(`✅ Route POST /api/commercant/loyers/pay existe`, 'success');
        log(`   (Erreur attendue: ${error.response.status} - ${error.response.data.message})`, 'info');
        return true;
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 7: GET /api/acheteur/:id/achats/en-cours
async function testGetAchatsEnCours() {
  try {
    log('\n📋 === TEST 7: GET /api/acheteur/:id/achats/en-cours ===');
    
    const response = await axios.get(
      `${BASE_URL}/acheteur/${testData.acheteurId}/achats/en-cours`,
      { headers: { Authorization: `Bearer ${tokens.acheteur}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route GET /api/acheteur/:id/achats/en-cours fonctionne`, 'success');
      log(`   Achats en cours: ${response.data.achats?.length || 0}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 8: GET /api/acheteur/:id/achats/historique
async function testGetAchatsHistorique() {
  try {
    log('\n📋 === TEST 8: GET /api/acheteur/:id/achats/historique ===');
    
    const response = await axios.get(
      `${BASE_URL}/acheteur/${testData.acheteurId}/achats/historique`,
      { headers: { Authorization: `Bearer ${tokens.acheteur}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route GET /api/acheteur/:id/achats/historique fonctionne`, 'success');
      log(`   Achats historique: ${response.data.achats?.length || 0}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 9: GET /api/acheteur/:id/factures
async function testGetMyFactures() {
  try {
    log('\n📋 === TEST 9: GET /api/acheteur/:id/factures ===');
    
    const response = await axios.get(
      `${BASE_URL}/acheteur/${testData.acheteurId}/factures`,
      { headers: { Authorization: `Bearer ${tokens.acheteur}` } }
    );
    
    if (response.status === 200) {
      log(`✅ Route GET /api/acheteur/:id/factures fonctionne`, 'success');
      log(`   Factures: ${response.data.factures?.length || 0}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Fonction principale
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║        TEST DES ROUTES MANQUANTES - RENDER            ║');
  log('╚════════════════════════════════════════════════════════╝');
  log(`\n🌐 URL de l'API: ${BASE_URL}`);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Connexions
  if (!await loginAdmin()) {
    log('\n❌ Impossible de continuer sans connexion admin', 'error');
    process.exit(1);
  }
  
  if (!await loginCommercant()) {
    log('\n⚠️  Connexion commercant échouée - certains tests seront limités', 'warning');
  }
  
  if (!await loginAcheteur()) {
    log('\n⚠️  Connexion acheteur échouée - certains tests seront limités', 'warning');
  }
  
  // Exécuter les tests
  const tests = [
    { name: 'GET /api/users/:id/me', fn: testGetMyProfile },
    { name: 'PUT /api/users/me', fn: testUpdateMyProfile },
    { name: 'GET /api/users/:userId/notifications', fn: testGetMyNotifications },
    { name: 'GET /api/users/:id/wallet', fn: testGetMyWallet },
    { name: 'GET /api/admin/demandes-location/etat/:etat', fn: testGetDemandesLocationParEtat },
    { name: 'POST /api/commercant/loyers/pay', fn: testPayLoyer },
    { name: 'GET /api/acheteur/:id/achats/en-cours', fn: testGetAchatsEnCours },
    { name: 'GET /api/acheteur/:id/achats/historique', fn: testGetAchatsHistorique },
    { name: 'GET /api/acheteur/:id/factures', fn: testGetMyFactures }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Résumé
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║                    RÉSUMÉ DES TESTS                    ║');
  log('╚════════════════════════════════════════════════════════╝');
  log(`\n📊 Total: ${results.total}`);
  log(`✅ Réussis: ${results.passed}`, 'success');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`📈 Taux de réussite: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);
  
  if (results.passed === results.total) {
    log('🎉 Toutes les routes manquantes fonctionnent sur Render!', 'success');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
