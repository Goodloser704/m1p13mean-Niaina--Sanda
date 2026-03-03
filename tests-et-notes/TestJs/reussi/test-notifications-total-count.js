/**
 * 🧪 Test de la correction du champ 'total' dans les notifications
 * Vérifie que 'total' représente le nombre TOTAL de notifications, pas juste celles retournées
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    mdp: password
  });
  return response.data;
}

async function getNotifications(token, page = 1, limit = 2) {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params: { page, limit }
  });
  return response.data;
}

async function main() {
  console.log('\n🧪 TEST: Vérification du champ "total" dans les notifications\n');
  
  try {
    // Connexion admin (qui a 3 notifications)
    log('🔐 Connexion admin...', 'yellow');
    const admin = await login('admin@mallapp.com', 'admin123');
    log(`✅ Admin connecté: ${admin.user.id}\n`, 'green');
    
    // Test 1: Récupérer avec limit=2 (devrait retourner 2 notifs mais total=3)
    log('📋 Test 1: GET /notifications?limit=2', 'cyan');
    const result1 = await getNotifications(admin.token, 1, 2);
    
    console.log(`   Notifications retournées: ${result1.notifications.length}`);
    console.log(`   Total dans la réponse: ${result1.pagination.total}`);
    console.log(`   Non lues: ${result1.unreadCount}`);
    
    const test1Pass = result1.notifications.length === 2 && result1.pagination.total === 3;
    log(`   ${test1Pass ? '✅' : '❌'} Test 1: ${test1Pass ? 'PASSÉ' : 'ÉCHOUÉ'}`, test1Pass ? 'green' : 'red');
    
    if (!test1Pass) {
      log(`   ⚠️  Attendu: 2 notifications retournées, total=3`, 'yellow');
      log(`   ⚠️  Reçu: ${result1.notifications.length} notifications, total=${result1.pagination.total}`, 'yellow');
    }
    
    // Test 2: Récupérer avec limit=10 (devrait retourner 3 notifs et total=3)
    log('\n📋 Test 2: GET /notifications?limit=10', 'cyan');
    const result2 = await getNotifications(admin.token, 1, 10);
    
    console.log(`   Notifications retournées: ${result2.notifications.length}`);
    console.log(`   Total dans la réponse: ${result2.pagination.total}`);
    
    const test2Pass = result2.notifications.length === 3 && result2.pagination.total === 3;
    log(`   ${test2Pass ? '✅' : '❌'} Test 2: ${test2Pass ? 'PASSÉ' : 'ÉCHOUÉ'}`, test2Pass ? 'green' : 'red');
    
    // Test 3: Page 2 avec limit=2 (devrait retourner 1 notif mais total=3)
    log('\n📋 Test 3: GET /notifications?page=2&limit=2', 'cyan');
    const result3 = await getNotifications(admin.token, 2, 2);
    
    console.log(`   Notifications retournées: ${result3.notifications.length}`);
    console.log(`   Total dans la réponse: ${result3.pagination.total}`);
    
    const test3Pass = result3.notifications.length === 1 && result3.pagination.total === 3;
    log(`   ${test3Pass ? '✅' : '❌'} Test 3: ${test3Pass ? 'PASSÉ' : 'ÉCHOUÉ'}`, test3Pass ? 'green' : 'red');
    
    // Résumé
    const allPassed = test1Pass && test2Pass && test3Pass;
    
    log('\n' + '='.repeat(60), 'cyan');
    log('RÉSUMÉ', 'cyan');
    log('='.repeat(60), 'cyan');
    
    if (allPassed) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
      log('\n✅ Le champ "total" représente bien le nombre TOTAL de notifications', 'green');
      log('✅ La pagination fonctionne correctement', 'green');
    } else {
      log('\n❌ Certains tests ont échoué', 'red');
      log('\n⚠️  Le champ "total" ne représente pas le nombre total correct', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    if (error.response) {
      console.log('Détails:', error.response.data);
    }
  }
}

main();
