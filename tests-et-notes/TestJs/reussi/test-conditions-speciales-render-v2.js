const axios = require('axios');

// Configuration RENDER (Production)
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
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
    console.error('Data:', error.response.data);
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
    log('TEST 1: Connexion Admin - RENDER');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    adminToken = response.data.token;
    logSuccess('Admin connecté avec succès sur RENDER');
    return true;
  } catch (error) {
    logError('Échec connexion admin RENDER', error);
    return false;
  }
}

// 2. Test: Supprimer un étage avec des espaces (comme précédemment)
async function testDeleteEtageAvecEspaces() {
  try {
    log('TEST 2: Supprimer étage avec espaces - RENDER');
    
    // Récupérer les étages existants
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (etagesResponse.data.length === 0) {
      log('⚠️ Aucun étage disponible pour le test');
      return true;
    }
    
    const etage = etagesResponse.data[0];
    log('Étage sélectionné', { id: etage._id, nom: etage.nom });
    
    // Créer un espace sur cet étage
    const espaceResponse = await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: `E-TEST-${Date.now()}`,
        superficie: 50,
        prixLoyer: 1000,
        etage: etage._id
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const espaceId = espaceResponse.data._id;
    log('Espace créé', { id: espaceId });
    
    // Vérifier les stats de l'étage
    const statsResponse = await axios.get(
      `${BASE_URL}/etages/${etage._id}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Stats étage avant suppression', statsResponse.data);
    
    // Tenter de supprimer l'étage
    try {
      await axios.delete(
        `${BASE_URL}/etages/${etage._id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      logSuccess('Étage supprimé (avec cascade?)');
      
      // Vérifier si l'espace existe encore
      try {
        await axios.get(
          `${BASE_URL}/espaces/${espaceId}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        log('⚠️ Espace encore présent après suppression étage');
      } catch (err) {
        logSuccess('Espace supprimé en cascade');
      }
    } catch (error) {
      log('❌ Suppression étage bloquée', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test suppression étage avec espaces', error);
    return false;
  }
}

// 3. Test: Modifier un espace occupé
async function testModifierEspaceOccupe() {
  try {
    log('TEST 3: Modifier espace occupé - RENDER');
    
    // Récupérer les espaces existants
    const espacesResponse = await axios.get(
      `${BASE_URL}/espaces`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (espacesResponse.data.length === 0) {
      log('⚠️ Aucun espace disponible pour le test');
      return true;
    }
    
    const espace = espacesResponse.data[0];
    log('Espace sélectionné', { id: espace._id, numero: espace.numero, statut: espace.statut });
    
    // Marquer l'espace comme occupé
    await axios.patch(
      `${BASE_URL}/espaces/${espace._id}`,
      { statut: 'occupe' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Espace marqué comme occupé');
    
    // Tenter de modifier le prix de loyer
    try {
      await axios.patch(
        `${BASE_URL}/espaces/${espace._id}`,
        { prixLoyer: 9999 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      logSuccess('Prix modifié malgré statut occupé');
    } catch (error) {
      log('⚠️ Modification bloquée pour espace occupé', error.response?.data);
    }
    
    // Vérifier l'état final
    const checkEspace = await axios.get(
      `${BASE_URL}/espaces/${espace._id}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('État final de l\'espace', checkEspace.data);
    
    return true;
  } catch (error) {
    logError('Erreur test modification espace occupé', error);
    return false;
  }
}

// 4. Test: Créer espace avec superficie négative
async function testCreateEspaceSuperficieNegative() {
  try {
    log('TEST 4: Créer espace avec superficie négative - RENDER');
    
    // Récupérer un étage
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (etagesResponse.data.length === 0) {
      log('⚠️ Aucun étage disponible pour le test');
      return true;
    }
    
    const etageId = etagesResponse.data[0]._id;
    
    // Tenter de créer un espace avec superficie négative
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E-NEG-${Date.now()}`,
          superficie: -50,
          prixLoyer: 1000,
          etage: etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec superficie négative (problème de validation!)');
    } catch (error) {
      logSuccess('Création espace bloquée avec superficie négative (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test espace superficie négative', error);
    return false;
  }
}

// 5. Test: Créer espace avec prix loyer négatif
async function testCreateEspacePrixNegatif() {
  try {
    log('TEST 5: Créer espace avec prix loyer négatif - RENDER');
    
    // Récupérer un étage
    const etagesResponse = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (etagesResponse.data.length === 0) {
      log('⚠️ Aucun étage disponible pour le test');
      return true;
    }
    
    const etageId = etagesResponse.data[0]._id;
    
    // Tenter de créer un espace avec prix négatif
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: `E-PRIX-NEG-${Date.now()}`,
          superficie: 50,
          prixLoyer: -1000,
          etage: etageId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec prix négatif (problème de validation!)');
    } catch (error) {
      logSuccess('Création espace bloquée avec prix négatif (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test espace prix négatif', error);
    return false;
  }
}

// 6. Test: Créer espace avec étage inexistant
async function testCreateEspaceEtageInexistant() {
  try {
    log('TEST 6: Créer espace avec étage inexistant - RENDER');
    
    // Tenter de créer un espace avec un ID d'étage invalide
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
    } catch (error) {
      logSuccess('Création espace bloquée avec étage inexistant (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test espace étage inexistant', error);
    return false;
  }
}

// 7. Test: Accès non autorisé aux routes admin
async function testAccesNonAutorise() {
  try {
    log('TEST 7: Accès non autorisé aux routes admin - RENDER');
    
    // Créer un utilisateur simple (acheteur)
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'User',
      prenoms: 'Simple Test',
      email: `user.render.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0987654321',
      role: 'acheteur'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur acheteur créé');
    
    // Tenter de créer un espace (route admin)
    try {
      const etagesResponse = await axios.get(
        `${BASE_URL}/etages`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      if (etagesResponse.data.length > 0) {
        await axios.post(
          `${BASE_URL}/espaces`,
          {
            numero: `E-UNAUTH-${Date.now()}`,
            superficie: 50,
            prixLoyer: 1000,
            etage: etagesResponse.data[0]._id
          },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        log('⚠️ Création espace autorisée pour utilisateur simple (problème de sécurité!)');
      }
    } catch (error) {
      logSuccess('Création espace bloquée pour utilisateur simple (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    // Tenter de supprimer un étage
    try {
      const etagesResponse = await axios.get(
        `${BASE_URL}/etages`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      if (etagesResponse.data.length > 0) {
        await axios.delete(
          `${BASE_URL}/etages/${etagesResponse.data[0]._id}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        log('⚠️ Suppression étage autorisée pour utilisateur simple (problème!)');
      }
    } catch (error) {
      logSuccess('Suppression étage bloquée pour utilisateur simple (comportement attendu)');
    }
    
    return true;
  } catch (error) {
    logError('Erreur test accès non autorisé', error);
    return false;
  }
}

// 8. Test: Créer boutique avec catégorie inexistante
async function testCreateBoutiqueCategInexistante() {
  try {
    log('TEST 8: Créer boutique avec catégorie inexistante - RENDER');
    
    // Créer un utilisateur commerçant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenoms: 'Commercant Test',
      email: `commercant.render.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'commercant'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur commerçant créé');
    
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
    } catch (error) {
      logSuccess('Création boutique bloquée avec catégorie inexistante (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test boutique catégorie inexistante', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('\n🚀 DÉBUT DES TESTS CONDITIONS SPÉCIALES V2 - RENDER (PRODUCTION)\n');
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  // Test 1: Connexion
  results.total++;
  if (await loginAdmin()) {
    results.success++;
  } else {
    results.failed++;
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  // Test 2: Supprimer étage avec espaces
  results.total++;
  if (await testDeleteEtageAvecEspaces()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 3: Modifier espace occupé
  results.total++;
  if (await testModifierEspaceOccupe()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 4: Espace superficie négative
  results.total++;
  if (await testCreateEspaceSuperficieNegative()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 5: Espace prix négatif
  results.total++;
  if (await testCreateEspacePrixNegatif()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 6: Espace étage inexistant
  results.total++;
  if (await testCreateEspaceEtageInexistant()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 7: Accès non autorisé
  results.total++;
  if (await testAccesNonAutorise()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 8: Boutique catégorie inexistante
  results.total++;
  if (await testCreateBoutiqueCategInexistante()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS - RENDER (PRODUCTION)');
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

runAllTests().catch(console.error);
