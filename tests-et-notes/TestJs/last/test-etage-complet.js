const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

let adminToken = '';
const etagesCreesIds = [];

async function login() {
  console.log('\n🔐 Connexion admin...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.token;
    console.log('✅ Connexion réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.response?.data || error.message);
    return false;
  }
}

async function creerEtage(niveau, nom = null) {
  try {
    const data = nom ? { niveau, nom } : { niveau };
    const response = await axios.post(
      `${BASE_URL}/etages`,
      data,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    etagesCreesIds.push(response.data.etage._id);
    return { success: true, etage: response.data.etage };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

async function supprimerEtage(etageId) {
  try {
    await axios.delete(
      `${BASE_URL}/etages/${etageId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

async function listerEtages(actifSeulement = false) {
  try {
    const response = await axios.get(
      `${BASE_URL}/etages?actifSeulement=${actifSeulement}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    return response.data.etages;
  } catch (error) {
    console.error('❌ Erreur liste:', error.response?.data || error.message);
    return [];
  }
}

async function nettoyerEtagesTest() {
  console.log('\n🧹 Nettoyage des étages de test...');
  for (const id of etagesCreesIds) {
    await supprimerEtage(id);
  }
  etagesCreesIds.length = 0;
}

async function testCas(numero, description, testFn) {
  console.log('\n' + '─'.repeat(60));
  console.log(`📝 TEST ${numero}: ${description}`);
  console.log('─'.repeat(60));
  
  try {
    await testFn();
    console.log(`✅ TEST ${numero} RÉUSSI`);
    return true;
  } catch (error) {
    console.log(`❌ TEST ${numero} ÉCHOUÉ: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTS COMPLETS: Création/Suppression/Recréation Étages');
  console.log('='.repeat(60));

  if (!await login()) {
    console.error('❌ Impossible de se connecter');
    return;
  }

  let testsReussis = 0;
  let testsTotal = 0;

  // TEST 1: Créer un étage simple
  testsTotal++;
  if (await testCas(1, 'Créer un étage simple (niveau 50)', async () => {
    const result = await creerEtage(50);
    if (!result.success) throw new Error(`Création échouée: ${result.error}`);
    console.log(`   ✓ Étage créé: ${result.etage.nom} (ID: ${result.etage._id})`);
  })) testsReussis++;

  // TEST 2: Tenter de créer un doublon (doit échouer)
  testsTotal++;
  if (await testCas(2, 'Tenter de créer un doublon actif (doit échouer)', async () => {
    const result = await creerEtage(50);
    if (result.success) throw new Error('Devrait échouer mais a réussi!');
    if (result.status !== 400) throw new Error(`Status attendu 400, reçu ${result.status}`);
    console.log(`   ✓ Erreur attendue reçue: ${result.error}`);
  })) testsReussis++;

  // TEST 3: Supprimer l'étage
  testsTotal++;
  if (await testCas(3, 'Supprimer l\'étage (soft delete)', async () => {
    const result = await supprimerEtage(etagesCreesIds[0]);
    if (!result.success) throw new Error(`Suppression échouée: ${result.error}`);
    console.log(`   ✓ Étage supprimé (soft delete)`);
  })) testsReussis++;

  // TEST 4: Vérifier que l'étage est inactif
  testsTotal++;
  if (await testCas(4, 'Vérifier que l\'étage est inactif', async () => {
    const etagesActifs = await listerEtages(true);
    const etageActif = etagesActifs.find(e => e.niveau === 50);
    if (etageActif) throw new Error('Étage encore actif!');
    
    const tousEtages = await listerEtages(false);
    const etageInactif = tousEtages.find(e => e.niveau === 50);
    if (!etageInactif) throw new Error('Étage introuvable!');
    if (etageInactif.isActive) throw new Error('Étage devrait être inactif!');
    
    console.log(`   ✓ Étage bien inactif dans la base`);
  })) testsReussis++;

  // TEST 5: Recréer le même niveau (doit réactiver)
  testsTotal++;
  if (await testCas(5, 'Recréer le même niveau (doit réactiver)', async () => {
    const result = await creerEtage(50);
    if (!result.success) throw new Error(`Recréation échouée: ${result.error}`);
    console.log(`   ✓ Étage recréé/réactivé: ${result.etage.nom}`);
    console.log(`   ✓ Même ID: ${result.etage._id === etagesCreesIds[0]}`);
  })) testsReussis++;

  // TEST 6: Créer plusieurs étages avec niveaux différents
  testsTotal++;
  if (await testCas(6, 'Créer plusieurs étages (niveaux 51, 52, 53)', async () => {
    const r1 = await creerEtage(51, 'Étage Test 51');
    const r2 = await creerEtage(52, 'Étage Test 52');
    const r3 = await creerEtage(53, 'Étage Test 53');
    
    if (!r1.success || !r2.success || !r3.success) {
      throw new Error('Au moins une création a échoué');
    }
    console.log(`   ✓ 3 étages créés avec succès`);
  })) testsReussis++;

  // TEST 7: Supprimer et recréer avec un nom différent
  testsTotal++;
  if (await testCas(7, 'Supprimer et recréer avec nom différent', async () => {
    const idEtage51 = etagesCreesIds.find(async (id) => {
      const etages = await listerEtages(false);
      const etage = etages.find(e => e._id === id);
      return etage?.niveau === 51;
    });
    
    await supprimerEtage(etagesCreesIds[1]); // Étage 51
    const result = await creerEtage(51, 'Nouveau Nom Étage 51');
    
    if (!result.success) throw new Error(`Recréation échouée: ${result.error}`);
    if (result.etage.nom !== 'Nouveau Nom Étage 51') {
      throw new Error(`Nom incorrect: ${result.etage.nom}`);
    }
    console.log(`   ✓ Étage recréé avec nouveau nom: ${result.etage.nom}`);
  })) testsReussis++;

  // TEST 8: Créer étage avec niveau négatif (sous-sol)
  testsTotal++;
  if (await testCas(8, 'Créer étage avec niveau négatif (sous-sol -1)', async () => {
    const result = await creerEtage(-1);
    if (!result.success) throw new Error(`Création échouée: ${result.error}`);
    console.log(`   ✓ Sous-sol créé: ${result.etage.nom}`);
  })) testsReussis++;

  // TEST 9: Créer étage niveau 0 (rez-de-chaussée)
  testsTotal++;
  if (await testCas(9, 'Créer étage niveau 0 (rez-de-chaussée)', async () => {
    const result = await creerEtage(0);
    if (!result.success) throw new Error(`Création échouée: ${result.error}`);
    if (!result.etage.nom.includes('Rez-de-chaussée')) {
      throw new Error(`Nom incorrect: ${result.etage.nom}`);
    }
    console.log(`   ✓ Rez-de-chaussée créé: ${result.etage.nom}`);
  })) testsReussis++;

  // TEST 10: Cycle complet sur niveau 3 (celui de l'erreur originale)
  testsTotal++;
  if (await testCas(10, 'Cycle complet sur niveau 3 (erreur originale)', async () => {
    // Vérifier si niveau 3 existe déjà
    const etages = await listerEtages(false);
    const etage3 = etages.find(e => e.niveau === 3);
    
    if (etage3) {
      console.log(`   ℹ️  Étage niveau 3 existe (${etage3.isActive ? 'actif' : 'inactif'})`);
      if (etage3.isActive) {
        console.log(`   → Suppression de l'étage actif...`);
        await supprimerEtage(etage3._id);
      }
    }
    
    console.log(`   → Création niveau 3...`);
    const r1 = await creerEtage(3);
    if (!r1.success) throw new Error(`Création échouée: ${r1.error}`);
    
    console.log(`   → Suppression niveau 3...`);
    await supprimerEtage(r1.etage._id);
    
    console.log(`   → Recréation niveau 3...`);
    const r2 = await creerEtage(3);
    if (!r2.success) throw new Error(`Recréation échouée: ${r2.error}`);
    
    console.log(`   ✓ Cycle complet réussi sur niveau 3`);
  })) testsReussis++;

  // Nettoyage
  await nettoyerEtagesTest();

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`Tests réussis: ${testsReussis}/${testsTotal}`);
  console.log(`Taux de réussite: ${Math.round(testsReussis/testsTotal*100)}%`);
  
  if (testsReussis === testsTotal) {
    console.log('\n🎉 🎉 🎉 TOUS LES TESTS SONT RÉUSSIS ! 🎉 🎉 🎉');
  } else {
    console.log(`\n⚠️  ${testsTotal - testsReussis} test(s) ont échoué`);
  }
  console.log('='.repeat(60));
}

runTests().catch(console.error);
