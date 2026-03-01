const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let authToken = '';
let etageVideId = '';
let etageAvecEspaceId = '';
let espaceId = '';

async function loginAdmin() {
  console.log('\n🔐 Connexion admin...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Connexion admin réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    return false;
  }
}

async function creerEtageVide() {
  console.log('\n🏗️  Création d\'un étage vide pour test...');
  try {
    const etageData = {
      numero: 47,
      nom: 'Étage Test Vide',
      niveau: 47,
      description: 'Étage de test sans espaces'
    };
    
    const response = await axios.post(`${BASE_URL}/etages`, etageData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    etageVideId = response.data.etage._id;
    console.log('✅ Étage vide créé:', etageVideId);
    console.log('   Numero:', response.data.etage.numero);
    console.log('   Nom:', response.data.etage.nom);
    return true;
  } catch (error) {
    console.error('❌ Erreur création étage vide:', error.response?.data || error.message);
    return false;
  }
}

async function creerEtageAvecEspace() {
  console.log('\n🏗️  Création d\'un étage avec espace pour test...');
  try {
    // 1. Créer l'étage
    const etageData = {
      numero: 45,
      nom: 'Étage Test Avec Espace',
      niveau: 45,
      description: 'Étage de test avec espaces'
    };
    
    const etageResponse = await axios.post(`${BASE_URL}/etages`, etageData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    etageAvecEspaceId = etageResponse.data.etage._id;
    console.log('✅ Étage créé:', etageAvecEspaceId);
    
    // 2. Créer un espace sur cet étage
    const espaceData = {
      codeEspace: `TST${Date.now().toString().slice(-4)}`,
      surface: 50,
      etage: etageAvecEspaceId,
      loyer: 1500,
      statut: 'Disponible',
      description: 'Espace de test'
    };
    
    const espaceResponse = await axios.post(`${BASE_URL}/espaces`, espaceData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    espaceId = espaceResponse.data.espace._id;
    console.log('✅ Espace créé sur l\'étage:', espaceId);
    console.log('   Code:', espaceResponse.data.espace.codeEspace);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur création étage avec espace:', error.response?.data || error.message);
    return false;
  }
}

async function testerSuppressionEtageVide() {
  console.log('\n🗑️  Test 1: Suppression d\'un étage VIDE...');
  try {
    const response = await axios.delete(`${BASE_URL}/etages/${etageVideId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Suppression réussie!');
    console.log('   Message:', response.data.message);
    
    // Vérifier que l'étage est bien marqué comme inactif
    try {
      const verif = await axios.get(`${BASE_URL}/etages/${etageVideId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('⚠️  L\'étage existe encore (normal si soft delete)');
      console.log('   isActive:', verif.data.etage?.isActive);
    } catch (e) {
      console.log('✅ L\'étage n\'est plus accessible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression étage vide:', error.response?.data || error.message);
    return false;
  }
}

async function testerSuppressionEtageAvecEspace() {
  console.log('\n🗑️  Test 2: Suppression d\'un étage AVEC ESPACE...');
  try {
    const response = await axios.delete(`${BASE_URL}/etages/${etageAvecEspaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ ERREUR: La suppression a réussi alors qu\'elle devrait échouer!');
    console.log('   Message:', response.data.message);
    return false;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 409) {
      console.log('✅ Suppression refusée (comportement attendu)');
      console.log('   Message:', error.response.data.message);
      
      // Vérifier le message d'erreur
      const message = error.response.data.message.toLowerCase();
      if (message.includes('espace') || message.includes('contient')) {
        console.log('✅ Message d\'erreur approprié');
        return true;
      } else {
        console.log('⚠️  Message d\'erreur inattendu');
        return true; // Quand même un succès car la suppression a été refusée
      }
    } else {
      console.error('❌ Erreur inattendue:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testerSuppressionEtageApresSuppressionEspace() {
  console.log('\n🗑️  Test 3: Suppression d\'un étage APRÈS suppression de l\'espace...');
  try {
    // 1. Supprimer l'espace
    console.log('   Étape 1: Suppression de l\'espace...');
    await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   ✅ Espace supprimé');
    
    // 2. Maintenant supprimer l'étage
    console.log('   Étape 2: Suppression de l\'étage...');
    const response = await axios.delete(`${BASE_URL}/etages/${etageAvecEspaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Suppression de l\'étage réussie!');
    console.log('   Message:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function nettoyage() {
  console.log('\n🧹 Nettoyage...');
  
  // Essayer de supprimer l'espace s'il existe encore
  if (espaceId) {
    try {
      await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('   ✅ Espace nettoyé');
    } catch (e) {
      // Déjà supprimé ou n'existe pas
    }
  }
  
  // Essayer de supprimer les étages de test
  for (const etageId of [etageVideId, etageAvecEspaceId]) {
    if (etageId) {
      try {
        await axios.delete(`${BASE_URL}/etages/${etageId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ✅ Étage nettoyé:', etageId);
      } catch (e) {
        // Déjà supprimé ou n'existe pas
      }
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Suppression Étage avec/sans Espaces');
  console.log('═══════════════════════════════════════════════════════');
  console.log('URL:', BASE_URL);
  
  // 1. Connexion
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  // 2. Préparation
  const etageVideCreated = await creerEtageVide();
  const etageAvecEspaceCreated = await creerEtageAvecEspace();
  
  if (!etageVideCreated || !etageAvecEspaceCreated) {
    console.log('\n❌ Impossible de continuer sans les étages de test');
    await nettoyage();
    return;
  }
  
  // 3. Tests
  const results = {
    suppressionEtageVide: await testerSuppressionEtageVide(),
    suppressionEtageAvecEspace: await testerSuppressionEtageAvecEspace(),
    suppressionApresSuppressionEspace: await testerSuppressionEtageApresSuppressionEspace()
  };
  
  // 4. Nettoyage
  await nettoyage();
  
  // 5. Résultats
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RÉSULTATS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test 1 - Suppression étage vide:           ', results.suppressionEtageVide ? '✅' : '❌');
  console.log('Test 2 - Suppression étage avec espace:    ', results.suppressionEtageAvecEspace ? '✅' : '❌');
  console.log('Test 3 - Suppression après nettoyage:      ', results.suppressionApresSuppressionEspace ? '✅' : '❌');
  
  const allSuccess = Object.values(results).every(r => r === true);
  
  if (allSuccess) {
    console.log('\n🎉 Tous les tests sont passés!');
    console.log('\n📝 Comportement vérifié:');
    console.log('   ✅ Un étage vide peut être supprimé');
    console.log('   ✅ Un étage avec espaces ne peut PAS être supprimé');
    console.log('   ✅ Un étage peut être supprimé après suppression de ses espaces');
  } else {
    console.log('\n❌ Certains tests ont échoué.');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
