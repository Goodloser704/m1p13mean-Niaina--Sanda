const axios = require('axios');

/**
 * 🧪 Test de vérification de cohérence des données de loyers
 * Utilise les données existantes pour vérifier la logique
 */

const BASE_URL = 'http://localhost:3000/api';

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

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
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
    return true;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 2. Récupérer toutes les boutiques actives
async function getBoutiquesActives() {
  logSection('2️⃣  RÉCUPÉRATION BOUTIQUES ACTIVES');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/boutiques`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const boutiquesActives = response.data.boutiques.filter(b => b.statutBoutique === 'Actif' && b.espace);
    
    logInfo(`Total boutiques: ${response.data.boutiques.length}`);
    logInfo(`Boutiques actives avec espace: ${boutiquesActives.length}`);
    
    console.log('\nDétails des boutiques actives:');
    boutiquesActives.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.nom}`);
      console.log(`     Espace: ${b.espace?.code || 'N/A'}`);
      console.log(`     Loyer: ${b.espace?.loyer || 0}€`);
    });
    
    return boutiquesActives;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// 3. Vérifier l'historique pour février 2026
async function verifierHistoriqueFevrier(boutiquesActives) {
  logSection('3️⃣  HISTORIQUE FÉVRIER 2026');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2026-02' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Paiements enregistrés: ${response.data.loyers.length}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalMontant}€`);
    logInfo(`Montant moyen: ${response.data.statistiques.montantMoyen}€`);
    
    if (response.data.loyers.length > 0) {
      console.log('\nDétails des paiements:');
      response.data.loyers.forEach((loyer, i) => {
        console.log(`  ${i + 1}. ${loyer.boutique?.nom || 'N/A'} - ${loyer.montant}€`);
        console.log(`     Reçu: ${loyer.numeroRecepisse}`);
        console.log(`     Date: ${new Date(loyer.dateEmission).toLocaleDateString('fr-FR')}`);
      });
    }
    
    return response.data;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 4. Vérifier les boutiques impayées pour février 2026
async function verifierBoutiquesImpayees(boutiquesActives, historique) {
  logSection('4️⃣  BOUTIQUES IMPAYÉES FÉVRIER 2026');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      params: { mois: '2026-02' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Boutiques actives: ${response.data.statistiques.nombreBoutiquesActives}`);
    logInfo(`Boutiques payées: ${response.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${response.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total dû: ${response.data.statistiques.totalMontantDu}€`);
    logInfo(`Taux de paiement: ${response.data.statistiques.tauxPaiement}%`);
    
    console.log('\nBoutiques impayées:');
    response.data.boutiquesImpayees.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.nom}`);
      console.log(`     Commerçant: ${b.commercant?.nom} ${b.commercant?.prenoms}`);
      console.log(`     Espace: ${b.espace?.code}`);
      console.log(`     Montant dû: ${b.montantDu}€`);
    });
    
    // Vérifications de cohérence
    console.log('\n--- VÉRIFICATIONS DE COHÉRENCE ---');
    
    // 1. Nombre total de boutiques
    const totalCalcule = response.data.statistiques.nombreBoutiquesPayees + 
                         response.data.statistiques.nombreBoutiquesImpayees;
    
    if (totalCalcule === response.data.statistiques.nombreBoutiquesActives) {
      logSuccess(`✓ Nombre total cohérent: ${totalCalcule} = ${response.data.statistiques.nombreBoutiquesActives}`);
    } else {
      logWarning(`⚠ Incohérence: ${totalCalcule} ≠ ${response.data.statistiques.nombreBoutiquesActives}`);
    }
    
    // 2. Nombre de paiements vs boutiques payées
    if (historique && historique.loyers.length === response.data.statistiques.nombreBoutiquesPayees) {
      logSuccess(`✓ Nombre de paiements = boutiques payées: ${historique.loyers.length}`);
    } else if (historique) {
      logWarning(`⚠ Paiements (${historique.loyers.length}) ≠ boutiques payées (${response.data.statistiques.nombreBoutiquesPayees})`);
    }
    
    // 3. Montant total dû
    const montantDuCalcule = response.data.boutiquesImpayees.reduce((sum, b) => sum + b.montantDu, 0);
    if (Math.abs(montantDuCalcule - response.data.statistiques.totalMontantDu) < 0.01) {
      logSuccess(`✓ Montant total dû cohérent: ${montantDuCalcule}€`);
    } else {
      logWarning(`⚠ Incohérence montant: ${montantDuCalcule}€ ≠ ${response.data.statistiques.totalMontantDu}€`);
    }
    
    // 4. Taux de paiement
    const tauxCalcule = response.data.statistiques.nombreBoutiquesActives > 0
      ? Math.round((response.data.statistiques.nombreBoutiquesPayees / response.data.statistiques.nombreBoutiquesActives) * 100)
      : 0;
    
    if (tauxCalcule === response.data.statistiques.tauxPaiement) {
      logSuccess(`✓ Taux de paiement cohérent: ${tauxCalcule}%`);
    } else {
      logWarning(`⚠ Incohérence taux: ${tauxCalcule}% ≠ ${response.data.statistiques.tauxPaiement}%`);
    }
    
    // 5. Vérifier qu'aucune boutique n'est à la fois payée et impayée
    if (historique) {
      const boutiquesPayeesIds = new Set(historique.loyers.map(l => l.boutique?._id).filter(Boolean));
      const boutiquesImpayeesIds = new Set(response.data.boutiquesImpayees.map(b => b._id));
      
      const intersection = [...boutiquesPayeesIds].filter(id => boutiquesImpayeesIds.has(id));
      
      if (intersection.length === 0) {
        logSuccess('✓ Aucune boutique n\'est à la fois payée et impayée');
      } else {
        logWarning(`⚠ ${intersection.length} boutique(s) apparaissent dans les deux listes!`);
      }
    }
    
    return response.data;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 5. Vérifier l'historique par année
async function verifierHistoriqueAnnee() {
  logSection('5️⃣  HISTORIQUE ANNÉE 2026');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { annee: '2026' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Paiements 2026: ${response.data.loyers.length}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalMontant}€`);
    logInfo(`Montant moyen: ${response.data.statistiques.montantMoyen}€`);
    
    // Grouper par mois
    const parMois = {};
    response.data.loyers.forEach(loyer => {
      const mois = loyer.periode;
      if (!parMois[mois]) {
        parMois[mois] = { count: 0, total: 0 };
      }
      parMois[mois].count++;
      parMois[mois].total += loyer.montant;
    });
    
    console.log('\nRépartition par mois:');
    Object.keys(parMois).sort().forEach(mois => {
      console.log(`  ${mois}: ${parMois[mois].count} paiement(s) - ${parMois[mois].total}€`);
    });
    
    return response.data;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 6. Test de cas limites
async function testerCasLimites() {
  logSection('6️⃣  TEST CAS LIMITES');
  
  // Test 1: Mois futur
  console.log('\n--- Test mois futur (2026-12) ---');
  try {
    const res = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2026-12' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logInfo(`Paiements: ${res.data.loyers.length}`);
    logSuccess('✓ Requête mois futur acceptée');
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 2: Mois passé
  console.log('\n--- Test mois passé (2025-01) ---');
  try {
    const res = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2025-01' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logInfo(`Paiements: ${res.data.loyers.length}`);
    logSuccess('✓ Requête mois passé acceptée');
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 3: Format invalide
  console.log('\n--- Test format invalide ---');
  try {
    await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2026-13' }, // Mois invalide
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logWarning('⚠ Format invalide accepté (devrait être rejeté)');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('✓ Format invalide correctement rejeté');
    } else {
      logInfo(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 4: Boutiques impayées sans paramètre (mois courant)
  console.log('\n--- Test boutiques impayées sans paramètre ---');
  try {
    const res = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logInfo(`Période par défaut: ${res.data.periode}`);
    logSuccess('✓ Mois courant utilisé par défaut');
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  return true;
}

// Fonction principale
async function runTests() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║        TEST VÉRIFICATION COHÉRENCE DES DONNÉES LOYERS           ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  if (!await loginAdmin()) {
    logError('Impossible de continuer sans connexion admin');
    return;
  }
  
  const boutiquesActives = await getBoutiquesActives();
  const historique = await verifierHistoriqueFevrier(boutiquesActives);
  await verifierBoutiquesImpayees(boutiquesActives, historique);
  await verifierHistoriqueAnnee();
  await testerCasLimites();
  
  logSection('✅ TESTS TERMINÉS');
  console.log('Toutes les vérifications de cohérence ont été effectuées.\n');
}

runTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
