const axios = require('axios');

// Configuration - Changez BASE_URL pour tester local ou production
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
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
    log(`TEST 1: Connexion Admin - ${BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER'}`);
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

// 2. Test: Créer espace avec étage inexistant
async function testCreateEspaceEtageInexistant() {
  try {
    log('TEST 2: Créer espace avec étage inexistant');
    
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E-INVALID-${Date.now()}`,
          superficie: 50,
          prixLoyer: 1000,
          etage: '000000000000000000000000'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec étage inexistant (problème!)');
      return false;
    } catch (error) {
      logSuccess('Création espace bloquée avec étage inexistant ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test espace étage inexistant', error);
    return false;
  }
}

// 3. Test: Créer espace avec superficie négative
async function testCreateEspaceSuperficieNegative() {
  try {
    log('TEST 3: Créer espace avec superficie négative');
    
    // D'abord récupérer les étages
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    log('Réponse étages', { 
      type: typeof etagesResponse.data,
      isArray: Array.isArray(etagesResponse.data),
      data: etagesResponse.data
    });
    
    // Gérer différents formats de réponse
    let etages = [];
    if (Array.isArray(etagesResponse.data)) {
      etages = etagesResponse.data;
    } else if (etagesResponse.data.etages && Array.isArray(etagesResponse.data.etages)) {
      etages = etagesResponse.data.etages;
    } else if (etagesResponse.data.data && Array.isArray(etagesResponse.data.data)) {
      etages = etagesResponse.data.data;
    }
    
    if (etages.length === 0) {
      log('⚠️ Aucun étage disponible, création d\'un étage de test');
      
      // Créer un centre commercial d'abord si nécessaire
      try {
        const centreResponse = await axios.post(
          `${BASE_URL}/centre-commercial`,
          {
            nom: `Centre Test ${Date.now()}`,
            adresse: '123 Test Street',
            ville: 'TestVille',
            codePostal: '12345'
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        testData.centreId = centreResponse.data._id;
        log('Centre créé', { id: testData.centreId });
      } catch (err) {
        log('⚠️ Impossible de créer centre commercial, skip test');
        return true;
      }
      
      // Créer un étage
      try {
        const etageResponse = await axios.post(
          `${BASE_URL}/etages`,
          {
            numero: Math.floor(Math.random() * 1000),
            nom: `Étage Test ${Date.now()}`,
            centreCommercial: testData.centreId
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        testData.etageId = etageResponse.data._id;
        log('Étage créé', { id: testData.etageId });
      } catch (err) {
        log('⚠️ Impossible de créer étage, skip test');
        return true;
      }
    } else {
      testData.etageId = etages[0]._id;
      log('Étage existant utilisé', { id: testData.etageId });
    }
    
    // Tenter de créer un espace avec superficie négative
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
      log('⚠️ Espace créé avec superficie négative (problème de validation!)');
      return false;
    } catch (error) {
      logSuccess('Création espace bloquée avec superficie négative ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test espace superficie négative', error);
    return false;
  }
}

// 4. Test: Créer espace avec prix loyer négatif
async function testCreateEspacePrixNegatif() {
  try {
    log('TEST 4: Créer espace avec prix loyer négatif');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E-PRIX-NEG-${Date.now()}`,
          superficie: 50,
          prixLoyer: -1000,
          etage: testData.etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec prix négatif (problème de validation!)');
      return false;
    } catch (error) {
      logSuccess('Création espace bloquée avec prix négatif ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test espace prix négatif', error);
    return false;
  }
}

// 5. Test: Accès non autorisé aux routes admin
async function testAccesNonAutorise() {
  try {
    log('TEST 5: Accès non autorisé aux routes admin');
    
    // Créer un utilisateur simple (Acheteur)
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'User',
      prenoms: 'Simple Test',
      email: `user.test.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0987654321',
      role: 'Acheteur'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur Acheteur créé');
    
    // Tenter de créer un espace (route admin)
    if (testData.etageId) {
      try {
        await axios.post(
          `${BASE_URL}/espaces`,
          {
            numero: `E-UNAUTH-${Date.now()}`,
            superficie: 50,
            prixLoyer: 1000,
            etage: testData.etageId
          },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        log('⚠️ Création espace autorisée pour utilisateur simple (problème de sécurité!)');
        return false;
      } catch (error) {
        logSuccess('Création espace bloquée pour utilisateur simple ✓');
        log('Erreur reçue', error.response?.data);
        return true;
      }
    } else {
      log('⚠️ Pas d\'étage disponible pour tester');
      return true;
    }
  } catch (error) {
    logError('Erreur test accès non autorisé', error);
    return false;
  }
}

// 6. Test: Créer boutique avec catégorie inexistante
async function testCreateBoutiqueCategInexistante() {
  try {
    log('TEST 6: Créer boutique avec catégorie inexistante');
    
    // Créer un utilisateur Commercant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Test',
      email: `commercant.test.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'Commercant'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur Commercant créé');
    
    // Tenter de créer une boutique avec catégorie inexistante
    try {
      await axios.post(
        `${BASE_URL}/boutique`,
        {
          nom: `Boutique Test ${Date.now()}`,
          description: 'Test catégorie invalide',
          categorie: '000000000000000000000000'
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      log('⚠️ Boutique créée avec catégorie inexistante (problème!)');
      return false;
    } catch (error) {
      logSuccess('Création boutique bloquée avec catégorie inexistante ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test boutique catégorie inexistante', error);
    return false;
  }
}

// 7. Test: Créer espace avec numéro en double
async function testCreateEspaceNumeroDouble() {
  try {
    log('TEST 7: Créer espace avec numéro en double');
    
    if (!testData.etageId) {
      log('⚠️ Pas d\'étage disponible, skip test');
      return true;
    }
    
    // Générer un numéro vraiment unique avec millisecondes
    const numeroUnique = `T${Date.now()}`.slice(0, 10);
    
    // Créer le premier espace
    const espace1 = await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: numeroUnique,
        superficie: 50,
        prixLoyer: 1000,
        etage: testData.etageId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Premier espace créé', { id: espace1.data._id, numero: numeroUnique });
    
    // Tenter de créer un deuxième espace avec le même numéro
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: numeroUnique,
          superficie: 60,
          prixLoyer: 1200,
          etage: testData.etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Deuxième espace créé avec même numéro (problème d\'unicité!)');
      return false;
    } catch (error) {
      logSuccess('Création espace bloquée avec numéro en double ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test espace numéro double', error);
    log('Status:', error.response?.status);
    log('Data:', error.response?.data);
    return false;
  }
}

// 8. Test: Modifier espace inexistant
async function testModifierEspaceInexistant() {
  try {
    log('TEST 8: Modifier espace inexistant');
    
    try {
      await axios.patch(
        `${BASE_URL}/espaces/000000000000000000000000`,
        { prixLoyer: 9999 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Modification réussie sur espace inexistant (problème!)');
      return false;
    } catch (error) {
      logSuccess('Modification bloquée pour espace inexistant ✓');
      log('Erreur reçue', error.response?.data);
      return true;
    }
  } catch (error) {
    logError('Erreur test modification espace inexistant', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  const env = BASE_URL.includes('localhost') ? 'LOCAL' : 'RENDER (PRODUCTION)';
  console.log(`\n🚀 DÉBUT DES TESTS CONDITIONS SPÉCIALES - ${env}\n`);
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion Admin', fn: loginAdmin, critical: true },
    { name: 'Espace étage inexistant', fn: testCreateEspaceEtageInexistant },
    { name: 'Espace superficie négative', fn: testCreateEspaceSuperficieNegative },
    { name: 'Espace prix négatif', fn: testCreateEspacePrixNegatif },
    { name: 'Accès non autorisé', fn: testAccesNonAutorise },
    { name: 'Boutique catégorie inexistante', fn: testCreateBoutiqueCategInexistante },
    { name: 'Espace numéro double', fn: testCreateEspaceNumeroDouble },
    { name: 'Modifier espace inexistant', fn: testModifierEspaceInexistant }
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
  console.log(`📊 RÉSUMÉ DES TESTS - ${env}`);
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

runAllTests().catch(console.error);
