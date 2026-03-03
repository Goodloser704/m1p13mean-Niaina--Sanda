const axios = require('axios');

/**
 * 🧪 Test de la route statut paiements mois courant
 */

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
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

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
}

async function testStatutPaiements() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║       TEST ROUTE STATUT PAIEMENTS MOIS COURANT                   ║
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
    
    // 2. Test de la route
    logSection('2️⃣  RÉCUPÉRATION STATUT PAIEMENTS');
    const response = await axios.get(`${BASE_URL}/admin/loyers/statut-paiements-mois-courant`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période: ${response.data.periode}`);
    logInfo(`Mois: ${response.data.moisCourant.nomMois} ${response.data.moisCourant.annee}`);
    
    console.log('\n--- STATISTIQUES ---');
    logInfo(`Boutiques actives: ${response.data.statistiques.nombreBoutiquesActives}`);
    logInfo(`Boutiques payées: ${response.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${response.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total encaissé: ${response.data.statistiques.totalEncaisse}€`);
    logInfo(`Total dû: ${response.data.statistiques.totalMontantDu}€`);
    logInfo(`Taux de paiement: ${response.data.statistiques.tauxPaiement}%`);
    
    // 3. Afficher les boutiques payées
    if (response.data.boutiquesPayees.length > 0) {
      console.log('\n--- BOUTIQUES PAYÉES ---');
      response.data.boutiquesPayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom}`);
        console.log(`     Commerçant: ${b.commercant?.nom} ${b.commercant?.prenoms}`);
        console.log(`     Espace: ${b.espace?.code}`);
        console.log(`     Montant payé: ${b.montantPaye}€`);
        console.log(`     Date: ${new Date(b.datePaiement).toLocaleDateString('fr-FR')}`);
        console.log(`     Statut: ${b.statut}`);
      });
    } else {
      logWarning('Aucune boutique n\'a payé ce mois');
    }
    
    // 4. Afficher les boutiques impayées
    if (response.data.boutiquesImpayees.length > 0) {
      console.log('\n--- BOUTIQUES IMPAYÉES ---');
      response.data.boutiquesImpayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom}`);
        console.log(`     Commerçant: ${b.commercant?.nom} ${b.commercant?.prenoms}`);
        console.log(`     Email: ${b.commercant?.email}`);
        console.log(`     Espace: ${b.espace?.code}`);
        console.log(`     Montant dû: ${b.montantDu}€`);
        console.log(`     Statut: ${b.statut}`);
      });
    } else {
      logSuccess('Toutes les boutiques ont payé!');
    }
    
    // 5. Vérifications de cohérence
    logSection('3️⃣  VÉRIFICATIONS DE COHÉRENCE');
    
    const payees = response.data.statistiques.nombreBoutiquesPayees;
    const impayees = response.data.statistiques.nombreBoutiquesImpayees;
    const actives = response.data.statistiques.nombreBoutiquesActives;
    
    if (payees + impayees === actives) {
      logSuccess(`✓ Total cohérent: ${payees} + ${impayees} = ${actives}`);
    } else {
      logError(`⚠ Incohérence: ${payees} + ${impayees} ≠ ${actives}`);
    }
    
    if (response.data.boutiquesPayees.length === payees) {
      logSuccess(`✓ Nombre boutiques payées cohérent`);
    } else {
      logError(`⚠ Incohérence boutiques payées`);
    }
    
    if (response.data.boutiquesImpayees.length === impayees) {
      logSuccess(`✓ Nombre boutiques impayées cohérent`);
    } else {
      logError(`⚠ Incohérence boutiques impayées`);
    }
    
    // Vérifier que le mois est bien le mois en cours
    const now = new Date();
    const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (response.data.periode === moisCourant) {
      logSuccess(`✓ Période correcte: ${moisCourant}`);
    } else {
      logError(`⚠ Période incorrecte: attendu ${moisCourant}, reçu ${response.data.periode}`);
    }
    
    // 6. Test accès non autorisé
    logSection('4️⃣  TEST ACCÈS NON AUTORISÉ');
    
    const commRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    try {
      await axios.get(`${BASE_URL}/admin/loyers/statut-paiements-mois-courant`, {
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
    console.log('Route statut-paiements-mois-courant testée avec succès!\n');
    
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

testStatutPaiements();
