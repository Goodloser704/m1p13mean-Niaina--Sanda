/**
 * 🧪 Test du Workflow Complet
 * Test CRUD complet pour valider le script test-rapide
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

async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    mdp: password
  });
  return response.data;
}

async function createItem(token, data) {
  const response = await axios.post(`${API_URL}/test-items`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function getItems(token) {
  const response = await axios.get(`${API_URL}/test-items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function getItemById(token, id) {
  const response = await axios.get(`${API_URL}/test-items/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function updateItem(token, id, data) {
  const response = await axios.put(`${API_URL}/test-items/${id}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function toggleItem(token, id) {
  const response = await axios.put(`${API_URL}/test-items/${id}/toggle`, {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function deleteItem(token, id) {
  const response = await axios.delete(`${API_URL}/test-items/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function getStats(token) {
  const response = await axios.get(`${API_URL}/test-items/stats/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function main() {
  log('\n🚀 TEST DU WORKFLOW COMPLET', 'magenta');
  log(`📡 API: ${API_URL}`, 'cyan');
  log(`⏰ ${new Date().toLocaleString('fr-FR')}`, 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  try {
    // Connexion
    logSection('ÉTAPE 1: Authentification');
    log('🔐 Connexion admin...', 'yellow');
    const admin = await login('admin@mallapp.com', 'admin123');
    log(`✅ Connecté: ${admin.user.id}`, 'green');
    results.total++; results.passed++;
    
    // Créer des items
    logSection('ÉTAPE 2: Création d\'items');
    
    log('➕ Création item 1...', 'yellow');
    const item1 = await createItem(admin.token, {
      titre: 'Test Item 1',
      description: 'Premier item de test',
      valeur: 100,
      tags: ['test', 'demo']
    });
    log(`✅ Item créé: ${item1.item._id}`, 'green');
    results.total++; results.passed++;
    
    log('\n➕ Création item 2...', 'yellow');
    const item2 = await createItem(admin.token, {
      titre: 'Test Item 2',
      description: 'Deuxième item de test',
      valeur: 200,
      tags: ['test']
    });
    log(`✅ Item créé: ${item2.item._id}`, 'green');
    results.total++; results.passed++;
    
    log('\n➕ Création item 3...', 'yellow');
    const item3 = await createItem(admin.token, {
      titre: 'Test Item 3',
      description: 'Troisième item de test',
      valeur: 300
    });
    log(`✅ Item créé: ${item3.item._id}`, 'green');
    results.total++; results.passed++;
    
    // Récupérer tous les items
    logSection('ÉTAPE 3: Récupération des items');
    log('📋 GET /test-items...', 'yellow');
    const allItems = await getItems(admin.token);
    console.log(`   Items retournés: ${allItems.count}`);
    console.log(`   Total: ${allItems.total}`);
    
    const test1 = allItems.count >= 3;
    log(`   ${test1 ? '✅' : '❌'} Au moins 3 items récupérés`, test1 ? 'green' : 'red');
    results.total++;
    if (test1) results.passed++; else results.failed++;
    
    // Récupérer un item par ID
    logSection('ÉTAPE 4: Récupération par ID');
    log(`🔍 GET /test-items/${item1.item._id}...`, 'yellow');
    const singleItem = await getItemById(admin.token, item1.item._id);
    console.log(`   Titre: ${singleItem.titre}`);
    console.log(`   Valeur: ${singleItem.valeur}`);
    
    const test2 = singleItem.titre === 'Test Item 1';
    log(`   ${test2 ? '✅' : '❌'} Item correct récupéré`, test2 ? 'green' : 'red');
    results.total++;
    if (test2) results.passed++; else results.failed++;
    
    // Mettre à jour un item
    logSection('ÉTAPE 5: Mise à jour');
    log(`✏️ PUT /test-items/${item1.item._id}...`, 'yellow');
    const updated = await updateItem(admin.token, item1.item._id, {
      titre: 'Test Item 1 - Modifié',
      valeur: 150
    });
    console.log(`   Nouveau titre: ${updated.item.titre}`);
    console.log(`   Nouvelle valeur: ${updated.item.valeur}`);
    
    const test3 = updated.item.titre === 'Test Item 1 - Modifié' && updated.item.valeur === 150;
    log(`   ${test3 ? '✅' : '❌'} Mise à jour réussie`, test3 ? 'green' : 'red');
    results.total++;
    if (test3) results.passed++; else results.failed++;
    
    // Toggle statut
    logSection('ÉTAPE 6: Toggle statut');
    log(`🔄 PUT /test-items/${item2.item._id}/toggle...`, 'yellow');
    const toggled = await toggleItem(admin.token, item2.item._id);
    console.log(`   Statut: ${toggled.item.statut}`);
    
    const test4 = toggled.item.statut === 'inactif';
    log(`   ${test4 ? '✅' : '❌'} Statut changé`, test4 ? 'green' : 'red');
    results.total++;
    if (test4) results.passed++; else results.failed++;
    
    // Statistiques
    logSection('ÉTAPE 7: Statistiques');
    log('📊 GET /test-items/stats/me...', 'yellow');
    const stats = await getStats(admin.token);
    console.log(`   Total items: ${stats.total}`);
    console.log(`   Par statut:`, stats.byStatus);
    
    const test5 = stats.total >= 3;
    log(`   ${test5 ? '✅' : '❌'} Stats récupérées`, test5 ? 'green' : 'red');
    results.total++;
    if (test5) results.passed++; else results.failed++;
    
    // Supprimer un item
    logSection('ÉTAPE 8: Suppression');
    log(`🗑️ DELETE /test-items/${item3.item._id}...`, 'yellow');
    const deleted = await deleteItem(admin.token, item3.item._id);
    console.log(`   Item supprimé: ${deleted.item.titre}`);
    log(`   ✅ Suppression réussie`, 'green');
    results.total++; results.passed++;
    
    // Vérifier la suppression
    log('\n📋 Vérification après suppression...', 'yellow');
    const afterDelete = await getItems(admin.token);
    console.log(`   Items restants: ${afterDelete.count}`);
    
    const test6 = afterDelete.count === allItems.count - 1;
    log(`   ${test6 ? '✅' : '❌'} Item bien supprimé`, test6 ? 'green' : 'red');
    results.total++;
    if (test6) results.passed++; else results.failed++;
    
    // Résumé
    logSection('RÉSUMÉ DES TESTS');
    
    console.log(`\n📊 Résultats:`);
    console.log(`   Total: ${results.total}`);
    log(`   ✅ Réussis: ${results.passed}`, 'green');
    log(`   ❌ Échoués: ${results.failed}`, 'red');
    
    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    log(`\n   Taux de réussite: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
    
    if (results.failed === 0) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
      log('\n✅ Le workflow de développement fonctionne parfaitement!', 'green');
      log('✅ Vous pouvez développer en local et déployer en confiance!', 'green');
    } else {
      log('\n⚠️  Certains tests ont échoué', 'yellow');
    }
    
  } catch (error) {
    results.failed++;
    
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lancez d\'abord le backend:', 'yellow');
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
