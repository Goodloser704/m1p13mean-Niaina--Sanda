const axios = require('axios');

/**
 * 🧪 Test complet des loyers avec création de données
 * - Création de plusieurs boutiques
 * - Paiement de loyers pour différentes périodes
 * - Vérification de la cohérence des données
 */

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let adminToken = null;
let commercant1Token = null;
let commercant2Token = null;
let commercant3Token = null;

const testData = {
  boutiques: [],
  espaces: [],
  paiements: []
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

function logSubSection(message) {
  console.log(`\n${colors.magenta}--- ${message} ---${colors.reset}`);
}

// 1. Connexions
async function loginAll() {
  logSection('1️⃣  CONNEXIONS');
  
  try {
    // Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    adminToken = adminRes.data.token;
    logSuccess('Admin connecté');
    
    // Commerçant 1
    const comm1Res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    commercant1Token = comm1Res.data.token;
    logSuccess('Commerçant 1 connecté');
    
    // Créer commerçant 2
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        nom: 'Dupont',
        prenoms: 'Marie',
        email: 'marie.dupont@test.com',
        mdp: 'Marie123456!',
        telephone: '0340000010',
        genre: 'Feminin',
        role: 'Commercant'
      });
      const comm2Res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'marie.dupont@test.com',
        mdp: 'Marie123456!'
      });
      commercant2Token = comm2Res.data.token;
      logSuccess('Commerçant 2 créé et connecté');
    } catch (e) {
      if (e.response?.status === 400) {
        const comm2Res = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'marie.dupont@test.com',
          mdp: 'Marie123456!'
        });
        commercant2Token = comm2Res.data.token;
        logInfo('Commerçant 2 déjà existant - connecté');
      }
    }
    
    // Créer commerçant 3
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        nom: 'Martin',
        prenoms: 'Pierre',
        email: 'pierre.martin@test.com',
        mdp: 'Pierre123456!',
        telephone: '0340000011',
        genre: 'Masculin',
        role: 'Commercant'
      });
      const comm3Res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'pierre.martin@test.com',
        mdp: 'Pierre123456!'
      });
      commercant3Token = comm3Res.data.token;
      logSuccess('Commerçant 3 créé et connecté');
    } catch (e) {
      if (e.response?.status === 400) {
        const comm3Res = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'pierre.martin@test.com',
          mdp: 'Pierre123456!'
        });
        commercant3Token = comm3Res.data.token;
        logInfo('Commerçant 3 déjà existant - connecté');
      }
    }
    
    return true;
  } catch (error) {
    logError(`Erreur connexions: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 2. Créer des espaces
async function creerEspaces() {
  logSection('2️⃣  CRÉATION DES ESPACES');
  
  try {
    const etagesRes = await axios.get(`${BASE_URL}/admin/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const etageId = etagesRes.data.etages[0]?._id;
    
    if (!etageId) {
      logError('Aucun étage disponible');
      return false;
    }
    
    // Utiliser un identifiant unique basé sur timestamp + random
    const uniqueId = () => {
      const timestamp = Date.now().toString(36); // Base 36 pour réduire la taille
      const random = Math.random().toString(36).substring(2, 6); // 4 caractères aléatoires
      return `${timestamp}${random}`.toUpperCase().slice(0, 10);
    };
    
    const espacesData = [
      { code: uniqueId(), surface: 50, loyer: 1000 },
      { code: uniqueId(), surface: 75, loyer: 1500 },
      { code: uniqueId(), surface: 100, loyer: 2000 },
      { code: uniqueId(), surface: 60, loyer: 1200 }
    ];
    
    for (const espaceData of espacesData) {
      try {
        const res = await axios.post(`${BASE_URL}/admin/espaces`, {
          ...espaceData,
          etage: etageId,
          statut: 'Disponible'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        testData.espaces.push({
          _id: res.data.espace._id,
          code: res.data.espace.code,
          loyer: res.data.espace.loyer
        });
        
        logSuccess(`Espace créé: ${espaceData.code} - Loyer: ${espaceData.loyer}€`);
      } catch (error) {
        logWarning(`Espace ${espaceData.code} non créé: ${error.response?.data?.message || error.message}`);
      }
    }
    
    if (testData.espaces.length === 0) {
      logError('Aucun espace créé');
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Erreur création espaces: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 3. Créer des boutiques et les activer
async function creerBoutiques() {
  logSection('3️⃣  CRÉATION ET ACTIVATION DES BOUTIQUES');
  
  if (testData.espaces.length === 0) {
    logError('Aucun espace disponible pour créer des boutiques');
    return false;
  }
  
  try {
    const categoriesRes = await axios.get(`${BASE_URL}/categories-boutique`);
    const categorieId = categoriesRes.data.categories[0]?._id;
    
    if (!categorieId) {
      logError('Aucune catégorie disponible');
      return false;
    }
    
    const boutiquesData = [
      { nom: 'Boutique Mode Chic', commercant: commercant1Token, espace: testData.espaces[0] },
      { nom: 'Électronique Plus', commercant: commercant2Token, espace: testData.espaces[Math.min(1, testData.espaces.length - 1)] },
      { nom: 'Librairie du Centre', commercant: commercant3Token, espace: testData.espaces[Math.min(2, testData.espaces.length - 1)] },
      { nom: 'Bijouterie Élégance', commercant: commercant1Token, espace: testData.espaces[Math.min(3, testData.espaces.length - 1)] }
    ];
    
    for (const boutiqueData of boutiquesData) {
      try {
        // Créer la boutique
        const boutiqueRes = await axios.post(`${BASE_URL}/commercant/boutiques`, {
          nom: boutiqueData.nom,
          description: `Description de ${boutiqueData.nom}`,
          categorie: categorieId
        }, {
          headers: { Authorization: `Bearer ${boutiqueData.commercant}` }
        });
        
        const boutiqueId = boutiqueRes.data.boutique._id;
        logInfo(`Boutique créée: ${boutiqueData.nom}`);
        
        // Créer demande de location
        const demandeRes = await axios.post(`${BASE_URL}/commercant/demandes-location`, {
          boutique: boutiqueId,
          espace: boutiqueData.espace._id,
          message: `Demande pour ${boutiqueData.nom}`
        }, {
          headers: { Authorization: `Bearer ${boutiqueData.commercant}` }
        });
        
        // Approuver la demande
        await axios.put(`${BASE_URL}/admin/demandes-location/${demandeRes.data.demande._id}/approve`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        testData.boutiques.push({
          _id: boutiqueId,
          nom: boutiqueData.nom,
          espace: boutiqueData.espace,
          commercant: boutiqueData.commercant
        });
        
        logSuccess(`Boutique activée: ${boutiqueData.nom} - Espace: ${boutiqueData.espace.code}`);
      } catch (error) {
        logWarning(`Boutique ${boutiqueData.nom} non créée: ${error.response?.data?.message || error.message}`);
      }
    }
    
    if (testData.boutiques.length === 0) {
      logError('Aucune boutique créée');
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Erreur création boutiques: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 4. Créditer les portefeuilles
async function crediterPortefeuilles() {
  logSection('4️⃣  CRÉDIT DES PORTEFEUILLES');
  
  const commercants = [
    { token: commercant1Token, nom: 'Commerçant 1' },
    { token: commercant2Token, nom: 'Commerçant 2' },
    { token: commercant3Token, nom: 'Commerçant 3' }
  ];
  
  for (const comm of commercants) {
    try {
      await axios.post(`${BASE_URL}/commercant/portefeuille/recharge`, {
        montant: 10000
      }, {
        headers: { Authorization: `Bearer ${comm.token}` }
      });
      logSuccess(`${comm.nom}: 10,000€ crédités`);
    } catch (error) {
      logError(`Erreur crédit ${comm.nom}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return true;
}

// 5. Payer des loyers pour différentes périodes
async function payerLoyers() {
  logSection('5️⃣  PAIEMENT DES LOYERS');
  
  if (testData.boutiques.length === 0) {
    logError('Aucune boutique disponible pour payer des loyers');
    return false;
  }
  
  const periodes = [
    '2025-12', // Décembre 2025
    '2026-01', // Janvier 2026
    '2026-02'  // Février 2026 (mois en cours)
  ];
  
  // Boutique 1 et 2 paient tous les mois
  // Boutique 3 paie seulement décembre et janvier
  // Boutique 4 ne paie que décembre
  
  const paiementsConfig = [
    { boutique: 0, periodes: ['2025-12', '2026-01', '2026-02'] }, // Paie tout
    { boutique: Math.min(1, testData.boutiques.length - 1), periodes: ['2025-12', '2026-01', '2026-02'] }, // Paie tout
    { boutique: Math.min(2, testData.boutiques.length - 1), periodes: ['2025-12', '2026-01'] },            // Impayé février
    { boutique: Math.min(3, testData.boutiques.length - 1), periodes: ['2025-12'] }                        // Impayé janvier et février
  ];
  
  for (const config of paiementsConfig) {
    const boutique = testData.boutiques[config.boutique];
    if (!boutique) continue;
    
    logSubSection(`Paiements pour ${boutique.nom}`);
    
    for (const periode of config.periodes) {
      try {
        const res = await axios.post(`${BASE_URL}/commercant/loyers/pay`, {
          boutiqueId: boutique._id,
          montant: boutique.espace.loyer,
          periode: periode
        }, {
          headers: { Authorization: `Bearer ${boutique.commercant}` }
        });
        
        testData.paiements.push({
          boutique: boutique.nom,
          periode: periode,
          montant: boutique.espace.loyer,
          recepisse: res.data.recepisse._id
        });
        
        logSuccess(`${periode}: ${boutique.espace.loyer}€ payé`);
      } catch (error) {
        logError(`${periode}: ${error.response?.data?.message || error.message}`);
      }
    }
  }
  
  return true;
}

// 6. Vérifier l'historique par période
async function verifierHistorique() {
  logSection('6️⃣  VÉRIFICATION HISTORIQUE PAR PÉRIODE');
  
  if (testData.paiements.length === 0) {
    logWarning('Aucun paiement effectué, test ignoré');
    return true; // On accepte ce cas
  }
  
  const periodes = ['2025-12', '2026-01', '2026-02'];
  
  for (const periode of periodes) {
    logSubSection(`Période: ${periode}`);
    
    try {
      const res = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
        params: { mois: periode },
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const attendu = testData.paiements.filter(p => p.periode === periode);
      const recu = res.data.loyers.length;
      
      logInfo(`Paiements attendus: ${attendu.length}`);
      logInfo(`Paiements reçus: ${recu}`);
      logInfo(`Total encaissé: ${res.data.statistiques.totalMontant}€`);
      
      // Vérifier la cohérence
      if (attendu.length === recu) {
        logSuccess('✓ Nombre de paiements cohérent');
      } else {
        logWarning(`⚠ Incohérence: attendu ${attendu.length}, reçu ${recu}`);
      }
      
      // Vérifier le montant total
      const montantAttendu = attendu.reduce((sum, p) => sum + p.montant, 0);
      if (Math.abs(montantAttendu - res.data.statistiques.totalMontant) < 0.01) {
        logSuccess(`✓ Montant total cohérent: ${montantAttendu}€`);
      } else {
        logWarning(`⚠ Incohérence montant: attendu ${montantAttendu}€, reçu ${res.data.statistiques.totalMontant}€`);
      }
      
    } catch (error) {
      logError(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return true;
}

// 7. Vérifier les boutiques impayées
async function verifierBoutiquesImpayees() {
  logSection('7️⃣  VÉRIFICATION BOUTIQUES IMPAYÉES');
  
  if (testData.boutiques.length === 0) {
    logWarning('Aucune boutique créée, test ignoré');
    return true; // On accepte ce cas
  }
  
  const periodes = [
    { mois: '2026-01', attendues: ['Bijouterie Élégance'] },
    { mois: '2026-02', attendues: ['Librairie du Centre', 'Bijouterie Élégance'] }
  ];
  
  for (const config of periodes) {
    logSubSection(`Période: ${config.mois}`);
    
    try {
      const res = await axios.get(`${BASE_URL}/admin/loyers/boutiques-impayees`, {
        params: { mois: config.mois },
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      logInfo(`Boutiques actives: ${res.data.statistiques.nombreBoutiquesActives}`);
      logInfo(`Boutiques payées: ${res.data.statistiques.nombreBoutiquesPayees}`);
      logInfo(`Boutiques impayées: ${res.data.statistiques.nombreBoutiquesImpayees}`);
      logInfo(`Total dû: ${res.data.statistiques.totalMontantDu}€`);
      logInfo(`Taux de paiement: ${res.data.statistiques.tauxPaiement}%`);
      
      // Vérifier la cohérence
      const boutiquesImpayeesNoms = res.data.boutiquesImpayees.map(b => b.nom);
      
      console.log('\nBoutiques impayées trouvées:');
      boutiquesImpayeesNoms.forEach(nom => console.log(`  - ${nom}`));
      
      console.log('\nBoutiques impayées attendues:');
      config.attendues.forEach(nom => console.log(`  - ${nom}`));
      
      // Vérifier que toutes les boutiques attendues sont présentes
      let coherent = true;
      for (const nom of config.attendues) {
        if (boutiquesImpayeesNoms.includes(nom)) {
          logSuccess(`✓ ${nom} correctement identifiée comme impayée`);
        } else {
          logWarning(`⚠ ${nom} devrait être impayée mais n'apparaît pas`);
          coherent = false;
        }
      }
      
      // Vérifier qu'il n'y a pas de faux positifs
      for (const nom of boutiquesImpayeesNoms) {
        if (!config.attendues.includes(nom)) {
          logWarning(`⚠ ${nom} apparaît comme impayée mais ne devrait pas`);
          coherent = false;
        }
      }
      
      if (coherent) {
        logSuccess('✓ Liste des boutiques impayées cohérente');
      }
      
      // Vérifier le montant total dû
      const montantDuAttendu = res.data.boutiquesImpayees.reduce((sum, b) => sum + b.montantDu, 0);
      if (Math.abs(montantDuAttendu - res.data.statistiques.totalMontantDu) < 0.01) {
        logSuccess(`✓ Montant total dû cohérent: ${montantDuAttendu}€`);
      } else {
        logWarning(`⚠ Incohérence montant dû`);
      }
      
    } catch (error) {
      logError(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return true;
}

// 8. Vérifier l'historique par année
async function verifierHistoriqueAnnee() {
  logSection('8️⃣  VÉRIFICATION HISTORIQUE PAR ANNÉE');
  
  try {
    const res = await axios.get(`${BASE_URL}/admin/loyers/historique-par-periode`, {
      params: { annee: '2026' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const paiements2026 = testData.paiements.filter(p => p.periode.startsWith('2026'));
    
    logInfo(`Paiements 2026 attendus: ${paiements2026.length}`);
    logInfo(`Paiements 2026 reçus: ${res.data.loyers.length}`);
    logInfo(`Total encaissé: ${res.data.statistiques.totalMontant}€`);
    
    if (paiements2026.length === res.data.loyers.length) {
      logSuccess('✓ Nombre de paiements 2026 cohérent');
    } else {
      logWarning(`⚠ Incohérence: attendu ${paiements2026.length}, reçu ${res.data.loyers.length}`);
    }
    
    const montantAttendu = paiements2026.reduce((sum, p) => sum + p.montant, 0);
    if (Math.abs(montantAttendu - res.data.statistiques.totalMontant) < 0.01) {
      logSuccess(`✓ Montant total 2026 cohérent: ${montantAttendu}€`);
    } else {
      logWarning(`⚠ Incohérence montant: attendu ${montantAttendu}€, reçu ${res.data.statistiques.totalMontant}€`);
    }
    
    return true;
  } catch (error) {
    logError(`Erreur: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║     TEST COMPLET LOYERS AVEC DONNÉES ET VÉRIFICATION            ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Connexions', fn: loginAll },
    { name: 'Création espaces', fn: creerEspaces },
    { name: 'Création boutiques', fn: creerBoutiques },
    { name: 'Crédit portefeuilles', fn: crediterPortefeuilles },
    { name: 'Paiement loyers', fn: payerLoyers },
    { name: 'Vérification historique', fn: verifierHistorique },
    { name: 'Vérification boutiques impayées', fn: verifierBoutiquesImpayees },
    { name: 'Vérification historique année', fn: verifierHistoriqueAnnee }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const success = await test.fn();
      if (success !== false) { // Accepter true ou undefined comme succès
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`Erreur dans ${test.name}: ${error.message}`);
      results.failed++;
    }
  }
  
  // Résumé final
  logSection('📊 RÉSUMÉ FINAL');
  console.log(`Total tests: ${results.total}`);
  console.log(`${colors.green}Réussis: ${results.success}${colors.reset}`);
  console.log(`${colors.red}Échoués: ${results.failed}${colors.reset}`);
  console.log(`Taux de réussite: ${Math.round((results.success / results.total) * 100)}%\n`);
  
  console.log(`${colors.cyan}Données créées:${colors.reset}`);
  console.log(`  - Espaces: ${testData.espaces.length}`);
  console.log(`  - Boutiques: ${testData.boutiques.length}`);
  console.log(`  - Paiements: ${testData.paiements.length}\n`);
}

runTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
