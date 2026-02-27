/**
 * 🧪 Test des routes de notifications /count et /read-all
 * Objectif: Prouver que l'identifiant utilisateur est correctement récupéré via le middleware auth
 * API: https://m1p13mean-niaina-1.onrender.com
 */

const axios = require('axios');

const API_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

// Codes couleur pour l'affichage
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Comptes de test
const testAccounts = [
  {
    name: 'Admin',
    email: 'admin@mallapp.com',
    password: 'admin123',
    role: 'Admin'
  },
  {
    name: 'Client Test',
    email: 'client@test.com',
    password: 'Client123456!',
    role: 'Client'
  }
];

/**
 * Fonction pour se connecter et obtenir un token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      mdp: password  // L'API attend 'mdp' et non 'password'
    });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Test 1: Récupérer le nombre de notifications non lues
 */
async function testGetUnreadCount(token, userName) {
  try {
    const response = await axios.get(`${API_URL}/notifications/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    logTest(
      `GET /notifications/count pour ${userName}`,
      true,
      `Nombre de notifications non lues: ${response.data.unreadCount}`
    );
    
    return {
      success: true,
      count: response.data.unreadCount
    };
  } catch (error) {
    logTest(
      `GET /notifications/count pour ${userName}`,
      false,
      `Erreur: ${error.response?.data?.message || error.message}`
    );
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Test 2: Marquer toutes les notifications comme lues
 */
async function testMarkAllAsRead(token, userName) {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    logTest(
      `PUT /notifications/read-all pour ${userName}`,
      true,
      `${response.data.count} notifications marquées comme lues`
    );
    
    return {
      success: true,
      count: response.data.count,
      message: response.data.message
    };
  } catch (error) {
    logTest(
      `PUT /notifications/read-all pour ${userName}`,
      false,
      `Erreur: ${error.response?.data?.message || error.message}`
    );
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Test 3: Vérifier que le count est à 0 après markAllAsRead
 */
async function testCountAfterMarkAllAsRead(token, userName) {
  try {
    const response = await axios.get(`${API_URL}/notifications/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const isZero = response.data.unreadCount === 0;
    
    logTest(
      `Vérification count après read-all pour ${userName}`,
      isZero,
      `Count après marquage: ${response.data.unreadCount} (devrait être 0)`
    );
    
    return {
      success: true,
      count: response.data.unreadCount,
      isZero
    };
  } catch (error) {
    logTest(
      `Vérification count après read-all pour ${userName}`,
      false,
      `Erreur: ${error.response?.data?.message || error.message}`
    );
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Test 4: Vérifier que sans token, l'accès est refusé
 */
async function testWithoutToken() {
  logSection('TEST: Accès sans token (doit échouer)');
  
  let allPassed = true;
  
  // Test GET /count sans token
  try {
    await axios.get(`${API_URL}/notifications/count`);
    logTest('GET /count sans token', false, 'Devrait être refusé mais a réussi!');
    allPassed = false;
  } catch (error) {
    const isUnauthorized = error.response?.status === 401;
    logTest(
      'GET /count sans token',
      isUnauthorized,
      `Status: ${error.response?.status} - ${error.response?.data?.message || 'Accès refusé'}`
    );
    if (!isUnauthorized) allPassed = false;
  }
  
  // Test PUT /read-all sans token
  try {
    await axios.put(`${API_URL}/notifications/read-all`, {});
    logTest('PUT /read-all sans token', false, 'Devrait être refusé mais a réussi!');
    allPassed = false;
  } catch (error) {
    const isUnauthorized = error.response?.status === 401;
    logTest(
      'PUT /read-all sans token',
      isUnauthorized,
      `Status: ${error.response?.status} - ${error.response?.data?.message || 'Accès refusé'}`
    );
    if (!isUnauthorized) allPassed = false;
  }
  
  return allPassed;
}

/**
 * Test 5: Vérifier que chaque utilisateur voit uniquement ses propres notifications
 */
async function testUserIsolation(user1Token, user1Name, user2Token, user2Name) {
  logSection('TEST: Isolation des notifications entre utilisateurs');
  
  // Récupérer le count pour user1
  const count1Before = await testGetUnreadCount(user1Token, user1Name);
  
  // Récupérer le count pour user2
  const count2Before = await testGetUnreadCount(user2Token, user2Name);
  
  // Marquer toutes les notifications de user1 comme lues
  await testMarkAllAsRead(user1Token, user1Name);
  
  // Vérifier que le count de user1 est à 0
  const count1After = await testGetUnreadCount(user1Token, user1Name);
  
  // Vérifier que le count de user2 n'a PAS changé
  const count2After = await testGetUnreadCount(user2Token, user2Name);
  
  const isolated = count2Before.count === count2After.count;
  
  log('\n📊 Résultat de l\'isolation:', 'yellow');
  console.log(`   ${user1Name} avant: ${count1Before.count}, après: ${count1After.count}`);
  console.log(`   ${user2Name} avant: ${count2Before.count}, après: ${count2After.count}`);
  
  logTest(
    'Les notifications sont bien isolées par utilisateur',
    isolated,
    isolated 
      ? `${user2Name} n'a pas été affecté par les actions de ${user1Name}` 
      : `PROBLÈME: ${user2Name} a été affecté!`
  );
  
  return isolated;
}

/**
 * Fonction principale
 */
async function runTests() {
  log('\n🚀 DÉMARRAGE DES TESTS DE NOTIFICATIONS', 'magenta');
  log(`📡 API: ${API_URL}`, 'blue');
  log(`⏰ Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  try {
    // Connexion des utilisateurs de test
    logSection('ÉTAPE 1: Connexion des utilisateurs');
    
    const loginResults = [];
    for (const account of testAccounts) {
      log(`\n🔐 Connexion de ${account.name} (${account.email})...`, 'yellow');
      const result = await login(account.email, account.password);
      
      if (result.success) {
        logTest(`Connexion ${account.name}`, true, `User ID: ${result.user._id}`);
        loginResults.push({
          ...account,
          token: result.token,
          userId: result.user._id
        });
      } else {
        logTest(`Connexion ${account.name}`, false, result.error);
      }
    }
    
    if (loginResults.length < 2) {
      log('\n❌ Impossible de continuer: pas assez d\'utilisateurs connectés', 'red');
      return;
    }
    
    // Test sans token
    logSection('ÉTAPE 2: Tests de sécurité (sans token)');
    const securityPassed = await testWithoutToken();
    results.total += 2;
    if (securityPassed) results.passed += 2;
    else results.failed += 2;
    
    // Tests avec chaque utilisateur
    logSection('ÉTAPE 3: Tests des routes avec authentification');
    
    for (const user of loginResults) {
      log(`\n👤 Tests pour ${user.name}`, 'yellow');
      
      // Test GET /count
      const countResult = await testGetUnreadCount(user.token, user.name);
      results.total++;
      if (countResult.success) results.passed++;
      else results.failed++;
      
      // Test PUT /read-all
      const markResult = await testMarkAllAsRead(user.token, user.name);
      results.total++;
      if (markResult.success) results.passed++;
      else results.failed++;
      
      // Test count après read-all
      const verifyResult = await testCountAfterMarkAllAsRead(user.token, user.name);
      results.total++;
      if (verifyResult.success && verifyResult.isZero) results.passed++;
      else results.failed++;
    }
    
    // Test d'isolation entre utilisateurs
    if (loginResults.length >= 2) {
      const isolationPassed = await testUserIsolation(
        loginResults[0].token,
        loginResults[0].name,
        loginResults[1].token,
        loginResults[1].name
      );
      results.total++;
      if (isolationPassed) results.passed++;
      else results.failed++;
    }
    
    // Résumé final
    logSection('RÉSUMÉ DES TESTS');
    
    log(`\n📊 Résultats:`, 'cyan');
    console.log(`   Total de tests: ${results.total}`);
    log(`   ✅ Réussis: ${results.passed}`, 'green');
    log(`   ❌ Échoués: ${results.failed}`, 'red');
    
    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    log(`\n   Taux de réussite: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
    
    if (results.failed === 0) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
      log('\n✅ CONCLUSION:', 'green');
      console.log('   • Le middleware auth fonctionne correctement');
      console.log('   • L\'identifiant utilisateur est bien récupéré via req.user._id');
      console.log('   • Les routes /count et /read-all utilisent correctement cet ID');
      console.log('   • Chaque utilisateur accède uniquement à ses propres notifications');
      console.log('   • La sécurité est assurée (pas d\'accès sans token)');
    } else {
      log('\n⚠️  Certains tests ont échoué', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Erreur lors de l'exécution des tests: ${error.message}`, 'red');
    console.error(error);
  }
}

// Exécution des tests
runTests();
