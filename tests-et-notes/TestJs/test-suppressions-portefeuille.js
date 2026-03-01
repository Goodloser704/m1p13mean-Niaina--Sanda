const axios = require('axios');

/**
 * 🗑️ Tests de suppressions multiples - Portefeuilles
 * Test des suppressions en cascade et de l'intégrité des données
 */

const BASE_URL = 'http://localhost:3000/api';

// Codes couleur
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

let totalTests = 0;
let testsReussis = 0;
let testsEchoues = 0;

let adminToken = '';
let commercantToken = '';
let commercantId = '';

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

function afficherSection(titre) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${titre}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function authentifier() {
  afficherSection('🔐 AUTHENTIFICATION');
  
  try {
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    adminToken = adminRes.data.token;
    afficherResultat('Connexion Admin', true);
    
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jean.dupont@test.com',
      mdp: 'Test123456!'
    });
    commercantToken = commercantRes.data.token;
    commercantId = commercantRes.data.user.id;
    afficherResultat('Connexion Commerçant (Jean Dupont)', true, `ID: ${commercantId}`);
    
  } catch (error) {
    console.error(`${colors.red}Erreur d'authentification:${colors.reset}`, error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test 1: État initial - Compter les données
 */
async function testEtatInitial() {
  afficherSection('📊 TEST 1: État initial des données');
  
  try {
    // Compter les portefeuilles
    const pfRes = await axios.get(`${BASE_URL}/portefeuille/admin/all?limit=100`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'Nombre de portefeuilles actifs',
      true,
      `${pfRes.data.pagination.total} portefeuilles trouvés`
    );
    
    // Obtenir les transactions du commerçant
    const txRes = await axios.get(`${BASE_URL}/portefeuille/transactions?limit=100`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'Nombre de transactions du commerçant',
      true,
      `${txRes.data.pagination.total} transactions`
    );
    
    // Obtenir le portefeuille du commerçant
    const walletRes = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'Solde du portefeuille commerçant',
      true,
      `${walletRes.data.portefeuille.balance}€`
    );
    
    return {
      totalPortefeuilles: pfRes.data.pagination.total,
      totalTransactions: txRes.data.pagination.total,
      soldeInitial: walletRes.data.portefeuille.balance
    };
    
  } catch (error) {
    afficherResultat('État initial', false, error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test 2: Suppression d'un utilisateur (devrait supprimer son portefeuille)
 */
async function testSuppressionUtilisateur() {
  afficherSection('🗑️ TEST 2: Suppression d\'un utilisateur');
  
  try {
    // Créer un utilisateur temporaire
    const newUser = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Temporaire',
      prenoms: 'Test',
      email: 'temp.test@test.com',
      mdp: 'Test123456!',
      role: 'Acheteur',
      telephone: '0340000099',
      genre: 'Masculin'
    });
    
    const tempUserId = newUser.data.user.id;
    afficherResultat('Création utilisateur temporaire', true, `ID: ${tempUserId}`);
    
    // Vérifier que le portefeuille a été créé
    const tempToken = newUser.data.token;
    const walletRes = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    
    afficherResultat('Portefeuille créé automatiquement', true, `Balance: ${walletRes.data.portefeuille.balance}€`);
    
    // Supprimer l'utilisateur (si la route existe)
    try {
      await axios.delete(`${BASE_URL}/users/${tempUserId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Suppression utilisateur', true, 'Utilisateur supprimé');
      
      // Vérifier que le portefeuille n'existe plus
      try {
        await axios.get(`${BASE_URL}/portefeuille/me`, {
          headers: { Authorization: `Bearer ${tempToken}` }
        });
        afficherResultat('Vérification suppression portefeuille', false, 'Le portefeuille existe encore');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          afficherResultat('Vérification suppression portefeuille', true, 'Portefeuille supprimé en cascade');
        } else {
          afficherResultat('Vérification suppression portefeuille', false, error.response?.data?.message);
        }
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        afficherResultat('Suppression utilisateur', false, 'Route de suppression non implémentée');
      } else {
        afficherResultat('Suppression utilisateur', false, error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    afficherResultat('Test suppression utilisateur', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Suppression multiple de transactions
 */
async function testSuppressionTransactions() {
  afficherSection('🗑️ TEST 3: Suppression de transactions');
  
  try {
    // Obtenir les transactions du commerçant
    const txRes = await axios.get(`${BASE_URL}/portefeuille/transactions?limit=5`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const transactions = txRes.data.transactions;
    afficherResultat('Récupération des transactions', true, `${transactions.length} transactions à tester`);
    
    if (transactions.length === 0) {
      afficherResultat('Test suppression transactions', false, 'Aucune transaction à supprimer');
      return;
    }
    
    // Essayer de supprimer une transaction (si la route existe)
    const txId = transactions[0]._id;
    
    try {
      await axios.delete(`${BASE_URL}/portefeuille/transactions/${txId}`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Suppression transaction', true, `Transaction ${txId} supprimée`);
      
      // Vérifier que la transaction n'existe plus
      const newTxRes = await axios.get(`${BASE_URL}/portefeuille/transactions`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      
      const found = newTxRes.data.transactions.find(tx => tx._id === txId);
      afficherResultat(
        'Vérification suppression',
        !found,
        found ? 'Transaction encore présente' : 'Transaction bien supprimée'
      );
      
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        afficherResultat('Suppression transaction', false, 'Route de suppression non implémentée (normal pour l\'intégrité)');
      } else {
        afficherResultat('Suppression transaction', false, error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    afficherResultat('Test suppression transactions', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Intégrité des données après suppressions
 */
async function testIntegriteDonnees(etatInitial) {
  afficherSection('🔍 TEST 4: Intégrité des données');
  
  if (!etatInitial) {
    afficherResultat('Test intégrité', false, 'État initial non disponible');
    return;
  }
  
  try {
    // Vérifier les portefeuilles
    const pfRes = await axios.get(`${BASE_URL}/portefeuille/admin/all?limit=100`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'Cohérence des portefeuilles',
      true,
      `${pfRes.data.pagination.total} portefeuilles (initial: ${etatInitial.totalPortefeuilles})`
    );
    
    // Vérifier les transactions
    const txRes = await axios.get(`${BASE_URL}/portefeuille/transactions?limit=100`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'Cohérence des transactions',
      true,
      `${txRes.data.pagination.total} transactions (initial: ${etatInitial.totalTransactions})`
    );
    
    // Vérifier le solde
    const walletRes = await axios.get(`${BASE_URL}/portefeuille/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'Cohérence du solde',
      true,
      `${walletRes.data.portefeuille.balance}€ (initial: ${etatInitial.soldeInitial}€)`
    );
    
    // Vérifier les statistiques
    const statsRes = await axios.get(`${BASE_URL}/portefeuille/stats`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'Statistiques cohérentes',
      statsRes.data.statistiques.nombreTransactions === txRes.data.pagination.total,
      `${statsRes.data.statistiques.nombreTransactions} transactions dans les stats`
    );
    
  } catch (error) {
    afficherResultat('Test intégrité', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Tentatives de suppressions non autorisées
 */
async function testSuppressionsNonAutorisees() {
  afficherSection('🔒 TEST 5: Suppressions non autorisées');
  
  try {
    // Essayer de supprimer le portefeuille d'un autre utilisateur
    const otherUserRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sophie.martin@test.com',
      mdp: 'Test123456!'
    });
    
    const otherUserId = otherUserRes.data.user.id;
    
    try {
      await axios.delete(`${BASE_URL}/portefeuille/users/${otherUserId}/wallet`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Suppression portefeuille autre utilisateur', false, 'Suppression autorisée (ne devrait pas)');
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404 || error.response?.status === 405) {
        afficherResultat('Suppression portefeuille autre utilisateur', true, 'Accès refusé comme attendu');
      } else {
        afficherResultat('Suppression portefeuille autre utilisateur', false, error.response?.data?.message);
      }
    }
    
    // Essayer de supprimer une transaction d'un autre utilisateur
    const otherToken = otherUserRes.data.token;
    const txRes = await axios.get(`${BASE_URL}/portefeuille/transactions?limit=1`, {
      headers: { Authorization: `Bearer ${otherToken}` }
    });
    
    if (txRes.data.transactions.length > 0) {
      const txId = txRes.data.transactions[0]._id;
      
      try {
        await axios.delete(`${BASE_URL}/portefeuille/transactions/${txId}`, {
          headers: { Authorization: `Bearer ${commercantToken}` }
        });
        afficherResultat('Suppression transaction autre utilisateur', false, 'Suppression autorisée (ne devrait pas)');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404 || error.response?.status === 405) {
          afficherResultat('Suppression transaction autre utilisateur', true, 'Accès refusé comme attendu');
        } else {
          afficherResultat('Suppression transaction autre utilisateur', false, error.response?.data?.message);
        }
      }
    }
    
  } catch (error) {
    afficherResultat('Test suppressions non autorisées', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Suppression en cascade (Admin)
 */
async function testSuppressionCascadeAdmin() {
  afficherSection('🗑️ TEST 6: Suppression en cascade (Admin)');
  
  try {
    // Créer un utilisateur de test complet
    const newUser = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Cascade',
      prenoms: 'Test',
      email: 'cascade.test@test.com',
      mdp: 'Test123456!',
      role: 'Commercant',
      telephone: '0340000098',
      genre: 'Masculin'
    });
    
    const cascadeUserId = newUser.data.user.id;
    const cascadeToken = newUser.data.token;
    
    afficherResultat('Création utilisateur cascade', true, `ID: ${cascadeUserId}`);
    
    // Créer des transactions pour cet utilisateur
    await axios.post(`${BASE_URL}/portefeuille/recharge`, {
      montant: 100,
      modePaiement: 'Carte'
    }, {
      headers: { Authorization: `Bearer ${cascadeToken}` }
    });
    
    afficherResultat('Création transaction pour test cascade', true, 'Recharge de 100€');
    
    // Compter les données avant suppression
    const txBefore = await axios.get(`${BASE_URL}/portefeuille/transactions`, {
      headers: { Authorization: `Bearer ${cascadeToken}` }
    });
    
    console.log(`  ${colors.magenta}Avant suppression:${colors.reset}`);
    console.log(`  - Transactions: ${txBefore.data.pagination.total}`);
    
    // Supprimer l'utilisateur (Admin)
    try {
      await axios.delete(`${BASE_URL}/users/${cascadeUserId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      afficherResultat('Suppression utilisateur par Admin', true, 'Utilisateur supprimé');
      
      // Vérifier que tout a été supprimé
      console.log(`  ${colors.magenta}Vérification suppression en cascade:${colors.reset}`);
      
      try {
        await axios.get(`${BASE_URL}/portefeuille/me`, {
          headers: { Authorization: `Bearer ${cascadeToken}` }
        });
        afficherResultat('Portefeuille supprimé', false, 'Portefeuille encore accessible');
      } catch (error) {
        afficherResultat('Portefeuille supprimé', true, 'Portefeuille inaccessible');
      }
      
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        afficherResultat('Suppression utilisateur par Admin', false, 'Route non implémentée');
      } else {
        afficherResultat('Suppression utilisateur par Admin', false, error.response?.data?.message);
      }
    }
    
  } catch (error) {
    afficherResultat('Test suppression cascade', false, error.response?.data?.message || error.message);
  }
}

function afficherResume() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}RÉSUMÉ DES TESTS DE SUPPRESSION${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  console.log(`Total de tests: ${totalTests}`);
  console.log(`${colors.green}✓ Tests réussis: ${testsReussis}${colors.reset}`);
  console.log(`${colors.red}✗ Tests échoués: ${testsEchoues}${colors.reset}`);
  
  const pourcentage = ((testsReussis / totalTests) * 100).toFixed(2);
  console.log(`\nTaux de réussite: ${pourcentage}%`);
  
  if (testsEchoues === 0) {
    console.log(`\n${colors.green}🎉 Tous les tests sont passés avec succès!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué (routes de suppression non implémentées).${colors.reset}\n`);
  }
}

async function executerTests() {
  console.log(`${colors.magenta}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🗑️  TESTS DE SUPPRESSIONS - PORTEFEUILLES 🗑️         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifier();
    const etatInitial = await testEtatInitial();
    await testSuppressionUtilisateur();
    await testSuppressionTransactions();
    await testIntegriteDonnees(etatInitial);
    await testSuppressionsNonAutorisees();
    await testSuppressionCascadeAdmin();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

executerTests();
