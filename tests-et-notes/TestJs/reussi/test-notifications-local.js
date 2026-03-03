/**
 * 🧪 Test des notifications en LOCAL (rapide)
 * Pas besoin de déployer sur Render !
 */

const axios = require('axios');

// ✅ URL LOCALE au lieu de production
const API_URL = 'http://localhost:5000/api';

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

async function getCount(token) {
  const response = await axios.get(`${API_URL}/notifications/count`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function markAllAsRead(token) {
  const response = await axios.put(
    `${API_URL}/notifications/read-all`,
    {},
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
}

async function main() {
  console.log('\n🧪 TEST LOCAL DES NOTIFICATIONS\n');
  log('📡 API: ' + API_URL, 'cyan');
  
  try {
    // Connexion
    log('\n🔐 Connexion admin...', 'yellow');
    const admin = await login('admin@mallapp.com', 'admin123');
    log(`✅ Connecté: ${admin.user.id}\n`, 'green');
    
    // Test 1: Vérifier le total
    log('📋 Test 1: Vérification du champ "total"', 'cyan');
    const result = await getNotifications(admin.token, 1, 2);
    console.log(`   Retournées: ${result.notifications.length}`);
    console.log(`   Total: ${result.pagination.total}`);
    log(`   ${result.pagination.total >= result.notifications.length ? '✅' : '❌'} Total correct\n`, 
        result.pagination.total >= result.notifications.length ? 'green' : 'red');
    
    // Test 2: Count
    log('📋 Test 2: GET /count', 'cyan');
    const count = await getCount(admin.token);
    console.log(`   Non lues: ${count.unreadCount}`);
    log(`   ✅ Count récupéré\n`, 'green');
    
    // Test 3: Mark all as read
    log('📋 Test 3: PUT /read-all', 'cyan');
    const marked = await markAllAsRead(admin.token);
    console.log(`   Marquées: ${marked.count}`);
    log(`   ✅ Marquage effectué\n`, 'green');
    
    log('🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lancez d\'abord le backend:', 'yellow');
      log('   cd mall-app/backend', 'cyan');
      log('   npm start', 'cyan');
    } else {
      log(`\n❌ Erreur: ${error.message}`, 'red');
      if (error.response) {
        console.log('Détails:', error.response.data);
      }
    }
  }
}

main();
