/**
 * 🧪 Test Complet - Routes Loyers et Factures
 * Test de toutes les routes loyers et factures en local
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
let acheteurToken = '';
let boutiqueId = '';
let factureId = '';
let recuId = '';

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
    
    // Login Acheteur
    try {
      const acheteurRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'client@test.com',
        mdp: 'Client123456!'
      });
      
      acheteurToken = acheteurRes.data.token;
      logTest('Login Acheteur', !!acheteurToken);
    } catch (error) {
      logTest('Login Acheteur', false, 'Compte acheteur non disponible');
    }
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES LOYERS - COMMERCANT
 */
async function testLoyersCommercant() {
  logSection('2. ROUTES LOYERS - COMMERCANT');
  
  // 2.1 Récupérer une boutique active
  try {
    const res = await axios.get(
      `${BASE_URL}/boutique/my-boutiques`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (res.data.boutiques && res.data.boutiques.length > 0) {
      boutiqueId = res.data.boutiques[0]._id;
      console.log(`  ℹ Boutique trouvée: ${boutiqueId}`);
    }
    logTest('Récupération boutique pour tests', res.status === 200);
  } catch (error) {
    logTest('Récupération boutique', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Payer le loyer
  if (boutiqueId) {
    try {
      const now = new Date();
      const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const res = await axios.post(
        `${BASE_URL}/commercant/loyers/pay`,
        {
          boutiqueId: boutiqueId,
          montant: 800,
          periode: periode
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      if (res.data.recepisse) {
        recuId = res.data.recepisse._id;
      }
      logTest('POST /commercant/loyers/pay - Payer loyer', res.status === 200);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      // Si déjà payé, c'est normal
      if (msg.includes('déjà été payé')) {
        logTest('POST /commercant/loyers/pay', true, 'Loyer déjà payé (normal)');
      } else {
        logTest('POST /commercant/loyers/pay', false, msg);
      }
    }
  }
  
  // 2.3 Obtenir l'historique des loyers
  try {
    const res = await axios.get(
      `${BASE_URL}/commercant/loyers/historique`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /commercant/loyers/historique', res.status === 200);
  } catch (error) {
    logTest('GET /commercant/loyers/historique', false, error.response?.data?.message || error.message);
  }
}

/**
 * 3. ROUTES LOYERS - ADMIN
 */
async function testLoyersAdmin() {
  logSection('3. ROUTES LOYERS - ADMIN');
  
  // 3.1 Historique par période
  try {
    const now = new Date();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const annee = now.getFullYear();
    
    const res = await axios.get(
      `${BASE_URL}/admin/loyers/historique-par-periode?mois=${mois}&annee=${annee}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /admin/loyers/historique-par-periode', res.status === 200);
  } catch (error) {
    logTest('GET /admin/loyers/historique-par-periode', false, error.response?.data?.message || error.message);
  }
  
  // 3.2 Boutiques payées
  try {
    const res = await axios.get(
      `${BASE_URL}/admin/loyers/boutiques-payees`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /admin/loyers/boutiques-payees', res.status === 200);
  } catch (error) {
    logTest('GET /admin/loyers/boutiques-payees', false, error.response?.data?.message || error.message);
  }
  
  // 3.3 Boutiques impayées
  try {
    const res = await axios.get(
      `${BASE_URL}/admin/loyers/boutiques-impayees`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /admin/loyers/boutiques-impayees', res.status === 200);
  } catch (error) {
    logTest('GET /admin/loyers/boutiques-impayees', false, error.response?.data?.message || error.message);
  }
  
  // 3.4 Statut paiements mois courant
  try {
    const res = await axios.get(
      `${BASE_URL}/admin/loyers/statut-paiements-mois-courant`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /admin/loyers/statut-paiements-mois-courant', res.status === 200);
  } catch (error) {
    logTest('GET /admin/loyers/statut-paiements-mois-courant', false, error.response?.data?.message || error.message);
  }
}

/**
 * 4. ROUTES FACTURES - ACHETEUR
 */
async function testFacturesAcheteur() {
  logSection('4. ROUTES FACTURES - ACHETEUR');
  
  if (!acheteurToken) {
    console.log(`  ${colors.yellow}⚠ Tests factures ignorés (pas de compte acheteur)${colors.reset}`);
    return;
  }
  
  // 4.1 Obtenir mes factures
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/factures`,
      { headers: { Authorization: `Bearer ${acheteurToken}` } }
    );
    
    if (res.data.factures && res.data.factures.length > 0) {
      factureId = res.data.factures[0]._id;
      console.log(`  ℹ Facture trouvée: ${factureId}`);
    }
    logTest('GET /achats/factures - Mes factures', res.status === 200);
  } catch (error) {
    logTest('GET /achats/factures', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 Obtenir une facture par ID
  if (factureId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/achats/factures/${factureId}`,
        { headers: { Authorization: `Bearer ${acheteurToken}` } }
      );
      
      logTest('GET /achats/factures/:id - Facture par ID', res.status === 200);
    } catch (error) {
      logTest('GET /achats/factures/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.3 Obtenir factures avec pagination
  try {
    const res = await axios.get(
      `${BASE_URL}/achats/factures?page=1&limit=10`,
      { headers: { Authorization: `Bearer ${acheteurToken}` } }
    );
    
    logTest('GET /achats/factures?page&limit - Pagination', res.status === 200);
  } catch (error) {
    logTest('GET /achats/factures?page&limit', false, error.response?.data?.message || error.message);
  }
}

/**
 * 5. ROUTES FACTURES - ADMIN
 */
async function testFacturesAdmin() {
  logSection('5. ROUTES FACTURES - ADMIN');
  
  // 5.1 Obtenir factures d'un acheteur (Admin)
  try {
    // Récupérer un acheteur
    const acheteurRes = await axios.get(
      `${BASE_URL}/auth/me`,
      { headers: { Authorization: `Bearer ${acheteurToken || commercantToken}` } }
    );
    
    if (acheteurRes.data.user) {
      const acheteurId = acheteurRes.data.user._id;
      
      const res = await axios.get(
        `${BASE_URL}/factures/acheteur/${acheteurId}/factures`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /factures/acheteur/:id/factures (Admin)', res.status === 200);
    }
  } catch (error) {
    logTest('GET /factures/acheteur/:id/factures', false, error.response?.data?.message || error.message);
  }
  
  // 5.2 Obtenir une facture spécifique (Admin)
  if (factureId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/factures/${factureId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /factures/:id (Admin)', res.status === 200);
    } catch (error) {
      logTest('GET /factures/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 6. TESTS DE PERMISSIONS
 */
async function testPermissions() {
  logSection('6. TESTS DE PERMISSIONS');
  
  // 6.1 Commercant ne peut pas accéder aux routes admin loyers
  try {
    await axios.get(
      `${BASE_URL}/admin/loyers/boutiques-payees`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Commercant accès admin loyers - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403;
    logTest('Commercant accès admin loyers - Refusé', isAccessDenied);
  }
  
  // 6.2 Acheteur ne peut pas payer de loyer
  if (acheteurToken) {
    try {
      await axios.post(
        `${BASE_URL}/commercant/loyers/pay`,
        { montant: 500 },
        { headers: { Authorization: `Bearer ${acheteurToken}` } }
      );
      
      logTest('Acheteur payer loyer - Refusé', false, 'Devrait être refusé');
    } catch (error) {
      const isAccessDenied = error.response?.status === 403;
      logTest('Acheteur payer loyer - Refusé', isAccessDenied);
    }
  }
}

/**
 * 7. TESTS DE VALIDATION
 */
async function testValidation() {
  logSection('7. TESTS DE VALIDATION');
  
  // 7.1 Paiement loyer avec montant invalide
  try {
    await axios.post(
      `${BASE_URL}/commercant/loyers/pay`,
      { montant: -100 },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Paiement montant négatif - Rejeté', false, 'Devrait être rejeté');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('Paiement montant négatif - Rejeté', isValidationError);
  }
  
  // 7.2 Historique avec période invalide
  try {
    await axios.get(
      `${BASE_URL}/admin/loyers/historique-par-periode?mois=13&annee=2024`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('Période invalide - Rejetée', false, 'Devrait être rejetée');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('Période invalide - Rejetée', isValidationError);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - ROUTES LOYERS & FACTURES${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testLoyersCommercant();
    await testLoyersAdmin();
    await testFacturesAcheteur();
    await testFacturesAdmin();
    await testPermissions();
    await testValidation();
    
    logStats();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    logStats();
    process.exit(1);
  }
}

// Lancer les tests
runTests();
