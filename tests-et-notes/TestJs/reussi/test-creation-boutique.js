/**
 * 🏪 TEST CRÉATION BOUTIQUE
 * Test complet du flux de création de boutique avec catégories
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function testEndpoint(config) {
  const { name, method, url, data, headers, expectedStatus = 200 } = config;
  
  try {
    const fullUrl = `${API_URL}${url}`;
    log(`\n🧪 Test: ${name}`, 'cyan');
    log(`   URL: ${method} ${fullUrl}`, 'reset');
    
    const response = await axios({
      method,
      url: fullUrl,
      data,
      headers,
      validateStatus: () => true
    });

    const success = response.status === expectedStatus;
    const statusColor = success ? 'green' : 'red';
    const statusIcon = success ? '✅' : '❌';
    
    log(`   ${statusIcon} Status: ${response.status} (attendu: ${expectedStatus})`, statusColor);
    
    if (response.data) {
      if (response.data.message) {
        log(`   📝 Message: ${response.data.message}`, statusColor);
      }
      if (response.data._id) {
        log(`   🆔 ID: ${response.data._id}`, 'green');
      }
    }
    
    return { success, data: response.data, status: response.status };
  } catch (error) {
    log(`❌ ERREUR: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   Réponse: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🏪 TEST CRÉATION BOUTIQUE AVEC CATÉGORIES                             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  let stats = { total: 0, passed: 0, failed: 0 };
  let tokens = { commercant: null };
  let categorieId = null;

  // ============================================================================
  // ÉTAPE 1: CONNEXION COMMERÇANT
  // ============================================================================
  logSection('ÉTAPE 1: CONNEXION COMMERÇANT');

  stats.total++;
  const loginCommercant = await testEndpoint({
    name: 'Login Commerçant',
    method: 'POST',
    url: '/auth/login',
    data: {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    },
    expectedStatus: 200
  });

  if (loginCommercant.success) {
    tokens.commercant = loginCommercant.data.token;
    log(`✅ Token Commerçant récupéré`, 'green');
    stats.passed++;
  } else {
    log(`❌ Échec connexion commerçant`, 'red');
    stats.failed++;
    log('\n⚠️  Impossible de continuer sans token', 'yellow');
    return;
  }

  // ============================================================================
  // ÉTAPE 2: RÉCUPÉRER LES CATÉGORIES
  // ============================================================================
  logSection('ÉTAPE 2: RÉCUPÉRATION DES CATÉGORIES');

  stats.total++;
  const getCategories = await testEndpoint({
    name: 'GET /api/categories-boutique (avec token)',
    method: 'GET',
    url: '/categories-boutique',
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 200
  });

  if (getCategories.success && getCategories.data.categories) {
    const categories = getCategories.data.categories;
    log(`✅ ${categories.length} catégories récupérées`, 'green');
    stats.passed++;
    
    // Afficher les catégories disponibles
    log('\n📋 Catégories disponibles:', 'cyan');
    categories.forEach((cat, index) => {
      log(`   ${index + 1}. ${cat.nom} (ID: ${cat._id})`, 'reset');
      if (index === 0) {
        categorieId = cat._id;
        log(`      👉 Sera utilisée pour le test`, 'yellow');
      }
    });
  } else {
    log(`❌ Échec récupération catégories`, 'red');
    stats.failed++;
    log('\n⚠️  Impossible de continuer sans catégorie', 'yellow');
    return;
  }

  // ============================================================================
  // ÉTAPE 3: CRÉER UNE BOUTIQUE
  // ============================================================================
  logSection('ÉTAPE 3: CRÉATION BOUTIQUE');

  const boutiqueData = {
    nom: `Boutique Test ${Date.now()}`,
    description: 'Boutique de test créée automatiquement',
    categorie: categorieId, // ✅ ObjectId de la catégorie
    emplacement: {
      zone: 'Zone A',
      numeroLocal: 'A12',
      etage: 1
    },
    contact: {
      telephone: '0123456789',
      email: 'test@boutique.com',
      siteWeb: 'https://test-boutique.com'
    },
    horaires: {
      lundi: { ouverture: '09:00', fermeture: '18:00' },
      mardi: { ouverture: '09:00', fermeture: '18:00' },
      mercredi: { ouverture: '09:00', fermeture: '18:00' },
      jeudi: { ouverture: '09:00', fermeture: '18:00' },
      vendredi: { ouverture: '09:00', fermeture: '18:00' },
      samedi: { ouverture: '09:00', fermeture: '18:00' },
      dimanche: { ouverture: '10:00', fermeture: '17:00' }
    }
  };

  log('\n📦 Données envoyées:', 'cyan');
  log(`   Nom: ${boutiqueData.nom}`, 'reset');
  log(`   Catégorie ID: ${boutiqueData.categorie}`, 'reset');
  log(`   Description: ${boutiqueData.description}`, 'reset');

  stats.total++;
  const createBoutique = await testEndpoint({
    name: 'POST /api/boutique/register',
    method: 'POST',
    url: '/boutique/register',
    data: boutiqueData,
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 201
  });

  if (createBoutique.success) {
    log(`✅ Boutique créée avec succès!`, 'green');
    stats.passed++;
    
    if (createBoutique.data.boutique) {
      const boutique = createBoutique.data.boutique;
      log('\n🏪 Détails de la boutique créée:', 'cyan');
      log(`   ID: ${boutique._id}`, 'green');
      log(`   Nom: ${boutique.nom}`, 'green');
      log(`   Statut: ${boutique.statut}`, 'green');
      log(`   Date création: ${boutique.dateCreation}`, 'green');
    }
  } else {
    log(`❌ Échec création boutique`, 'red');
    stats.failed++;
    
    if (createBoutique.data) {
      log('\n📄 Détails de l\'erreur:', 'red');
      log(JSON.stringify(createBoutique.data, null, 2), 'red');
    }
  }

  // ============================================================================
  // ÉTAPE 4: VÉRIFIER LA BOUTIQUE CRÉÉE
  // ============================================================================
  logSection('ÉTAPE 4: VÉRIFICATION BOUTIQUE');

  stats.total++;
  const getMyBoutiques = await testEndpoint({
    name: 'GET /api/boutique/my-boutiques',
    method: 'GET',
    url: '/boutique/my-boutiques',
    headers: { Authorization: `Bearer ${tokens.commercant}` },
    expectedStatus: 200
  });

  if (getMyBoutiques.success) {
    const boutiques = getMyBoutiques.data.boutiques || [];
    log(`✅ ${boutiques.length} boutique(s) trouvée(s)`, 'green');
    stats.passed++;
    
    if (boutiques.length > 0) {
      log('\n🏪 Liste des boutiques:', 'cyan');
      boutiques.forEach((b, index) => {
        log(`   ${index + 1}. ${b.nom} (${b.statut})`, 'reset');
      });
    }
  } else {
    log(`❌ Échec récupération boutiques`, 'red');
    stats.failed++;
  }

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  logSection('📊 RÉSUMÉ');
  
  console.log(`Total de tests:     ${stats.total}`);
  log(`✅ Réussis:         ${stats.passed}`, 'green');
  log(`❌ Échoués:         ${stats.failed}`, 'red');
  
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  const rateColor = successRate >= 75 ? 'green' : (successRate >= 50 ? 'yellow' : 'red');
  log(`\n📈 Taux de réussite: ${successRate}%`, rateColor);

  if (stats.passed === stats.total) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
    log('✅ La création de boutique fonctionne correctement', 'green');
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('Vérifiez les détails ci-dessus', 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
