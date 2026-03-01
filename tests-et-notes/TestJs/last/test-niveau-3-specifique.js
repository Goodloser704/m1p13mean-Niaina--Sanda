const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

let adminToken = '';

async function login() {
  console.log('🔐 Connexion admin...');
  const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
  adminToken = response.data.token;
  console.log('✅ Connecté\n');
}

async function creerEtage(niveau) {
  try {
    const response = await axios.post(
      `${BASE_URL}/etages`,
      { niveau },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    return { success: true, etage: response.data.etage };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      fullError: error.response?.data
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
    return { success: false, error: error.response?.data?.message };
  }
}

async function listerEtages(actifSeulement = false) {
  const response = await axios.get(
    `${BASE_URL}/etages?actifSeulement=${actifSeulement}`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  return response.data.etages;
}

async function testNiveau3() {
  console.log('='.repeat(70));
  console.log('🎯 TEST SPÉCIFIQUE: Niveau 3 (Erreur signalée par collaborateur)');
  console.log('='.repeat(70));
  console.log('\nErreur originale:');
  console.log('  "[CONTROLLER] Étage avec niveau 3 existe déjà (ID: 6990cde4a3a7cda3317594b2)"');
  console.log('  "Response: 400 - Un étage avec le niveau 3 existe déjà"\n');
  console.log('='.repeat(70));

  await login();

  // Étape 1: Vérifier l'état actuel
  console.log('\n📋 ÉTAPE 1: Vérification état actuel du niveau 3');
  console.log('-'.repeat(70));
  
  const tousEtages = await listerEtages(false);
  const etage3 = tousEtages.find(e => e.niveau === 3);
  
  if (etage3) {
    console.log(`✓ Étage niveau 3 trouvé dans la base:`);
    console.log(`  - ID: ${etage3._id}`);
    console.log(`  - Nom: ${etage3.nom}`);
    console.log(`  - Statut: ${etage3.isActive ? '🟢 ACTIF' : '🔴 INACTIF'}`);
    
    if (etage3.isActive) {
      console.log('\n⚠️  L\'étage est actif, suppression nécessaire pour le test...');
      const resultSuppr = await supprimerEtage(etage3._id);
      if (resultSuppr.success) {
        console.log('✓ Étage supprimé (soft delete)');
      } else {
        console.log(`❌ Erreur suppression: ${resultSuppr.error}`);
        return;
      }
    }
  } else {
    console.log('ℹ️  Aucun étage niveau 3 dans la base');
  }

  // Étape 2: Créer niveau 3
  console.log('\n🏗️  ÉTAPE 2: Création étage niveau 3');
  console.log('-'.repeat(70));
  
  const result1 = await creerEtage(3);
  if (!result1.success) {
    console.log(`❌ ÉCHEC: ${result1.error}`);
    console.log('Détails:', result1.fullError);
    return;
  }
  
  console.log('✅ Étage créé avec succès:');
  console.log(`  - ID: ${result1.etage._id}`);
  console.log(`  - Nom: ${result1.etage.nom}`);
  console.log(`  - Niveau: ${result1.etage.niveau}`);

  // Étape 3: Supprimer niveau 3
  console.log('\n🗑️  ÉTAPE 3: Suppression étage niveau 3 (soft delete)');
  console.log('-'.repeat(70));
  
  const resultSuppr = await supprimerEtage(result1.etage._id);
  if (!resultSuppr.success) {
    console.log(`❌ ÉCHEC: ${resultSuppr.error}`);
    return;
  }
  
  console.log('✅ Étage supprimé (soft delete)');

  // Étape 4: Vérifier que l'étage est inactif
  console.log('\n🔍 ÉTAPE 4: Vérification que l\'étage est inactif');
  console.log('-'.repeat(70));
  
  const etagesActifs = await listerEtages(true);
  const etage3Actif = etagesActifs.find(e => e.niveau === 3);
  
  if (etage3Actif) {
    console.log('❌ PROBLÈME: L\'étage est encore dans la liste des actifs!');
    return;
  }
  
  const tousEtages2 = await listerEtages(false);
  const etage3Inactif = tousEtages2.find(e => e.niveau === 3);
  
  if (!etage3Inactif) {
    console.log('❌ PROBLÈME: L\'étage a disparu de la base!');
    return;
  }
  
  console.log('✅ Étage bien présent mais inactif:');
  console.log(`  - ID: ${etage3Inactif._id}`);
  console.log(`  - isActive: ${etage3Inactif.isActive}`);

  // Étape 5: RECRÉER niveau 3 (le moment critique!)
  console.log('\n🔄 ÉTAPE 5: RECRÉATION étage niveau 3 (TEST CRITIQUE)');
  console.log('-'.repeat(70));
  console.log('⚠️  C\'est ici que l\'erreur se produisait avant la correction...\n');
  
  const result2 = await creerEtage(3);
  
  if (!result2.success) {
    console.log('\n❌❌❌ ÉCHEC - L\'ERREUR EST TOUJOURS PRÉSENTE! ❌❌❌');
    console.log(`Erreur: ${result2.error}`);
    console.log('Détails:', result2.fullError);
    console.log('\n⚠️  La correction n\'a pas fonctionné!');
    return;
  }
  
  console.log('✅✅✅ SUCCÈS - L\'ÉTAGE A ÉTÉ RECRÉÉ/RÉACTIVÉ! ✅✅✅');
  console.log(`  - ID: ${result2.etage._id}`);
  console.log(`  - Nom: ${result2.etage.nom}`);
  console.log(`  - Niveau: ${result2.etage.niveau}`);
  console.log(`  - Même ID qu'avant: ${result2.etage._id === result1.etage._id ? '✅ OUI' : '❌ NON'}`);

  // Étape 6: Vérification finale
  console.log('\n✅ ÉTAPE 6: Vérification finale');
  console.log('-'.repeat(70));
  
  const etagesFinaux = await listerEtages(true);
  const etage3Final = etagesFinaux.find(e => e.niveau === 3);
  
  if (!etage3Final) {
    console.log('❌ PROBLÈME: L\'étage n\'est pas dans les actifs!');
    return;
  }
  
  console.log('✅ Étage niveau 3 bien actif dans la base');
  console.log(`  - ID: ${etage3Final._id}`);
  console.log(`  - Nom: ${etage3Final.nom}`);

  // Nettoyage
  console.log('\n🧹 Nettoyage...');
  await supprimerEtage(result2.etage._id);

  // Résultat final
  console.log('\n' + '='.repeat(70));
  console.log('🎉🎉🎉 TEST RÉUSSI - LE BUG EST CORRIGÉ! 🎉🎉🎉');
  console.log('='.repeat(70));
  console.log('\nLe système peut maintenant:');
  console.log('  ✅ Créer un étage niveau 3');
  console.log('  ✅ Supprimer l\'étage (soft delete)');
  console.log('  ✅ Recréer/réactiver l\'étage niveau 3 sans erreur');
  console.log('\nL\'erreur "Un étage avec le niveau 3 existe déjà" n\'apparaît plus!');
  console.log('='.repeat(70));
}

testNiveau3().catch(error => {
  console.error('\n❌ ERREUR FATALE:', error.message);
  console.error(error);
});
