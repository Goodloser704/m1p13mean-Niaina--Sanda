/**
 * 🧪 SCRIPT DE TEST COMPLET - TOUTES LES FONCTIONS SPÉCIFIÉES
 * Basé sur note/Liste-des-fonctions.txt
 * 
 * Ce script teste TOUTES les fonctions listées dans les spécifications
 * organisées par service et par rôle (Admin, Commercant, Acheteur)
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Variables globales pour stocker les données de test
let testData = {
  admin: { token: null, userId: null },
  commercant: { token: null, userId: null, boutiqueId: null, produitId: null },
  acheteur: { token: null, userId: null, factureId: null, achatId: null },
  centreCommercialId: null,
  etageId: null,
  espaceId: null,
  categorieId: null,
  typeProduitId: null,
  demandeLocationId: null
};

// Compteurs de résultats
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};


// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logTest(name, status, details = '') {
  stats.total++;
  if (status === 'PASS') {
    stats.passed++;
    // Ne pas afficher les tests réussis
  } else if (status === 'FAIL') {
    stats.failed++;
    log(`❌ ${name}`, 'red');
    if (details) {
      log(`   ${details}`, 'reset');
    }
  } else if (status === 'SKIP') {
    stats.skipped++;
    log(`⏭️  ${name}`, 'yellow');
    if (details) {
      log(`   ${details}`, 'reset');
    }
  }
}

async function testEndpoint(config) {
  const { name, method, url, data, headers, expectedStatus = 200, skipOnError = false } = config;
  
  try {
    const response = await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      headers,
      validateStatus: () => true
    });

    if (response.status === expectedStatus) {
      logTest(name, 'PASS');
      return { success: true, data: response.data, status: response.status };
    } else {
      // Afficher les détails de l'erreur
      let errorDetails = `Status: ${response.status} (attendu: ${expectedStatus})`;
      
      // Ajouter le message d'erreur du serveur
      if (response.data) {
        if (response.data.message) {
          errorDetails += `\n   Message: ${response.data.message}`;
        }
        if (response.data.errors && Array.isArray(response.data.errors)) {
          errorDetails += `\n   Erreurs de validation:`;
          response.data.errors.forEach(err => {
            errorDetails += `\n     - ${err.msg || err.message} (${err.param || err.path})`;
          });
        }
        // Afficher la réponse complète si elle est courte
        if (typeof response.data === 'object' && JSON.stringify(response.data).length < 200) {
          errorDetails += `\n   Réponse: ${JSON.stringify(response.data, null, 2)}`;
        }
      }
      
      logTest(name, 'FAIL', errorDetails);
      return { success: false, data: response.data, status: response.status };
    }
  } catch (error) {
    if (skipOnError) {
      logTest(name, 'SKIP', `Erreur réseau: ${error.message}`);
      return { success: false, skipped: true };
    }
    
    let errorDetails = `Erreur: ${error.message}`;
    if (error.response) {
      errorDetails += `\n   Status: ${error.response.status}`;
      if (error.response.data) {
        errorDetails += `\n   Réponse: ${JSON.stringify(error.response.data, null, 2)}`;
      }
    }
    
    logTest(name, 'FAIL', errorDetails);
    return { success: false, error: error.message };
  }
}


// ============================================================================
// 1. AUTHENTIFICATION & PROFIL – AuthService
// ============================================================================

async function testAuthService() {
  logSection('1. AUTHENTIFICATION & PROFIL – AuthService');

  // 1.1 registerUser - Inscription Acheteur
  const registerAcheteur = await testEndpoint({
    name: 'POST /api/auth/register (Acheteur)',
    method: 'POST',
    url: '/auth/register',
    data: {
      nom: 'Dupont',
      prenoms: 'Jean',
      email: `acheteur.test.${Date.now()}@example.com`,
      mdp: 'password123',
      role: 'Acheteur',
      telephone: '0612345678'
    },
    expectedStatus: 201
  });

  if (registerAcheteur.success) {
    testData.acheteur.token = registerAcheteur.data.token;
    testData.acheteur.userId = registerAcheteur.data.user._id;
  }

  // 1.2 registerUser - Inscription Commercant
  const registerCommercant = await testEndpoint({
    name: 'POST /api/auth/register (Commercant)',
    method: 'POST',
    url: '/auth/register',
    data: {
      nom: 'Martin',
      prenoms: 'Sophie',
      email: `commercant.test.${Date.now()}@example.com`,
      mdp: 'password123',
      role: 'Commercant',
      telephone: '0623456789'
    },
    expectedStatus: 201
  });

  if (registerCommercant.success) {
    testData.commercant.token = registerCommercant.data.token;
    testData.commercant.userId = registerCommercant.data.user._id;
  }

  // 1.3 login - Connexion Admin (créé manuellement)
  const loginAdmin = await testEndpoint({
    name: 'POST /api/auth/login (Admin)',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    },
    expectedStatus: 200,
    skipOnError: true
  });

  if (loginAdmin.success) {
    testData.admin.token = loginAdmin.data.token;
    testData.admin.userId = loginAdmin.data.user._id;
  }

  // 1.4 getMyProfile
  await testEndpoint({
    name: 'GET /api/auth/me',
    method: 'GET',
    url: '/auth/me',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });

  // 1.5 updateMyProfile
  await testEndpoint({
    name: 'PUT /api/auth/profile',
    method: 'PUT',
    url: '/auth/profile',
    data: {
      telephone: '0698765432'
    },
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });
}

// ============================================================================
// 2. NOTIFICATIONS – NotificationService
// ============================================================================

async function testNotificationService() {
  logSection('2. NOTIFICATIONS – NotificationService');

  // 2.1 getMyNotifications
  await testEndpoint({
    name: 'GET /api/notifications',
    method: 'GET',
    url: '/notifications?page=1&limit=10',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });
}

// ============================================================================
// 3. PORTEFEUILLE – PorteFeuilleService
// ============================================================================

async function testPorteFeuilleService() {
  logSection('3. PORTEFEUILLE – PorteFeuilleService');

  // 3.1 getMyWallet
  await testEndpoint({
    name: 'GET /api/portefeuille/me',
    method: 'GET',
    url: '/portefeuille/me',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });
}


// ============================================================================
// I - ADMIN SERVICES
// ============================================================================

async function testAdminServices() {
  logSection('I - ADMIN SERVICES');

  if (!testData.admin.token) {
    log('⚠️  Admin non connecté, tests Admin ignorés', 'yellow');
    return;
  }

  // Centre Commercial – updateCentreCommercial
  const updateCC = await testEndpoint({
    name: 'PUT /api/centre-commercial',
    method: 'PUT',
    url: '/centre-commercial',
    data: {
      nom: 'Centre Commercial Test',
      description: 'Description mise à jour',
      adresse: '123 Rue Test',
      email: 'contact@centre-test.com',
      telephone: '0123456789'
    },
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  if (updateCC.success) {
    testData.centreCommercialId = updateCC.data.centreCommercial?._id || updateCC.data._id;
  }

  // Étages – createEtage
  const numeroEtage = Math.floor(Math.random() * 10);
  const createEtage = await testEndpoint({
    name: 'POST /api/etages',
    method: 'POST',
    url: '/etages',
    data: { 
      numero: numeroEtage,
      nom: `Étage ${numeroEtage}`,
      description: 'Étage de test'
    },
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 201,
    skipOnError: true
  });

  if (createEtage.success) {
    testData.etageId = createEtage.data.etage?._id || createEtage.data._id;
  }

  // Espaces – createEspace
  const codeEspace = `T${Date.now().toString().slice(-3)}`;
  const createEspace = await testEndpoint({
    name: 'POST /api/espaces',
    method: 'POST',
    url: '/espaces',
    data: {
      centreCommercial: testData.centreCommercialId,
      code: codeEspace,
      codeEspace: codeEspace,
      surface: 50,
      etage: testData.etageId,
      loyer: 1500,
      description: 'Espace de test'
    },
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 201,
    skipOnError: true
  });

  if (createEspace.success) {
    testData.espaceId = createEspace.data.espace?._id || createEspace.data._id;
  }

  // Espaces – getEspace
  await testEndpoint({
    name: 'GET /api/espaces/:id',
    method: 'GET',
    url: `/espaces/${testData.espaceId}`,
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  // Espaces – getAllEspaces
  await testEndpoint({
    name: 'GET /api/espaces',
    method: 'GET',
    url: '/espaces',
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  // Catégories – createCategorie
  const createCategorie = await testEndpoint({
    name: 'POST /api/categories-boutique',
    method: 'POST',
    url: '/categories-boutique',
    data: { nom: `Test_${Date.now()}`, description: 'Catégorie de test' },
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 201,
    skipOnError: true
  });

  if (createCategorie.success) {
    testData.categorieId = createCategorie.data.categorie?._id || createCategorie.data._id;
  }

  // Catégories – getCategories
  await testEndpoint({
    name: 'GET /api/categories-boutique',
    method: 'GET',
    url: '/categories-boutique',
    expectedStatus: 200
  });

  // Demandes de location – getDemandesLocation
  await testEndpoint({
    name: 'GET /api/demandes-location',
    method: 'GET',
    url: '/demandes-location',
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  // Dashboard – getDashboardStats
  await testEndpoint({
    name: 'GET /api/admin/dashboard',
    method: 'GET',
    url: '/admin/dashboard',
    headers: { Authorization: `Bearer ${testData.admin.token}` },
    expectedStatus: 200,
    skipOnError: true
  });
}


// ============================================================================
// II - COMMERCANT SERVICES
// ============================================================================

async function testCommercantServices() {
  logSection('II - COMMERCANT SERVICES');

  if (!testData.commercant.token) {
    log('⚠️  Commercant non connecté, tests Commercant ignorés', 'yellow');
    return;
  }

  // Boutiques – createBoutique
  log('\n🏪 Test: createBoutique', 'blue');
  const createBoutique = await testEndpoint({
    name: 'POST /api/boutique/commercant/boutique',
    method: 'POST',
    url: '/boutique/commercant/boutique',
    data: {
      nom: `Boutique Test ${Date.now()}`,
      description: 'Une boutique de test',
      categorie: testData.categorieId,
      horairesHebdo: [
        { jour: 'Lundi', debut: '09:00', fin: '18:00' },
        { jour: 'Mardi', debut: '09:00', fin: '18:00' }
      ]
    },
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 201
  });

  if (createBoutique.success) {
    testData.commercant.boutiqueId = createBoutique.data.boutique._id;
    log(`   Boutique créée: ${testData.commercant.boutiqueId}`, 'reset');
  }

  // Boutiques – getBoutique
  log('\n🏪 Test: getBoutique', 'blue');
  await testEndpoint({
    name: 'GET /api/boutique/commercant/boutique/:id',
    method: 'GET',
    url: `/boutique/commercant/boutique/${testData.commercant.boutiqueId}`,
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 200
  });

  // Boutiques – getMyBoutiques
  log('\n🏪 Test: getMyBoutiques', 'blue');
  await testEndpoint({
    name: 'GET /api/boutique/my-boutiques',
    method: 'GET',
    url: '/boutique/my-boutiques',
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 200
  });

  // TypeProduit – createTypeProduit (pour les tests)
  log('\n📦 Test: createTypeProduit', 'blue');
  const createTypeProduit = await testEndpoint({
    name: 'POST /api/types-produit',
    method: 'POST',
    url: '/types-produit',
    data: { type: `Type_${Date.now()}` },
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 201,
    skipOnError: true
  });

  if (createTypeProduit.success) {
    testData.typeProduitId = createTypeProduit.data._id;
    log(`   Type Produit créé: ${testData.typeProduitId}`, 'reset');
  }


  // Produits – createProduit
  log('\n📦 Test: createProduit', 'blue');
  const createProduit = await testEndpoint({
    name: 'POST /api/produits',
    method: 'POST',
    url: '/produits',
    data: {
      nom: `Produit Test ${Date.now()}`,
      description: 'Un produit de test',
      prix: 29.99,
      typeProduit: testData.typeProduitId,
      boutique: testData.commercant.boutiqueId,
      tempsPreparation: '00:30:00',
      stock: { nombreDispo: 10 }
    },
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 201
  });

  if (createProduit.success) {
    testData.commercant.produitId = createProduit.data._id;
    log(`   Produit créé: ${testData.commercant.produitId}`, 'reset');
  }

  // Produits – updateStock
  log('\n📦 Test: updateStock', 'blue');
  await testEndpoint({
    name: 'PUT /api/produits/:id/stock',
    method: 'PUT',
    url: `/produits/${testData.commercant.produitId}/stock`,
    data: { nombreDispo: 15 },
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  // Demande de location (si espace disponible)
  if (testData.espaceId) {
    log('\n📋 Test: Créer demande de location', 'blue');
    const createDemande = await testEndpoint({
      name: 'POST /api/demandes-location',
      method: 'POST',
      url: '/demandes-location',
      data: {
        boutique: testData.commercant.boutiqueId,
        espace: testData.espaceId
      },
      headers: { Authorization: `Bearer ${testData.commercant.token}` },
      expectedStatus: 201,
      skipOnError: true
    });

    if (createDemande.success) {
      testData.demandeLocationId = createDemande.data._id;
      log(`   Demande créée: ${testData.demandeLocationId}`, 'reset');
    }
  }

  // Paiement loyer – payLoyer (nécessite une boutique avec espace)
  log('\n💳 Test: payLoyer', 'blue');
  await testEndpoint({
    name: 'POST /api/commercant/loyers/pay',
    method: 'POST',
    url: '/commercant/loyers/pay',
    data: { 
      boutiqueId: testData.commercant.boutiqueId,
      montant: 500,
      periode: '2026-02'
    },
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 200,
    skipOnError: true
  });

  // Achats Commercant – getAchatsEnCours
  log('\n🛒 Test: getAchatsEnCours (Commercant)', 'blue');
  await testEndpoint({
    name: 'GET /api/commercant/achats/en-cours',
    method: 'GET',
    url: '/commercant/achats/en-cours',
    headers: { Authorization: `Bearer ${testData.commercant.token}` },
    expectedStatus: 200,
    skipOnError: true
  });
}


// ============================================================================
// III - ACHETEUR SERVICES
// ============================================================================

async function testAcheteurServices() {
  logSection('III - ACHETEUR SERVICES');

  if (!testData.acheteur.token) {
    log('⚠️  Acheteur non connecté, tests Acheteur ignorés', 'yellow');
    return;
  }

  // Boutiques & Produits – getBoutiques
  log('\n🏪 Test: getBoutiques', 'blue');
  await testEndpoint({
    name: 'GET /api/boutiques',
    method: 'GET',
    url: '/boutique/boutiques?page=1&limit=10',
    expectedStatus: 200
  });

  // Boutiques & Produits – searchBoutiques
  log('\n🔍 Test: searchBoutiques', 'blue');
  await testEndpoint({
    name: 'GET /api/boutiques/search',
    method: 'GET',
    url: '/boutique/boutiques/search?keyword=test',
    expectedStatus: 200
  });

  // Boutiques & Produits – getProduitsByBoutique
  if (testData.commercant.boutiqueId) {
    log('\n📦 Test: getProduitsByBoutique', 'blue');
    await testEndpoint({
      name: 'GET /api/boutiques/:id/produits',
      method: 'GET',
      url: `/boutique/boutiques/${testData.commercant.boutiqueId}/produits`,
      expectedStatus: 200
    });
  }

  // Panier & Achat – validerPanier
  if (testData.commercant.produitId) {
    log('\n🛒 Test: validerPanier', 'blue');
    const validerPanier = await testEndpoint({
      name: 'POST /api/acheteur/:id/achats/panier/validate',
      method: 'POST',
      url: '/achats/panier/valider',
      data: {
        achats: [
          {
            produit: testData.commercant.produitId,
            quantite: 2,
            typeAchat: 'Recuperer',
            prixUnitaire: 29.99
          }
        ],
        montantTotal: 59.98
      },
      headers: { Authorization: `Bearer ${testData.acheteur.token}` },
      expectedStatus: 201
    });

    if (validerPanier.success) {
      testData.acheteur.factureId = validerPanier.data.facture?._id;
      testData.acheteur.achatId = validerPanier.data.achats?.[0]?._id;
      log(`   Facture créée: ${testData.acheteur.factureId}`, 'reset');
      log(`   Achat créé: ${testData.acheteur.achatId}`, 'reset');
    }
  }

  // Panier & Achat – getMyAchatsEnCours
  log('\n🛒 Test: getMyAchatsEnCours', 'blue');
  await testEndpoint({
    name: 'GET /api/acheteur/:id/achats/en-cours',
    method: 'GET',
    url: '/achats/en-cours',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });

  // Panier & Achat – getMyHistoriqueAchats
  log('\n🛒 Test: getMyHistoriqueAchats', 'blue');
  await testEndpoint({
    name: 'GET /api/acheteur/:id/achats/historique',
    method: 'GET',
    url: '/achats/historique',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });

  // Factures – getMyFactures
  log('\n🧾 Test: getMyFactures', 'blue');
  await testEndpoint({
    name: 'GET /api/acheteur/:id/factures',
    method: 'GET',
    url: '/achats/factures',
    headers: { Authorization: `Bearer ${testData.acheteur.token}` },
    expectedStatus: 200
  });
}


// ============================================================================
// TESTS SUPPLÉMENTAIRES
// ============================================================================

async function testAdditionalFeatures() {
  logSection('TESTS SUPPLÉMENTAIRES');

    // Test de notification après achat
    if (testData.acheteur.achatId) {
      log('\n🔔 Test: Vérifier notifications après achat', 'blue');
      const notifications = await testEndpoint({
        name: 'GET /api/notifications (après achat)',
        method: 'GET',
        url: '/notifications',
        headers: { Authorization: `Bearer ${testData.acheteur.token}` },
        expectedStatus: 200
      });

    // Marquer une notification comme lue
    if (notifications.success && notifications.data.data?.length > 0) {
      const notifId = notifications.data.data[0]._id;
      log('\n🔔 Test: markNotificationAsRead', 'blue');
      await testEndpoint({
        name: 'PUT /api/notifications/:id/read',
        method: 'PUT',
        url: `/notifications/${notifId}/read`,
        headers: { Authorization: `Bearer ${testData.acheteur.token}` },
        expectedStatus: 200
      });
    }
  }

  // Test Admin - Accepter demande de location
  if (testData.admin.token && testData.demandeLocationId) {
    log('\n✅ Test: updateDemandeEtat (Accepter)', 'blue');
    await testEndpoint({
      name: 'PUT /api/admin/demandes-location/:id (Accepter)',
      method: 'PUT',
      url: `/demandes-location/${testData.demandeLocationId}`,
      data: { etat: 'Acceptee' },
      headers: { Authorization: `Bearer ${testData.admin.token}` },
      expectedStatus: 200,
      skipOnError: true
    });
  }

  // Test Admin - getDemandeLocationParEtat
  if (testData.admin.token) {
    log('\n📋 Test: getDemandeLocationParEtat', 'blue');
    await testEndpoint({
      name: 'GET /api/admin/demandes-location/etat/:etat',
      method: 'GET',
      url: '/demandes-location/etat/EnAttente',
      headers: { Authorization: `Bearer ${testData.admin.token}` },
      expectedStatus: 200,
      skipOnError: true
    });
  }

  // Test Commercant - validerLivraison
  if (testData.commercant.token && testData.acheteur.achatId) {
    log('\n🚚 Test: validerLivraison', 'blue');
    await testEndpoint({
      name: 'PUT /api/commercant/achats/:id/livraison',
      method: 'PUT',
      url: `/commercant/achats/${testData.acheteur.achatId}/livraison`,
      data: { dureeLivraison: '02:00:00' },
      headers: { Authorization: `Bearer ${testData.commercant.token}` },
      expectedStatus: 200,
      skipOnError: true
    });
  }
}


// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function runAllTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 TEST COMPLET - TOUTES LES FONCTIONS SPÉCIFIÉES                     ║', 'cyan');
  log('║     Basé sur note/Liste-des-fonctions.txt                                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'blue');

  const startTime = Date.now();

  try {
    // 1. Tests Authentification & Profil
    await testAuthService();

    // 2. Tests Notifications
    await testNotificationService();

    // 3. Tests PorteFeuille
    await testPorteFeuilleService();

    // 4. Tests Admin
    await testAdminServices();

    // 5. Tests Commercant
    await testCommercantServices();

    // 6. Tests Acheteur
    await testAcheteurServices();

    // 7. Tests supplémentaires
    await testAdditionalFeatures();

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Afficher le résumé
  logSection('📊 RÉSUMÉ DES TESTS');
  
  console.log(`Total de tests:     ${stats.total}`);
  log(`✅ Réussis:         ${stats.passed}`, 'green');
  log(`❌ Échoués:         ${stats.failed}`, 'red');
  log(`⏭️  Ignorés:         ${stats.skipped}`, 'yellow');
  console.log(`⏱️  Durée:           ${duration}s`);
  
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  log(`\n📈 Taux de réussite: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // Afficher les données de test générées
  logSection('📝 DONNÉES DE TEST GÉNÉRÉES');
  console.log(JSON.stringify(testData, null, 2));

  // Recommandations
  logSection('💡 RECOMMANDATIONS');
  
  if (stats.failed > 0) {
    log('⚠️  Certains tests ont échoué. Vérifiez:', 'yellow');
    log('   - Le serveur backend est démarré', 'reset');
    log('   - La base de données est accessible', 'reset');
    log('   - Un compte Admin existe (email: admin@mallapp.com, mdp: admin123)', 'reset');
    log('   - Les routes sont correctement implémentées', 'reset');
  }

  if (stats.skipped > 0) {
    log('⚠️  Certains tests ont été ignorés:', 'yellow');
    log('   - Vérifiez que toutes les dépendances sont satisfaites', 'reset');
    log('   - Certaines fonctionnalités peuvent ne pas être implémentées', 'reset');
  }

  if (stats.passed === stats.total && stats.total > 0) {
    log('🎉 Tous les tests sont passés avec succès!', 'green');
    log('✅ L\'application est conforme aux spécifications', 'green');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
