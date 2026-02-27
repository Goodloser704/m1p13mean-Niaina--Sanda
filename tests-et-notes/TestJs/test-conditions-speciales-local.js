const axios = require('axios');

// Configuration LOCAL
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let testData = {
  centreId: null,
  etageId: null,
  espaceId: null,
  boutiqueId: null,
  categorieId: null,
  produitId: null,
  userId: null
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

// 2. Test: Supprimer une boutique avec des produits
async function testDeleteBoutiqueAvecProduits() {
  try {
    log('TEST 2: Supprimer boutique avec produits');
    
    // Créer une catégorie
    const catResponse = await axios.post(
      `${BASE_URL}/categories-boutique`,
      { nom: 'Test Catégorie Spéciale' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testData.categorieId = catResponse.data._id;
    log('Catégorie créée', { id: testData.categorieId });
    
    // Créer un utilisateur commerçant
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'Test',
      prenom: 'Commercant',
      email: `commercant.special.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0123456789',
      role: 'commercant'
    });
    testData.userId = userResponse.data.user._id;
    const userToken = userResponse.data.token;
    log('Utilisateur créé', { id: testData.userId });
    
    // Créer une boutique
    const boutiqueResponse = await axios.post(
      `${BASE_URL}/boutique`,
      {
        nom: 'Boutique Test Spéciale',
        description: 'Test suppression avec produits',
        categorie: testData.categorieId
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testData.boutiqueId = boutiqueResponse.data._id;
    log('Boutique créée', { id: testData.boutiqueId });
    
    // Créer plusieurs produits
    for (let i = 1; i <= 3; i++) {
      const produitResponse = await axios.post(
        `${BASE_URL}/produits`,
        {
          nom: `Produit Test ${i}`,
          description: `Description produit ${i}`,
          prix: 100 * i,
          stock: 10,
          boutique: testData.boutiqueId
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      log(`Produit ${i} créé`, { id: produitResponse.data._id });
    }
    
    // Vérifier les produits de la boutique
    const produitsResponse = await axios.get(
      `${BASE_URL}/produits/boutique/${testData.boutiqueId}`
    );
    log('Produits de la boutique', { count: produitsResponse.data.length });
    
    // Tenter de supprimer la boutique (devrait échouer ou supprimer en cascade)
    try {
      await axios.delete(
        `${BASE_URL}/boutique/${testData.boutiqueId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      logSuccess('Boutique supprimée (avec cascade?)');
      
      // Vérifier si les produits existent encore
      try {
        const checkProduits = await axios.get(
          `${BASE_URL}/produits/boutique/${testData.boutiqueId}`
        );
        log('⚠️ Produits encore présents après suppression boutique', { count: checkProduits.data.length });
      } catch (err) {
        logSuccess('Produits supprimés en cascade');
      }
    } catch (error) {
      log('❌ Suppression boutique bloquée (comportement attendu si produits)', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test boutique avec produits', error);
    return false;
  }
}

// 3. Test: Créer un espace sans étage (condition invalide)
async function testCreateEspaceSansEtage() {
  try {
    log('TEST 3: Créer espace sans étage valide');
    
    // Tenter de créer un espace avec un ID d'étage invalide
    try {
      await axios.post(
        `${BASE_URL}/espaces`,
        {
          numero: 'E-INVALID',
          superficie: 50,
          prixLoyer: 1000,
          etage: '000000000000000000000000' // ID invalide
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Espace créé avec étage invalide (problème!)');
    } catch (error) {
      logSuccess('Création espace bloquée avec étage invalide (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test espace sans étage', error);
    return false;
  }
}

// 4. Test: Modifier un étage avec des espaces occupés
async function testModifierEtageAvecEspacesOccupes() {
  try {
    log('TEST 4: Modifier étage avec espaces occupés');
    
    // Créer centre commercial
    const centreResponse = await axios.post(
      `${BASE_URL}/centre-commercial`,
      {
        nom: 'Centre Test Modification',
        adresse: '123 Test Street',
        ville: 'TestVille',
        codePostal: '12345'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testData.centreId = centreResponse.data._id;
    log('Centre créé', { id: testData.centreId });
    
    // Créer étage
    const etageResponse = await axios.post(
      `${BASE_URL}/etages`,
      {
        numero: 1,
        nom: 'Étage Test Modification',
        centreCommercial: testData.centreId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testData.etageId = etageResponse.data._id;
    log('Étage créé', { id: testData.etageId });
    
    // Créer espace
    const espaceResponse = await axios.post(
      `${BASE_URL}/espaces`,
      {
        numero: 'E-MOD-01',
        superficie: 75,
        prixLoyer: 1500,
        etage: testData.etageId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testData.espaceId = espaceResponse.data._id;
    log('Espace créé', { id: testData.espaceId });
    
    // Marquer l'espace comme occupé
    await axios.patch(
      `${BASE_URL}/espaces/${testData.espaceId}`,
      { statut: 'occupe' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Espace marqué comme occupé');
    
    // Tenter de modifier l'étage (changer le numéro)
    try {
      await axios.put(
        `${BASE_URL}/etages/${testData.etageId}`,
        {
          numero: 99,
          nom: 'Étage Modifié'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      logSuccess('Étage modifié malgré espaces occupés');
    } catch (error) {
      log('⚠️ Modification étage bloquée', error.response?.data);
    }
    
    // Vérifier l'état de l'espace
    const checkEspace = await axios.get(
      `${BASE_URL}/espaces/${testData.espaceId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('État espace après modification étage', checkEspace.data);
    
    return true;
  } catch (error) {
    logError('Erreur test modification étage', error);
    return false;
  }
}

// 5. Test: Supprimer un centre commercial avec étages et espaces
async function testDeleteCentreAvecHierarchie() {
  try {
    log('TEST 5: Supprimer centre avec hiérarchie complète');
    
    // Créer centre
    const centreResponse = await axios.post(
      `${BASE_URL}/centre-commercial`,
      {
        nom: 'Centre Test Hiérarchie',
        adresse: '456 Test Avenue',
        ville: 'TestCity',
        codePostal: '54321'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const centreId = centreResponse.data._id;
    log('Centre créé', { id: centreId });
    
    // Créer 2 étages
    const etages = [];
    for (let i = 1; i <= 2; i++) {
      const etageResponse = await axios.post(
        `${BASE_URL}/etages`,
        {
          numero: i,
          nom: `Étage ${i}`,
          centreCommercial: centreId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      etages.push(etageResponse.data._id);
      log(`Étage ${i} créé`, { id: etageResponse.data._id });
      
      // Créer 2 espaces par étage
      for (let j = 1; j <= 2; j++) {
        const espaceResponse = await axios.post(
          `${BASE_URL}/espaces`,
          {
            numero: `E-${i}-${j}`,
            superficie: 50,
            prixLoyer: 1000,
            etage: etageResponse.data._id
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        log(`Espace ${i}-${j} créé`, { id: espaceResponse.data._id });
      }
    }
    
    // Vérifier la hiérarchie
    const statsResponse = await axios.get(
      `${BASE_URL}/centre-commercial/${centreId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('Stats centre avant suppression', statsResponse.data);
    
    // Tenter de supprimer le centre
    try {
      await axios.delete(
        `${BASE_URL}/centre-commercial/${centreId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      logSuccess('Centre supprimé');
      
      // Vérifier si les étages existent encore
      for (const etageId of etages) {
        try {
          await axios.get(
            `${BASE_URL}/etages/${etageId}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          log('⚠️ Étage encore présent après suppression centre', { id: etageId });
        } catch (err) {
          logSuccess(`Étage ${etageId} supprimé en cascade`);
        }
      }
    } catch (error) {
      log('❌ Suppression centre bloquée', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test suppression centre', error);
    return false;
  }
}

// 6. Test: Créer produit avec stock négatif
async function testCreateProduitStockNegatif() {
  try {
    log('TEST 6: Créer produit avec stock négatif');
    
    if (!testData.boutiqueId) {
      log('⚠️ Pas de boutique disponible, skip test');
      return true;
    }
    
    // Tenter de créer un produit avec stock négatif
    try {
      await axios.post(
        `${BASE_URL}/produits`,
        {
          nom: 'Produit Stock Négatif',
          description: 'Test validation',
          prix: 100,
          stock: -10,
          boutique: testData.boutiqueId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('⚠️ Produit créé avec stock négatif (problème de validation!)');
    } catch (error) {
      logSuccess('Création produit bloquée avec stock négatif (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    return true;
  } catch (error) {
    logError('Erreur test produit stock négatif', error);
    return false;
  }
}

// 7. Test: Accès non autorisé aux routes admin
async function testAccesNonAutorise() {
  try {
    log('TEST 7: Accès non autorisé aux routes admin');
    
    // Créer un utilisateur simple
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nom: 'User',
      prenom: 'Simple',
      email: `user.simple.${Date.now()}@test.com`,
      mdp: 'Test123456!',
      telephone: '0987654321',
      role: 'client'
    });
    const userToken = userResponse.data.token;
    log('Utilisateur simple créé');
    
    // Tenter d'accéder à une route admin
    try {
      await axios.get(
        `${BASE_URL}/admin/boutiques/pending`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      log('⚠️ Accès admin autorisé pour utilisateur simple (problème de sécurité!)');
    } catch (error) {
      logSuccess('Accès admin bloqué pour utilisateur simple (comportement attendu)');
      log('Erreur reçue', error.response?.data);
    }
    
    // Tenter de créer un étage
    try {
      await axios.post(
        `${BASE_URL}/etages`,
        {
          numero: 99,
          nom: 'Étage Non Autorisé',
          centreCommercial: testData.centreId || '000000000000000000000000'
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      log('⚠️ Création étage autorisée pour utilisateur simple (problème!)');
    } catch (error) {
      logSuccess('Création étage bloquée pour utilisateur simple (comportement attendu)');
    }
    
    return true;
  } catch (error) {
    logError('Erreur test accès non autorisé', error);
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('\n🚀 DÉBUT DES TESTS CONDITIONS SPÉCIALES - LOCAL\n');
  
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
  
  // Test 2: Boutique avec produits
  results.total++;
  if (await testDeleteBoutiqueAvecProduits()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 3: Espace sans étage
  results.total++;
  if (await testCreateEspaceSansEtage()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 4: Modifier étage avec espaces occupés
  results.total++;
  if (await testModifierEtageAvecEspacesOccupes()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 5: Supprimer centre avec hiérarchie
  results.total++;
  if (await testDeleteCentreAvecHierarchie()) {
    results.success++;
  } else {
    results.failed++;
  }
  
  // Test 6: Produit stock négatif
  results.total++;
  if (await testCreateProduitStockNegatif()) {
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
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS - LOCAL');
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

runAllTests().catch(console.error);
