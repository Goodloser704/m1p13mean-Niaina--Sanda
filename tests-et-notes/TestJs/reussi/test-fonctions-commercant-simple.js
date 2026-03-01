/**
 * 🧪 Test Simplifié des Fonctions Commercant
 * Test des endpoints commercant pour les achats (sans création de données)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

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
  commercant: {
    email: 'commercant@test.com',
    mdp: 'Commercant123456!'
  }
};

let tokenCommercant = null;

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
 * Connexion commercant
 */
async function loginCommercant() {
  log('\n🔐 Connexion commercant...', 'cyan');
  const response = await request('POST', '/auth/login', {
    email: COMPTES_TEST.commercant.email,
    mdp: COMPTES_TEST.commercant.mdp
  });
  
  if (response.ok && response.data.token) {
    tokenCommercant = response.data.token;
    log(`✅ Commercant connecté: ${COMPTES_TEST.commercant.email}`, 'green');
    return true;
  } else {
    log(`❌ Échec connexion commercant: ${response.data.message || 'Erreur'}`, 'red');
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

  const response = await request('GET', '/commercant/achats/en-cours', null, tokenCommercant);

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
      log('   💡 Ceci est normal si aucun client n\'a passé de commande récemment', 'blue');
    }
    
    return true;
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    log(`   Détails: ${JSON.stringify(response.data, null, 2)}`, 'red');
    return false;
  }
}

/**
 * TEST 2: Test sans authentification
 */
async function testSansAuthentification() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 2: Test sans authentification', 'cyan');
  log('='.repeat(80), 'cyan');

  const response = await request('GET', '/commercant/achats/en-cours', null, null);

  log(`\n📊 Statut: ${response.status}`, 'blue');
  
  if (!response.ok && response.status === 401) {
    log(`✅ Succès: L'authentification est bien requise`, 'green');
    log(`   Message: ${response.data.message || 'Non autorisé'}`, 'blue');
    return true;
  } else {
    log(`❌ Échec: L'endpoint devrait être protégé`, 'red');
    return false;
  }
}

/**
 * TEST 3: Test avec mauvais token
 */
async function testMauvaisToken() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 3: Test avec mauvais token', 'cyan');
  log('='.repeat(80), 'cyan');

  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token';
  const response = await request('GET', '/commercant/achats/en-cours', null, fakeToken);

  log(`\n📊 Statut: ${response.status}`, 'blue');
  
  if (!response.ok && (response.status === 401 || response.status === 403)) {
    log(`✅ Succès: Le token invalide est bien rejeté`, 'green');
    log(`   Message: ${response.data.message || 'Token invalide'}`, 'blue');
    return true;
  } else {
    log(`❌ Échec: Le token invalide devrait être rejeté`, 'red');
    return false;
  }
}

/**
 * TEST 4: Vérifier la structure de la réponse
 */
async function testStructureReponse() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 4: Vérifier la structure de la réponse', 'cyan');
  log('='.repeat(80), 'cyan');

  const response = await request('GET', '/commercant/achats/en-cours', null, tokenCommercant);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    const hasAchats = Array.isArray(response.data.achats);
    const hasCount = typeof response.data.count === 'number';
    
    if (hasAchats && hasCount) {
      log(`✅ Succès: La structure de la réponse est correcte`, 'green');
      log(`   ✓ achats: Array (${response.data.achats.length} éléments)`, 'blue');
      log(`   ✓ count: Number (${response.data.count})`, 'blue');
      
      if (response.data.achats.length > 0) {
        const achat = response.data.achats[0];
        log(`\n   Structure d'un achat:`, 'blue');
        log(`   ✓ _id: ${achat._id ? '✅' : '❌'}`, achat._id ? 'green' : 'red');
        log(`   ✓ produit: ${achat.produit ? '✅' : '❌'}`, achat.produit ? 'green' : 'red');
        log(`   ✓ acheteur: ${achat.acheteur ? '✅' : '❌'}`, achat.acheteur ? 'green' : 'red');
        log(`   ✓ typeAchat: ${achat.typeAchat ? '✅' : '❌'}`, achat.typeAchat ? 'green' : 'red');
        log(`   ✓ etat: ${achat.etat ? '✅' : '❌'}`, achat.etat ? 'green' : 'red');
      }
      
      return true;
    } else {
      log(`❌ Échec: Structure de réponse incorrecte`, 'red');
      log(`   achats is Array: ${hasAchats}`, hasAchats ? 'green' : 'red');
      log(`   count is Number: ${hasCount}`, hasCount ? 'green' : 'red');
      return false;
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '🚀'.repeat(40), 'cyan');
  log('TEST SIMPLIFIÉ DES FONCTIONS COMMERCANT', 'cyan');
  log('🚀'.repeat(40) + '\n', 'cyan');

  log(`🌐 URL de base: ${BASE_URL}`, 'blue');
  log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');

  const results = {
    total: 0,
    success: 0,
    failed: 0
  };

  try {
    // Connexion
    log('\n' + '='.repeat(80), 'cyan');
    log('PHASE 1: CONNEXION', 'cyan');
    log('='.repeat(80), 'cyan');

    const loginOk = await loginCommercant();
    if (!loginOk) {
      log('\n❌ Impossible de continuer sans connexion', 'red');
      return;
    }

    // Exécution des tests
    log('\n' + '='.repeat(80), 'cyan');
    log('PHASE 2: EXÉCUTION DES TESTS', 'cyan');
    log('='.repeat(80), 'cyan');

    const tests = [
      { name: 'Obtenir achats en cours', fn: testObtenirAchatsEnCours },
      { name: 'Sans authentification', fn: testSansAuthentification },
      { name: 'Avec mauvais token', fn: testMauvaisToken },
      { name: 'Structure de la réponse', fn: testStructureReponse }
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
    log(`📈 Taux de réussite: ${percentage}%`, percentage >= 75 ? 'green' : 'yellow');

    if (results.success === results.total) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
      log('✅ L\'endpoint GET /api/commercant/achats/en-cours fonctionne correctement', 'green');
    } else if (results.success >= results.total * 0.75) {
      log('\n✅ LA MAJORITÉ DES TESTS SONT PASSÉS', 'green');
      log('⚠️  Quelques tests ont échoué, vérifiez les logs ci-dessus', 'yellow');
    } else {
      log('\n⚠️  PLUSIEURS TESTS ONT ÉCHOUÉ', 'yellow');
      log('🔍 Vérifiez les logs ci-dessus pour plus de détails', 'yellow');
    }

    // Informations supplémentaires
    log('\n' + '='.repeat(80), 'cyan');
    log('📝 INFORMATIONS SUPPLÉMENTAIRES', 'cyan');
    log('='.repeat(80), 'cyan');

    log('\n💡 Pour tester la validation de livraison:', 'blue');
    log('   1. Un client doit passer une commande avec livraison', 'blue');
    log('   2. Le commercant verra l\'achat dans "achats en cours"', 'blue');
    log('   3. Le commercant peut alors valider la livraison', 'blue');
    log('   4. Endpoint: PUT /api/commercant/achats/:id/livraison', 'blue');
    log('   5. Body: { "dureeLivraison": "02:30:00" }', 'blue');

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }

  log('\n' + '🏁'.repeat(40) + '\n', 'cyan');
}

// Exécution
main().catch(console.error);
