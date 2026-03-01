/**
 * Test des statistiques d'étage après fix getNombreEspaces()
 * 
 * Ce test vérifie que la modification de getNombreEspaces() pour ne compter
 * que les espaces actifs (isActive: true) n'affecte pas négativement l'affichage
 * des statistiques dans le frontend.
 * 
 * Scénarios testés:
 * 1. Créer un étage
 * 2. Créer des espaces actifs sur cet étage
 * 3. Vérifier que les stats sont correctes
 * 4. Supprimer (soft delete) un espace
 * 5. Vérifier que les stats sont mises à jour correctement
 * 6. Vérifier que l'étage peut être supprimé après suppression de tous les espaces
 */

const BASE_URL = 'http://localhost:3000';

// Credentials admin
const ADMIN_CREDENTIALS = {
  email: 'admin@mall.com',
  mdp: 'Admin123456!'
};

let adminToken = '';
let centreCommercialId = '';

// Fonction pour se connecter en tant qu'admin
async function loginAdmin() {
  console.log('\n🔐 === CONNEXION ADMIN ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur login: ${data.message || response.statusText}`);
    }

    if (!data.token) {
      throw new Error('Token non reçu dans la réponse');
    }

    adminToken = data.token;
    console.log('✅ Connexion admin réussie');
    console.log('👤 Utilisateur:', data.user?.email);
    console.log('🎭 Rôle:', data.user?.role);
    
    return data;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.message);
    throw error;
  }
}

// Fonction pour obtenir le centre commercial
async function obtenirCentreCommercial() {
  console.log('\n🏬 === OBTENTION CENTRE COMMERCIAL ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/centre-commercial`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur obtention centre commercial: ${JSON.stringify(data)}`);
    }

    console.log('✅ Centre commercial obtenu:', data.centreCommercial.nom);
    console.log('🆔 ID:', data.centreCommercial._id);
    
    return data.centreCommercial;
  } catch (error) {
    console.error('❌ Erreur obtention centre commercial:', error.message);
    throw error;
  }
}

// Fonction pour créer un étage de test
async function creerEtageTest() {
  console.log('\n🏢 === CRÉATION ÉTAGE TEST ===');
  
  // Utiliser les derniers chiffres du timestamp pour garantir l'unicité (entre 0 et 49)
  const numeroUnique = parseInt(Date.now().toString().slice(-2)) % 50;
  const etageData = {
    numero: numeroUnique,
    nom: `Étage Test Stats ${numeroUnique} - ${Date.now()}`,
    description: 'Étage pour tester les statistiques'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/etages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(etageData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur création étage: ${JSON.stringify(data)}`);
    }

    console.log('✅ Étage créé:', data.etage.nom);
    console.log('🆔 ID:', data.etage._id);
    console.log('🔢 Numéro:', data.etage.numero);
    
    return data.etage;
  } catch (error) {
    console.error('❌ Erreur création étage:', error.message);
    throw error;
  }
}

// Fonction pour créer un espace sur l'étage
async function creerEspaceTest(etageId, numero, centreCommercialId) {
  console.log(`\n📦 === CRÉATION ESPACE ${numero} ===`);
  
  const codeUnique = `TST${Date.now().toString().slice(-6)}${numero}`;
  const espaceData = {
    centreCommercial: centreCommercialId,
    code: codeUnique,
    codeEspace: codeUnique,
    surface: 50 + numero * 10,
    loyer: 1000 + numero * 100,
    etage: etageId,
    statut: 'Disponible'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/espaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(espaceData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur création espace: ${JSON.stringify(data)}`);
    }

    console.log('✅ Espace créé:', data.espace.code);
    console.log('🆔 ID:', data.espace._id);
    console.log('📏 Superficie:', data.espace.superficie, 'm²');
    
    return data.espace;
  } catch (error) {
    console.error('❌ Erreur création espace:', error.message);
    throw error;
  }
}

// Fonction pour obtenir les détails d'un étage avec stats
async function obtenirDetailsEtage(etageId) {
  console.log('\n📊 === OBTENTION DÉTAILS ÉTAGE ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/etages/${etageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur obtention étage: ${JSON.stringify(data)}`);
    }

    console.log('✅ Détails étage obtenus');
    console.log('🏢 Nom:', data.etage.nom);
    console.log('📊 Nombre espaces:', data.etage.nombreEspaces);
    console.log('🟢 Espaces disponibles:', data.etage.espacesDisponibles);
    console.log('🔴 Espaces occupés:', data.etage.espacesOccupes);
    
    return data.etage;
  } catch (error) {
    console.error('❌ Erreur obtention étage:', error.message);
    throw error;
  }
}

// Fonction pour supprimer un espace (soft delete)
async function supprimerEspace(espaceId) {
  console.log('\n🗑️ === SUPPRESSION ESPACE ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/espaces/${espaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur suppression espace: ${JSON.stringify(data)}`);
    }

    console.log('✅ Espace supprimé');
    
    return data;
  } catch (error) {
    console.error('❌ Erreur suppression espace:', error.message);
    throw error;
  }
}

// Fonction pour supprimer un étage
async function supprimerEtage(etageId) {
  console.log('\n🗑️ === SUPPRESSION ÉTAGE ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/etages/${etageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur suppression étage: ${JSON.stringify(data)}`);
    }

    console.log('✅ Étage supprimé');
    
    return data;
  } catch (error) {
    console.error('❌ Erreur suppression étage:', error.message);
    throw error;
  }
}

// Test principal
async function runTests() {
  console.log('🧪 ========================================');
  console.log('🧪 TEST STATISTIQUES ÉTAGE APRÈS FIX');
  console.log('🧪 ========================================');
  console.log('🌐 URL:', BASE_URL);
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
  
  let etageTest = null;
  let espacesTest = [];
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 1. Connexion admin
    await loginAdmin();

    // 2. Obtenir le centre commercial
    const centreCommercial = await obtenirCentreCommercial();
    centreCommercialId = centreCommercial._id;

    // 3. Créer un étage de test
    etageTest = await creerEtageTest();

    // 4. Vérifier stats initiales (0 espaces)
    console.log('\n📊 === TEST 1: Stats initiales (0 espaces) ===');
    let stats = await obtenirDetailsEtage(etageTest._id);
    
    if (stats.nombreEspaces === 0 && 
        stats.espacesDisponibles === 0 && 
        stats.espacesOccupes === 0) {
      console.log('✅ TEST 1 PASSÉ: Stats initiales correctes');
      testsPassed++;
    } else {
      console.log('❌ TEST 1 ÉCHOUÉ: Stats initiales incorrectes');
      console.log('   Attendu: 0 espaces, 0 disponibles, 0 occupés');
      console.log('   Reçu:', stats.nombreEspaces, 'espaces,', stats.espacesDisponibles, 'disponibles,', stats.espacesOccupes, 'occupés');
      testsFailed++;
    }

    // 5. Créer 3 espaces
    console.log('\n📦 === CRÉATION DE 3 ESPACES ===');
    for (let i = 1; i <= 3; i++) {
      const espace = await creerEspaceTest(etageTest._id, i, centreCommercialId);
      espacesTest.push(espace);
    }

    // 6. Vérifier stats avec 3 espaces
    console.log('\n📊 === TEST 2: Stats avec 3 espaces actifs ===');
    stats = await obtenirDetailsEtage(etageTest._id);
    
    if (stats.nombreEspaces === 3 && 
        stats.espacesDisponibles === 3 && 
        stats.espacesOccupes === 0) {
      console.log('✅ TEST 2 PASSÉ: Stats avec 3 espaces correctes');
      testsPassed++;
    } else {
      console.log('❌ TEST 2 ÉCHOUÉ: Stats avec 3 espaces incorrectes');
      console.log('   Attendu: 3 espaces, 3 disponibles, 0 occupés');
      console.log('   Reçu:', stats.nombreEspaces, 'espaces,', stats.espacesDisponibles, 'disponibles,', stats.espacesOccupes, 'occupés');
      testsFailed++;
    }

    // 7. Supprimer 1 espace (soft delete)
    console.log('\n🗑️ === SUPPRESSION D\'UN ESPACE ===');
    await supprimerEspace(espacesTest[0]._id);

    // 8. Vérifier stats après suppression (2 espaces actifs)
    console.log('\n📊 === TEST 3: Stats après suppression d\'un espace ===');
    stats = await obtenirDetailsEtage(etageTest._id);
    
    if (stats.nombreEspaces === 2 && 
        stats.espacesDisponibles === 2 && 
        stats.espacesOccupes === 0) {
      console.log('✅ TEST 3 PASSÉ: Stats après suppression correctes (ne compte que les espaces actifs)');
      testsPassed++;
    } else {
      console.log('❌ TEST 3 ÉCHOUÉ: Stats après suppression incorrectes');
      console.log('   Attendu: 2 espaces, 2 disponibles, 0 occupés');
      console.log('   Reçu:', stats.nombreEspaces, 'espaces,', stats.espacesDisponibles, 'disponibles,', stats.espacesOccupes, 'occupés');
      testsFailed++;
    }

    // 9. Supprimer les 2 espaces restants
    console.log('\n🗑️ === SUPPRESSION DES ESPACES RESTANTS ===');
    await supprimerEspace(espacesTest[1]._id);
    await supprimerEspace(espacesTest[2]._id);

    // 10. Vérifier stats après suppression de tous les espaces
    console.log('\n📊 === TEST 4: Stats après suppression de tous les espaces ===');
    stats = await obtenirDetailsEtage(etageTest._id);
    
    if (stats.nombreEspaces === 0 && 
        stats.espacesDisponibles === 0 && 
        stats.espacesOccupes === 0) {
      console.log('✅ TEST 4 PASSÉ: Stats après suppression de tous les espaces correctes');
      testsPassed++;
    } else {
      console.log('❌ TEST 4 ÉCHOUÉ: Stats après suppression de tous les espaces incorrectes');
      console.log('   Attendu: 0 espaces, 0 disponibles, 0 occupés');
      console.log('   Reçu:', stats.nombreEspaces, 'espaces,', stats.espacesDisponibles, 'disponibles,', stats.espacesOccupes, 'occupés');
      testsFailed++;
    }

    // 11. Tenter de supprimer l'étage (devrait réussir maintenant)
    console.log('\n🗑️ === TEST 5: Suppression de l\'étage après suppression des espaces ===');
    try {
      await supprimerEtage(etageTest._id);
      console.log('✅ TEST 5 PASSÉ: Étage supprimé avec succès (plus d\'espaces actifs)');
      testsPassed++;
      etageTest = null; // Marquer comme supprimé
    } catch (error) {
      console.log('❌ TEST 5 ÉCHOUÉ: Impossible de supprimer l\'étage');
      console.log('   Erreur:', error.message);
      testsFailed++;
    }

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error.message);
    testsFailed++;
  } finally {
    // Nettoyage: supprimer l'étage de test s'il existe encore
    if (etageTest && etageTest._id) {
      console.log('\n🧹 === NETTOYAGE ===');
      try {
        // Supprimer tous les espaces restants
        for (const espace of espacesTest) {
          try {
            await supprimerEspace(espace._id);
          } catch (e) {
            // Ignorer les erreurs (espace déjà supprimé)
          }
        }
        
        // Supprimer l'étage
        await supprimerEtage(etageTest._id);
        console.log('✅ Nettoyage terminé');
      } catch (error) {
        console.log('⚠️ Erreur nettoyage (peut être ignorée):', error.message);
      }
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${testsPassed}`);
  console.log(`❌ Tests échoués: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log(`🎯 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('✅ La modification de getNombreEspaces() fonctionne correctement');
    console.log('✅ Les statistiques ne comptent que les espaces actifs');
    console.log('✅ La suppression d\'étage fonctionne après suppression des espaces');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('❌ Vérifier les logs ci-dessus pour plus de détails');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
