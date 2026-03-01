const axios = require('axios');

/**
 * 🧪 Test des nouvelles routes d'historique de loyers
 * - Historique par période (mois/année)
 * - Boutiques avec loyer impayé
 */

const BASE_URL = 'http://localhost:3000/api';

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
let commercantToken = null;
let testBoutiqueId = null;
let testEspaceId = null;

// Fonction utilitaire pour afficher les résultats
function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
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
    logSuccess('Admin connecté');
    logInfo(`Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError(`Erreur connexion admin: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 2. Connexion commerçant
async function loginCommercant() {
  logSection('2️⃣  CONNEXION COMMERCANT');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    commercantToken = response.data.token;
    logSuccess('Commerçant connecté');
    logInfo(`Token: ${commercantToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError(`Erreur connexion commerçant: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 3. Créer des données de test (espace, boutique)
async function creerDonneesTest() {
  logSection('3️⃣  CRÉATION DONNÉES DE TEST');
  
  try {
    // Récupérer un centre commercial
    const centresResponse = await axios.get(`${BASE_URL}/admin/centres-commerciaux`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const centreId = centresResponse.data.centres[0]?._id;
    if (!centreId) {
      logError('Aucun centre commercial trouvé');
      return false;
    }
    logInfo(`Centre commercial: ${centreId}`);
    
    // Récupérer un étage
    const etagesResponse = await axios.get(`${BASE_URL}/admin/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const etageId = etagesResponse.data.etages[0]?._id;
    if (!etageId) {
      logError('Aucun étage trouvé');
      return false;
    }
    logInfo(`Étage: ${etageId}`);
    
    // Créer un espace de test
    const espaceResponse = await axios.post(`${BASE_URL}/admin/espaces`, {
      code: `TEST-LOYER-${Date.now()}`,
      surface: 50,
      loyer: 1000,
      etage: etageId,
      statut: 'Disponible'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    testEspaceId = espaceResponse.data.espace._id;
    logSuccess(`Espace créé: ${testEspaceId}`);
    logInfo(`Loyer: ${espaceResponse.data.espace.loyer}€`);
    
    // Récupérer une catégorie
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`);
    const categorieId = categoriesResponse.data.categories[0]?._id;
    
    // Créer une boutique de test
    const boutiqueResponse = await axios.post(`${BASE_URL}/commercant/boutiques`, {
      nom: `Boutique Test Loyer ${Date.now()}`,
      description: 'Boutique pour tester les loyers',
      categorie: categorieId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    testBoutiqueId = boutiqueResponse.data.boutique._id;
    logSuccess(`Boutique créée: ${testBoutiqueId}`);
    
    return true;
  } catch (error) {
    logError(`Erreur création données: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 4. Créer une demande de location et l'approuver
async function creerDemandeLocation() {
  logSection('4️⃣  DEMANDE DE LOCATION');
  
  try {
    // Créer la demande
    const demandeResponse = await axios.post(`${BASE_URL}/commercant/demandes-location`, {
      boutique: testBoutiqueId,
      espace: testEspaceId,
      message: 'Test de paiement de loyer'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const demandeId = demandeResponse.data.demande._id;
    logSuccess(`Demande créée: ${demandeId}`);
    
    // Approuver la demande
    await axios.put(`${BASE_URL}/admin/demandes-location/${demandeId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess('Demande approuvée - Boutique active');
    return true;
  } catch (error) {
    logError(`Erreur demande location: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 5. Créditer le portefeuille du commerçant
async function crediterPortefeuille() {
  logSection('5️⃣  CRÉDIT PORTEFEUILLE');
  
  try {
    const response = await axios.post(`${BASE_URL}/commercant/portefeuille/recharge`, {
      montant: 5000
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    logSuccess(`Portefeuille crédité: ${response.data.nouveauSolde}€`);
    return true;
  } catch (error) {
    logError(`Erreur crédit portefeuille: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 6. Payer le loyer pour plusieurs périodes
async function payerLoyers() {
  logSection('6️⃣  PAIEMENT LOYERS');
  
  const periodes = [
    '2026-01', // Janvier 2026
    '2026-02', // Février 2026 (mois en cours)
    '2025-12'  // Décembre 2025
  ];
  
  for (const periode of periodes) {
    try {
      const response = await axios.post(`${BASE_URL}/commercant/loyers/pay`, {
        boutiqueId: testBoutiqueId,
        montant: 1000,
        periode: periode
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      
      logSuccess(`Loyer payé pour ${periode}: ${response.data.recepisse.montant}€`);
      logInfo(`Reçu: ${response.data.recepisse._id}`);
    } catch (error) {
      logError(`Erreur paiement ${periode}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return true;
}

// 7. Tester l'historique par période (mois)
async function testerHistoriqueParMois() {
  logSection('7️⃣  TEST HISTORIQUE PAR MOIS');
  
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
      response.data.loyers.forEach((loyer, index) => {
        console.log(`  ${index + 1}. ${loyer.numeroRecepisse} - ${loyer.montant}€ - ${loyer.boutique?.nom || 'N/A'}`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Erreur historique par mois: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 8. Tester l'historique par période (année)
async function testerHistoriqueParAnnee() {
  logSection('8️⃣  TEST HISTORIQUE PAR ANNÉE');
  
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

// 9. Créer une boutique sans payer le loyer
async function creerBoutiqueImpayee() {
  logSection('9️⃣  CRÉATION BOUTIQUE IMPAYÉE');
  
  try {
    // Créer un nouvel espace
    const etagesResponse = await axios.get(`${BASE_URL}/admin/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const etageId = etagesResponse.data.etages[0]?._id;
    
    const espaceResponse = await axios.post(`${BASE_URL}/admin/espaces`, {
      code: `IMPAYE-${Date.now()}`,
      surface: 40,
      loyer: 800,
      etage: etageId,
      statut: 'Disponible'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const espaceImpayeId = espaceResponse.data.espace._id;
    logSuccess(`Espace créé: ${espaceImpayeId}`);
    
    // Créer une nouvelle boutique
    const categoriesResponse = await axios.get(`${BASE_URL}/categories-boutique`);
    const categorieId = categoriesResponse.data.categories[0]?._id;
    
    const boutiqueResponse = await axios.post(`${BASE_URL}/commercant/boutiques`, {
      nom: `Boutique Impayée ${Date.now()}`,
      description: 'Boutique qui ne paiera pas',
      categorie: categorieId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const boutiqueImpayeeId = boutiqueResponse.data.boutique._id;
    logSuccess(`Boutique créée: ${boutiqueImpayeeId}`);
    
    // Créer et approuver la demande
    const demandeResponse = await axios.post(`${BASE_URL}/commercant/demandes-location`, {
      boutique: boutiqueImpayeeId,
      espace: espaceImpayeId,
      message: 'Boutique qui ne paiera pas'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    await axios.put(`${BASE_URL}/admin/demandes-location/${demandeResponse.data.demande._id}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logSuccess('Boutique active mais sans paiement de loyer');
    return true;
  } catch (error) {
    logError(`Erreur création boutique impayée: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 10. Tester la liste des boutiques impayées
async function testerBoutiquesImpayees() {
  logSection('🔟 TEST BOUTIQUES IMPAYÉES');
  
  try {
    // Test pour le mois en cours (février 2026)
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
      console.log('\nBoutiques impayées:');
      response.data.boutiquesImpayees.forEach((boutique, index) => {
        console.log(`  ${index + 1}. ${boutique.nom}`);
        console.log(`     Commerçant: ${boutique.commercant?.nom} ${boutique.commercant?.prenoms}`);
        console.log(`     Email: ${boutique.commercant?.email}`);
        console.log(`     Espace: ${boutique.espace?.code}`);
        console.log(`     Montant dû: ${boutique.montantDu}€`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Erreur boutiques impayées: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 11. Tester les accès non autorisés
async function testerAccesNonAutorises() {
  logSection('1️⃣1️⃣  TEST ACCÈS NON AUTORISÉS');
  
  try {
    // Commerçant essaie d'accéder aux routes admin
    try {
      await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
        params: { mois: '2026-02' },
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logError('Le commerçant a pu accéder à la route admin (PROBLÈME!)');
    } catch (error) {
      if (error.response?.status === 403) {
        logSuccess('Accès refusé au commerçant pour route admin (OK)');
      } else {
        logWarning(`Erreur inattendue: ${error.response?.status}`);
      }
    }
    
    try {
      await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logError('Le commerçant a pu accéder à la route admin (PROBLÈME!)');
    } catch (error) {
      if (error.response?.status === 403) {
        logSuccess('Accès refusé au commerçant pour boutiques impayées (OK)');
      } else {
        logWarning(`Erreur inattendue: ${error.response?.status}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Erreur test accès: ${error.message}`);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║     TEST HISTORIQUE LOYERS ET BOUTIQUES IMPAYÉES          ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexion admin', fn: loginAdmin },
    { name: 'Connexion commerçant', fn: loginCommercant },
    { name: 'Création données test', fn: creerDonneesTest },
    { name: 'Demande location', fn: creerDemandeLocation },
    { name: 'Crédit portefeuille', fn: crediterPortefeuille },
    { name: 'Paiement loyers', fn: payerLoyers },
    { name: 'Historique par mois', fn: testerHistoriqueParMois },
    { name: 'Historique par année', fn: testerHistoriqueParAnnee },
    { name: 'Boutique impayée', fn: creerBoutiqueImpayee },
    { name: 'Liste boutiques impayées', fn: testerBoutiquesImpayees },
    { name: 'Accès non autorisés', fn: testerAccesNonAutorises }
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
}

// Exécuter les tests
runTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
