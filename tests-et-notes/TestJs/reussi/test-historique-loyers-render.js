const axios = require('axios');

/**
 * 🧪 Test des routes d'historique de loyers sur RENDER
 * - Historique par période (mois/année)
 * - Boutiques avec loyer impayé
 */

const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = null;

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

// 1. Connexion admin
async function loginAdmin() {
  logSection('1️⃣  CONNEXION ADMIN');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    adminToken = response.data.token;
    logSuccess('Admin connecté sur Render');
    logInfo(`Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError(`Erreur connexion admin: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 2. Tester l'historique par mois
async function testerHistoriqueParMois() {
  logSection('2️⃣  TEST HISTORIQUE PAR MOIS');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2026-02' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess(`Historique récupéré pour février 2026`);
    logInfo(`Nombre de paiements: ${response.data.loyers.length}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalMontant}€`);
    logInfo(`Montant moyen: ${response.data.statistiques.montantMoyen}€`);
    
    if (response.data.loyers.length > 0) {
      console.log('\nDétails des paiements:');
      response.data.loyers.slice(0, 5).forEach((loyer, index) => {
        console.log(`  ${index + 1}. ${loyer.numeroRecepisse} - ${loyer.montant}€ - ${loyer.boutique?.nom || 'N/A'}`);
      });
      if (response.data.loyers.length > 5) {
        console.log(`  ... et ${response.data.loyers.length - 5} autres`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Erreur historique par mois: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 3. Tester l'historique par année
async function testerHistoriqueParAnnee() {
  logSection('3️⃣  TEST HISTORIQUE PAR ANNÉE');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { annee: '2026' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess(`Historique récupéré pour 2026`);
    logInfo(`Nombre de paiements: ${response.data.loyers.length}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalMontant}€`);
    logInfo(`Montant moyen: ${response.data.statistiques.montantMoyen}€`);
    
    return true;
  } catch (error) {
    logError(`Erreur historique par année: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 4. Tester la liste des boutiques impayées
async function testerBoutiquesImpayees() {
  logSection('4️⃣  TEST BOUTIQUES IMPAYÉES');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      params: { mois: '2026-02' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess(`Liste des boutiques impayées récupérée`);
    logInfo(`Période: ${response.data.periode}`);
    logInfo(`Boutiques actives: ${response.data.statistiques.nombreBoutiquesActives}`);
    logInfo(`Boutiques payées: ${response.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${response.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total dû: ${response.data.statistiques.totalMontantDu}€`);
    logInfo(`Taux de paiement: ${response.data.statistiques.tauxPaiement}%`);
    
    if (response.data.boutiquesImpayees.length > 0) {
      console.log('\nBoutiques impayées (5 premières):');
      response.data.boutiquesImpayees.slice(0, 5).forEach((boutique, index) => {
        console.log(`  ${index + 1}. ${boutique.nom}`);
        console.log(`     Commerçant: ${boutique.commercant?.nom} ${boutique.commercant?.prenoms}`);
        console.log(`     Email: ${boutique.commercant?.email}`);
        console.log(`     Espace: ${boutique.espace?.code}`);
        console.log(`     Montant dû: ${boutique.montantDu}€`);
      });
      if (response.data.boutiquesImpayees.length > 5) {
        console.log(`  ... et ${response.data.boutiquesImpayees.length - 5} autres boutiques`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Erreur boutiques impayées: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 5. Tester sans spécifier de mois (mois en cours par défaut)
async function testerBoutiquesImpayeesMoisCourant() {
  logSection('5️⃣  TEST BOUTIQUES IMPAYÉES (MOIS COURANT)');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess(`Liste récupérée pour le mois en cours`);
    logInfo(`Période: ${response.data.periode}`);
    logInfo(`Boutiques impayées: ${response.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total dû: ${response.data.statistiques.totalMontantDu}€`);
    
    return true;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 6. Tester l'historique pour un mois sans paiements
async function testerHistoriqueMoisVide() {
  logSection('6️⃣  TEST HISTORIQUE MOIS VIDE');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2025-01' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess(`Historique récupéré pour janvier 2025`);
    logInfo(`Nombre de paiements: ${response.data.loyers.length}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalMontant}€`);
    
    return true;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║   TEST HISTORIQUE LOYERS SUR RENDER (PRODUCTION)          ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion admin', fn: loginAdmin },
    { name: 'Historique par mois', fn: testerHistoriqueParMois },
    { name: 'Historique par année', fn: testerHistoriqueParAnnee },
    { name: 'Boutiques impayées (mois spécifique)', fn: testerBoutiquesImpayees },
    { name: 'Boutiques impayées (mois courant)', fn: testerBoutiquesImpayeesMoisCourant },
    { name: 'Historique mois vide', fn: testerHistoriqueMoisVide }
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
  
  // Résumé final
  logSection('📊 RÉSUMÉ DES TESTS');
  console.log(`Total: ${results.total}`);
  console.log(`${colors.green}Réussis: ${results.success}${colors.reset}`);
  console.log(`${colors.red}Échoués: ${results.failed}${colors.reset}`);
  console.log(`Taux de réussite: ${Math.round((results.success / results.total) * 100)}%\n`);
  
  if (results.success === results.total) {
    logSuccess('🎉 TOUS LES TESTS SONT PASSÉS SUR RENDER!');
  } else {
    logError(`${results.failed} test(s) ont échoué`);
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
