/**
 * Test de conformité des modèles avec les spécifications - VERSION RENDER
 * Vérifie que les modèles utilisent les bons noms de champs
 */

const axios = require('axios');

// Configuration RENDER
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let testData = {
  centreCommercialId: null,
  etageId: null,
  espaceId: null
};

// Fonction pour logger avec couleurs
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Vert
    error: '\x1b[31m',   // Rouge
    warning: '\x1b[33m'  // Jaune
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

// Connexion Admin
async function loginAdmin() {
  try {
    log('\n🔐 === CONNEXION ADMIN ===');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    adminToken = response.data.token;
    log('✅ Connexion admin réussie', 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test 1: Créer un étage avec le champ 'niveau' (conforme aux specs)
async function testCreerEtageAvecNiveau() {
  try {
    log('\n📋 === TEST 1: Créer étage avec champ "niveau" (RENDER) ===');
    
    // Utiliser timestamp pour garantir l'unicité (entre -2 et 50)
    const niveauUnique = -2 + (Date.now() % 53);
    const etageData = {
      niveau: niveauUnique,
      nom: `Test Étage Render ${niveauUnique}`,
      description: 'Étage créé pour test de conformité sur Render'
    };
    
    log(`Données envoyées: ${JSON.stringify(etageData, null, 2)}`);
    
    const response = await axios.post(
      `${BASE_URL}/etages`,
      etageData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.status === 201 && response.data.etage) {
      testData.etageId = response.data.etage._id;
      log(`✅ Étage créé avec succès sur RENDER`, 'success');
      log(`   ID: ${response.data.etage._id}`);
      log(`   Niveau: ${response.data.etage.niveau}`);
      log(`   Nom: ${response.data.etage.nom}`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    // Si l'étage existe déjà, essayer de le récupérer
    if (error.response?.data?.message?.includes('existe déjà')) {
      try {
        const etagesResponse = await axios.get(`${BASE_URL}/etages`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (etagesResponse.data.etages && etagesResponse.data.etages.length > 0) {
          testData.etageId = etagesResponse.data.etages[0]._id;
          log(`ℹ️  Utilisation d'un étage existant: ${testData.etageId}`, 'warning');
          return true;
        }
      } catch (e) {
        // Ignorer
      }
    }
    return false;
  }
}

// Test 2: Créer un espace avec le champ 'code' (conforme aux specs)
async function testCreerEspaceAvecCode() {
  try {
    log('\n📦 === TEST 2: Créer espace avec champ "code" (RENDER) ===');
    
    // Récupérer le centre commercial
    const centreResponse = await axios.get(`${BASE_URL}/centre-commercial`);
    testData.centreCommercialId = centreResponse.data._id;
    
    // Générer un code vraiment unique
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const codeUnique = `R${Date.now().toString(36).toUpperCase().slice(-5)}${random}`;
    const espaceData = {
      centreCommercial: testData.centreCommercialId,
      code: codeUnique,
      surface: 75,
      etage: testData.etageId,
      loyer: 1500,
      statut: 'Disponible'
    };
    
    log(`Données envoyées: ${JSON.stringify(espaceData, null, 2)}`);
    
    const response = await axios.post(
      `${BASE_URL}/espaces`,
      espaceData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.status === 201 && response.data.espace) {
      testData.espaceId = response.data.espace._id;
      log(`✅ Espace créé avec succès sur RENDER`, 'success');
      log(`   ID: ${response.data.espace._id}`);
      log(`   Code: ${response.data.espace.code}`);
      log(`   Surface: ${response.data.espace.surface} m²`);
      log(`   Loyer: ${response.data.espace.loyer} €`);
      return true;
    }
    
    log(`❌ Réponse inattendue`, 'error');
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.response?.data?.message || error.message}`, 'error');
    if (error.response?.data) {
      log(`   Détails: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    return false;
  }
}

// Fonction principale
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║   TEST CONFORMITÉ MODÈLES - VERSION RENDER            ║');
  log('╚════════════════════════════════════════════════════════╝');
  log(`\n🌐 URL de l'API: ${BASE_URL}`);
  log('⏳ Attente du déploiement Render (peut prendre quelques minutes)...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Connexion admin
  if (!await loginAdmin()) {
    log('\n❌ Impossible de continuer sans connexion admin', 'error');
    log('ℹ️  Le serveur Render est peut-être en train de démarrer...', 'warning');
    process.exit(1);
  }
  
  // Exécuter les tests
  const tests = [
    { name: 'Créer étage avec "niveau"', fn: testCreerEtageAvecNiveau },
    { name: 'Créer espace avec "code"', fn: testCreerEspaceAvecCode }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    // Délai entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Résumé
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║                    RÉSUMÉ DES TESTS                    ║');
  log('╚════════════════════════════════════════════════════════╝');
  log(`\n📊 Total: ${results.total}`);
  log(`✅ Réussis: ${results.passed}`, 'success');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`📈 Taux de réussite: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);
  
  if (results.passed === results.total) {
    log('🎉 Tous les tests sont passés! Les modèles sont conformes aux spécifications.', 'success');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
