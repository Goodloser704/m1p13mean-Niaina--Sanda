/**
 * 🧪 Test Complet - Routes Users
 * Test de toutes les routes users en local
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

// Variables globales pour les tests
let adminToken = '';
let commercantToken = '';
let clientToken = '';
let adminId = '';
let commercantId = '';
let clientId = '';

/**
 * Afficher un résultat de test
 */
function logTest(name, success, details = '') {
  stats.total++;
  if (success) {
    stats.success++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    stats.failed++;
    stats.errors.push({ name, details });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (details) console.log(`  ${colors.yellow}${details}${colors.reset}`);
  }
}

/**
 * Afficher une section
 */
function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

/**
 * Afficher les statistiques finales
 */
function logStats() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}RÉSULTATS FINAUX${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`Total: ${stats.total}`);
  console.log(`${colors.green}Réussis: ${stats.success}${colors.reset}`);
  console.log(`${colors.red}Échoués: ${stats.failed}${colors.reset}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n${colors.red}ERREURS:${colors.reset}`);
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.name}`);
      if (error.details) console.log(`   ${error.details}`);
    });
  }
  
  const successRate = ((stats.success / stats.total) * 100).toFixed(2);
  console.log(`\n${colors.blue}Taux de réussite: ${successRate}%${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

/**
 * 1. AUTHENTIFICATION
 */
async function testAuthentification() {
  logSection('1. AUTHENTIFICATION');
  
  try {
    // Login Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    adminToken = adminRes.data.token;
    adminId = adminRes.data.user._id;
    console.log(`  ℹ Admin ID: ${adminId}`);
    logTest('Login Admin', !!adminToken);
    
    // Login Commercant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    commercantToken = commercantRes.data.token;
    commercantId = commercantRes.data.user._id;
    console.log(`  ℹ Commercant ID: ${commercantId}`);
    logTest('Login Commercant', !!commercantToken);
    
    // Login Client
    const clientRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    
    clientToken = clientRes.data.token;
    clientId = clientRes.data.user._id;
    console.log(`  ℹ Client ID: ${clientId}`);
    logTest('Login Client', !!clientToken);
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES PROFIL UTILISATEUR
 */
async function testProfilUtilisateur() {
  logSection('2. ROUTES PROFIL UTILISATEUR');
  
  // 2.1 GET /users/me - Obtenir mon profil (Admin)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/me`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.user && res.data.user.email === 'admin@mall.com';
    logTest('GET /users/me - Admin', isValid);
  } catch (error) {
    logTest('GET /users/me - Admin', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 GET /users/me - Obtenir mon profil (Commercant)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/me`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.user && res.data.user.email === 'commercant@test.com';
    logTest('GET /users/me - Commercant', isValid);
  } catch (error) {
    logTest('GET /users/me - Commercant', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 GET /users/me - Obtenir mon profil (Client)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/me`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.user && res.data.user.email === 'client@test.com';
    logTest('GET /users/me - Client', isValid);
  } catch (error) {
    logTest('GET /users/me - Client', false, error.response?.data?.message || error.message);
  }
  
  // 2.4 GET /users/:id/me - Obtenir profil avec ID (Admin)
  if (adminId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${adminId}/me`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.user;
      logTest('GET /users/:id/me - Admin avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/me - Admin', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.5 GET /users/:id/me - Obtenir profil avec ID (Commercant)
  if (commercantId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${commercantId}/me`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.user;
      logTest('GET /users/:id/me - Commercant avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/me - Commercant', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.6 GET /users/:id/me - Obtenir profil avec ID (Client)
  if (clientId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${clientId}/me`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.user;
      logTest('GET /users/:id/me - Client avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/me - Client', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 3. ROUTES NOTIFICATIONS
 */
async function testNotifications() {
  logSection('3. ROUTES NOTIFICATIONS');
  
  // 3.1 GET /users/notifications - Mes notifications (Admin)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/notifications`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const isValid = res.status === 200 && Array.isArray(res.data.notifications);
    logTest('GET /users/notifications - Admin', isValid);
  } catch (error) {
    logTest('GET /users/notifications - Admin', false, error.response?.data?.message || error.message);
  }
  
  // 3.2 GET /users/notifications - Mes notifications (Commercant)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/notifications`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    const isValid = res.status === 200 && Array.isArray(res.data.notifications);
    logTest('GET /users/notifications - Commercant', isValid);
  } catch (error) {
    logTest('GET /users/notifications - Commercant', false, error.response?.data?.message || error.message);
  }
  
  // 3.3 GET /users/notifications - Mes notifications (Client)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/notifications`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    const isValid = res.status === 200 && Array.isArray(res.data.notifications);
    logTest('GET /users/notifications - Client', isValid);
  } catch (error) {
    logTest('GET /users/notifications - Client', false, error.response?.data?.message || error.message);
  }
  
  // 3.4 GET /users/:userId/notifications - Notifications avec ID (Admin)
  if (adminId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${adminId}/notifications`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      const isValid = res.status === 200 && Array.isArray(res.data.notifications);
      logTest('GET /users/:userId/notifications - Admin avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:userId/notifications - Admin', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.5 GET /users/:userId/notifications - Notifications avec ID (Commercant)
  if (commercantId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${commercantId}/notifications`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      const isValid = res.status === 200 && Array.isArray(res.data.notifications);
      logTest('GET /users/:userId/notifications - Commercant avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:userId/notifications - Commercant', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.6 GET /users/:userId/notifications - Notifications avec ID (Client)
  if (clientId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${clientId}/notifications`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      const isValid = res.status === 200 && Array.isArray(res.data.notifications);
      logTest('GET /users/:userId/notifications - Client avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:userId/notifications - Client', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 4. ROUTES PORTEFEUILLE
 */
async function testPortefeuille() {
  logSection('4. ROUTES PORTEFEUILLE');
  
  // 4.1 GET /users/wallet - Mon portefeuille (Admin)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/wallet`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.portefeuille;
    logTest('GET /users/wallet - Admin', isValid);
  } catch (error) {
    logTest('GET /users/wallet - Admin', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 GET /users/wallet - Mon portefeuille (Commercant)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/wallet`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.portefeuille;
    logTest('GET /users/wallet - Commercant', isValid);
  } catch (error) {
    logTest('GET /users/wallet - Commercant', false, error.response?.data?.message || error.message);
  }
  
  // 4.3 GET /users/wallet - Mon portefeuille (Client)
  try {
    const res = await axios.get(
      `${BASE_URL}/users/wallet`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    const isValid = res.status === 200 && res.data.portefeuille;
    logTest('GET /users/wallet - Client', isValid);
  } catch (error) {
    logTest('GET /users/wallet - Client', false, error.response?.data?.message || error.message);
  }
  
  // 4.4 GET /users/:id/wallet - Portefeuille avec ID (Admin)
  if (adminId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${adminId}/wallet`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.portefeuille;
      logTest('GET /users/:id/wallet - Admin avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/wallet - Admin', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.5 GET /users/:id/wallet - Portefeuille avec ID (Commercant)
  if (commercantId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${commercantId}/wallet`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.portefeuille;
      logTest('GET /users/:id/wallet - Commercant avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/wallet - Commercant', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.6 GET /users/:id/wallet - Portefeuille avec ID (Client)
  if (clientId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/users/${clientId}/wallet`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      const isValid = res.status === 200 && res.data.portefeuille;
      logTest('GET /users/:id/wallet - Client avec ID', isValid);
    } catch (error) {
      logTest('GET /users/:id/wallet - Client', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 5. TESTS DE PERMISSIONS
 */
async function testPermissions() {
  logSection('5. TESTS DE PERMISSIONS');
  
  // 5.1 Sans authentification - Profil
  try {
    await axios.get(`${BASE_URL}/users/me`);
    logTest('Sans auth - GET /users/me - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 401;
    logTest('Sans auth - GET /users/me - Refusé', isAccessDenied);
  }
  
  // 5.2 Sans authentification - Notifications
  try {
    await axios.get(`${BASE_URL}/users/notifications`);
    logTest('Sans auth - GET /users/notifications - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 401;
    logTest('Sans auth - GET /users/notifications - Refusé', isAccessDenied);
  }
  
  // 5.3 Sans authentification - Portefeuille
  try {
    await axios.get(`${BASE_URL}/users/wallet`);
    logTest('Sans auth - GET /users/wallet - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 401;
    logTest('Sans auth - GET /users/wallet - Refusé', isAccessDenied);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - ROUTES USERS${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testProfilUtilisateur();
    await testNotifications();
    await testPortefeuille();
    await testPermissions();
    
    logStats();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    logStats();
    process.exit(1);
  }
}

// Lancer les tests
runTests();
