/**
 * Test de l'API portefeuille pour admin@mall.com
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

async function testPortefeuilleAPI() {
  try {
    console.log('🔐 Connexion en tant que admin@mall.com...\n');
    
    // 1. Login
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.user?.id || loginRes.data.user?._id || loginRes.data.userId;
    
    console.log(`✅ Connecté: ${loginRes.data.user?.email || loginRes.data.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Obtenir le portefeuille via /api/users/:id/wallet
    console.log('💰 GET /api/users/:id/wallet...\n');
    const walletRes = await axios.get(`${API_URL}/api/users/${userId}/wallet`, { headers });
    
    console.log('Réponse:');
    console.log(JSON.stringify(walletRes.data, null, 2));
    console.log('');
    
    // 3. Obtenir les transactions via /api/portefeuille/transactions
    console.log('📊 GET /api/portefeuille/transactions...\n');
    const transactionsRes = await axios.get(`${API_URL}/api/portefeuille/transactions`, { headers });
    
    console.log('Réponse:');
    console.log(JSON.stringify(transactionsRes.data, null, 2));
    console.log('');
    
    // 4. Obtenir les statistiques via /api/portefeuille/stats
    console.log('📈 GET /api/portefeuille/stats...\n');
    const statsRes = await axios.get(`${API_URL}/api/portefeuille/stats`, { headers });
    
    console.log('Réponse:');
    console.log(JSON.stringify(statsRes.data, null, 2));
    
    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPortefeuilleAPI();
