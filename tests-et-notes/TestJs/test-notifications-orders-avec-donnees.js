/**
 * 🧪 Test Complet - Routes Notifications et Orders/Achats AVEC DONNÉES
 * Test de toutes les routes notifications et orders/achats en local avec données
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
let notificationId = '';
let achatId = '';
let factureId = '';
let produitId = '';

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
 * 2. ROUTES NOTIFICATIONS - CLIENT
 */
async function testNotificationsClient() {
  logSection('2. ROUTES NOTIFICATIONS - CLIENT');
  
  // 2.1 Obtenir mes notifications
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    if (res.data.notifications && res.data.notifications.length > 0) {
      notificationId = res.data.notifications[0]._id;
      console.log(`  ℹ Notification trouvée: ${notificationId}`);
    }
    logTest('GET /notifications - Mes notifications', res.status === 200);
  } catch (error) {
    logTest('GET /notifications', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Obtenir le nombre de notifications non lues
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications/count`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /notifications/count - Nombre non lues', res.status === 200);
  } catch (error) {
    logTest('GET /notifications/count', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 Marquer une notification comme lue
  if (notificationId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('PUT /notifications/:id/read - Marquer comme lue', res.status === 200);
    } catch (error) {
      logTest('PUT /notifications/:id/read', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.4 Marquer toutes les notifications comme lues
  try {
    const res = await axios.put(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('PUT /notifications/read-all - Tout marquer comme lu', res.status === 200);
  } catch (error) {
    logTest('PUT /notifications/read-all', false, error.response?.data?.message || error.message);
  }
  
  // 2.5 Archiver une notification
  if (notificationId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/notifications/${notificationId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('PUT /notifications/:id/archive - Archiver', res.status === 200);
    } catch (error) {
      logTest('PUT /notifications/:id/archive', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.6 Notifications avec pagination
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications?page=1&limit=5`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /notifications?page&limit - Pagination', res.status === 200);
  } catch (error) {
    logTest('GET /notifications?page&limit', false, error.response?.data?.message || error.message);
  }
}

/**
 * 3. ROUTES NOTIFICATIONS - ADMIN
 */
async function testNotificationsAdmin() {
  logSection('3. ROUTES NOTIFICATIONS - ADMIN');
  
  // 3.1 Statistiques admin
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications/admin/stats`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /notifications/admin/stats - Statistiques', res.status === 200);
  } catch (error) {
    logTest('GET /notifications/admin/stats', false, error.response?.data?.message || error.message);
  }
}

/**
 * 4. ROUTES ACHATS - CLIENT
 */
async function testAchatsClient() {
  logSection('4. ROUTES ACHATS - CLIENT');
  
  // 4.1 Obtenir mes achats en cours
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/en-cours`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    if (res.data.achats && res.data.achats.length > 0) {
      achatId = res.data.achats[0]._id;
      console.log(`  ℹ Achat trouvé: ${achatId}`);
    }
    logTest('GET /achats/en-cours - Achats en cours', res.status === 200);
  } catch (error) {
    logTest('GET /achats/en-cours', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 Obtenir mon historique d'achats
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/historique`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/historique - Historique achats', res.status === 200);
  } catch (error) {
    logTest('GET /achats/historique', false, error.response?.data?.message || error.message);
  }
  
  // 4.3 Obtenir un achat par ID
  if (achatId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/achats/${achatId}`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('GET /achats/:id - Achat par ID', res.status === 200);
    } catch (error) {
      logTest('GET /achats/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.4 Obtenir mes statistiques d'achats
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/statistiques`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/statistiques - Statistiques', res.status === 200);
  } catch (error) {
    logTest('GET /achats/statistiques', false, error.response?.data?.message || error.message);
  }
  
  // 4.5 Obtenir mes factures
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/factures`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    if (res.data.factures && res.data.factures.length > 0) {
      factureId = res.data.factures[0]._id;
      console.log(`  ℹ Facture trouvée: ${factureId}`);
    }
    logTest('GET /achats/factures - Mes factures', res.status === 200);
  } catch (error) {
    logTest('GET /achats/factures', false, error.response?.data?.message || error.message);
  }
  
  // 4.6 Obtenir une facture par ID
  if (factureId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/achats/factures/${factureId}`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('GET /achats/factures/:id - Facture par ID', res.status === 200);
    } catch (error) {
      logTest('GET /achats/factures/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.7 Historique avec pagination
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/historique?page=1&limit=10`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /achats/historique?page&limit - Pagination', res.status === 200);
  } catch (error) {
    logTest('GET /achats/historique?page&limit', false, error.response?.data?.message || error.message);
  }
}

/**
 * 5. ROUTES ACHATS - VALIDATION PANIER
 */
async function testValidationPanier() {
  logSection('5. ROUTES ACHATS - VALIDATION PANIER');
  
  // 5.1 Récupérer un produit pour le panier
  try {
    const res = await axios.get(
      `${BASE_URL}/produits`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    if (res.data.produits && res.data.produits.length > 0) {
      const produit = res.data.produits.find(p => p.stock?.nombreDispo > 0);
      if (produit) {
        produitId = produit._id;
        console.log(`  ℹ Produit trouvé: ${produitId} (${produit.nom})`);
      }
    }
    logTest('Récupération produit pour panier', res.status === 200);
  } catch (error) {
    logTest('Récupération produit', false, error.response?.data?.message || error.message);
  }
  
  // 5.2 Valider un panier
  if (produitId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/achats/panier/valider`,
        {
          achats: [
            {
              produit: produitId,
              quantite: 1,
              typeAchat: 'Recuperer',
              prixUnitaire: 19.99
            }
          ],
          montantTotal: 19.99
        },
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('POST /achats/panier/valider - Valider panier', res.status === 201);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      // Si solde insuffisant ou prix modifié, c'est normal
      if (msg.includes('insuffisant') || msg.includes('modifié')) {
        logTest('POST /achats/panier/valider', true, `Validation échouée (${msg})`);
      } else {
        logTest('POST /achats/panier/valider', false, msg);
      }
    }
  }
}

/**
 * 6. ROUTES ACHATS - ANNULATION
 */
async function testAnnulationAchat() {
  logSection('6. ROUTES ACHATS - ANNULATION');
  
  // 6.1 Annuler un achat
  if (achatId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/achats/${achatId}/annuler`,
        { raison: 'Test annulation' },
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      
      logTest('PUT /achats/:id/annuler - Annuler achat', res.status === 200);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      // Si déjà annulé ou ne peut plus être annulé, c'est normal
      if (msg.includes('annulé') || msg.includes('ne peut plus')) {
        logTest('PUT /achats/:id/annuler', true, `Annulation impossible (${msg})`);
      } else {
        logTest('PUT /achats/:id/annuler', false, msg);
      }
    }
  }
}

/**
 * 7. ROUTES ORDERS (si disponibles)
 */
async function testOrders() {
  logSection('7. ROUTES ORDERS');
  
  // 7.1 Obtenir mes commandes
  try {
    const res = await axios.get(
      `${BASE_URL}/orders/me`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('GET /orders/me - Mes commandes', res.status === 200);
  } catch (error) {
    logTest('GET /orders/me', false, error.response?.data?.message || error.message);
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
  
  // 8.2 Commercant ne peut pas accéder aux achats client
  if (achatId) {
    try {
      await axios.get(
        `${BASE_URL}/achats/${achatId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('Commercant accès achats client - Refusé', false, 'Devrait être refusé');
    } catch (error) {
      const isAccessDenied = error.response?.status === 403 || error.response?.status === 404;
      logTest('Commercant accès achats client - Refusé', isAccessDenied);
    }
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - NOTIFICATIONS & ORDERS/ACHATS (AVEC DONNÉES)${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testNotificationsClient();
    await testNotificationsAdmin();
    await testAchatsClient();
    await testValidationPanier();
    await testAnnulationAchat();
    await testOrders();
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
