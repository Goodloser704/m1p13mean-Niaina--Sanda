/**
 * 🧪 TEST SPÉCIFIQUE PORTEFEUILLE
 * 
 * Test dédié pour vérifier l'accès au portefeuille avec différents rôles
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPortefeuille() {
  console.log('\n' + '='.repeat(80));
  log('💰 TEST SPÉCIFIQUE PORTEFEUILLE', 'cyan');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Créer un utilisateur Commercant
    log('1️⃣  Création d\'un utilisateur Commercant...', 'blue');
    const timestamp = Date.now();
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestPortefeuille${timestamp}`,
      prenoms: 'Test',
      email: `portefeuille${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000099',
      role: 'Commercant'
    });
    
    log(`📦 Réponse complète:`, 'yellow');
    log(JSON.stringify(registerRes.data, null, 2), 'yellow');
    
    const userId = registerRes.data.user?._id || registerRes.data.userId || registerRes.data.user?.id;
    const userToken = registerRes.data.token;
    
    if (!userId) {
      throw new Error('User ID non trouvé dans la réponse d\'inscription');
    }
    
    log(`✅ Utilisateur créé: ${userId}`, 'green');
    log(`   Email: ${registerRes.data.user.email}`, 'green');
    log(`   Role: ${registerRes.data.user.role}`, 'green');

    // 2. Vérifier que le portefeuille a été créé automatiquement
    log('\n2️⃣  Vérification de la création automatique du portefeuille...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
    
    // 3. Tester l'accès au portefeuille avec le token de l'utilisateur
    log('\n3️⃣  Test d\'accès au portefeuille (utilisateur propriétaire)...', 'blue');
    try {
      const walletRes = await axios.get(`${BASE_URL}/portefeuille/users/${userId}/wallet`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      log(`✅ Accès réussi au portefeuille`, 'green');
      log(`   Balance: ${walletRes.data.wallet.balance}€`, 'green');
      log(`   Owner ID: ${walletRes.data.wallet.owner}`, 'green');
      log(`   Transactions: ${walletRes.data.transactions.length}`, 'green');
      
      // Vérifier que l'owner correspond
      const ownerId = typeof walletRes.data.wallet.owner === 'object' 
        ? walletRes.data.wallet.owner._id 
        : walletRes.data.wallet.owner;
      
      if (ownerId.toString() === userId.toString()) {
        log(`✅ Owner ID correspond à l'utilisateur`, 'green');
      } else {
        log(`❌ Owner ID ne correspond pas: ${ownerId} vs ${userId}`, 'red');
      }
      
    } catch (error) {
      log(`❌ Erreur d'accès au portefeuille`, 'red');
      log(`   Message: ${error.response?.data?.message || error.message}`, 'yellow');
      log(`   Status: ${error.response?.status}`, 'yellow');
      
      // Afficher les détails pour le débogage
      log(`\n🔍 Détails du débogage:`, 'yellow');
      log(`   User ID du token: ${userId}`, 'yellow');
      log(`   Token: ${userToken.substring(0, 20)}...`, 'yellow');
    }

    // 4. Créer un autre utilisateur et tester l'accès croisé
    log('\n4️⃣  Test d\'accès croisé (autre utilisateur)...', 'blue');
    const otherUserRes = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestAutre${timestamp}`,
      prenoms: 'Test',
      email: `autre${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000098',
      role: 'Acheteur'
    });
    
    const otherUserId = otherUserRes.data.user?.id || otherUserRes.data.user?._id;
    const otherUserToken = otherUserRes.data.token;
    log(`✅ Autre utilisateur créé: ${otherUserId}`, 'green');

    try {
      await axios.get(`${BASE_URL}/portefeuille/users/${userId}/wallet`, {
        headers: { Authorization: `Bearer ${otherUserToken}` }
      });
      log(`❌ PROBLÈME: L'autre utilisateur peut accéder au portefeuille!`, 'red');
    } catch (error) {
      if (error.response?.status === 403) {
        log(`✅ Accès refusé comme attendu (403)`, 'green');
      } else {
        log(`⚠️  Erreur inattendue: ${error.response?.status} - ${error.response?.data?.message}`, 'yellow');
      }
    }

    // 5. Tester avec un admin
    log('\n5️⃣  Test d\'accès avec un admin...', 'blue');
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const adminToken = adminRes.data.token;
    log(`✅ Admin connecté`, 'green');

    try {
      const adminWalletRes = await axios.get(`${BASE_URL}/portefeuille/users/${userId}/wallet`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ Admin peut accéder au portefeuille (comme attendu)`, 'green');
      log(`   Balance: ${adminWalletRes.data.wallet.balance}€`, 'green');
    } catch (error) {
      log(`❌ Admin ne peut pas accéder au portefeuille`, 'red');
      log(`   Message: ${error.response?.data?.message || error.message}`, 'yellow');
    }

    log('\n' + '='.repeat(80), 'cyan');
    log('✅ TEST TERMINÉ', 'green');
    console.log('='.repeat(80) + '\n');
    
    process.exit(0);

  } catch (error) {
    log('\n❌ ERREUR FATALE', 'red');
    log(`   Message: ${error.message}`, 'yellow');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'yellow');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
    }
    console.error(error);
    process.exit(1);
  }
}

// Exécution
testPortefeuille();
