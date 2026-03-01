/**
 * 🔍 TEST CATÉGORIES - AUTHENTIFICATION
 * Vérifier si les catégories sont accessibles avec et sans auth
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(config) {
  const { name, method, url, headers } = config;
  
  try {
    const fullUrl = `${API_URL}${url}`;
    log(`\n🧪 ${name}`, 'cyan');
    log(`   URL: ${method} ${fullUrl}`, 'reset');
    log(`   Headers: ${headers ? 'Avec Authorization' : 'Sans Authorization'}`, 'reset');
    
    const response = await axios({
      method,
      url: fullUrl,
      headers,
      validateStatus: () => true
    });

    const statusColor = response.status === 200 ? 'green' : 'red';
    log(`   Status: ${response.status}`, statusColor);
    
    if (response.data?.message) {
      log(`   Message: ${response.data.message}`, statusColor);
    }
    
    if (response.data?.categories) {
      log(`   Catégories: ${response.data.categories.length}`, 'green');
    }
    
    return { success: response.status === 200, status: response.status };
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🔍 TEST CATÉGORIES - AUTHENTIFICATION                                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');

  // Test 1: Sans auth
  log('\n' + '='.repeat(80), 'cyan');
  log('  TEST 1: Routes catégories SANS authentification', 'cyan');
  log('='.repeat(80), 'cyan');

  await testEndpoint({
    name: 'GET /api/categories-boutique',
    method: 'GET',
    url: '/categories-boutique'
  });

  await testEndpoint({
    name: 'GET /api/categories-boutique?actives=true',
    method: 'GET',
    url: '/categories-boutique?actives=true'
  });

  await testEndpoint({
    name: 'GET /api/categories-boutique/test',
    method: 'GET',
    url: '/categories-boutique/test'
  });

  // Test 2: Avec auth
  log('\n' + '='.repeat(80), 'cyan');
  log('  TEST 2: Routes catégories AVEC authentification', 'cyan');
  log('='.repeat(80), 'cyan');

  // Login pour obtenir token
  log('\n🔐 Connexion...', 'yellow');
  const loginResponse = await axios.post(`${API_URL}/auth/login`, {
    email: 'commercant@test.com',
    mdp: 'Commercant123456!'
  });
  const token = loginResponse.data.token;
  log(`✅ Token obtenu`, 'green');

  await testEndpoint({
    name: 'GET /api/categories-boutique (avec token)',
    method: 'GET',
    url: '/categories-boutique',
    headers: { Authorization: `Bearer ${token}` }
  });

  await testEndpoint({
    name: 'GET /api/categories-boutique?actives=true (avec token)',
    method: 'GET',
    url: '/categories-boutique?actives=true',
    headers: { Authorization: `Bearer ${token}` }
  });

  // Analyse
  log('\n' + '='.repeat(80), 'cyan');
  log('  📊 ANALYSE', 'cyan');
  log('='.repeat(80), 'cyan');

  log('\n💡 PROBLÈME IDENTIFIÉ:', 'yellow');
  log('   Les routes catégories requièrent l\'authentification en production', 'yellow');
  log('   mais devraient être publiques selon le code local.', 'yellow');

  log('\n🔧 SOLUTION:', 'cyan');
  log('   1. L\'intercepteur frontend doit considérer /api/categories-boutique', 'cyan');
  log('      comme une route publique', 'cyan');
  log('   2. OU le composant doit charger les catégories APRÈS la connexion', 'cyan');

  log('\n✅ RECOMMANDATION:', 'green');
  log('   Charger les catégories APRÈS que l\'utilisateur soit connecté', 'green');
  log('   car seuls les commerçants connectés peuvent créer des boutiques.', 'green');

  console.log('\n' + '='.repeat(80) + '\n');
}

runTests().catch(error => {
  log(`\n💥 Erreur: ${error.message}`, 'red');
  process.exit(1);
});
