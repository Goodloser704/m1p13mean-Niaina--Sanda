const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Compte admin par défaut
const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

let adminToken = '';

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

async function creerEtage(niveau) {
  console.log(`\n🏢 Création étage niveau ${niveau}...`);
  try {
    const response = await axios.post(
      `${BASE_URL}/etages`,
      { niveau },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Étage créé:', response.data.etage);
    return response.data.etage;
  } catch (error) {
    console.error('❌ Erreur création:', error.response?.data || error.message);
    return null;
  }
}

async function supprimerEtage(etageId) {
  console.log(`\n🗑️  Suppression étage ${etageId}...`);
  try {
    const response = await axios.delete(
      `${BASE_URL}/etages/${etageId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Étage supprimé:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression:', error.response?.data || error.message);
    return false;
  }
}

async function listerEtages() {
  console.log('\n📋 Liste des étages...');
  try {
    const response = await axios.get(
      `${BASE_URL}/etages?actifSeulement=false`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`✅ ${response.data.etages.length} étages trouvés:`);
    response.data.etages.forEach(e => {
      console.log(`   - Niveau ${e.niveau}: ${e.nom} (${e.isActive ? 'ACTIF' : 'INACTIF'})`);
    });
    return response.data.etages;
  } catch (error) {
    console.error('❌ Erreur liste:', error.response?.data || error.message);
    return [];
  }
}

async function testSuppressionRecreation() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: Suppression puis recréation d\'un étage');
  console.log('='.repeat(60));

  // 1. Connexion
  if (!await login()) {
    console.error('❌ Impossible de se connecter');
    return;
  }

  // 2. Lister les étages existants
  await listerEtages();

  // 3. Créer un étage de test (niveau 77 - unique)
  const niveau = 77;
  console.log(`\n🔍 Vérification si niveau ${niveau} existe...`);
  const etage = await creerEtage(niveau);
  if (!etage) {
    console.error('❌ Impossible de créer l\'étage de test');
    return;
  }

  // 4. Vérifier qu'il est bien créé
  await listerEtages();

  // 5. Supprimer l'étage
  if (!await supprimerEtage(etage._id)) {
    console.error('❌ Impossible de supprimer l\'étage');
    return;
  }

  // 6. Vérifier qu'il est bien inactif
  await listerEtages();

  // 7. Tenter de recréer le même niveau (devrait réactiver)
  console.log('\n🔄 Tentative de recréation du même niveau...');
  const etageRecree = await creerEtage(niveau);
  
  if (etageRecree) {
    console.log('\n✅ ✅ ✅ TEST RÉUSSI ! ✅ ✅ ✅');
    console.log('L\'étage a été recréé/réactivé avec succès');
  } else {
    console.log('\n❌ ❌ ❌ TEST ÉCHOUÉ ! ❌ ❌ ❌');
    console.log('Impossible de recréer l\'étage');
  }

  // 8. Vérifier l'état final
  await listerEtages();

  // 9. Nettoyage: supprimer l'étage de test
  if (etageRecree) {
    console.log('\n🧹 Nettoyage...');
    await supprimerEtage(etageRecree._id);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 FIN DU TEST');
  console.log('='.repeat(60));
}

// Exécuter le test
testSuppressionRecreation().catch(console.error);
