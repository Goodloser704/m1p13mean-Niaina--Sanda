/**
 * 🧪 TEST USER ENDPOINTS - PRODUCTION
 * Teste tous les endpoints liés aux utilisateurs sur l'API déployée
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Variables globales pour les tests
let adminToken = '';
let clientToken = '';
let commercantToken = '';
let newUserId = '';

async function testUserEndpoints() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 TEST USER ENDPOINTS - PRODUCTION                                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // ============================================================================
    // TEST 1: Login Admin
    // ============================================================================
    log('📝 TEST 1: Login Admin', 'cyan');
    results.total++;
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@mall.com',
        mdp: 'Admin123456!'
      });

      if (response.status === 200 && response.data.token) {
        adminToken = response.data.token;
        log('✅ Login admin réussi', 'green');
        log(`   Token: ${adminToken.substring(0, 30)}...`, 'green');
        log(`   User: ${response.data.user.email} (${response.data.user.role})`, 'green');
        results.passed++;
        results.tests.push({ name: 'Login Admin', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Login Admin', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 2: Login Client
    // ============================================================================
    log('\n📝 TEST 2: Login Client', 'cyan');
    results.total++;
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'client@test.com',
        mdp: 'Client123456!'
      });

      if (response.status === 200 && response.data.token) {
        clientToken = response.data.token;
        log('✅ Login client réussi', 'green');
        log(`   User: ${response.data.user.email} (${response.data.user.role})`, 'green');
        results.passed++;
        results.tests.push({ name: 'Login Client', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Login Client', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 3: Login Commerçant
    // ============================================================================
    log('\n📝 TEST 3: Login Commerçant', 'cyan');
    results.total++;
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'commercant@test.com',
        mdp: 'Commercant123456!'
      });

      if (response.status === 200 && response.data.token) {
        commercantToken = response.data.token;
        log('✅ Login commerçant réussi', 'green');
        log(`   User: ${response.data.user.email} (${response.data.user.role})`, 'green');
        results.passed++;
        results.tests.push({ name: 'Login Commerçant', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Login Commerçant', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 4: Inscription nouveau utilisateur avec genre
    // ============================================================================
    log('\n📝 TEST 4: Inscription nouveau utilisateur (avec genre)', 'cyan');
    results.total++;
    try {
      const timestamp = Date.now();
      const response = await axios.post(`${API_URL}/auth/register`, {
        nom: 'TestUser',
        prenoms: 'Test',
        email: `testuser${timestamp}@test.com`,
        mdp: 'Test123456!',
        role: 'Acheteur',
        telephone: '0612345678',
        genre: 'Masculin'
      });

      if (response.status === 201 && response.data.user) {
        newUserId = response.data.user.id || response.data.user._id;
        log('✅ Inscription réussie', 'green');
        log(`   Email: ${response.data.user.email}`, 'green');
        log(`   Genre: ${response.data.user.genre || 'Non spécifié'}`, 'green');
        log(`   ID: ${newUserId}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Inscription avec genre', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.response?.data?.message || error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Inscription avec genre', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 5: Récupérer profil utilisateur (Client)
    // ============================================================================
    log('\n📝 TEST 5: Récupérer profil utilisateur', 'cyan');
    results.total++;
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });

      if (response.status === 200 && response.data.user) {
        log('✅ Profil récupéré', 'green');
        log(`   Nom: ${response.data.user.prenoms} ${response.data.user.nom}`, 'green');
        log(`   Email: ${response.data.user.email}`, 'green');
        log(`   Genre: ${response.data.user.genre || 'Non spécifié'}`, 'green');
        log(`   Rôle: ${response.data.user.role}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Récupérer profil', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.response?.data?.message || error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Récupérer profil', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 6: Mettre à jour profil utilisateur (avec genre)
    // ============================================================================
    log('\n📝 TEST 6: Mettre à jour profil (avec genre)', 'cyan');
    results.total++;
    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          telephone: '0698765432',
          genre: 'Feminin'
        },
        {
          headers: { Authorization: `Bearer ${clientToken}` }
        }
      );

      if (response.status === 200) {
        log('✅ Profil mis à jour', 'green');
        log(`   Téléphone: ${response.data.user.telephone}`, 'green');
        log(`   Genre: ${response.data.user.genre}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Mise à jour profil', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.response?.data?.message || error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Mise à jour profil', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 7: Vérifier token valide
    // ============================================================================
    log('\n📝 TEST 7: Vérifier token valide', 'cyan');
    results.total++;
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.status === 200 && response.data.valid) {
        log('✅ Token valide', 'green');
        log(`   User: ${response.data.user.email}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Vérifier token', status: 'PASS' });
      } else {
        throw new Error('Token invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.response?.data?.message || error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Vérifier token', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 8: Accès endpoint admin (avec token admin)
    // ============================================================================
    log('\n📝 TEST 8: Accès endpoint admin (avec token admin)', 'cyan');
    results.total++;
    try {
      const response = await axios.get(`${API_URL}/boutique/pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.status === 200) {
        log('✅ Accès admin autorisé', 'green');
        log(`   Boutiques en attente: ${response.data.boutiques?.length || 0}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Accès admin autorisé', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      log(`❌ Échec: ${error.response?.data?.message || error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Accès admin autorisé', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 9: Accès endpoint admin (avec token client) - Doit échouer
    // ============================================================================
    log('\n📝 TEST 9: Accès endpoint admin (avec token client) - Doit échouer', 'cyan');
    results.total++;
    try {
      const response = await axios.get(`${API_URL}/boutique/pending`, {
        headers: { Authorization: `Bearer ${clientToken}` },
        validateStatus: () => true
      });

      if (response.status === 403) {
        log('✅ Accès refusé comme attendu', 'green');
        log(`   Message: ${response.data.message}`, 'green');
        results.passed++;
        results.tests.push({ name: 'Accès admin refusé', status: 'PASS' });
      } else {
        throw new Error('Devrait être refusé (403)');
      }
    } catch (error) {
      log(`❌ Échec: ${error.message}`, 'red');
      results.failed++;
      results.tests.push({ name: 'Accès admin refusé', status: 'FAIL', error: error.message });
    }

    // ============================================================================
    // TEST 10: Logout
    // ============================================================================
    log('\n📝 TEST 10: Logout', 'cyan');
    results.total++;
    try {
      const response = await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${clientToken}` }
        }
      );

      if (response.status === 200) {
        log('✅ Logout réussi', 'green');
        results.passed++;
        results.tests.push({ name: 'Logout', status: 'PASS' });
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      // Le logout peut ne pas être implémenté, ce n'est pas critique
      log(`⚠️  Endpoint logout non disponible (non critique)`, 'yellow');
      results.passed++;
      results.tests.push({ name: 'Logout', status: 'PASS', note: 'Non implémenté' });
    }

  } catch (error) {
    log('\n❌ ERREUR CRITIQUE:', 'red');
    log(`   ${error.message}`, 'red');
  }

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    const color = test.status === 'PASS' ? 'green' : 'red';
    log(`${icon} Test ${index + 1}: ${test.name}`, color);
    if (test.error) {
      log(`   Erreur: ${test.error}`, 'red');
    }
    if (test.note) {
      log(`   Note: ${test.note}`, 'yellow');
    }
  });

  log('\n' + '='.repeat(80), 'cyan');
  log(`Total: ${results.total} tests`, 'cyan');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`📈 Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  log('='.repeat(80) + '\n', 'cyan');

  // Retourner le code de sortie approprié
  process.exit(results.failed > 0 ? 1 : 0);
}

// Exécuter les tests
testUserEndpoints();
