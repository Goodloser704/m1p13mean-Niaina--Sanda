const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000/api';

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

// Test 1: getAllBoutiques avec pagination par défaut
async function testGetAllBoutiquesDefault() {
  try {
    log('TEST 1: GET /api/boutique (pagination par défaut)');
    
    const response = await axios.get(`${BASE_URL}/boutique`);
    
    if (response.data.boutiques && 
        response.data.page && 
        response.data.limit && 
        response.data.totalPages !== undefined) {
      logSuccess('Pagination par défaut fonctionne!');
      log('Résultat', {
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      return true;
    } else {
      log('⚠️ Structure de réponse incorrecte', response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur test getAllBoutiques default', error);
    return false;
  }
}

// Test 2: getAllBoutiques avec pagination personnalisée
async function testGetAllBoutiquesCustomPagination() {
  try {
    log('TEST 2: GET /api/boutique?page=1&limit=5');
    
    const response = await axios.get(`${BASE_URL}/boutique`, {
      params: { page: 1, limit: 5 }
    });
    
    if (response.data.page === 1 && 
        response.data.limit === 5 && 
        response.data.boutiques.length <= 5) {
      logSuccess('Pagination personnalisée fonctionne!');
      log('Résultat', {
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      return true;
    } else {
      log('⚠️ Pagination incorrecte', response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur test pagination personnalisée', error);
    return false;
  }
}

// Test 3: getAllBoutiques page 2
async function testGetAllBoutiquesPage2() {
  try {
    log('TEST 3: GET /api/boutique?page=2&limit=3');
    
    const response = await axios.get(`${BASE_URL}/boutique`, {
      params: { page: 2, limit: 3 }
    });
    
    if (response.data.page === 2 && response.data.limit === 3) {
      logSuccess('Navigation page 2 fonctionne!');
      log('Résultat', {
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages
      });
      return true;
    } else {
      log('⚠️ Page 2 incorrecte', response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur test page 2', error);
    return false;
  }
}

// Test 4: getAllBoutiquesByStatut - Actif
async function testGetBoutiquesByStatutActif() {
  try {
    log('TEST 4: GET /api/boutique/by-statut?statut=Actif&page=1&limit=10');
    
    const response = await axios.get(`${BASE_URL}/boutique/by-statut`, {
      params: { statut: 'Actif', page: 1, limit: 10 }
    });
    
    if (response.data.boutiques && 
        response.data.page && 
        response.data.limit && 
        response.data.totalPages !== undefined) {
      logSuccess('getAllBoutiquesByStatut (Actif) fonctionne!');
      log('Résultat', {
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      
      // Vérifier que toutes les boutiques ont le bon statut
      const allActif = response.data.boutiques.every(b => b.statutBoutique === 'Actif');
      if (allActif) {
        log('✅ Toutes les boutiques ont le statut Actif');
      } else {
        log('⚠️ Certaines boutiques n\'ont pas le statut Actif');
      }
      
      return true;
    } else {
      log('⚠️ Structure de réponse incorrecte', response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur test by-statut Actif', error);
    return false;
  }
}

// Test 5: getAllBoutiquesByStatut - EnAttente
async function testGetBoutiquesByStatutEnAttente() {
  try {
    log('TEST 5: GET /api/boutique/by-statut?statut=EnAttente');
    
    const response = await axios.get(`${BASE_URL}/boutique/by-statut`, {
      params: { statut: 'EnAttente', page: 1, limit: 10 }
    });
    
    if (response.data.boutiques && response.data.page) {
      logSuccess('getAllBoutiquesByStatut (EnAttente) fonctionne!');
      log('Résultat', {
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      return true;
    } else {
      log('⚠️ Structure de réponse incorrecte', response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur test by-statut EnAttente', error);
    return false;
  }
}

// Test 6: getAllBoutiquesByStatut - Sans statut (doit échouer)
async function testGetBoutiquesByStatutSansStatut() {
  try {
    log('TEST 6: GET /api/boutique/by-statut (sans paramètre statut)');
    
    try {
      await axios.get(`${BASE_URL}/boutique/by-statut`);
      log('⚠️ La requête aurait dû échouer sans paramètre statut');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation statut requis fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test sans statut', error);
    return false;
  }
}

// Test 7: getAllBoutiquesByStatut - Statut invalide
async function testGetBoutiquesByStatutInvalide() {
  try {
    log('TEST 7: GET /api/boutique/by-statut?statut=InvalidStatut');
    
    try {
      await axios.get(`${BASE_URL}/boutique/by-statut`, {
        params: { statut: 'InvalidStatut' }
      });
      log('⚠️ La requête aurait dû échouer avec statut invalide');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation statut invalide fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test statut invalide', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 TEST PAGINATION BOUTIQUES - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'getAllBoutiques pagination par défaut', fn: testGetAllBoutiquesDefault },
    { name: 'getAllBoutiques pagination personnalisée', fn: testGetAllBoutiquesCustomPagination },
    { name: 'getAllBoutiques page 2', fn: testGetAllBoutiquesPage2 },
    { name: 'getAllBoutiquesByStatut - Actif', fn: testGetBoutiquesByStatutActif },
    { name: 'getAllBoutiquesByStatut - EnAttente', fn: testGetBoutiquesByStatutEnAttente },
    { name: 'getAllBoutiquesByStatut - Sans statut', fn: testGetBoutiquesByStatutSansStatut },
    { name: 'getAllBoutiquesByStatut - Statut invalide', fn: testGetBoutiquesByStatutInvalide }
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
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RÉSUMÉ DES TESTS PAGINATION - ${env}`);
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
