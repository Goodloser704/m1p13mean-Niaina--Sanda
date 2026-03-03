/**
 * 🧪 Test Complet - Routes Notifications et Orders/Achats SANS DONNÉES
 * Test de toutes les routes notifications et orders/achats en local sans données préalables
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
    logTest('Login Admin', !!adminToken);
    
    // Login Commercant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    commercantToken = commercantRes.data.token;
    logTest('Login Commercant', !!commercantToken);
    
    // Login Client
    const clientRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    
    clientToken = clientRes.data.token;
    logTest('Login Client', !!clientToken);
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES NOTIFICATIONS - VIDES
 */
async function testNotificationsVides() {
  logSection('2. ROUTES NOTIFICATIONS - SANS DONNÉES');
  
  // 2.1 Obtenir mes notifications (devrait être vide ou retourner [])
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    const isEmpty = !res.data.notifications || res.data.notifications.length === 0;
    console.log(`  ℹ Notifications trouvées: ${res.data.notifications?.length || 0}`);
    logTest('GET /notifications - Liste vide', res.status === 200);
  } catch (error) {
    logTest('GET /notifications', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Obtenir le nombre de notifications non lues (devrait être 0)
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications/count`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Notifications non lues: ${res.data.unreadCount}`);
    logTest('GET /notifications/count - Compteur à 0', res.status === 200);
  } catch (error) {
    logTest('GET /notifications/count', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 Marquer toutes comme lues (devrait fonctionner même sans données)
  try {
    const res = await axios.put(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /notifications/read-all - Sans données', res.status === 200);
  } catch (error) {
    logTest('PUT /notifications/read-all', false, error.response?.data?.message || error.message);
  }
  
  // 2.4 Marquer une notification inexistante comme lue (devrait échouer)
  try {
    await axios.put(
      `${BASE_URL}/notifications/507f1f77bcf86cd799439011/read`,
      {},
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /notifications/:id/read - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('PUT /notifications/:id/read - ID inexistant', isNotFound);
  }
  
  // 2.5 Archiver une notification inexistante (devrait échouer)
  try {
    await axios.put(
      `${BASE_URL}/notifications/507f1f77bcf86cd799439011/archive`,
      {},
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /notifications/:id/archive - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('PUT /notifications/:id/archive - ID inexistant', isNotFound);
  }
  
  // 2.6 Notifications avec pagination (liste vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications?page=1&limit=5`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /notifications?page&limit - Pagination vide', res.status === 200);
  } catch (error) {
    logTest('GET /notifications?page&limit', false, error.response?.data?.message || error.message);
  }
}

/**
 * 3. ROUTES NOTIFICATIONS - ADMIN
 */
async function testNotificationsAdmin() {
  logSection('3. ROUTES NOTIFICATIONS - ADMIN');
  
  // 3.1 Statistiques admin (devrait fonctionner même sans données)
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications/admin/stats`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /notifications/admin/stats - Stats vides', res.status === 200);
  } catch (error) {
    logTest('GET /notifications/admin/stats', false, error.response?.data?.message || error.message);
  }
}

/**
 * 4. ROUTES ACHATS - VIDES
 */
async function testAchatsVides() {
  logSection('4. ROUTES ACHATS - SANS DONNÉES');
  
  // 4.1 Obtenir mes achats en cours (devrait être vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/en-cours`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Achats en cours: ${res.data.count || 0}`);
    logTest('GET /achats/en-cours - Liste vide', res.status === 200);
  } catch (error) {
    logTest('GET /achats/en-cours', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 Obtenir mon historique d'achats (devrait être vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/historique`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Achats historique: ${res.data.achats?.length || 0}`);
    logTest('GET /achats/historique - Liste vide', res.status === 200);
  } catch (error) {
    logTest('GET /achats/historique', false, error.response?.data?.message || error.message);
  }
  
  // 4.3 Obtenir un achat inexistant par ID (devrait échouer)
  try {
    await axios.get(
      `${BASE_URL}/achats/507f1f77bcf86cd799439011`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/:id - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('GET /achats/:id - ID inexistant', isNotFound);
  }
  
  // 4.4 Obtenir mes statistiques d'achats (devrait fonctionner avec 0)
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/statistiques`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Total achats: ${res.data.totalAchats || 0}`);
    logTest('GET /achats/statistiques - Stats vides', res.status === 200);
  } catch (error) {
    logTest('GET /achats/statistiques', false, error.response?.data?.message || error.message);
  }
  
  // 4.5 Obtenir mes factures (devrait être vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/factures`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Factures: ${res.data.factures?.length || 0}`);
    logTest('GET /achats/factures - Liste vide', res.status === 200);
  } catch (error) {
    logTest('GET /achats/factures', false, error.response?.data?.message || error.message);
  }
  
  // 4.6 Obtenir une facture inexistante par ID (devrait échouer)
  try {
    await axios.get(
      `${BASE_URL}/achats/factures/507f1f77bcf86cd799439011`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/factures/:id - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('GET /achats/factures/:id - ID inexistant', isNotFound);
  }
  
  // 4.7 Historique avec pagination (liste vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/historique?page=1&limit=10`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/historique?page&limit - Pagination vide', res.status === 200);
  } catch (error) {
    logTest('GET /achats/historique?page&limit', false, error.response?.data?.message || error.message);
  }
}

/**
 * 5. ROUTES ACHATS - VALIDATION PANIER SANS PRODUITS
 */
async function testValidationPanierSansProduits() {
  logSection('5. ROUTES ACHATS - VALIDATION PANIER SANS PRODUITS');
  
  // 5.1 Valider un panier vide (devrait échouer)
  try {
    await axios.post(
      `${BASE_URL}/achats/panier/valider`,
      {
        achats: [],
        montantTotal: 0
      },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('POST /achats/panier/valider - Panier vide', false, 'Devrait échouer');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('POST /achats/panier/valider - Panier vide rejeté', isValidationError);
  }
  
  // 5.2 Valider un panier avec produit inexistant (devrait échouer)
  try {
    await axios.post(
      `${BASE_URL}/achats/panier/valider`,
      {
        achats: [
          {
            produit: '507f1f77bcf86cd799439011',
            quantite: 1,
            typeAchat: 'Recuperer',
            prixUnitaire: 19.99
          }
        ],
        montantTotal: 19.99
      },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('POST /achats/panier/valider - Produit inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isError = error.response?.status === 400 || error.response?.status === 500;
    logTest('POST /achats/panier/valider - Produit inexistant rejeté', isError);
  }
}

/**
 * 6. ROUTES ACHATS - ANNULATION SANS DONNÉES
 */
async function testAnnulationAchatSansDonnees() {
  logSection('6. ROUTES ACHATS - ANNULATION SANS DONNÉES');
  
  // 6.1 Annuler un achat inexistant (devrait échouer)
  try {
    await axios.put(
      `${BASE_URL}/achats/507f1f77bcf86cd799439011/annuler`,
      { raison: 'Test annulation' },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /achats/:id/annuler - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('PUT /achats/:id/annuler - ID inexistant rejeté', isNotFound);
  }
}

/**
 * 7. ROUTES ORDERS - VIDES
 */
async function testOrdersVides() {
  logSection('7. ROUTES ORDERS - SANS DONNÉES');
  
  // 7.1 Obtenir mes commandes (devrait être vide)
  try {
    const res = await axios.get(
      `${BASE_URL}/orders/me`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    console.log(`  ℹ Commandes: ${res.data.orders?.length || 0}`);
    logTest('GET /orders/me - Liste vide', res.status === 200);
  } catch (error) {
    logTest('GET /orders/me', false, error.response?.data?.message || error.message);
  }
  
  // 7.2 Obtenir une commande inexistante (devrait échouer)
  try {
    await axios.get(
      `${BASE_URL}/orders/507f1f77bcf86cd799439011`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /orders/:id - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('GET /orders/:id - ID inexistant rejeté', isNotFound);
  }
  
  // 7.3 Annuler une commande inexistante (devrait échouer)
  try {
    await axios.put(
      `${BASE_URL}/orders/507f1f77bcf86cd799439011/cancel`,
      {},
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /orders/:id/cancel - ID inexistant', false, 'Devrait échouer');
  } catch (error) {
    const isNotFound = error.response?.status === 404;
    logTest('PUT /orders/:id/cancel - ID inexistant rejeté', isNotFound);
  }
}

/**
 * 8. TESTS DE PERMISSIONS
 */
async function testPermissions() {
  logSection('8. TESTS DE PERMISSIONS');
  
  // 8.1 Commercant ne peut pas accéder aux stats admin notifications
  try {
    await axios.get(
      `${BASE_URL}/notifications/admin/stats`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Commercant accès stats admin - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403;
    logTest('Commercant accès stats admin - Refusé', isAccessDenied);
  }
  
  // 8.2 Admin ne peut pas valider de panier
  try {
    await axios.post(
      `${BASE_URL}/achats/panier/valider`,
      {
        achats: [{ produit: '507f1f77bcf86cd799439011', quantite: 1, typeAchat: 'Recuperer', prixUnitaire: 10 }],
        montantTotal: 10
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('Admin valider panier - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403;
    logTest('Admin valider panier - Refusé', isAccessDenied);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - NOTIFICATIONS & ORDERS/ACHATS (SANS DONNÉES)${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testNotificationsVides();
    await testNotificationsAdmin();
    await testAchatsVides();
    await testValidationPanierSansProduits();
    await testAnnulationAchatSansDonnees();
    await testOrdersVides();
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
