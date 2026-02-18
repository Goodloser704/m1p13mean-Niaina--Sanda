/**
 * 👁️ Test du Compteur de Vues (Exercice 4)
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
    log('\n👁️ TEST DU COMPTEUR DE VUES', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Connexion
    log('\n🔐 Connexion...', 'yellow');
    const auth = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });
    
    const token = auth.data.token;
    log('✅ Connecté!', 'green');
    
    // Créer un item
    log('\n➕ Création d\'un item...', 'yellow');
    const response = await axios.post(`${API_URL}/test-items`, {
      titre: 'Test Compteur Vues',
      description: 'Item pour tester le compteur de vues',
      valeur: 100
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const itemId = response.data.item._id;
    log(`✅ Item créé: ${itemId}`, 'green');
    log(`   Vues initiales: ${response.data.item.vues || 0}`, 'cyan');
    
    // Récupérer l'item plusieurs fois
    log('\n🔍 Récupération de l\'item 5 fois...', 'yellow');
    
    for (let i = 1; i <= 5; i++) {
      const item = await axios.get(`${API_URL}/test-items/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const vues = item.data.vues || 0;
      const attendu = i;
      const ok = vues === attendu;
      
      log(`   Récupération ${i}: vues = ${vues} ${ok ? '✅' : '❌ (attendu: ' + attendu + ')'}`, ok ? 'green' : 'red');
      
      if (!ok) {
        log('\n❌ EXERCICE 4 PAS ENCORE FAIT', 'red');
        log('\n💡 Consulte: EXERCICE-4-COMPTEUR-VUES.md', 'yellow');
        return;
      }
    }
    
    log('\n🎉 EXERCICE 4 RÉUSSI!', 'green');
    log('   Le compteur de vues fonctionne parfaitement!', 'green');
    
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
