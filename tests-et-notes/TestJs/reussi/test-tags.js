/**
 * 🏷️ Test des Tags Uniques et Minuscules (Exercice 5)
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  try {
    log('\n🏷️ TEST DES TAGS UNIQUES ET MINUSCULES', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Connexion
    log('\n🔐 Connexion...', 'yellow');
    const auth = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    const token = auth.data.token;
    log('✅ Connecté!', 'green');
    
    // Test 1: Tags avec majuscules et doublons
    log('\n📝 Test 1: Tags avec majuscules et doublons', 'yellow');
    log('   Tags envoyés: ["Test", "DEMO", "test", "Demo", "autre"]', 'cyan');
    
    const response = await axios.post(`${API_URL}/test-items`, {
      titre: 'Test Tags',
      description: 'Item pour tester les tags',
      valeur: 100,
      tags: ["Test", "DEMO", "test", "Demo", "autre"]
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const tags = response.data.item.tags;
    log(`   Tags reçus: [${tags.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
    
    // Vérifications
    log('\n📊 Vérifications:', 'yellow');
    
    // Vérif 1: Tous en minuscules?
    const tousMinuscules = tags.every(tag => tag === tag.toLowerCase());
    if (tousMinuscules) {
      log('   ✅ Tous les tags sont en minuscules', 'green');
    } else {
      log('   ❌ Certains tags ont des majuscules', 'red');
      tags.forEach(tag => {
        if (tag !== tag.toLowerCase()) {
          log(`      "${tag}" devrait être "${tag.toLowerCase()}"`, 'red');
        }
      });
    }
    
    // Vérif 2: Pas de doublons?
    const pasDeDoublons = tags.length === new Set(tags).size;
    if (pasDeDoublons) {
      log('   ✅ Pas de doublons', 'green');
    } else {
      log('   ❌ Il y a des doublons', 'red');
      const doublons = tags.filter((tag, index) => tags.indexOf(tag) !== index);
      log(`      Doublons trouvés: ${doublons.join(', ')}`, 'red');
    }
    
    // Vérif 3: Résultat attendu
    const attendu = ['test', 'demo', 'autre'];
    const tagsTriés = [...tags].sort();
    const attenduTrié = [...attendu].sort();
    const correct = JSON.stringify(tagsTriés) === JSON.stringify(attenduTrié);
    
    if (correct) {
      log('   ✅ Résultat correct!', 'green');
      log(`      Attendu: [${attendu.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
      log(`      Reçu: [${tags.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
    } else {
      log('   ❌ Résultat incorrect', 'red');
      log(`      Attendu: [${attendu.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
      log(`      Reçu: [${tags.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
    }
    
    // Test 2: Tags déjà en minuscules
    log('\n📝 Test 2: Tags déjà propres', 'yellow');
    log('   Tags envoyés: ["javascript", "nodejs", "mongodb"]', 'cyan');
    
    const response2 = await axios.post(`${API_URL}/test-items`, {
      titre: 'Test Tags 2',
      valeur: 50,
      tags: ["javascript", "nodejs", "mongodb"]
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const tags2 = response2.data.item.tags;
    log(`   Tags reçus: [${tags2.map(t => '"' + t + '"').join(', ')}]`, 'cyan');
    
    const correct2 = JSON.stringify(tags2.sort()) === JSON.stringify(["javascript", "nodejs", "mongodb"].sort());
    if (correct2) {
      log('   ✅ Tags inchangés (déjà propres)', 'green');
    } else {
      log('   ❌ Tags modifiés alors qu\'ils étaient déjà propres', 'red');
    }
    
    // Résultat final
    if (tousMinuscules && pasDeDoublons && correct && correct2) {
      log('\n🎉 EXERCICE 5 RÉUSSI!', 'green');
      log('   Les tags sont automatiquement nettoyés!', 'green');
    } else {
      log('\n❌ EXERCICE 5 PAS ENCORE FAIT', 'red');
      log('\n💡 Consulte: EXERCICE-5-TAGS-UNIQUES.md', 'yellow');
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
