const axios = require('axios');

/**
 * 🧪 Test de la route boutiques payées
 */

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

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
  console.log(`\n${colors.cyan}${'='.repeat(70)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
}

async function testBoutiquesPayees() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║              TEST ROUTE BOUTIQUES PAYÉES                         ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // 1. Connexion admin
    logSection('1️⃣  CONNEXION ADMIN');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const adminToken = loginRes.data.token;
    logSuccess('Admin connecté');
    
    // 2. Test boutiques payées pour mars 2026
    logSection('2️⃣  BOUTIQUES PAYÉES MARS 2026');
    const marsRes = await axios.get(`${BASE_URL}/admin/loyers/boutiques-payees`, {
      params: { mois: '2026-03' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période: ${marsRes.data.periode}`);
    logInfo(`Boutiques actives: ${marsRes.data.statistiques.nombreBoutiquesActives}`);
    logInfo(`Boutiques payées: ${marsRes.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${marsRes.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total encaissé: ${marsRes.data.statistiques.totalEncaisse}€`);
    logInfo(`Taux de paiement: ${marsRes.data.statistiques.tauxPaiement}%`);
    
    if (marsRes.data.boutiquesPayees.length > 0) {
      console.log('\nBoutiques qui ont payé:');
      marsRes.data.boutiquesPayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom}`);
        console.log(`     Commerçant: ${b.commercant?.nom} ${b.commercant?.prenoms}`);
        console.log(`     Email: ${b.commercant?.email}`);
        console.log(`     Espace: ${b.espace?.code}`);
        console.log(`     Montant payé: ${b.montantPaye}€`);
        console.log(`     Date paiement: ${new Date(b.datePaiement).toLocaleDateString('fr-FR')}`);
        console.log(`     Reçu: ${b.numeroRecepisse}`);
      });
    } else {
      console.log('\n⚠️  Aucune boutique n\'a payé pour mars 2026');
    }
    
    // 3. Test boutiques payées pour février 2026
    logSection('3️⃣  BOUTIQUES PAYÉES FÉVRIER 2026');
    const fevrierRes = await axios.get(`${BASE_URL}/admin/loyers/boutiques-payees`, {
      params: { mois: '2026-02' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période: ${fevrierRes.data.periode}`);
    logInfo(`Boutiques payées: ${fevrierRes.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Total encaissé: ${fevrierRes.data.statistiques.totalEncaisse}€`);
    
    if (fevrierRes.data.boutiquesPayees.length === 0) {
      logInfo('Aucune boutique n\'a payé pour février 2026 (normal)');
    }
    
    // 4. Test mois en cours (sans paramètre)
    logSection('4️⃣  BOUTIQUES PAYÉES MOIS EN COURS');
    const currentRes = await axios.get(`${BASE_URL}/admin/loyers/boutiques-payees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période par défaut: ${currentRes.data.periode}`);
    logInfo(`Boutiques payées: ${currentRes.data.statistiques.nombreBoutiquesPayees}`);
    logSuccess('Mois en cours utilisé par défaut');
    
    // 5. Comparaison avec boutiques impayées
    logSection('5️⃣  VÉRIFICATION COHÉRENCE');
    const impayeesRes = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      params: { mois: '2026-03' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const payees = marsRes.data.statistiques.nombreBoutiquesPayees;
    const impayees = impayeesRes.data.statistiques.nombreBoutiquesImpayees;
    const actives = marsRes.data.statistiques.nombreBoutiquesActives;
    
    logInfo(`Boutiques actives: ${actives}`);
    logInfo(`Boutiques payées: ${payees}`);
    logInfo(`Boutiques impayées: ${impayees}`);
    
    if (payees + impayees === actives) {
      logSuccess(`✓ Cohérence vérifiée: ${payees} + ${impayees} = ${actives}`);
    } else {
      logError(`⚠ Incohérence: ${payees} + ${impayees} ≠ ${actives}`);
    }
    
    // 6. Test accès non autorisé
    logSection('6️⃣  TEST ACCÈS NON AUTORISÉ');
    
    // Connexion commerçant
    const commRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    try {
      await axios.get(`${BASE_URL}/admin/loyers/boutiques-payees`, {
        headers: { Authorization: `Bearer ${commRes.data.token}` }
      });
      logError('Le commerçant a pu accéder à la route admin (PROBLÈME!)');
    } catch (error) {
      if (error.response?.status === 403) {
        logSuccess('Accès refusé au commerçant (OK)');
      } else {
        logError(`Erreur inattendue: ${error.response?.status}`);
      }
    }
    
    logSection('✅ TESTS TERMINÉS');
    console.log('Route boutiques-payees testée avec succès!\n');
    
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

testBoutiquesPayees();
