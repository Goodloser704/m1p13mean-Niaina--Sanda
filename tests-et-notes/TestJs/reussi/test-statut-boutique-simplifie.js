const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let commercantToken = '';
let boutiqueId = '';

const log = (message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(60));
};

const logError = (message, error) => {
  console.error(`\n${'❌'.repeat(30)}`);
  console.error(`❌ ${message}`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error:', error.message);
  }
  console.error('❌'.repeat(30));
};

const logSuccess = (message) => {
  console.log(`\n${'✅'.repeat(30)}`);
  console.log(`✅ ${message}`);
  console.log('✅'.repeat(30));
};

// Test 1: Connexion Admin
async function loginAdmin() {
  try {
    log('TEST 1: Connexion Admin');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    adminToken = response.data.token;
    logSuccess('Admin connecté avec succès');
    return true;
  } catch (error) {
    logError('Échec connexion admin', error);
    return false;
  }
}

// Test 2: Créer un commercant
async function createCommercant() {
  try {
    log('TEST 2: Créer un commercant');
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Statut',
      email: `commercant.statut.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    
    commercantToken = response.data.token;
    logSuccess('Commercant créé avec succès');
    return true;
  } catch (error) {
    logError('Échec création commercant', error);
    return false;
  }
}

// Test 3: Créer une boutique (doit être Inactif par défaut)
async function createBoutique() {
  try {
    log('TEST 3: Créer une boutique (doit être Inactif par défaut)');
    
    // Récupérer une catégorie
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let categories = [];
    if (Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    } else if (categoriesResponse.data.categories) {
      categories = categoriesResponse.data.categories;
    }
    
    if (!categories || categories.length === 0) {
      log('⚠️ Pas de catégories, skip test');
      return true;
    }
    
    const response = await axios.post(
      `${BASE_URL}/boutique/register`,
      {
        nom: `Boutique Test Statut ${Date.now()}`,
        description: 'Test statut simplifié',
        categorie: categories[0]._id
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    boutiqueId = response.data.boutique._id;
    
    if (response.data.boutique.statutBoutique === 'Inactif') {
      logSuccess('Boutique créée avec statut Inactif par défaut!');
      log('Boutique', response.data.boutique);
      return true;
    } else {
      log(`⚠️ Statut incorrect: ${response.data.boutique.statutBoutique} (attendu: Inactif)`);
      return false;
    }
  } catch (error) {
    logError('Erreur création boutique', error);
    return false;
  }
}

// Test 4: Vérifier que EnAttente n'est plus accepté
async function testEnAttenteRejected() {
  try {
    log('TEST 4: Vérifier que EnAttente n\'est plus un statut valide');
    
    try {
      await axios.get(`${BASE_URL}/boutique/by-statut`, {
        params: { statut: 'EnAttente' }
      });
      log('⚠️ EnAttente est encore accepté (devrait être rejeté)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('EnAttente correctement rejeté!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test EnAttente', error);
    return false;
  }
}

// Test 5: Récupérer boutiques par statut Inactif
async function testGetBoutiquesInactif() {
  try {
    log('TEST 5: Récupérer boutiques Inactif');
    
    const response = await axios.get(`${BASE_URL}/boutique/by-statut`, {
      params: { statut: 'Inactif' }
    });
    
    if (response.data.boutiques) {
      logSuccess(`${response.data.count} boutiques Inactif trouvées!`);
      log('Pagination', {
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      
      // Vérifier que notre boutique est dans la liste
      const found = response.data.boutiques.find(b => b._id === boutiqueId);
      if (found) {
        log('✅ Notre boutique est bien dans la liste des Inactif');
      }
      
      return true;
    } else {
      log('⚠️ Structure de réponse incorrecte');
      return false;
    }
  } catch (error) {
    logError('Erreur récupération boutiques Inactif', error);
    return false;
  }
}

// Test 6: Activer une boutique (Admin)
async function testActivateBoutique() {
  try {
    log('TEST 6: Activer une boutique (Admin)');
    
    if (!boutiqueId) {
      log('⚠️ Pas de boutique à activer, skip test');
      return true;
    }
    
    const response = await axios.put(
      `${BASE_URL}/boutique/${boutiqueId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.boutique && response.data.boutique.statutBoutique === 'Actif') {
      logSuccess('Boutique activée avec succès!');
      log('Boutique', response.data.boutique);
      return true;
    } else {
      log('⚠️ Boutique non activée correctement');
      return false;
    }
  } catch (error) {
    logError('Erreur activation boutique', error);
    return false;
  }
}

// Test 7: Vérifier que la boutique est maintenant Actif
async function testBoutiqueIsActif() {
  try {
    log('TEST 7: Vérifier que la boutique est Actif');
    
    const response = await axios.get(`${BASE_URL}/boutique/by-statut`, {
      params: { statut: 'Actif' }
    });
    
    const found = response.data.boutiques.find(b => b._id === boutiqueId);
    if (found && found.statutBoutique === 'Actif') {
      logSuccess('Boutique est bien Actif!');
      return true;
    } else {
      log('⚠️ Boutique non trouvée dans les Actif');
      return false;
    }
  } catch (error) {
    logError('Erreur vérification boutique Actif', error);
    return false;
  }
}

// Test 8: Désactiver une boutique (Admin)
async function testDeactivateBoutique() {
  try {
    log('TEST 8: Désactiver une boutique (Admin)');
    
    if (!boutiqueId) {
      log('⚠️ Pas de boutique à désactiver, skip test');
      return true;
    }
    
    const response = await axios.put(
      `${BASE_URL}/boutique/${boutiqueId}/reject`,
      { reason: 'Test désactivation' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.message.includes('désactivée')) {
      logSuccess('Boutique désactivée avec succès!');
      log('Résultat', response.data);
      return true;
    } else {
      log('⚠️ Boutique non désactivée correctement');
      return false;
    }
  } catch (error) {
    logError('Erreur désactivation boutique', error);
    return false;
  }
}

// Test 9: Vérifier que la boutique est de nouveau Inactif
async function testBoutiqueIsInactifAgain() {
  try {
    log('TEST 9: Vérifier que la boutique est de nouveau Inactif');
    
    const response = await axios.get(`${BASE_URL}/boutique/by-statut`, {
      params: { statut: 'Inactif' }
    });
    
    const found = response.data.boutiques.find(b => b._id === boutiqueId);
    if (found && found.statutBoutique === 'Inactif') {
      logSuccess('Boutique est bien Inactif!');
      return true;
    } else {
      log('⚠️ Boutique non trouvée dans les Inactif');
      return false;
    }
  } catch (error) {
    logError('Erreur vérification boutique Inactif', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 TEST STATUT BOUTIQUE SIMPLIFIÉ - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion Admin', fn: loginAdmin, critical: true },
    { name: 'Créer commercant', fn: createCommercant, critical: true },
    { name: 'Créer boutique (Inactif par défaut)', fn: createBoutique },
    { name: 'EnAttente rejeté', fn: testEnAttenteRejected },
    { name: 'Récupérer boutiques Inactif', fn: testGetBoutiquesInactif },
    { name: 'Activer boutique', fn: testActivateBoutique },
    { name: 'Vérifier boutique Actif', fn: testBoutiqueIsActif },
    { name: 'Désactiver boutique', fn: testDeactivateBoutique },
    { name: 'Vérifier boutique Inactif', fn: testBoutiqueIsInactifAgain }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    
    if (success) {
      results.success++;
    } else {
      results.failed++;
      if (test.critical) {
        console.log('\n❌ Test critique échoué, arrêt des tests');
        break;
      }
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RÉSUMÉ DES TESTS STATUT SIMPLIFIÉ - ${env}`);
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS PASSENT! 🎉\n');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) ont échoué\n`);
  }
}

runAllTests().catch(console.error);
