/**
 * 🔥 Test Niveau 2 - Modifications Moyennes
 * Test automatique pour les exercices 6 à 10
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(70) + '\n');
}

let token;
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function addResult(exercice, nom, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`   ✅ ${nom}`, 'green');
  } else {
    testResults.failed++;
    log(`   ❌ ${nom}`, 'red');
    if (message) log(`      ${message}`, 'yellow');
  }
  testResults.details.push({ exercice, nom, passed, message });
}

async function testExercice6() {
  logSection('EXERCICE 6: Système de Notation (1-5 étoiles)');
  
  try {
    // Créer un item
    log('➕ Création d\'un item...', 'yellow');
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'Item à noter',
      valeur: 100
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const itemId = createRes.data.item._id;
    log(`✅ Item créé: ${itemId}`, 'green');
    
    // Tester la route de notation
    log('\n⭐ Test de notation...', 'yellow');
    
    try {
      // Note 1: 5 étoiles
      const rate1 = await axios.post(`${API_URL}/test-items/${itemId}/rate`, {
        note: 5
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      addResult(6, 'Route POST /test-items/:id/rate existe', true);
      
      // Note 2: 4 étoiles
      await axios.post(`${API_URL}/test-items/${itemId}/rate`, {
        note: 4
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Note 3: 5 étoiles
      const rate3 = await axios.post(`${API_URL}/test-items/${itemId}/rate`, {
        note: 5
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Vérifier la moyenne (5 + 4 + 5) / 3 = 4.67
      const item = await axios.get(`${API_URL}/test-items/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const hasNotes = item.data.notes && Array.isArray(item.data.notes);
      addResult(6, 'Champ "notes[]" existe', hasNotes);
      
      const hasNoteMoyenne = item.data.noteMoyenne !== undefined;
      addResult(6, 'Champ "noteMoyenne" existe', hasNoteMoyenne);
      
      if (hasNoteMoyenne) {
        const moyenne = Math.round(item.data.noteMoyenne * 100) / 100;
        const attendu = 4.67;
        const correct = Math.abs(moyenne - attendu) < 0.01;
        addResult(6, `Moyenne correcte (${moyenne}/5)`, correct, 
          correct ? '' : `Attendu: ${attendu}, Reçu: ${moyenne}`);
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        addResult(6, 'Route POST /test-items/:id/rate existe', false, 
          'Route non trouvée - pas encore implémentée');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testExercice7() {
  logSection('EXERCICE 7: Archivage Automatique (30 jours)');
  
  try {
    log('📦 Test de la route d\'archivage...', 'yellow');
    
    try {
      const archiveRes = await axios.get(`${API_URL}/test-items/archive-old`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      addResult(7, 'Route GET /test-items/archive-old existe', true);
      
      const hasCount = archiveRes.data.count !== undefined;
      addResult(7, 'Retourne un compteur d\'items archivés', hasCount);
      
      if (hasCount) {
        log(`   📊 Items archivés: ${archiveRes.data.count}`, 'cyan');
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        addResult(7, 'Route GET /test-items/archive-old existe', false, 
          'Route non trouvée - pas encore implémentée');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testExercice8() {
  logSection('EXERCICE 8: Recherche Avancée avec Filtres');
  
  try {
    log('🔍 Test des filtres de recherche...', 'yellow');
    
    // Créer des items de test
    await axios.post(`${API_URL}/test-items`, {
      titre: 'Item Recherche 1',
      valeur: 150,
      statut: 'actif',
      tags: ['demo', 'test']
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    await axios.post(`${API_URL}/test-items`, {
      titre: 'Item Recherche 2',
      valeur: 300,
      statut: 'actif',
      tags: ['demo']
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Test 1: Filtre par statut
    try {
      const res1 = await axios.get(`${API_URL}/test-items?statut=actif`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      addResult(8, 'Filtre par statut fonctionne', res1.data.items.length > 0);
    } catch (error) {
      addResult(8, 'Filtre par statut fonctionne', false);
    }
    
    // Test 2: Filtre par valeur min/max
    try {
      const res2 = await axios.get(`${API_URL}/test-items?minValeur=100&maxValeur=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const hasMinMax = res2.data.items.every(item => 
        item.valeur >= 100 && item.valeur <= 200
      );
      addResult(8, 'Filtre par minValeur/maxValeur', hasMinMax,
        hasMinMax ? '' : 'Certains items hors de la plage');
    } catch (error) {
      addResult(8, 'Filtre par minValeur/maxValeur', false, 
        'Paramètres non pris en compte');
    }
    
    // Test 3: Filtre par tags
    try {
      const res3 = await axios.get(`${API_URL}/test-items?tags=demo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const hasTags = res3.data.items.length > 0;
      addResult(8, 'Filtre par tags', hasTags);
    } catch (error) {
      addResult(8, 'Filtre par tags', false);
    }
    
    // Test 4: Recherche textuelle
    try {
      const res4 = await axios.get(`${API_URL}/test-items?search=Recherche`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const hasSearch = res4.data.items.length > 0;
      addResult(8, 'Recherche textuelle (search)', hasSearch);
    } catch (error) {
      addResult(8, 'Recherche textuelle (search)', false);
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testExercice9() {
  logSection('EXERCICE 9: Historique des Modifications');
  
  try {
    log('📜 Test de l\'historique...', 'yellow');
    
    // Créer un item
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'Item Historique',
      valeur: 100,
      description: 'Version 1'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const itemId = createRes.data.item._id;
    
    // Modification 1
    await axios.put(`${API_URL}/test-items/${itemId}`, {
      valeur: 200,
      description: 'Version 2'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Modification 2
    await axios.put(`${API_URL}/test-items/${itemId}`, {
      valeur: 300,
      description: 'Version 3'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Récupérer l'item
    const item = await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const hasHistorique = item.data.historique && Array.isArray(item.data.historique);
    addResult(9, 'Champ "historique[]" existe', hasHistorique);
    
    if (hasHistorique) {
      const histLength = item.data.historique.length;
      addResult(9, `Historique contient ${histLength} entrées`, histLength >= 2,
        histLength >= 2 ? '' : 'Devrait avoir au moins 2 modifications');
      
      if (histLength > 0) {
        const firstEntry = item.data.historique[0];
        const hasDate = firstEntry.date !== undefined;
        const hasChanges = firstEntry.changes !== undefined || firstEntry.champsModifies !== undefined;
        
        addResult(9, 'Entrée historique contient la date', hasDate);
        addResult(9, 'Entrée historique contient les changements', hasChanges);
      }
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testExercice10() {
  logSection('EXERCICE 10: Duplication d\'Items');
  
  try {
    log('📋 Test de duplication...', 'yellow');
    
    // Créer un item
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'Item Original',
      valeur: 100,
      description: 'À dupliquer',
      tags: ['original']
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const itemId = createRes.data.item._id;
    log(`✅ Item créé: ${itemId}`, 'green');
    
    try {
      // Dupliquer
      log('\n📋 Duplication...', 'yellow');
      const dupRes = await axios.post(`${API_URL}/test-items/${itemId}/duplicate`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      addResult(10, 'Route POST /test-items/:id/duplicate existe', true);
      
      const duplicate = dupRes.data.item;
      
      // Vérifier le titre
      const hasCopie = duplicate.titre.includes('Copie') || duplicate.titre.includes('copie');
      addResult(10, 'Titre contient "(Copie)"', hasCopie,
        hasCopie ? '' : `Titre reçu: "${duplicate.titre}"`);
      
      // Vérifier que c'est un nouvel item
      const differentId = duplicate._id !== itemId;
      addResult(10, 'Nouvel ID créé (pas le même)', differentId);
      
      // Vérifier que les autres champs sont copiés
      const sameValeur = duplicate.valeur === 100;
      addResult(10, 'Valeur copiée correctement', sameValeur);
      
      const sameDescription = duplicate.description === 'À dupliquer';
      addResult(10, 'Description copiée correctement', sameDescription);
      
    } catch (error) {
      if (error.response?.status === 404) {
        addResult(10, 'Route POST /test-items/:id/duplicate existe', false,
          'Route non trouvée - pas encore implémentée');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function main() {
  log('\n🔥 TEST NIVEAU 2 - MODIFICATIONS MOYENNES', 'magenta');
  log('='.repeat(70), 'magenta');
  log('⏰ ' + new Date().toLocaleString('fr-FR'), 'cyan');
  
  try {
    // Connexion
    log('\n🔐 Connexion...', 'yellow');
    const auth = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    token = auth.data.token;
    log('✅ Connecté!', 'green');
    
    // Lancer tous les tests
    await testExercice6();
    await testExercice7();
    await testExercice8();
    await testExercice9();
    await testExercice10();
    
    // Résumé
    logSection('RÉSUMÉ DES TESTS');
    
    console.log(`\n📊 Résultats globaux:`);
    console.log(`   Total de tests: ${testResults.total}`);
    log(`   ✅ Réussis: ${testResults.passed}`, 'green');
    log(`   ❌ Échoués: ${testResults.failed}`, 'red');
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`\n   Taux de réussite: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
    
    // Détails par exercice
    console.log('\n📋 Détails par exercice:');
    for (let i = 6; i <= 10; i++) {
      const exerciceTests = testResults.details.filter(t => t.exercice === i);
      const passed = exerciceTests.filter(t => t.passed).length;
      const total = exerciceTests.length;
      
      if (total > 0) {
        const status = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
        const color = passed === total ? 'green' : passed > 0 ? 'yellow' : 'red';
        log(`   ${status} Exercice ${i}: ${passed}/${total} tests réussis`, color);
      } else {
        log(`   ⚪ Exercice ${i}: Pas encore testé`, 'cyan');
      }
    }
    
    // Conseils
    if (testResults.failed > 0) {
      log('\n💡 PROCHAINES ÉTAPES:', 'yellow');
      
      const exercicesEchoues = [...new Set(
        testResults.details.filter(t => !t.passed).map(t => t.exercice)
      )];
      
      exercicesEchoues.forEach(ex => {
        log(`   📝 Exercice ${ex}: Consulte EXERCICES-MODIFICATIONS-FARFELUES.md`, 'cyan');
      });
    } else {
      log('\n🎉 TOUS LES EXERCICES NIVEAU 2 SONT RÉUSSIS!', 'green');
      log('   Tu peux passer au Niveau 3!', 'green');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lance d\'abord le backend:', 'yellow');
      log('   cd mall-app/backend', 'cyan');
      log('   npm start', 'cyan');
    } else {
      log(`\n❌ Erreur: ${error.message}`, 'red');
      if (error.response) {
        console.log('Détails:', error.response.data);
      }
    }
  }
}

main();
