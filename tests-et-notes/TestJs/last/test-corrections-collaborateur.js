const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Comptes de test
const ADMIN = { email: 'admin@mallapp.com', mdp: 'admin123' };
const COMMERCANT = { email: 'commercant@test.com', mdp: 'Commercant123456!' };
const CLIENT = { email: 'client@test.com', mdp: 'Client123456!' };

let adminToken = '';
let commercantToken = '';
let clientToken = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function login(credentials, role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    log('✅', `Connexion ${role} réussie`, colors.green);
    return response.data.token;
  } catch (error) {
    log('❌', `Erreur connexion ${role}: ${error.response?.data?.message || error.message}`, colors.red);
    throw error;
  }
}

async function testRoute(method, url, token, data = null, description) {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    let response;
    
    if (method === 'GET') {
      response = await axios.get(url, config);
    } else if (method === 'POST') {
      response = await axios.post(url, data, config);
    } else if (method === 'PUT') {
      response = await axios.put(url, data, config);
    }
    
    log('✅', `${description} - Status: ${response.status}`, colors.green);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.message || error.message;
    log('❌', `${description} - Status: ${status} - ${message}`, colors.red);
    return { success: false, error: message, status };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  log('🧪', 'TESTS DES CORRECTIONS DU COLLABORATEUR', colors.cyan);
  console.log('='.repeat(70));
  
  let testsReussis = 0;
  let testsTotal = 0;

  try {
    // Connexions
    log('\n🔐', 'PHASE 1: Authentification', colors.blue);
    console.log('-'.repeat(70));
    
    adminToken = await login(ADMIN, 'Admin');
    commercantToken = await login(COMMERCANT, 'Commerçant');
    clientToken = await login(CLIENT, 'Client');

    // ========== TESTS ROUTES LOYERS ==========
    log('\n💰', 'PHASE 2: Tests Routes Loyers', colors.blue);
    console.log('-'.repeat(70));

    // Test 1: Historique loyers commerçant
    testsTotal++;
    const test1 = await testRoute(
      'GET',
      `${BASE_URL}/commercant/loyers/historique`,
      commercantToken,
      null,
      'GET /commercant/loyers/historique'
    );
    if (test1.success) {
      testsReussis++;
      log('  ℹ️', `  Loyers trouvés: ${test1.data.loyers?.length || 0}`, colors.cyan);
    }

    // Test 2: Statut paiements mois courant (Admin)
    testsTotal++;
    const test2 = await testRoute(
      'GET',
      `${BASE_URL}/admin/loyers/statut-paiements-mois-courant`,
      adminToken,
      null,
      'GET /admin/loyers/statut-paiements-mois-courant'
    );
    if (test2.success) {
      testsReussis++;
      const stats = test2.data.statistiques;
      log('  ℹ️', `  Boutiques payées: ${stats?.nombreBoutiquesPayees || 0}`, colors.cyan);
      log('  ℹ️', `  Boutiques impayées: ${stats?.nombreBoutiquesImpayees || 0}`, colors.cyan);
    }

    // Test 3: Boutiques payées (Admin)
    testsTotal++;
    const test3 = await testRoute(
      'GET',
      `${BASE_URL}/admin/loyers/boutiques-payees`,
      adminToken,
      null,
      'GET /admin/loyers/boutiques-payees'
    );
    if (test3.success) {
      testsReussis++;
      log('  ℹ️', `  Boutiques payées: ${test3.data.boutiquesPayees?.length || 0}`, colors.cyan);
    }

    // Test 4: Boutiques impayées (Admin)
    testsTotal++;
    const test4 = await testRoute(
      'GET',
      `${BASE_URL}/admin/loyers/boutiques-impayees`,
      adminToken,
      null,
      'GET /admin/loyers/boutiques-impayees'
    );
    if (test4.success) {
      testsReussis++;
      log('  ℹ️', `  Boutiques impayées: ${test4.data.boutiquesImpayees?.length || 0}`, colors.cyan);
    }

    // Test 5: Historique par période (Admin)
    testsTotal++;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const test5 = await testRoute(
      'GET',
      `${BASE_URL}/admin/loyers/historique-par-periode?mois=${currentMonth}`,
      adminToken,
      null,
      `GET /admin/loyers/historique-par-periode?mois=${currentMonth}`
    );
    if (test5.success) {
      testsReussis++;
      log('  ℹ️', `  Loyers période: ${test5.data.loyers?.length || 0}`, colors.cyan);
    }

    // ========== TESTS ROUTES PORTEFEUILLE ==========
    log('\n💳', 'PHASE 3: Tests Routes Portefeuille', colors.blue);
    console.log('-'.repeat(70));

    // Test 6: Mon portefeuille
    testsTotal++;
    const test6 = await testRoute(
      'GET',
      `${BASE_URL}/portefeuille/me`,
      clientToken,
      null,
      'GET /portefeuille/me'
    );
    if (test6.success) {
      testsReussis++;
      log('  ℹ️', `  Solde: ${test6.data.portefeuille?.balance || 0} Ar`, colors.cyan);
    }

    // Test 7: Mes transactions
    testsTotal++;
    const test7 = await testRoute(
      'GET',
      `${BASE_URL}/portefeuille/transactions`,
      clientToken,
      null,
      'GET /portefeuille/transactions'
    );
    if (test7.success) {
      testsReussis++;
      log('  ℹ️', `  Transactions: ${test7.data.transactions?.length || 0}`, colors.cyan);
    }

    // Test 8: Stats portefeuille
    testsTotal++;
    const test8 = await testRoute(
      'GET',
      `${BASE_URL}/portefeuille/stats`,
      clientToken,
      null,
      'GET /portefeuille/stats'
    );
    if (test8.success) {
      testsReussis++;
      log('  ℹ️', `  Total dépenses: ${test8.data.stats?.totalDepenses || 0} Ar`, colors.cyan);
    }

    // Test 9: Tous les portefeuilles (Admin)
    testsTotal++;
    const test9 = await testRoute(
      'GET',
      `${BASE_URL}/portefeuille/admin/all`,
      adminToken,
      null,
      'GET /portefeuille/admin/all'
    );
    if (test9.success) {
      testsReussis++;
      log('  ℹ️', `  Portefeuilles: ${test9.data.portefeuilles?.length || 0}`, colors.cyan);
    }

    // ========== TESTS ROUTES USERS ==========
    log('\n👤', 'PHASE 4: Tests Routes Users', colors.blue);
    console.log('-'.repeat(70));

    // Test 10: Mon profil
    testsTotal++;
    const test10 = await testRoute(
      'GET',
      `${BASE_URL}/users/me`,
      clientToken,
      null,
      'GET /users/me'
    );
    if (test10.success) {
      testsReussis++;
      log('  ℹ️', `  User: ${test10.data.user?.nom || 'N/A'}`, colors.cyan);
    }

    // Test 11: Mon portefeuille via /users/wallet
    testsTotal++;
    const test11 = await testRoute(
      'GET',
      `${BASE_URL}/users/wallet`,
      clientToken,
      null,
      'GET /users/wallet'
    );
    if (test11.success) {
      testsReussis++;
      log('  ℹ️', `  Solde: ${test11.data.portefeuille?.balance || 0} Ar`, colors.cyan);
    }

    // Test 12: Mes notifications via /users/notifications
    testsTotal++;
    const test12 = await testRoute(
      'GET',
      `${BASE_URL}/users/notifications`,
      clientToken,
      null,
      'GET /users/notifications'
    );
    if (test12.success) {
      testsReussis++;
      log('  ℹ️', `  Notifications: ${test12.data.notifications?.length || 0}`, colors.cyan);
    }

    // ========== TESTS ROUTES BOUTIQUES (Stats Dashboard) ==========
    log('\n🏪', 'PHASE 5: Tests Routes Boutiques (Dashboard)', colors.blue);
    console.log('-'.repeat(70));

    // Test 13: Statistiques boutiques (Admin)
    testsTotal++;
    const test13 = await testRoute(
      'GET',
      `${BASE_URL}/boutique/admin/stats`,
      adminToken,
      null,
      'GET /boutique/admin/stats'
    );
    if (test13.success) {
      testsReussis++;
      const stats = test13.data.stats;
      log('  ℹ️', `  Total boutiques: ${stats?.totalBoutiques || 0}`, colors.cyan);
      log('  ℹ️', `  Boutiques actives: ${stats?.boutiquesActives || 0}`, colors.cyan);
    }

    // Test 14: Liste boutiques (Admin)
    testsTotal++;
    const test14 = await testRoute(
      'GET',
      `${BASE_URL}/boutique/all`,
      adminToken,
      null,
      'GET /boutique/all'
    );
    if (test14.success) {
      testsReussis++;
      log('  ℹ️', `  Boutiques: ${test14.data.boutiques?.length || 0}`, colors.cyan);
    }

  } catch (error) {
    log('❌', `Erreur fatale: ${error.message}`, colors.red);
  }

  // Résumé
  console.log('\n' + '='.repeat(70));
  log('📊', 'RÉSUMÉ DES TESTS', colors.cyan);
  console.log('='.repeat(70));
  
  const tauxReussite = Math.round((testsReussis / testsTotal) * 100);
  console.log(`Tests réussis: ${testsReussis}/${testsTotal}`);
  console.log(`Taux de réussite: ${tauxReussite}%`);
  
  if (testsReussis === testsTotal) {
    log('\n🎉', 'TOUS LES TESTS SONT RÉUSSIS !', colors.green);
    log('✅', 'Les corrections du collaborateur fonctionnent correctement', colors.green);
  } else {
    log('\n⚠️', `${testsTotal - testsReussis} test(s) ont échoué`, colors.yellow);
    log('ℹ️', 'Vérifiez les erreurs ci-dessus pour plus de détails', colors.cyan);
  }
  
  console.log('='.repeat(70));
}

// Exécuter les tests
runTests().catch(error => {
  log('❌', `Erreur fatale: ${error.message}`, colors.red);
  console.error(error);
});
