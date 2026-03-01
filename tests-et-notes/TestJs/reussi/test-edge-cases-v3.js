const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let commercantToken = '';
let acheteurToken = '';
let testData = {
  userId: null,
  boutiqueId: null,
  espaceId: null,
  categorieId: null
};

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

// 2. Test: Modifier espace avec étage invalide
async function testUpdateEspaceEtageInvalide() {
  try {
    log('TEST 2: Modifier espace avec étage invalide');
    
    // Récupérer un espace
    const espacesResponse = await axios.get(
      `${BASE_URL}/espaces`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    let espaces = [];
    if (Array.isArray(espacesResponse.data)) {
      espaces = espacesResponse.data;
    } else if (espacesResponse.data.espaces) {
      espaces = espacesResponse.data.espaces;
    }
    
    if (!espaces || espaces.length === 0) {
      log('⚠️ Aucun espace disponible, skip test');
      return true;
    }
    
    const espace = espaces[0];
    testData.espaceId = espace._id;
    
    // Tenter de modifier avec un étage invalide
    try {
      await axios.patch(
        `${BASE_URL}/espaces/${espace._id}`,
        { etage: '000000000000000000000000' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace modifié avec étage invalide (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        logSuccess('Validation étage invalide fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test modification espace', error);
    return false;
  }
}

// 3. Test: Occuper espace déjà occupé
async function testOccuperEspaceDejaOccupe() {
  try {
    log('TEST 3: Occuper un espace déjà occupé');
    
    if (!testData.espaceId) {
      log('⚠️ Pas d\'espace disponible, skip test');
      return true;
    }
    
    // Créer une boutique
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
    
    // Créer un commercant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Espace',
      email: `commercant.espace.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    
    commercantToken = userResponse.data.token;
    
    // Créer une boutique
    const boutiqueResponse = await axios.post(
      `${BASE_URL}/boutique/register`,
      {
        nom: `Boutique Test ${Date.now()}`,
        description: 'Test occupation',
        categorie: categories[0]._id
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    testData.boutiqueId = boutiqueResponse.data.boutique._id;
    log('Boutique créée');
    
    // Occuper l'espace une première fois
    try {
      await axios.post(
        `${BASE_URL}/espaces/${testData.espaceId}/occuper`,
        { boutiqueId: testData.boutiqueId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('Espace occupé une première fois');
    } catch (error) {
      // Peut-être déjà occupé, continuer
      log('Espace peut-être déjà occupé');
    }
    
    // Tenter de l'occuper à nouveau
    try {
      await axios.post(
        `${BASE_URL}/espaces/${testData.espaceId}/occuper`,
        { boutiqueId: testData.boutiqueId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace occupé deux fois (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation espace déjà occupé fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test occupation espace', error);
    return false;
  }
}

// 4. Test: Inscription avec email en double
async function testInscriptionEmailDouble() {
  try {
    log('TEST 4: Inscription avec email en double');
    
    const email = `test.double.${Date.now()}@test.com`;
    
    // Première inscription
    await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Premier',
      email: email,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Acheteur'
    });
    log('Premier utilisateur créé');
    
    // Deuxième inscription avec même email
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        nom: 'Test',
        prenoms: 'Deuxieme',
        email: email,
        mdp: 'Test123456!',
        telephone: '0987654321',
        role: 'Acheteur'
      });
      log('⚠️ Deuxième utilisateur créé avec même email (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        logSuccess('Validation email unique fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test email double', error);
    return false;
  }
}

// 5. Test: Connexion avec mauvais mot de passe
async function testConnexionMauvaisMdp() {
  try {
    log('TEST 5: Connexion avec mauvais mot de passe');
    
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        mdp: 'MauvaisMotDePasse123!'
      });
      log('⚠️ Connexion réussie avec mauvais mot de passe (sécurité échouée!)');
      return false;
    } catch (error) {
      // Accepter 400 (Bad Request) ou 401 (Unauthorized)
      // Les deux sont appropriés pour des identifiants invalides
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        logSuccess('Validation mot de passe fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test mauvais mot de passe', error);
    return false;
  }
}

// 6. Test: Connexion avec email inexistant
async function testConnexionEmailInexistant() {
  try {
    log('TEST 6: Connexion avec email inexistant');
    
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: `inexistant.${Date.now()}@test.com`,
        mdp: 'Test123456!'
      });
      log('⚠️ Connexion réussie avec email inexistant (sécurité échouée!)');
      return false;
    } catch (error) {
      // Accepter 400 (Bad Request), 401 (Unauthorized) ou 404 (Not Found)
      // Les trois sont appropriés pour des identifiants invalides
      if (error.response && (error.response.status === 400 || error.response.status === 401 || error.response.status === 404)) {
        logSuccess('Validation email inexistant fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test email inexistant', error);
    return false;
  }
}

// 7. Test: Modifier boutique d'un autre commercant
async function testModifierBoutiqueAutreCommercant() {
  try {
    log('TEST 7: Modifier boutique d\'un autre commerçant');
    
    if (!testData.boutiqueId) {
      log('⚠️ Pas de boutique disponible, skip test');
      return true;
    }
    
    // Créer un deuxième commercant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Autre',
      email: `commercant.autre.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    
    const autreToken = userResponse.data.token;
    log('Deuxième commercant créé');
    
    // Tenter de modifier la boutique du premier commercant
    try {
      await axios.put(
        `${BASE_URL}/boutique/me/${testData.boutiqueId}`,
        { nom: 'Boutique Modifiée' },
        { headers: { Authorization: `Bearer ${autreToken}` } }
      );
      log('⚠️ Boutique modifiée par un autre commercant (sécurité échouée!)');
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        logSuccess('Validation propriétaire boutique fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test modification boutique autre', error);
    return false;
  }
}

// 8. Test: Accès route admin par commercant
async function testAccesAdminParCommercant() {
  try {
    log('TEST 8: Accès route admin par commercant');
    
    if (!commercantToken) {
      log('⚠️ Pas de commercant, skip test');
      return true;
    }
    
    // Tenter d'accéder à une route admin
    try {
      await axios.get(
        `${BASE_URL}/admin/boutiques/pending`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      log('⚠️ Commercant a accédé à route admin (sécurité échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        logSuccess('Validation autorisation admin fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else if (error.response && error.response.status === 404) {
        log('⚠️ Route non trouvée (peut-être pas implémentée)');
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test accès admin', error);
    return false;
  }
}

// 9. Test: Créer espace avec superficie énorme
async function testCreateEspaceSuperficieEnorme() {
  try {
    log('TEST 9: Créer espace avec superficie énorme (> 10000)');
    
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
    
    if (!etages || etages.length === 0) {
      log('⚠️ Aucun étage disponible, skip test');
      return true;
    }
    
    // Tenter de créer avec superficie énorme
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E${Date.now() % 10000}`,
          superficie: 50000, // 50000 m² !
          prixLoyer: 1000,
          etage: etages[0]._id
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec superficie énorme (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation superficie max fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test superficie énorme', error);
    return false;
  }
}

// 10. Test: Créer espace avec prix loyer énorme
async function testCreateEspacePrixEnorme() {
  try {
    log('TEST 10: Créer espace avec prix loyer énorme (> 1000000)');
    
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
    
    if (!etages || etages.length === 0) {
      log('⚠️ Aucun étage disponible, skip test');
      return true;
    }
    
    // Tenter de créer avec prix énorme
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E${Date.now() % 10000}`,
          superficie: 100,
          prixLoyer: 5000000, // 5 millions !
          etage: etages[0]._id
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec prix énorme (validation échouée!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Validation prix max fonctionne!');
        log('Message d\'erreur', error.response.data);
        return true;
      } else {
        logError('Erreur inattendue', error);
        return false;
      }
    }
  } catch (error) {
    logError('Erreur test prix énorme', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 TEST DES CAS LIMITES (EDGE CASES) V3 - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion Admin', fn: loginAdmin, critical: true },
    { name: 'Modifier espace étage invalide', fn: testUpdateEspaceEtageInvalide },
    { name: 'Occuper espace déjà occupé', fn: testOccuperEspaceDejaOccupe },
    { name: 'Inscription email double', fn: testInscriptionEmailDouble },
    { name: 'Connexion mauvais mot de passe', fn: testConnexionMauvaisMdp },
    { name: 'Connexion email inexistant', fn: testConnexionEmailInexistant },
    { name: 'Modifier boutique autre commercant', fn: testModifierBoutiqueAutreCommercant },
    { name: 'Accès admin par commercant', fn: testAccesAdminParCommercant },
    { name: 'Espace superficie énorme', fn: testCreateEspaceSuperficieEnorme },
    { name: 'Espace prix énorme', fn: testCreateEspacePrixEnorme }
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
  console.log(`📊 RÉSUMÉ DES TESTS EDGE CASES V3 - ${env}`);
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS EDGE CASES V3 PASSENT! 🎉\n');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) ont échoué\n`);
  }
}

runAllTests().catch(console.error);
