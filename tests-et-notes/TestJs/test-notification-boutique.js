/**
 * 🔔 TEST NOTIFICATION BOUTIQUE
 * Vérifie que les notifications sont créées pour les admins
 * quand un commerçant crée une boutique
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
      if (response.data.notifications) {
        log(`   🔔 Notifications: ${response.data.notifications.length}`, statusColor);
      }
      if (response.data.count !== undefined) {
        log(`   📊 Count: ${response.data.count}`, statusColor);
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
  log('║     🔔 TEST NOTIFICATION BOUTIQUE                                         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  let stats = { total: 0, passed: 0, failed: 0 };
  let tokens = { admin: null, commercant: null };
  let notificationCountBefore = 0;

  // ============================================================================
  // ÉTAPE 1: CONNEXION ADMIN ET COMPTAGE NOTIFICATIONS AVANT
  // ============================================================================
  logSection('ÉTAPE 1: CONNEXION ADMIN ET COMPTAGE INITIAL');

  stats.total++;
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
    stats.passed++;
  } else {
    log(`❌ Échec connexion admin`, 'red');
    stats.failed++;
    return;
  }

  // Compter les notifications avant
  stats.total++;
  const getNotificationsBefore = await testEndpoint({
    name: 'GET /api/notifications (avant création boutique)',
    method: 'GET',
    url: '/notifications?limit=100',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  if (getNotificationsBefore.success) {
    notificationCountBefore = getNotificationsBefore.data.notifications?.length || 0;
    log(`✅ Notifications avant: ${notificationCountBefore}`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec récupération notifications`, 'red');
    stats.failed++;
  }

  // ============================================================================
  // ÉTAPE 2: CONNEXION COMMERÇANT
  // ============================================================================
  logSection('ÉTAPE 2: CONNEXION COMMERÇANT');

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
    log(`✅ Token Commerçant récupéré`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec connexion commerçant`, 'red');
    stats.failed++;
    return;
  }

  // ============================================================================
  // ÉTAPE 3: RÉCUPÉRER UNE CATÉGORIE
  // ============================================================================
  logSection('ÉTAPE 3: RÉCUPÉRATION CATÉGORIE');

  stats.total++;
  const getCategories = await testEndpoint({
    name: 'GET /api/categories-boutique',
    method: 'GET',
    url: '/categories-boutique',
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 200
  });

  let categorieId = null;
  if (getCategories.success && getCategories.data.categories?.length > 0) {
    categorieId = getCategories.data.categories[0]._id;
    log(`✅ Catégorie ID: ${categorieId}`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec récupération catégories`, 'red');
    stats.failed++;
    return;
  }

  // ============================================================================
  // ÉTAPE 4: CRÉATION BOUTIQUE
  // ============================================================================
  logSection('ÉTAPE 4: CRÉATION BOUTIQUE');

  const boutiqueName = `Test Notif ${Date.now()}`;
  log(`📝 Nom de la boutique: ${boutiqueName}`, 'cyan');

  stats.total++;
  const createBoutique = await testEndpoint({
    name: 'POST /api/boutique/register',
    method: 'POST',
    url: '/boutique/register',
    data: {
      nom: boutiqueName,
      description: 'Test notification admin',
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
    log(`✅ Boutique créée: ${boutiqueName}`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec création boutique`, 'red');
    stats.failed++;
    return;
  }

  // ============================================================================
  // ÉTAPE 5: VÉRIFIER LES NOTIFICATIONS ADMIN (APRÈS)
  // ============================================================================
  logSection('ÉTAPE 5: VÉRIFICATION NOTIFICATIONS ADMIN');

  // Attendre 2 secondes pour que la notification soit créée
  log('⏳ Attente 2 secondes...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 2000));

  stats.total++;
  const getNotificationsAfter = await testEndpoint({
    name: 'GET /api/notifications (après création boutique)',
    method: 'GET',
    url: '/notifications?limit=100',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    expectedStatus: 200
  });

  if (getNotificationsAfter.success) {
    const notificationCountAfter = getNotificationsAfter.data.notifications?.length || 0;
    log(`✅ Notifications après: ${notificationCountAfter}`, 'green');
    
    const newNotifications = notificationCountAfter - notificationCountBefore;
    log(`\n📊 Nouvelles notifications: ${newNotifications}`, newNotifications > 0 ? 'green' : 'red');
    
    if (newNotifications > 0) {
      log(`✅ Une notification a été créée pour l'admin!`, 'green');
      stats.passed++;
      
      // Afficher la dernière notification
      const lastNotif = getNotificationsAfter.data.notifications[0];
      if (lastNotif) {
        log(`\n🔔 Dernière notification:`, 'cyan');
        log(`   Type: ${lastNotif.type}`, 'reset');
        log(`   Title: ${lastNotif.title || 'N/A'}`, 'reset');
        log(`   Message: ${lastNotif.message}`, 'reset');
        log(`   Lu: ${lastNotif.estLu ? 'Oui' : 'Non'}`, 'reset');
        log(`   Date: ${lastNotif.createdAt || lastNotif.dateCreation}`, 'reset');
      }
    } else {
      log(`❌ Aucune nouvelle notification créée!`, 'red');
      log(`⚠️  Le système de notification ne fonctionne pas`, 'yellow');
      stats.failed++;
    }
  } else {
    log(`❌ Échec récupération notifications après`, 'red');
    stats.failed++;
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
    log('✅ Les notifications fonctionnent correctement', 'green');
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
