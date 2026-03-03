const axios = require('axios');

/**
 * 🧪 Script pour ajouter un paiement de loyer en mars 2026
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

async function ajouterPaiementMars() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║           AJOUT PAIEMENT LOYER MARS 2026                         ║
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
    
    // 3. Payer le loyer de mars pour la première boutique
    logSection('3️⃣  PAIEMENT LOYER MARS 2026');
    const boutique = boutiquesActives[0];
    
    // Récupérer les détails de l'espace pour avoir le loyer
    const espaceRes = await axios.get(`${BASE_URL}/admin/espaces/${boutique.espace._id}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    }).catch(() => null);
    
    const montantLoyer = espaceRes?.data?.espace?.loyer || boutique.espace?.loyer || 1500;
    
    logInfo(`Boutique: ${boutique.nom}`);
    logInfo(`Espace: ${boutique.espace?.code}`);
    logInfo(`Montant: ${montantLoyer}€`);
    
    const paiementRes = await axios.post(`${BASE_URL}/commercant/loyers/pay`, {
      boutiqueId: boutique._id,
      montant: montantLoyer,
      periode: '2026-03'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    logSuccess('Paiement effectué avec succès!');
    logInfo(`Reçu: ${paiementRes.data.recepisse._id}`);
    logInfo(`Numéro: ${paiementRes.data.recepisse.numeroRecepisse || 'N/A'}`);
    logInfo(`Nouveau solde: ${paiementRes.data.nouveauSolde}€`);
    
    // 4. Vérifier l'historique mars
    logSection('4️⃣  VÉRIFICATION HISTORIQUE MARS');
    
    // Connexion admin pour vérifier
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const adminToken = adminRes.data.token;
    
    const historiqueRes = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { mois: '2026-03' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Paiements mars 2026: ${historiqueRes.data.loyers.length}`);
    logInfo(`Total encaissé: ${historiqueRes.data.statistiques.totalMontant}€`);
    
    if (historiqueRes.data.loyers.length > 0) {
      console.log('\nDétails:');
      historiqueRes.data.loyers.forEach((loyer, i) => {
        console.log(`  ${i + 1}. ${loyer.boutique?.nom || 'N/A'} - ${loyer.montant}€`);
      });
    }
    
    // 5. Vérifier les boutiques impayées mars
    logSection('5️⃣  BOUTIQUES IMPAYÉES MARS');
    
    const impayeesRes = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
      params: { mois: '2026-03' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    logInfo(`Boutiques actives: ${impayeesRes.data.statistiques.nombreBoutiquesActives}`);
    logInfo(`Boutiques payées: ${impayeesRes.data.statistiques.nombreBoutiquesPayees}`);
    logInfo(`Boutiques impayées: ${impayeesRes.data.statistiques.nombreBoutiquesImpayees}`);
    logInfo(`Taux de paiement: ${impayeesRes.data.statistiques.tauxPaiement}%`);
    
    if (impayeesRes.data.boutiquesImpayees.length > 0) {
      console.log('\nBoutiques impayées:');
      impayeesRes.data.boutiquesImpayees.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.nom} - ${b.montantDu}€`);
      });
    }
    
    logSection('✅ TERMINÉ');
    console.log('Paiement de mars ajouté et vérifié avec succès!\n');
    
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

ajouterPaiementMars();
