/**
 * 🧪 TEST LOGIN FRONTEND
 * Test du flux complet de connexion et accès aux fonctionnalités
 * après déploiement
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
      if (response.data.user) {
        log(`   👤 Utilisateur: ${response.data.user.nom} ${response.data.user.prenoms}`, 'green');
        log(`   🎭 Rôle: ${response.data.user.role}`, 'green');
      }
      if (response.data.categories) {
        log(`   📋 Catégories: ${response.data.categories.length}`, statusColor);
      }
      if (response.data.boutiques) {
        log(`   🏪 Boutiques: ${response.data.boutiques.length}`, statusColor);
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
  log('║     🧪 TEST LOGIN FRONTEND - FLUX COMPLET APRÈS DÉPLOIEMENT               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  let stats = { total: 0, passed: 0, failed: 0 };
  let tokens = { admin: null, commercant: null, client: null };

  // ============================================================================
  // ÉTAPE 1: CONNEXION DES 3 COMPTES PAR DÉFAUT
  // ============================================================================
  logSection('ÉTAPE 1: CONNEXION DES COMPTES PAR DÉFAUT');

  // Admin
  stats.total++;
  const loginAdmin = await testEndpoint({
    name: 'Login Admin',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    },
    expectedStatus: 200
  });

  if (loginAdmin.success) {
    tokens.admin = loginAdmin.data.token;
    stats.passed++;
  } else {
    stats.failed++;
  }

  // Commerçant
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
    tokens.commercant = loginCommercant.data.token;
    stats.passed++;
  } else {
    stats.failed++;
  }

  // Client
  stats.total++;
  const loginClient = await testEndpoint({
    name: 'Login Client',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'client@test.com',
      mdp: 'Client123456!'
    },
    expectedStatus: 200
  });

  if (loginClient.success) {
    tokens.client = loginClient.data.token;
    stats.passed++;
  } else {
    stats.failed++;
  }

  // ============================================================================
  // ÉTAPE 2: ACCÈS AUX CATÉGORIES (COMMERÇANT)
  // ============================================================================
  logSection('ÉTAPE 2: ACCÈS AUX CATÉGORIES (COMMERÇANT CONNECTÉ)');
  log('📝 Contexte: Commerçant connecté accède à /boutique-registration', 'yellow');
  log('📝 Comportement attendu: Catégories se chargent avec le token', 'yellow');

  if (tokens.commercant) {
    stats.total++;
    const getCategories = await testEndpoint({
      name: 'GET /api/categories-boutique (avec token Commerçant)',
      method: 'GET',
      url: '/categories-boutique?actives=true',
      headers: { Authorization: `Bearer ${tokens.commercant}` },
      expectedStatus: 200
    });

    if (getCategories.success) {
      log(`✅ Les catégories se chargent correctement pour un Commerçant connecté`, 'green');
      stats.passed++;
    } else {
      log(`❌ Échec du chargement des catégories`, 'red');
      stats.failed++;
    }
  } else {
    log('⚠️  Impossible de tester (pas de token Commerçant)', 'yellow');
  }

  // ============================================================================
  // ÉTAPE 3: CRÉATION DE BOUTIQUE (COMMERÇANT)
  // ============================================================================
  logSection('ÉTAPE 3: CRÉATION DE BOUTIQUE (COMMERÇANT CONNECTÉ)');

  if (tokens.commercant) {
    // D'abord récupérer une catégorie
    const getCategoriesForCreation = await testEndpoint({
      name: 'GET /api/categories-boutique (pour récupérer un ID)',
      method: 'GET',
      url: '/categories-boutique',
      headers: { Authorization: `Bearer ${tokens.commercant}` },
      expectedStatus: 200
    });

    let categorieId = null;
    if (getCategoriesForCreation.success && getCategoriesForCreation.data.categories.length > 0) {
      categorieId = getCategoriesForCreation.data.categories[0]._id;
      log(`✅ Catégorie ID récupéré: ${categorieId}`, 'green');
    }

    if (categorieId) {
      stats.total++;
      const createBoutique = await testEndpoint({
        name: 'POST /api/boutique/register (création boutique)',
        method: 'POST',
        url: '/boutique/register',
        data: {
          nom: `Boutique Test ${Date.now()}`,
          description: 'Test après déploiement',
          categorie: categorieId,
          emplacement: {
            zone: 'Zone Test',
            numeroLocal: 'T01',
            etage: 1
          },
          contact: {
            telephone: '0123456789',
            email: 'test@boutique.com',
            siteWeb: 'https://test.com'
          },
          horaires: {
            lundi: { ouverture: '09:00', fermeture: '18:00' },
            mardi: { ouverture: '09:00', fermeture: '18:00' },
            mercredi: { ouverture: '09:00', fermeture: '18:00' },
            jeudi: { ouverture: '09:00', fermeture: '18:00' },
            vendredi: { ouverture: '09:00', fermeture: '18:00' },
            samedi: { ouverture: '09:00', fermeture: '18:00' },
            dimanche: { ouverture: '10:00', fermeture: '17:00' }
          }
        },
        headers: { Authorization: `Bearer ${tokens.commercant}` },
        expectedStatus: 201
      });

      if (createBoutique.success) {
        log(`✅ Boutique créée avec succès!`, 'green');
        stats.passed++;
      } else {
        log(`❌ Échec de la création de boutique`, 'red');
        stats.failed++;
      }
    }
  }

  // ============================================================================
  // ÉTAPE 4: ACCÈS AUX BOUTIQUES (COMMERÇANT)
  // ============================================================================
  logSection('ÉTAPE 4: ACCÈS AUX BOUTIQUES (COMMERÇANT)');

  if (tokens.commercant) {
    stats.total++;
    const getMyBoutiques = await testEndpoint({
      name: 'GET /api/boutique/my-boutiques',
      method: 'GET',
      url: '/boutique/my-boutiques',
      headers: { Authorization: `Bearer ${tokens.commercant}` },
      expectedStatus: 200
    });

    if (getMyBoutiques.success) {
      log(`✅ Accès aux boutiques du commerçant réussi`, 'green');
      stats.passed++;
    } else {
      log(`❌ Échec de l'accès aux boutiques`, 'red');
      stats.failed++;
    }
  }

  // ============================================================================
  // ÉTAPE 5: DASHBOARD ADMIN
  // ============================================================================
  logSection('ÉTAPE 5: DASHBOARD ADMIN');

  if (tokens.admin) {
    stats.total++;
    const getDashboard = await testEndpoint({
      name: 'GET /api/admin/dashboard',
      method: 'GET',
      url: '/admin/dashboard',
      headers: { Authorization: `Bearer ${tokens.admin}` },
      expectedStatus: 200
    });

    if (getDashboard.success) {
      log(`✅ Accès au dashboard admin réussi`, 'green');
      stats.passed++;
    } else {
      log(`❌ Échec de l'accès au dashboard`, 'red');
      stats.failed++;
    }
  }

  // ============================================================================
  // ÉTAPE 6: NOTIFICATIONS
  // ============================================================================
  logSection('ÉTAPE 6: NOTIFICATIONS');

  if (tokens.commercant) {
    stats.total++;
    const getNotifications = await testEndpoint({
      name: 'GET /api/notifications (Commerçant)',
      method: 'GET',
      url: '/notifications?limit=20&includeRead=true',
      headers: { Authorization: `Bearer ${tokens.commercant}` },
      expectedStatus: 200
    });

    if (getNotifications.success) {
      log(`✅ Accès aux notifications réussi`, 'green');
      stats.passed++;
    } else {
      log(`❌ Échec de l'accès aux notifications`, 'red');
      stats.failed++;
    }
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
    log('✅ Le déploiement est réussi et toutes les fonctionnalités marchent', 'green');
  } else if (successRate >= 75) {
    log('\n✅ LA PLUPART DES TESTS SONT PASSÉS', 'green');
    log('⚠️  Quelques fonctionnalités nécessitent une vérification', 'yellow');
  } else {
    log('\n⚠️  PLUSIEURS TESTS ONT ÉCHOUÉ', 'yellow');
    log('Vérifiez les détails ci-dessus', 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
