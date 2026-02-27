/**
 * 🧪 TEST CATÉGORIES APRÈS DÉPLOIEMENT
 * Vérifie que les catégories se chargent correctement après le fix
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
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
  const { name, method, url, data, headers, expectedStatus = 200, showDetails = true } = config;
  
  try {
    const fullUrl = `${API_URL}${url}`;
    
    if (showDetails) {
      log(`\n🧪 Test: ${name}`, 'cyan');
      log(`   URL: ${method} ${fullUrl}`, 'reset');
    }
    
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
    
    if (showDetails) {
      log(`   ${statusIcon} Status: ${response.status} (attendu: ${expectedStatus})`, statusColor);
    }
    
    if (response.data) {
      if (showDetails && response.data.message) {
        log(`   📝 Message: ${response.data.message}`, statusColor);
      }
      if (response.data.categories) {
        if (showDetails) {
          log(`   📋 Catégories trouvées: ${response.data.categories.length}`, statusColor);
        }
        
        // Afficher quelques catégories
        if (showDetails && response.data.categories.length > 0) {
          log(`\n   📋 Aperçu des catégories:`, 'cyan');
          response.data.categories.slice(0, 5).forEach((cat, index) => {
            const activeIcon = cat.isActive ? '✅' : '❌';
            log(`      ${index + 1}. ${activeIcon} ${cat.nom} (ID: ${cat._id})`, 'reset');
          });
          if (response.data.categories.length > 5) {
            log(`      ... et ${response.data.categories.length - 5} autres`, 'reset');
          }
        }
      }
    }
    
    return { success, data: response.data, status: response.status };
  } catch (error) {
    if (showDetails) {
      log(`❌ ERREUR: ${error.message}`, 'red');
      if (error.response?.data) {
        log(`   Réponse: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      }
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 TEST CATÉGORIES APRÈS DÉPLOIEMENT                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}`, 'cyan');
  log(`📅 Date: ${new Date().toLocaleString('fr-FR')}\n`, 'cyan');

  let stats = { total: 0, passed: 0, failed: 0 };
  let commercantToken = null;

  // ============================================================================
  // ÉTAPE 1: CONNEXION COMMERÇANT
  // ============================================================================
  logSection('ÉTAPE 1: CONNEXION COMMERÇANT');
  log('📝 Contexte: Un commerçant se connecte pour créer une boutique', 'yellow');

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
    commercantToken = loginCommercant.data.token;
    log(`\n✅ Token Commerçant récupéré avec succès`, 'green');
    log(`   Token: ${commercantToken.substring(0, 50)}...`, 'reset');
    stats.passed++;
  } else {
    log(`\n❌ Échec de la connexion commerçant`, 'red');
    log(`⚠️  Impossible de continuer les tests sans token`, 'yellow');
    stats.failed++;
    return;
  }

  // ============================================================================
  // ÉTAPE 2: CHARGEMENT DES CATÉGORIES (AVEC TOKEN)
  // ============================================================================
  logSection('ÉTAPE 2: CHARGEMENT DES CATÉGORIES');
  log('📝 Contexte: Le commerçant accède à la page /boutique-registration', 'yellow');
  log('📝 Comportement attendu: Les catégories se chargent avec le token', 'yellow');

  // Test 1: Toutes les catégories
  stats.total++;
  const getAllCategories = await testEndpoint({
    name: 'GET /api/categories-boutique (toutes)',
    method: 'GET',
    url: '/categories-boutique',
    headers: { Authorization: `Bearer ${commercantToken}` },
    expectedStatus: 200
  });

  if (getAllCategories.success) {
    log(`\n✅ Toutes les catégories chargées avec succès`, 'green');
    stats.passed++;
  } else {
    log(`\n❌ Échec du chargement de toutes les catégories`, 'red');
    stats.failed++;
  }

  // Test 2: Catégories actives seulement
  stats.total++;
  const getActiveCategories = await testEndpoint({
    name: 'GET /api/categories-boutique?actives=true (actives)',
    method: 'GET',
    url: '/categories-boutique?actives=true',
    headers: { Authorization: `Bearer ${commercantToken}` },
    expectedStatus: 200
  });

  if (getActiveCategories.success) {
    log(`\n✅ Catégories actives chargées avec succès`, 'green');
    stats.passed++;
    
    // Vérifier qu'on a bien des catégories
    if (getActiveCategories.data.categories && getActiveCategories.data.categories.length > 0) {
      log(`   📊 ${getActiveCategories.data.categories.length} catégories actives disponibles`, 'green');
      
      // Vérifier que toutes sont actives
      const allActive = getActiveCategories.data.categories.every(cat => cat.isActive);
      if (allActive) {
        log(`   ✅ Toutes les catégories retournées sont bien actives`, 'green');
      } else {
        log(`   ⚠️  Certaines catégories retournées ne sont pas actives`, 'yellow');
      }
    } else {
      log(`   ⚠️  Aucune catégorie active trouvée`, 'yellow');
    }
  } else {
    log(`\n❌ Échec du chargement des catégories actives`, 'red');
    stats.failed++;
  }

  // ============================================================================
  // ÉTAPE 3: VÉRIFICATION DES DONNÉES
  // ============================================================================
  logSection('ÉTAPE 3: VÉRIFICATION DES DONNÉES');

  if (getActiveCategories.success && getActiveCategories.data.categories) {
    const categories = getActiveCategories.data.categories;
    
    log('📊 Analyse des catégories:', 'cyan');
    log(`   Total: ${categories.length}`, 'reset');
    
    // Compter les catégories actives/inactives
    const actives = categories.filter(c => c.isActive).length;
    const inactives = categories.filter(c => !c.isActive).length;
    log(`   Actives: ${actives}`, 'green');
    if (inactives > 0) {
      log(`   Inactives: ${inactives}`, 'yellow');
    }
    
    // Vérifier les champs requis
    log(`\n   🔍 Vérification des champs:`, 'cyan');
    const hasAllFields = categories.every(cat => 
      cat._id && cat.nom && typeof cat.isActive === 'boolean'
    );
    
    if (hasAllFields) {
      log(`   ✅ Tous les champs requis sont présents (_id, nom, isActive)`, 'green');
    } else {
      log(`   ❌ Certains champs requis sont manquants`, 'red');
    }
    
    // Afficher les catégories disponibles
    log(`\n   📋 Liste des catégories disponibles:`, 'cyan');
    categories.forEach((cat, index) => {
      const activeIcon = cat.isActive ? '✅' : '❌';
      log(`      ${index + 1}. ${activeIcon} ${cat.nom}`, 'reset');
    });
  }

  // ============================================================================
  // ÉTAPE 4: TEST DE CRÉATION DE BOUTIQUE AVEC CATÉGORIE
  // ============================================================================
  logSection('ÉTAPE 4: TEST CRÉATION BOUTIQUE AVEC CATÉGORIE');
  log('📝 Contexte: Le commerçant remplit le formulaire et crée une boutique', 'yellow');

  if (getActiveCategories.success && getActiveCategories.data.categories.length > 0) {
    const categorieId = getActiveCategories.data.categories[0]._id;
    const categorieNom = getActiveCategories.data.categories[0].nom;
    
    log(`\n📋 Catégorie sélectionnée: ${categorieNom} (${categorieId})`, 'cyan');
    
    stats.total++;
    const createBoutique = await testEndpoint({
      name: 'POST /api/boutique/register',
      method: 'POST',
      url: '/boutique/register',
      data: {
        nom: `Test Boutique ${Date.now()}`,
        description: 'Boutique de test après déploiement',
        categorie: categorieId, // ✅ ObjectId de la catégorie
        emplacement: {
          zone: 'Zone Test',
          numeroLocal: 'T01',
          etage: 1
        },
        contact: {
          telephone: '0123456789',
          email: 'test@boutique.com',
          siteWeb: 'https://test.com'
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
      },
      headers: { Authorization: `Bearer ${commercantToken}` },
      expectedStatus: 201
    });

    if (createBoutique.success) {
      log(`\n✅ Boutique créée avec succès!`, 'green');
      if (createBoutique.data.boutique) {
        log(`   🏪 Nom: ${createBoutique.data.boutique.nom}`, 'green');
        log(`   📋 Catégorie: ${categorieNom}`, 'green');
        log(`   📊 Statut: ${createBoutique.data.boutique.statut}`, 'green');
      }
      stats.passed++;
    } else {
      log(`\n❌ Échec de la création de boutique`, 'red');
      stats.failed++;
    }
  } else {
    log(`\n⚠️  Impossible de tester la création (pas de catégories)`, 'yellow');
  }

  // ============================================================================
  // RÉSUMÉ FINAL
  // ============================================================================
  logSection('📊 RÉSUMÉ FINAL');
  
  console.log(`Total de tests:     ${stats.total}`);
  log(`✅ Réussis:         ${stats.passed}`, 'green');
  log(`❌ Échoués:         ${stats.failed}`, 'red');
  
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  const rateColor = successRate >= 75 ? 'green' : (successRate >= 50 ? 'yellow' : 'red');
  log(`\n📈 Taux de réussite: ${successRate}%`, rateColor);

  // Verdict final
  console.log('\n' + '='.repeat(80));
  if (stats.passed === stats.total) {
    log('🎉 SUCCÈS COMPLET!', 'green');
    log('✅ Le fix fonctionne parfaitement', 'green');
    log('✅ Les catégories se chargent correctement avec le token', 'green');
    log('✅ La création de boutique fonctionne', 'green');
  } else if (successRate >= 75) {
    log('✅ SUCCÈS PARTIEL', 'green');
    log('La plupart des tests passent, quelques ajustements mineurs possibles', 'yellow');
  } else {
    log('❌ ÉCHEC', 'red');
    log('Des problèmes subsistent, vérifiez les détails ci-dessus', 'red');
  }
  console.log('='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n💥 Erreur critique: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
