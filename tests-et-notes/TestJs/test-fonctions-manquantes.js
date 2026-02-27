/**
 * 🧪 Test des Fonctions Manquantes Implémentées
 * Test des endpoints commercant pour les achats
 * 
 * Fonctions testées:
 * 1. GET /api/commercant/achats/en-cours - Voir les commandes reçues
 * 2. PUT /api/commercant/achats/:id/livraison - Valider la livraison
 */

const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com/api';

// Couleurs pour les logs
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

// Comptes de test
const COMPTES_TEST = {
  admin: {
    email: 'admin@mallapp.com',
    mdp: 'admin123'
  },
  commercant: {
    email: 'commercant@test.com',
    mdp: 'Commercant123456!'
  },
  acheteur: {
    email: 'client@test.com',
    mdp: 'Client123456!'
  }
};

let tokens = {};
let testData = {
  boutique: null,
  produit: null,
  achat: null
};

/**
 * Fonction utilitaire pour faire des requêtes HTTP
 */
async function request(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      json = { error: 'Invalid JSON', body: text };
    }

    return {
      status: response.status,
      ok: response.ok,
      data: json
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.message }
    };
  }
}

/**
 * Connexion des utilisateurs
 */
async function login(email, mdp, role) {
  log(`\n🔐 Connexion ${role}...`, 'cyan');
  const response = await request('POST', '/auth/login', { email, mdp });
  
  if (response.ok && response.data.token) {
    tokens[role] = response.data.token;
    log(`✅ ${role} connecté: ${email}`, 'green');
    return true;
  } else {
    log(`❌ Échec connexion ${role}: ${response.data.message || 'Erreur'}`, 'red');
    return false;
  }
}

/**
 * Créer une boutique de test
 */
async function creerBoutiqueTest() {
  log('\n🏪 Création boutique de test...', 'cyan');
  
  const boutique = {
    nom: `Boutique Test ${Date.now()}`,
    description: 'Boutique pour tester les achats commercant',
    categorie: '507f1f77bcf86cd799439011' // ID fictif
  };

  const response = await request('POST', '/boutique/register', boutique, tokens.commercant);
  
  if (response.ok && response.data.boutique) {
    testData.boutique = response.data.boutique;
    log(`✅ Boutique créée: ${testData.boutique._id}`, 'green');
    return true;
  } else {
    log(`⚠️  Boutique non créée (peut-être existe déjà): ${response.data.message}`, 'yellow');
    
    // Essayer de récupérer une boutique existante
    const getBoutiques = await request('GET', '/boutique/my-boutiques', null, tokens.commercant);
    if (getBoutiques.ok && getBoutiques.data.boutiques && getBoutiques.data.boutiques.length > 0) {
      testData.boutique = getBoutiques.data.boutiques[0];
      log(`✅ Utilisation boutique existante: ${testData.boutique._id}`, 'green');
      return true;
    }
    
    return false;
  }
}

/**
 * Créer un produit de test
 */
async function creerProduitTest() {
  log('\n📦 Création produit de test...', 'cyan');
  
  const produit = {
    nom: `Produit Test ${Date.now()}`,
    description: 'Produit pour tester les achats',
    prix: 50,
    stock: {
      nombreDispo: 100
    },
    tempsPreparation: '00:30:00',
    boutique: testData.boutique._id
  };

  const response = await request('POST', '/produits', produit, tokens.commercant);
  
  if (response.ok && response.data.produit) {
    testData.produit = response.data.produit;
    log(`✅ Produit créé: ${testData.produit._id}`, 'green');
    return true;
  } else {
    log(`❌ Échec création produit: ${response.data.message}`, 'red');
    return false;
  }
}

/**
 * Créer un achat de test (livraison)
 */
async function creerAchatTest() {
  log('\n🛒 Création achat de test (livraison)...', 'cyan');
  
  const panier = {
    achats: [
      {
        produit: testData.produit._id,
        quantite: 2,
        typeAchat: 'Livrer',
        prixUnitaire: testData.produit.prix
      }
    ],
    montantTotal: testData.produit.prix * 2
  };

  const response = await request('POST', '/achats/panier/valider', panier, tokens.acheteur);
  
  if (response.ok && response.data.achats && response.data.achats.length > 0) {
    testData.achat = response.data.achats[0];
    log(`✅ Achat créé: ${testData.achat._id}`, 'green');
    log(`   Type: ${testData.achat.typeAchat.type}`, 'blue');
    log(`   État: ${testData.achat.etat}`, 'blue');
    return true;
  } else {
    log(`❌ Échec création achat: ${response.data.message}`, 'red');
    return false;
  }
}

/**
 * TEST 1: GET /api/commercant/achats/en-cours
 */
async function testObtenirAchatsEnCours() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 1: GET /api/commercant/achats/en-cours', 'cyan');
  log('='.repeat(80), 'cyan');

  const response = await request('GET', '/commercant/achats/en-cours', null, tokens.commercant);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    log(`✅ Succès: ${response.data.count} achat(s) en cours`, 'green');
    
    if (response.data.achats && response.data.achats.length > 0) {
      log('\n📦 Achats en cours:', 'blue');
      response.data.achats.forEach((achat, index) => {
        log(`\n   ${index + 1}. Achat ${achat._id}`, 'yellow');
        log(`      Produit: ${achat.produit?.nom || 'N/A'}`, 'blue');
        log(`      Acheteur: ${achat.acheteur?.nom || 'N/A'} ${achat.acheteur?.prenoms || ''}`, 'blue');
        log(`      Quantité: ${achat.quantite || 'N/A'}`, 'blue');
        log(`      Type: ${achat.typeAchat?.type || 'N/A'}`, 'blue');
        log(`      État: ${achat.etat || 'N/A'}`, 'blue');
        log(`      Montant: ${achat.montantTotal || 'N/A'}€`, 'blue');
      });
    } else {
      log('   Aucun achat en cours', 'yellow');
    }
    
    return true;
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    log(`   Détails: ${JSON.stringify(response.data, null, 2)}`, 'red');
    return false;
  }
}

/**
 * TEST 2: PUT /api/commercant/achats/:id/livraison
 */
async function testValiderLivraison() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 2: PUT /api/commercant/achats/:id/livraison', 'cyan');
  log('='.repeat(80), 'cyan');

  if (!testData.achat) {
    log('⚠️  Aucun achat de test disponible, création...', 'yellow');
    const created = await creerAchatTest();
    if (!created) {
      log('❌ Impossible de créer un achat de test', 'red');
      return false;
    }
  }

  const dureeLivraison = '02:30:00'; // 2h30
  log(`\n📦 Validation livraison pour achat: ${testData.achat._id}`, 'blue');
  log(`⏱️  Durée livraison: ${dureeLivraison}`, 'blue');

  const response = await request(
    'PUT',
    `/commercant/achats/${testData.achat._id}/livraison`,
    { dureeLivraison },
    tokens.commercant
  );

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    log(`✅ Succès: Livraison validée`, 'green');
    
    if (response.data.achat) {
      log('\n📦 Détails achat mis à jour:', 'blue');
      log(`   ID: ${response.data.achat._id}`, 'blue');
      log(`   État: ${response.data.achat.etat}`, 'blue');
      log(`   Date début: ${response.data.achat.typeAchat?.dateDebut || 'N/A'}`, 'blue');
      log(`   Date fin: ${response.data.achat.typeAchat?.dateFin || 'N/A'}`, 'blue');
      log(`   Montant: ${response.data.achat.montantTotal}€`, 'blue');
    }
    
    if (response.data.transaction) {
      log('\n💰 Transaction créée:', 'blue');
      log(`   ID: ${response.data.transaction._id}`, 'blue');
      log(`   Montant: ${response.data.transaction.amount}€`, 'blue');
      log(`   Type: ${response.data.transaction.type}`, 'blue');
    }
    
    return true;
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    log(`   Détails: ${JSON.stringify(response.data, null, 2)}`, 'red');
    return false;
  }
}

/**
 * TEST 3: Vérifier que l'achat n'apparaît plus dans les achats en cours
 */
async function testAchatNonPlusEnCours() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 3: Vérifier que l\'achat validé n\'est plus en cours', 'cyan');
  log('='.repeat(80), 'cyan');

  const response = await request('GET', '/commercant/achats/en-cours', null, tokens.commercant);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    const achatTrouve = response.data.achats?.find(a => a._id === testData.achat._id);
    
    if (!achatTrouve) {
      log(`✅ Succès: L'achat validé n'apparaît plus dans les achats en cours`, 'green');
      return true;
    } else {
      log(`⚠️  L'achat validé apparaît encore dans les achats en cours`, 'yellow');
      log(`   État actuel: ${achatTrouve.etat}`, 'yellow');
      return false;
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    return false;
  }
}

/**
 * TEST 4: Test avec mauvais format de durée
 */
async function testFormatDureeInvalide() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 4: Test validation avec format durée invalide', 'cyan');
  log('='.repeat(80), 'cyan');

  // Créer un nouvel achat pour ce test
  await creerAchatTest();

  const dureeInvalide = '2h30'; // Format invalide
  log(`\n📦 Test avec durée invalide: ${dureeInvalide}`, 'blue');

  const response = await request(
    'PUT',
    `/commercant/achats/${testData.achat._id}/livraison`,
    { dureeLivraison: dureeInvalide },
    tokens.commercant
  );

  log(`\n📊 Statut: ${response.status}`, 'blue');
  
  if (!response.ok && response.status === 400) {
    log(`✅ Succès: Validation du format fonctionne correctement`, 'green');
    log(`   Message: ${response.data.message || response.data.errors?.[0]?.msg}`, 'blue');
    return true;
  } else {
    log(`❌ Échec: La validation devrait rejeter ce format`, 'red');
    return false;
  }
}

/**
 * TEST 5: Test sans authentification
 */
async function testSansAuthentification() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 5: Test sans authentification', 'cyan');
  log('='.repeat(80), 'cyan');

  const response = await request('GET', '/commercant/achats/en-cours', null, null);

  log(`\n📊 Statut: ${response.status}`, 'blue');
  
  if (!response.ok && response.status === 401) {
    log(`✅ Succès: L'authentification est bien requise`, 'green');
    return true;
  } else {
    log(`❌ Échec: L'endpoint devrait être protégé`, 'red');
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '🚀'.repeat(40), 'cyan');
  log('TEST DES FONCTIONS MANQUANTES IMPLÉMENTÉES', 'cyan');
  log('🚀'.repeat(40) + '\n', 'cyan');

  log(`🌐 URL de base: ${BASE_URL}`, 'blue');
  log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');

  const results = {
    total: 0,
    success: 0,
    failed: 0
  };

  try {
    // Connexion des utilisateurs
    log('\n' + '='.repeat(80), 'cyan');
    log('PHASE 1: CONNEXION DES UTILISATEURS', 'cyan');
    log('='.repeat(80), 'cyan');

    const loginAdmin = await login(COMPTES_TEST.admin.email, COMPTES_TEST.admin.mdp, 'admin');
    const loginCommercant = await login(COMPTES_TEST.commercant.email, COMPTES_TEST.commercant.mdp, 'commercant');
    const loginAcheteur = await login(COMPTES_TEST.acheteur.email, COMPTES_TEST.acheteur.mdp, 'acheteur');

    if (!loginCommercant || !loginAcheteur) {
      log('\n❌ Impossible de continuer sans les comptes de test', 'red');
      return;
    }

    // Préparation des données de test
    log('\n' + '='.repeat(80), 'cyan');
    log('PHASE 2: PRÉPARATION DES DONNÉES DE TEST', 'cyan');
    log('='.repeat(80), 'cyan');

    await creerBoutiqueTest();
    if (testData.boutique) {
      await creerProduitTest();
    }

    // Exécution des tests
    log('\n' + '='.repeat(80), 'cyan');
    log('PHASE 3: EXÉCUTION DES TESTS', 'cyan');
    log('='.repeat(80), 'cyan');

    const tests = [
      { name: 'Obtenir achats en cours', fn: testObtenirAchatsEnCours },
      { name: 'Valider livraison', fn: testValiderLivraison },
      { name: 'Achat non plus en cours', fn: testAchatNonPlusEnCours },
      { name: 'Format durée invalide', fn: testFormatDureeInvalide },
      { name: 'Sans authentification', fn: testSansAuthentification }
    ];

    for (const test of tests) {
      results.total++;
      const success = await test.fn();
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    // Résumé
    log('\n' + '='.repeat(80), 'cyan');
    log('📊 RÉSUMÉ DES TESTS', 'cyan');
    log('='.repeat(80), 'cyan');

    log(`\n✅ Tests réussis: ${results.success}/${results.total}`, 'green');
    log(`❌ Tests échoués: ${results.failed}/${results.total}`, results.failed > 0 ? 'red' : 'green');
    
    const percentage = ((results.success / results.total) * 100).toFixed(1);
    log(`📈 Taux de réussite: ${percentage}%`, percentage >= 80 ? 'green' : 'yellow');

    if (results.success === results.total) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
      log('✅ Les fonctions manquantes sont correctement implémentées', 'green');
    } else {
      log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
      log('🔍 Vérifiez les logs ci-dessus pour plus de détails', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }

  log('\n' + '🏁'.repeat(40) + '\n', 'cyan');
}

// Exécution
main().catch(console.error);
