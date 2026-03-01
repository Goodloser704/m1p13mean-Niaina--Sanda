const axios = require('axios');

// Configuration - RENDER
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let authToken = '';
let etageId = '';
let espace1Id = '';
let espace2Id = '';

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

async function creerEtageTest() {
  console.log('\n🏗️  Création d\'un étage de test...');
  try {
    const etageData = {
      numero: 42,
      nom: 'Étage Test Stats',
      niveau: 42,
      description: 'Test statistiques avec espaces actifs/inactifs'
    };
    
    const response = await axios.post(`${BASE_URL}/etages`, etageData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    etageId = response.data.etage._id;
    console.log('✅ Étage créé:', etageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur création étage:', error.response?.data || error.message);
    return false;
  }
}

async function creerEspaces() {
  console.log('\n🏪 Création de 2 espaces sur l\'étage...');
  try {
    // Espace 1
    const espace1Data = {
      codeEspace: `ST1${Date.now().toString().slice(-4)}`,
      surface: 50,
      etage: etageId,
      loyer: 1500,
      statut: 'Disponible'
    };
    
    const response1 = await axios.post(`${BASE_URL}/espaces`, espace1Data, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    espace1Id = response1.data.espace._id;
    console.log('✅ Espace 1 créé:', espace1Id);
    
    // Espace 2
    const espace2Data = {
      codeEspace: `ST2${Date.now().toString().slice(-4)}`,
      surface: 60,
      etage: etageId,
      loyer: 1800,
      statut: 'Disponible'
    };
    
    const response2 = await axios.post(`${BASE_URL}/espaces`, espace2Data, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    espace2Id = response2.data.espace._id;
    console.log('✅ Espace 2 créé:', espace2Id);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur création espaces:', error.response?.data || error.message);
    return false;
  }
}

async function verifierStatsEtage(contexte) {
  console.log(`\n📊 Vérification stats étage - ${contexte}...`);
  try {
    const response = await axios.get(`${BASE_URL}/etages/${etageId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const etage = response.data.etage;
    console.log('✅ Stats récupérées:');
    console.log('   - Nombre d\'espaces:', etage.nombreEspaces);
    console.log('   - Espaces disponibles:', etage.espacesDisponibles);
    console.log('   - Espaces occupés:', etage.espacesOccupes);
    
    return {
      nombreEspaces: etage.nombreEspaces,
      espacesDisponibles: etage.espacesDisponibles,
      espacesOccupes: etage.espacesOccupes
    };
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error.response?.data || error.message);
    return null;
  }
}

async function supprimerEspace(espaceId, nom) {
  console.log(`\n🗑️  Suppression ${nom}...`);
  try {
    await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ ${nom} supprimé (soft delete)`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur suppression ${nom}:`, error.response?.data || error.message);
    return false;
  }
}

async function nettoyage() {
  console.log('\n🧹 Nettoyage...');
  
  for (const espaceId of [espace1Id, espace2Id]) {
    if (espaceId) {
      try {
        await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (e) {
        // Déjà supprimé
      }
    }
  }
  
  if (etageId) {
    try {
      await axios.delete(`${BASE_URL}/etages/${etageId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('   ✅ Étage nettoyé');
    } catch (e) {
      // Déjà supprimé ou contient encore des espaces
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Stats Étage avec Espaces Actifs/Inactifs');
  console.log('═══════════════════════════════════════════════════════');
  console.log('URL:', BASE_URL);
  
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  const etageCreated = await creerEtageTest();
  if (!etageCreated) {
    console.log('\n❌ Impossible de continuer sans étage');
    return;
  }
  
  // Scénario 1: Étage vide
  const stats1 = await verifierStatsEtage('Étage vide');
  
  // Créer 2 espaces
  const espacesCreated = await creerEspaces();
  if (!espacesCreated) {
    console.log('\n❌ Impossible de continuer sans espaces');
    await nettoyage();
    return;
  }
  
  // Scénario 2: Étage avec 2 espaces actifs
  const stats2 = await verifierStatsEtage('2 espaces actifs');
  
  // Supprimer 1 espace (soft delete)
  await supprimerEspace(espace1Id, 'Espace 1');
  
  // Scénario 3: Étage avec 1 espace actif + 1 inactif
  const stats3 = await verifierStatsEtage('1 actif + 1 inactif');
  
  // Supprimer le 2ème espace (soft delete)
  await supprimerEspace(espace2Id, 'Espace 2');
  
  // Scénario 4: Étage avec 2 espaces inactifs
  const stats4 = await verifierStatsEtage('2 espaces inactifs');
  
  // Nettoyage
  await nettoyage();
  
  // Analyse des résultats
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ANALYSE DES RÉSULTATS');
  console.log('═══════════════════════════════════════════════════════');
  
  const results = {
    scenario1: stats1?.nombreEspaces === 0,
    scenario2: stats2?.nombreEspaces === 2,
    scenario3: stats3?.nombreEspaces === 1,
    scenario4: stats4?.nombreEspaces === 0
  };
  
  console.log('\nScénario 1 - Étage vide:');
  console.log('  Attendu: 0 espaces');
  console.log('  Obtenu:', stats1?.nombreEspaces);
  console.log('  Résultat:', results.scenario1 ? '✅' : '❌');
  
  console.log('\nScénario 2 - 2 espaces actifs:');
  console.log('  Attendu: 2 espaces');
  console.log('  Obtenu:', stats2?.nombreEspaces);
  console.log('  Résultat:', results.scenario2 ? '✅' : '❌');
  
  console.log('\nScénario 3 - 1 actif + 1 inactif:');
  console.log('  Attendu: 1 espace (ne compte que les actifs)');
  console.log('  Obtenu:', stats3?.nombreEspaces);
  console.log('  Résultat:', results.scenario3 ? '✅' : '❌');
  
  console.log('\nScénario 4 - 2 espaces inactifs:');
  console.log('  Attendu: 0 espaces (ne compte que les actifs)');
  console.log('  Obtenu:', stats4?.nombreEspaces);
  console.log('  Résultat:', results.scenario4 ? '✅' : '❌');
  
  const allSuccess = Object.values(results).every(r => r === true);
  
  if (allSuccess) {
    console.log('\n🎉 Tous les scénarios sont corrects!');
    console.log('\n📝 Comportement vérifié:');
    console.log('   ✅ getNombreEspaces() ne compte QUE les espaces actifs');
    console.log('   ✅ Les espaces supprimés (soft delete) ne sont plus comptés');
    console.log('   ✅ Les statistiques sont correctes dans tous les cas');
  } else {
    console.log('\n❌ Certains scénarios ont échoué.');
    console.log('⚠️  Le fix getNombreEspaces pourrait avoir des effets secondaires!');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
