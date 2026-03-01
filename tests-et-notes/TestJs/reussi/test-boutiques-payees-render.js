const axios = require('axios');

const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
}

async function testRender() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║         TEST ROUTE BOUTIQUES PAYÉES SUR RENDER                   ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    logSection('1️⃣  CONNEXION ADMIN');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const adminToken = loginRes.data.token;
    logSuccess('Admin connecté sur Render');
    
    logSection('2️⃣  TEST BOUTIQUES PAYÉES');
    const response = await axios.get(`${BASE_URL}/admin/loyers/boutiques-payees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période: ${response.data.periode}`);
    logInfo(`Boutiques payées: ${response.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalEncaisse}€`);
    logInfo(`Taux de paiement: ${response.data.statistiques.tauxPaiement}%`);
    
    logSuccess('✅ Route boutiques-payees fonctionne sur Render!');
    
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
  }
}

testRender();
