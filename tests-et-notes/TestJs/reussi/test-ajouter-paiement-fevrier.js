const axios = require('axios');

/**
 * 🧪 Script pour ajouter un paiement de loyer en février 2026
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

async function ajouterPaiementFevrier() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║           AJOUT PAIEMENT LOYER FÉVRIER 2026                      ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // 1. Connexion commerçant
    logSection('1️⃣  CONNEXION COMMERÇANT');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    const commercantToken = loginRes.data.token;
    logSuccess('Commerçant connecté');
    
    // 2. Récupérer les boutiques du commerçant
    logSection('2️⃣  RÉCUPÉRATION BOUTIQUES');
    const boutiquesRes = await axios.get(`${BASE_URL}/boutique`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const boutiquesActives = boutiquesRes.data.boutiques.filter(b => b.statutBoutique === 'Actif');
    
    if (boutiquesActives.length === 0) {
      logError('Aucune boutique active trouvée');
      return;
    }
    
    logInfo(`Boutiques actives: ${boutiquesActives.length}`);
    boutiquesActives.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.nom} - Espace: ${b.espace?.code || 'N/A'}`);
    });
    
    // 3. Payer le loyer de février pour la première boutique
    logSection('3️⃣  PAIEMENT LOYER FÉVRIER 2026');
    const boutique = boutiquesActives[0];
    
    const montantLoyer = boutique.espace?.loyer || 1500;
    
    logInfo(`Boutique: ${boutique.nom}`);
    logInfo(`Espace: ${boutique.espace?.code}`);
    logInfo(`Montant: ${montantLoyer}€`);
    
    const paiementRes = await axios.post(`${BASE_URL}/commercant/loyers/pay`, {
      boutiqueId: boutique._id,
      montant: montantLoyer,
      periode: '2026-02'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    logSuccess('Paiement effectué avec succès!');
    logInfo(`Reçu: ${paiementRes.data.recepisse._id}`);
    logInfo(`Nouveau solde: ${paiementRes.data.nouveauSolde}€`);
    
    // 4. Vérifier le statut des paiements
    logSection('4️⃣  VÉRIFICATION STATUT PAIEMENTS');
    
    // Connexion admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const adminToken = adminRes.data.token;
    
    const statutRes = await axios.get(`${BASE_URL}/admin/loyers/statut-paiements-mois-courant`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Période: ${statutRes.data.periode}`);
    logInfo(`Boutiques payées: ${statutRes.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${statutRes.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Total encaissé: ${statutRes.data.statistiques.totalEncaisse}€`);
    logInfo(`Taux de paiement: ${statutRes.data.statistiques.tauxPaiement}%`);
    
    if (statutRes.data.boutiquesPayees.length > 0) {
      console.log('\n✅ Boutiques qui ont payé:');
      statutRes.data.boutiquesPayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom} - ${b.montantPaye}€ (${b.statut})`);
      });
    }
    
    if (statutRes.data.boutiquesImpayees.length > 0) {
      console.log('\n⚠️  Boutiques impayées:');
      statutRes.data.boutiquesImpayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom} - ${b.montantDu}€ dû (${b.statut})`);
      });
    }
    
    logSection('✅ TERMINÉ');
    console.log('Paiement de février ajouté et vérifié avec succès!\n');
    
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

ajouterPaiementFevrier();
