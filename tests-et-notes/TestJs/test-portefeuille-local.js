const axios = require('axios');

/**
 * 💰 Tests des routes Portefeuille - Serveur Local
 * Test complet des fonctionnalités de gestion de portefeuille
 */

const BASE_URL = 'http://localhost:3000/api';

// Codes couleur pour l'affichage
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Compteurs de résultats
let totalTests = 0;
let testsReussis = 0;
let testsEchoues = 0;

// Tokens d'authentification
let adminToken = '';
let commercantToken = '';
let acheteurToken = '';

// IDs pour les tests
let commercantId = '';
let acheteurId = '';

/**
 * Afficher un résultat de test
 */
function afficherResultat(nom, succes, details = '') {
  totalTests++;
  if (succes) {
    testsReussis++;
    console.log(`${colors.green}✓${colors.reset} ${nom}`);
  } else {
    testsEchoues++;
    console.log(`${colors.red}✗${colors.reset} ${nom}`);
  }
  if (details) {
    console.log(`  ${colors.yellow}→${colors.reset} ${details}`);
  }
}

/**
 * Afficher une section
 */
function afficherSection(titre) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${titre}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Authentification des utilisateurs de test
 */
async function authentifierUtilisateurs() {
  afficherSection('🔐 AUTHENTIFICATION DES UTILISATEURS');
  
  try {
    // Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    adminToken = adminRes.data.token;
    afficherResultat('Connexion Admin', true, `Token: ${adminToken.substring(0, 20)}...`);
    
    // Commerçant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    commercantToken = commercantRes.data.token;
    commercantId = commercantRes.data.user.id; // Utiliser 'id' au lieu de '_id'
    afficherResultat('Connexion Commerçant', true, `ID: ${commercantId}`);
    
    // Acheteur
    const acheteurRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    acheteurToken = acheteurRes.data.token;
    acheteurId = acheteurRes.data.user.id; // Utiliser 'id' au lieu de '_id'
    afficherResultat('Connexion Acheteur', true, `ID: ${acheteurId}`);
    
  } catch (error) {
    console.error(`${colors.red}Erreur d'authentification:${colors.reset}`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Config:', error.config.data);
    } else {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

/**
 * Test 1: Obtenir mon portefeuille
 */
async function testObtenirMonPortefeuille() {
  afficherSection('💰 TEST 1: Obtenir mon portefeuille');
  
  try {
    // Test avec commerçant
    const res = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/me (Commerçant)',
      res.status === 200 && res.data.portefeuille,
      `Balance: ${res.data.portefeuille.balance}€`
    );
    
    // Test avec acheteur
    const res2 = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/me (Acheteur)',
      res2.status === 200 && res2.data.portefeuille,
      `Balance: ${res2.data.portefeuille.balance}€`
    );
    
    // Test sans authentification (doit échouer)
    try {
      await axios.get(`${BASE_URL}/portefeuille/me`);
      afficherResultat('GET /api/portefeuille/me (Sans auth)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/portefeuille/me (Sans auth)',
        error.response?.status === 401,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/portefeuille/me', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 2: Obtenir le portefeuille d'un utilisateur
 */
async function testObtenirPortefeuilleUtilisateur() {
  afficherSection('👤 TEST 2: Obtenir le portefeuille d\'un utilisateur');
  
  try {
    // Test: Commerçant consulte son propre portefeuille
    const res1 = await axios.get(`${BASE_URL}/portefeuille/users/${commercantId}/wallet`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/users/:id/wallet (Propre portefeuille)',
      res1.status === 200 && res1.data.wallet && res1.data.transactions,
      `Balance: ${res1.data.wallet.balance}€, Transactions: ${res1.data.transactions.length}`
    );
    
    // Test: Admin consulte le portefeuille d'un commerçant
    const res2 = await axios.get(`${BASE_URL}/portefeuille/users/${commercantId}/wallet`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/users/:id/wallet (Admin)',
      res2.status === 200 && res2.data.wallet,
      `Admin peut consulter le portefeuille du commerçant`
    );
    
    // Test: Acheteur essaie de consulter le portefeuille du commerçant (doit échouer)
    try {
      await axios.get(`${BASE_URL}/portefeuille/users/${commercantId}/wallet`, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('GET /api/portefeuille/users/:id/wallet (Autre utilisateur)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/portefeuille/users/:id/wallet (Autre utilisateur)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/portefeuille/users/:id/wallet', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Obtenir l'historique des transactions
 */
async function testObtenirTransactions() {
  afficherSection('📜 TEST 3: Obtenir l\'historique des transactions');
  
  try {
    // Test sans pagination
    const res1 = await axios.get(`${BASE_URL}/portefeuille/transactions`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/transactions (Sans pagination)',
      res1.status === 200 && res1.data.transactions && res1.data.pagination,
      `${res1.data.transactions.length} transactions, Total: ${res1.data.pagination.total}`
    );
    
    // Test avec pagination
    const res2 = await axios.get(`${BASE_URL}/portefeuille/transactions?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/transactions (Avec pagination)',
      res2.status === 200 && res2.data.transactions.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.transactions.length}`
    );
    
    // Test avec filtre par type
    const res3 = await axios.get(`${BASE_URL}/portefeuille/transactions?type=Recharge`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/transactions (Filtre type)',
      res3.status === 200,
      `Transactions de type Recharge: ${res3.data.transactions.length}`
    );
    
  } catch (error) {
    afficherResultat('GET /api/portefeuille/transactions', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Recharger le portefeuille
 */
async function testRechargerPortefeuille() {
  afficherSection('💳 TEST 4: Recharger le portefeuille');
  
  try {
    // Obtenir le solde initial
    const resInitial = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    const balanceInitiale = resInitial.data.portefeuille.balance;
    
    // Test: Recharge valide
    const res1 = await axios.post(`${BASE_URL}/portefeuille/recharge`, {
      montant: 100,
      modePaiement: 'Carte'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'POST /api/portefeuille/recharge (Montant valide)',
      res1.status === 200 && res1.data.portefeuille.balance === balanceInitiale + 100,
      `Balance: ${balanceInitiale}€ → ${res1.data.portefeuille.balance}€`
    );
    
    // Test: Recharge avec PayPal
    const res2 = await axios.post(`${BASE_URL}/portefeuille/recharge`, {
      montant: 50,
      modePaiement: 'PayPal'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'POST /api/portefeuille/recharge (PayPal)',
      res2.status === 200,
      `+50€ via PayPal`
    );
    
    // Test: Montant invalide (trop petit)
    try {
      await axios.post(`${BASE_URL}/portefeuille/recharge`, {
        montant: 0,
        modePaiement: 'Carte'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('POST /api/portefeuille/recharge (Montant = 0)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'POST /api/portefeuille/recharge (Montant = 0)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
    // Test: Montant invalide (trop grand)
    try {
      await axios.post(`${BASE_URL}/portefeuille/recharge`, {
        montant: 15000,
        modePaiement: 'Carte'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('POST /api/portefeuille/recharge (Montant > 10000)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'POST /api/portefeuille/recharge (Montant > 10000)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('POST /api/portefeuille/recharge', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Obtenir les statistiques
 */
async function testObtenirStatistiques() {
  afficherSection('📊 TEST 5: Obtenir les statistiques du portefeuille');
  
  try {
    const res = await axios.get(`${BASE_URL}/portefeuille/stats`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/stats',
      res.status === 200 && res.data.portefeuille && res.data.statistiques,
      `Balance: ${res.data.portefeuille.balance}€, Transactions: ${res.data.statistiques.nombreTransactions}`
    );
    
    console.log(`\n  ${colors.magenta}Détails des statistiques:${colors.reset}`);
    console.log(`  - Période: ${res.data.statistiques.periode}`);
    console.log(`  - Total entrées: ${res.data.statistiques.totalEntrees}€`);
    console.log(`  - Total sorties: ${res.data.statistiques.totalSorties}€`);
    console.log(`  - Nombre de transactions: ${res.data.statistiques.nombreTransactions}`);
    
    if (res.data.statistiques.transactionsParType.length > 0) {
      console.log(`  - Transactions par type:`);
      res.data.statistiques.transactionsParType.forEach(stat => {
        console.log(`    • ${stat.type}: ${stat.nombre} (${stat.montant}€)`);
      });
    }
    
  } catch (error) {
    afficherResultat('GET /api/portefeuille/stats', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Routes Admin - Obtenir tous les portefeuilles
 */
async function testObtenirTousPortefeuilles() {
  afficherSection('👑 TEST 6: Routes Admin - Tous les portefeuilles');
  
  try {
    // Test: Admin accède à tous les portefeuilles
    const res1 = await axios.get(`${BASE_URL}/portefeuille/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/admin/all (Admin)',
      res1.status === 200 && res1.data.portefeuilles && res1.data.pagination,
      `${res1.data.portefeuilles.length} portefeuilles, Total: ${res1.data.pagination.total}`
    );
    
    // Test: Avec pagination
    const res2 = await axios.get(`${BASE_URL}/portefeuille/admin/all?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/admin/all (Pagination)',
      res2.status === 200 && res2.data.portefeuilles.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.portefeuilles.length}`
    );
    
    // Test: Avec recherche
    const res3 = await axios.get(`${BASE_URL}/portefeuille/admin/all?search=commercant`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/portefeuille/admin/all (Recherche)',
      res3.status === 200,
      `Résultats pour "commercant": ${res3.data.portefeuilles.length}`
    );
    
    // Test: Commerçant essaie d'accéder (doit échouer)
    try {
      await axios.get(`${BASE_URL}/portefeuille/admin/all`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('GET /api/portefeuille/admin/all (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/portefeuille/admin/all (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/portefeuille/admin/all', false, error.response?.data?.message || error.message);
  }
}

/**
 * Afficher le résumé final
 */
function afficherResume() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}RÉSUMÉ DES TESTS${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  console.log(`Total de tests: ${totalTests}`);
  console.log(`${colors.green}✓ Tests réussis: ${testsReussis}${colors.reset}`);
  console.log(`${colors.red}✗ Tests échoués: ${testsEchoues}${colors.reset}`);
  
  const pourcentage = ((testsReussis / totalTests) * 100).toFixed(2);
  console.log(`\nTaux de réussite: ${pourcentage}%`);
  
  if (testsEchoues === 0) {
    console.log(`\n${colors.green}🎉 Tous les tests sont passés avec succès!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.${colors.reset}\n`);
  }
}

/**
 * Fonction principale
 */
async function executerTests() {
  console.log(`${colors.magenta}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     💰 TESTS DES ROUTES PORTEFEUILLE - LOCAL 💰          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await testObtenirMonPortefeuille();
    await testObtenirPortefeuilleUtilisateur();
    await testObtenirTransactions();
    await testRechargerPortefeuille();
    await testObtenirStatistiques();
    await testObtenirTousPortefeuilles();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
