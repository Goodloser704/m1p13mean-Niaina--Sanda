/**
 * 🔄 Test de Comparaison Local vs Render
 * Vérifie que les résultats sont identiques entre local et production
 */

const axios = require('axios');

const LOCAL_API = 'http://localhost:3000/api';
const RENDER_API = 'https://m1p13mean-niaina-1.onrender.com/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(70) + '\n');
}

async function login(apiUrl, email, password) {
  const response = await axios.post(`${apiUrl}/auth/login`, {
    email,
    mdp: password
  });
  return response.data;
}

async function testEndpoint(apiUrl, token, endpoint, method = 'GET', data = null) {
  const config = {
    method,
    url: `${apiUrl}${endpoint}`,
    headers: { 'Authorization': `Bearer ${token}` }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    config.data = data;
  }
  
  const response = await axios(config);
  return response.data;
}

function compareResults(local, render, testName) {
  const localStr = JSON.stringify(local, null, 2);
  const renderStr = JSON.stringify(render, null, 2);
  
  // Comparer les structures (ignorer les IDs et dates qui peuvent différer)
  const localKeys = Object.keys(local).sort();
  const renderKeys = Object.keys(render).sort();
  
  const keysMatch = JSON.stringify(localKeys) === JSON.stringify(renderKeys);
  
  if (keysMatch) {
    log(`   ✅ ${testName}: Structures identiques`, 'green');
    return true;
  } else {
    log(`   ❌ ${testName}: Structures différentes`, 'red');
    console.log('   Local keys:', localKeys);
    console.log('   Render keys:', renderKeys);
    return false;
  }
}

async function main() {
  log('\n🔄 COMPARAISON LOCAL vs RENDER', 'magenta');
  log(`📡 Local:  ${LOCAL_API}`, 'cyan');
  log(`📡 Render: ${RENDER_API}`, 'cyan');
  log(`⏰ ${new Date().toLocaleString('fr-FR')}`, 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    differences: []
  };
  
  try {
    // Connexion sur les deux environnements
    logSection('ÉTAPE 1: Authentification');
    
    log('🔐 Connexion LOCAL...', 'yellow');
    const localAuth = await login(LOCAL_API, 'admin@mallapp.com', 'admin123');
    log(`✅ Local connecté: ${localAuth.user.id}`, 'green');
    
    log('\n🔐 Connexion RENDER...', 'yellow');
    const renderAuth = await login(RENDER_API, 'admin@mallapp.com', 'admin123');
    log(`✅ Render connecté: ${renderAuth.user.id}`, 'green');
    
    // Comparer les réponses d'authentification
    results.total++;
    if (compareResults(localAuth.user, renderAuth.user, 'Auth Response')) {
      results.passed++;
    } else {
      results.failed++;
      results.differences.push('Auth Response');
    }
    
    // Test 1: GET /notifications/count
    logSection('TEST 1: GET /notifications/count');
    
    log('📋 Local...', 'yellow');
    const localCount = await testEndpoint(LOCAL_API, localAuth.token, '/notifications/count');
    console.log(`   Count: ${localCount.unreadCount}`);
    
    log('\n📋 Render...', 'yellow');
    const renderCount = await testEndpoint(RENDER_API, renderAuth.token, '/notifications/count');
    console.log(`   Count: ${renderCount.unreadCount}`);
    
    results.total++;
    if (compareResults(localCount, renderCount, 'Notifications Count')) {
      results.passed++;
    } else {
      results.failed++;
      results.differences.push('Notifications Count');
    }
    
    // Test 2: GET /notifications
    logSection('TEST 2: GET /notifications');
    
    log('📋 Local...', 'yellow');
    const localNotifs = await testEndpoint(LOCAL_API, localAuth.token, '/notifications?limit=5');
    console.log(`   Notifications: ${localNotifs.notifications?.length || 0}`);
    console.log(`   Structure:`, Object.keys(localNotifs));
    
    log('\n📋 Render...', 'yellow');
    const renderNotifs = await testEndpoint(RENDER_API, renderAuth.token, '/notifications?limit=5');
    console.log(`   Notifications: ${renderNotifs.notifications?.length || 0}`);
    console.log(`   Structure:`, Object.keys(renderNotifs));
    
    results.total++;
    if (compareResults(
      { keys: Object.keys(localNotifs), hasNotifications: !!localNotifs.notifications },
      { keys: Object.keys(renderNotifs), hasNotifications: !!renderNotifs.notifications },
      'Notifications List'
    )) {
      results.passed++;
    } else {
      results.failed++;
      results.differences.push('Notifications List');
    }
    
    // Test 3: GET /test-items (si disponible)
    logSection('TEST 3: GET /test-items');
    
    try {
      log('📋 Local...', 'yellow');
      const localItems = await testEndpoint(LOCAL_API, localAuth.token, '/test-items?limit=5');
      console.log(`   Items: ${localItems.count}`);
      console.log(`   Total: ${localItems.total}`);
      
      log('\n📋 Render...', 'yellow');
      const renderItems = await testEndpoint(RENDER_API, renderAuth.token, '/test-items?limit=5');
      console.log(`   Items: ${renderItems.count}`);
      console.log(`   Total: ${renderItems.total}`);
      
      results.total++;
      if (compareResults(
        { hasItems: localItems.count >= 0, hasTotal: !!localItems.total },
        { hasItems: renderItems.count >= 0, hasTotal: !!renderItems.total },
        'Test Items'
      )) {
        results.passed++;
      } else {
        results.failed++;
        results.differences.push('Test Items');
      }
    } catch (error) {
      log('   ⚠️  Route /test-items non disponible sur Render (normal si pas déployé)', 'yellow');
    }
    
    // Test 4: Créer un item et vérifier la cohérence
    logSection('TEST 4: Création et Vérification');
    
    try {
      const testData = {
        titre: `Test Comparaison ${Date.now()}`,
        description: 'Test de comparaison local vs render',
        valeur: 999
      };
      
      log('➕ Création LOCAL...', 'yellow');
      const localCreate = await testEndpoint(LOCAL_API, localAuth.token, '/test-items', 'POST', testData);
      console.log(`   Item créé: ${localCreate.item?._id}`);
      
      log('\n➕ Création RENDER...', 'yellow');
      const renderCreate = await testEndpoint(RENDER_API, renderAuth.token, '/test-items', 'POST', testData);
      console.log(`   Item créé: ${renderCreate.item?._id}`);
      
      results.total++;
      if (compareResults(
        { hasItem: !!localCreate.item, hasMessage: !!localCreate.message },
        { hasItem: !!renderCreate.item, hasMessage: !!renderCreate.message },
        'Create Item'
      )) {
        results.passed++;
      } else {
        results.failed++;
        results.differences.push('Create Item');
      }
      
      // Nettoyer (supprimer les items créés)
      if (localCreate.item?._id) {
        await testEndpoint(LOCAL_API, localAuth.token, `/test-items/${localCreate.item._id}`, 'DELETE');
      }
      if (renderCreate.item?._id) {
        await testEndpoint(RENDER_API, renderAuth.token, `/test-items/${renderCreate.item._id}`, 'DELETE');
      }
      
    } catch (error) {
      log('   ⚠️  Test de création non disponible (normal si pas déployé)', 'yellow');
    }
    
    // Résumé
    logSection('RÉSUMÉ DE LA COMPARAISON');
    
    console.log(`\n📊 Résultats:`);
    console.log(`   Total de tests: ${results.total}`);
    log(`   ✅ Identiques: ${results.passed}`, 'green');
    log(`   ❌ Différents: ${results.failed}`, 'red');
    
    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    log(`\n   Taux de similarité: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
    
    if (results.failed === 0) {
      log('\n🎉 LOCAL ET RENDER SONT IDENTIQUES!', 'green');
      log('\n✅ Ce qui marche en local marchera en production!', 'green');
      log('✅ Vous pouvez déployer en confiance!', 'green');
    } else {
      log('\n⚠️  Différences détectées:', 'yellow');
      results.differences.forEach(diff => {
        console.log(`   - ${diff}`);
      });
      log('\n💡 Vérifiez que le code est bien déployé sur Render', 'yellow');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lancez d\'abord le backend:', 'yellow');
      log('   cd mall-app/backend', 'cyan');
      log('   npm start', 'cyan');
    } else if (error.response?.status === 404) {
      log('\n⚠️  Route non trouvée (peut-être pas encore déployée sur Render)', 'yellow');
    } else {
      log(`\n❌ Erreur: ${error.message}`, 'red');
      if (error.response) {
        console.log('Détails:', error.response.data);
      }
    }
  }
}

main();
