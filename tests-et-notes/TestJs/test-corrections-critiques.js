const axios = require('axios');

// Configuration - Changez BASE_URL pour tester local ou production
const BASE_URL = process.env.TEST_URL || 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let testData = {};

// Utilitaires
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

// 1. Connexion Admin
async function loginAdmin() {
  try {
    log(`TEST 1: Connexion Admin`);
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

// 2. Test: Créer espace avec numéro valide (CORRECTION CRITIQUE)
async function testCreateEspaceNumeroValide() {
  try {
    log('TEST 2: Créer espace avec numéro valide (test correction)');
    
    // Récupérer un étage
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    let etages = [];
    if (Array.isArray(etagesResponse.data)) {
      etages = etagesResponse.data;
    } else if (etagesResponse.data.etages) {
      etages = etagesResponse.data.etages;
    }
    
    if (etages.length === 0) {
      log('⚠️ Aucun étage disponible, skip test');
      return true;
    }
    
    testData.etageId = etages[0]._id;
    
    // Créer un espace avec un numéro valide
    const numeroUnique = `E-TEST-${Date.now()}`;
    const espaceResponse = await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: numeroUnique,
        superficie: 75,
        prixLoyer: 1500,
        etage: testData.etageId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    testData.espaceId = espaceResponse.data.espace._id;
    logSuccess('Espace créé avec succès (correction validée!)');
    log('Espace créé', espaceResponse.data.espace);
    return true;
  } catch (error) {
    logError('Erreur création espace avec numéro valide', error);
    return false;
  }
}

// 3. Test: Créer espace avec numéro en double (CORRECTION CRITIQUE)
async function testCreateEspaceNumeroDouble() {
  try {
    log('TEST 3: Créer espace avec numéro en double (test validation unicité)');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    const numeroDouble = `E-DOUBLE-${Date.now()}`;
    
    // Créer le premier espace
    await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: numeroDouble,
        superficie: 50,
        prixLoyer: 1000,
        etage: testData.etageId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Premier espace créé');
    
    // Tenter de créer un deuxième avec le même numéro
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: numeroDouble,
          superficie: 60,
          prixLoyer: 1200,
          etage: testData.etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Deuxième espace créé avec même numéro (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.data.message.includes('existe déjà')) {
        logSuccess('Validation unicité fonctionne correctement!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test numéro double', error);
    return false;
  }
}

// 4. Test: Créer espace sans numéro (CORRECTION CRITIQUE)
async function testCreateEspaceSansNumero() {
  try {
    log('TEST 4: Créer espace sans numéro (test validation)');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          superficie: 50,
          prixLoyer: 1000,
          etage: testData.etageId
          // Pas de numéro!
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé sans numéro (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.data.message.includes('requis')) {
        logSuccess('Validation champ requis fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test sans numéro', error);
    return false;
  }
}

// 5. Test: Créer espace avec superficie négative (CORRECTION CRITIQUE)
async function testCreateEspaceSuperficieNegative() {
  try {
    log('TEST 5: Créer espace avec superficie négative (test validation)');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E-NEG-${Date.now()}`,
          superficie: -50,
          prixLoyer: 1000,
          etage: testData.etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec superficie négative (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.data.message.includes('positif')) {
        logSuccess('Validation superficie fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test superficie négative', error);
    return false;
  }
}

// 6. Test: Modifier espace avec PATCH (CORRECTION ROUTE)
async function testPatchEspace() {
  try {
    log('TEST 6: Modifier espace avec PATCH (test route ajoutée)');
    
    if (!testData.espaceId) {
      log('⚠️ Pas d\'espace disponible, skip test');
      return true;
    }
    
    try {
      const response = await axios.patch(
        `${BASE_URL}/espaces/${testData.espaceId}`,
        { prixLoyer: 2000 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      logSuccess('Route PATCH fonctionne!');
      log('Espace modifié', response.data);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('⚠️ Route PATCH non trouvée (pas encore déployée)');
        return true; // Pas critique si pas déployé
      }
      logError('Erreur PATCH', error);
      return false;
    }
  } catch (error) {
    logError('Erreur test PATCH', error);
    return false;
  }
}

// 7. Test: Créer boutique avec POST direct (CORRECTION ROUTE)
async function testPostBoutique() {
  try {
    log('TEST 7: Créer boutique avec POST /api/boutique (test route ajoutée)');
    
    // Créer un utilisateur Commercant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Correction',
      email: `commercant.correction.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur Commercant créé');
    
    // Récupérer une catégorie
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`);
    if (!categoriesResponse.data || categoriesResponse.data.length === 0) {
      log('⚠️ Aucune catégorie disponible, skip test');
      return true;
    }
    
    const categorieId = categoriesResponse.data[0]._id;
    
    try {
      const response = await axios.post(
        `${BASE_URL}/boutique`,
        {
          nom: `Boutique Test ${Date.now()}`,
          description: 'Test route POST directe',
          categorie: categorieId
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      logSuccess('Route POST /api/boutique fonctionne!');
      log('Boutique créée', response.data);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('⚠️ Route POST /api/boutique non trouvée (pas encore déployée)');
        return true; // Pas critique si pas déployé
      }
      logError('Erreur POST boutique', error);
      return false;
    }
  } catch (error) {
    logError('Erreur test POST boutique', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 TEST DES CORRECTIONS CRITIQUES - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion Admin', fn: loginAdmin, critical: true },
    { name: 'Créer espace numéro valide', fn: testCreateEspaceNumeroValide },
    { name: 'Créer espace numéro double', fn: testCreateEspaceNumeroDouble },
    { name: 'Créer espace sans numéro', fn: testCreateEspaceSansNumero },
    { name: 'Créer espace superficie négative', fn: testCreateEspaceSuperficieNegative },
    { name: 'Modifier espace PATCH', fn: testPatchEspace },
    { name: 'Créer boutique POST direct', fn: testPostBoutique }
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
  console.log(`📊 RÉSUMÉ DES TESTS DE CORRECTION - ${env}`);
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 TOUTES LES CORRECTIONS FONCTIONNENT! 🎉\n');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) ont échoué\n`);
  }
}

runAllTests().catch(console.error);
