/**
 * 🔍 TEST CATÉGORIES PUBLIQUES
 * Test pour diagnostiquer le problème de chargement des catégories
 * sans authentification sur la page d'inscription boutique
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

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function testEndpoint(config) {
  const { name, method, url, data, headers, expectedStatus = 200 } = config;
  
  try {
    const fullUrl = `${API_URL}${url}`;
    log(`\n🧪 Test: ${name}`, 'cyan');
    log(`   URL: ${method} ${fullUrl}`, 'reset');
    
    if (headers) {
      log(`   Headers: ${JSON.stringify(headers, null, 2)}`, 'reset');
    } else {
      log(`   Headers: Aucun (requête publique)`, 'yellow');
    }
    
    const response = await axios({
      method,
      url: fullUrl,
      data,
      headers,
      validateStatus: () => true
    });

    const success = response.status === expectedStatus;
    const statusColor = success ? 'green' : 'red';
    const statusIcon = success ? '✅' : '❌';
    
    log(`   ${statusIcon} Status: ${response.status} (attendu: ${expectedStatus})`, statusColor);
    
    if (response.data) {
      if (response.data.message) {
        log(`   📝 Message: ${response.data.message}`, statusColor);
      }
      if (response.data.categories) {
        log(`   📋 Catégories: ${response.data.categories.length}`, statusColor);
        
        // Afficher les 3 premières catégories
        if (response.data.categories.length > 0) {
          log(`\n   📋 Aperçu des catégories:`, 'cyan');
          response.data.categories.slice(0, 3).forEach((cat, index) => {
            log(`      ${index + 1}. ${cat.nom} (ID: ${cat._id})`, 'reset');
          });
          if (response.data.categories.length > 3) {
            log(`      ... et ${response.data.categories.length - 3} autres`, 'reset');
          }
        }
      }
      if (response.data.error) {
        log(`   ❌ Erreur: ${response.data.error}`, 'red');
      }
    }
    
    return { success, data: response.data, status: response.status };
  } catch (error) {
    log(`❌ ERREUR: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   Réponse: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🔍 TEST CATÉGORIES PUBLIQUES - DIAGNOSTIC                             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  let stats = { total: 0, passed: 0, failed: 0 };
  let commercantToken = null;

  // ============================================================================
  // SCÉNARIO 1: ACCÈS SANS AUTHENTIFICATION (comme un utilisateur non connecté)
  // ============================================================================
  logSection('SCÉNARIO 1: ACCÈS SANS AUTHENTIFICATION');
  log('📝 Contexte: Utilisateur non connecté accède à la page d\'inscription boutique', 'yellow');
  log('📝 Comportement attendu: Les catégories doivent être accessibles publiquement', 'yellow');

  stats.total++;
  const testPublic1 = await testEndpoint({
    name: 'GET /api/categories-boutique (sans token)',
    method: 'GET',
    url: '/categories-boutique',
    expectedStatus: 200
  });

  if (testPublic1.success) {
    log(`✅ Les catégories sont accessibles publiquement`, 'green');
    stats.passed++;
  } else {
    log(`❌ Les catégories ne sont PAS accessibles publiquement`, 'red');
    log(`⚠️  Cela empêche les utilisateurs non connectés de voir les catégories`, 'yellow');
    stats.failed++;
  }

  stats.total++;
  const testPublic2 = await testEndpoint({
    name: 'GET /api/categories-boutique?actives=true (sans token)',
    method: 'GET',
    url: '/categories-boutique?actives=true',
    expectedStatus: 200
  });

  if (testPublic2.success) {
    log(`✅ Les catégories actives sont accessibles publiquement`, 'green');
    stats.passed++;
  } else {
    log(`❌ Les catégories actives ne sont PAS accessibles publiquement`, 'red');
    stats.failed++;
  }

  // ============================================================================
  // SCÉNARIO 2: CONNEXION COMMERÇANT ET ACCÈS AUX CATÉGORIES
  // ============================================================================
  logSection('SCÉNARIO 2: ACCÈS AVEC AUTHENTIFICATION COMMERÇANT');
  log('📝 Contexte: Commerçant connecté accède à la page d\'inscription boutique', 'yellow');

  stats.total++;
  const loginCommercant = await testEndpoint({
    name: 'Login Commerçant',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    },
    expectedStatus: 200
  });

  if (loginCommercant.success) {
    commercantToken = loginCommercant.data.token;
    log(`✅ Token Commerçant récupéré`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec connexion commerçant`, 'red');
    stats.failed++;
  }

  if (commercantToken) {
    stats.total++;
    const testAuth1 = await testEndpoint({
      name: 'GET /api/categories-boutique (avec token Commerçant)',
      method: 'GET',
      url: '/categories-boutique',
      headers: { Authorization: `Bearer ${commercantToken}` },
      expectedStatus: 200
    });

    if (testAuth1.success) {
      log(`✅ Les catégories sont accessibles avec token`, 'green');
      stats.passed++;
    } else {
      log(`❌ Les catégories ne sont PAS accessibles avec token`, 'red');
      stats.failed++;
    }

    stats.total++;
    const testAuth2 = await testEndpoint({
      name: 'GET /api/categories-boutique?actives=true (avec token Commerçant)',
      method: 'GET',
      url: '/categories-boutique?actives=true',
      headers: { Authorization: `Bearer ${commercantToken}` },
      expectedStatus: 200
    });

    if (testAuth2.success) {
      log(`✅ Les catégories actives sont accessibles avec token`, 'green');
      stats.passed++;
    } else {
      log(`❌ Les catégories actives ne sont PAS accessibles avec token`, 'red');
      stats.failed++;
    }
  }

  // ============================================================================
  // SCÉNARIO 3: VÉRIFIER LE BACKEND
  // ============================================================================
  logSection('SCÉNARIO 3: VÉRIFICATION BACKEND');
  log('📝 Vérification de la configuration backend', 'yellow');

  // Tester d'autres routes publiques pour comparaison
  stats.total++;
  const testBoutiques = await testEndpoint({
    name: 'GET /api/boutiques (route publique pour comparaison)',
    method: 'GET',
    url: '/boutiques',
    expectedStatus: 200
  });

  if (testBoutiques.success) {
    log(`✅ Les boutiques sont accessibles publiquement (route publique fonctionne)`, 'green');
    stats.passed++;
  } else {
    log(`❌ Les boutiques ne sont PAS accessibles publiquement`, 'red');
    stats.failed++;
  }

  // ============================================================================
  // DIAGNOSTIC ET RECOMMANDATIONS
  // ============================================================================
  logSection('🔍 DIAGNOSTIC');

  if (!testPublic1.success && !testPublic2.success) {
    log('❌ PROBLÈME IDENTIFIÉ:', 'red');
    log('   Les catégories ne sont PAS accessibles sans authentification', 'red');
    log('   Cela empêche le chargement de la page d\'inscription boutique', 'red');
    
    log('\n💡 SOLUTIONS POSSIBLES:', 'yellow');
    log('   1. Backend: Vérifier que la route /api/categories-boutique est publique', 'yellow');
    log('   2. Backend: Vérifier le middleware auth.js (optionalAuth)', 'yellow');
    log('   3. Frontend: L\'interceptor marque déjà la route comme publique', 'yellow');
    log('   4. Frontend: Le composant charge les catégories APRÈS la connexion', 'yellow');
    
    log('\n🔧 SOLUTION RECOMMANDÉE:', 'cyan');
    log('   Le composant boutique-registration doit vérifier si l\'utilisateur', 'cyan');
    log('   est connecté AVANT de charger les catégories. Si non connecté,', 'cyan');
    log('   rediriger vers la page de connexion.', 'cyan');
  } else if (testPublic1.success || testPublic2.success) {
    log('✅ Les catégories sont accessibles publiquement', 'green');
    log('   Le problème peut venir de l\'interceptor frontend', 'yellow');
    
    log('\n💡 VÉRIFICATIONS:', 'yellow');
    log('   1. L\'interceptor ajoute-t-il le token même pour les routes publiques?', 'yellow');
    log('   2. Le composant charge-t-il les catégories au bon moment?', 'yellow');
  }

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  logSection('📊 RÉSUMÉ');
  
  console.log(`Total de tests:     ${stats.total}`);
  log(`✅ Réussis:         ${stats.passed}`, 'green');
  log(`❌ Échoués:         ${stats.failed}`, 'red');
  
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  const rateColor = successRate >= 75 ? 'green' : (successRate >= 50 ? 'yellow' : 'red');
  log(`\n📈 Taux de réussite: ${successRate}%`, rateColor);

  if (stats.passed === stats.total) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
