/**
 * 🧪 Script de Test pour les Exercices
 * Utilise ce script pour tester tes modifications rapidement
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
    // 1. Se connecter
    log('\n🔐 Connexion...', 'yellow');
    const auth = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });
    
    const token = auth.data.token;
    log('✅ Connecté!', 'green');
    
    // 2. Créer un item
    log('\n➕ Création d\'un item...', 'yellow');
    log('   Données envoyées:', 'cyan');
    const dataToSend = {
      titre: 'mon test item',
      description: 'Ceci est un test pour les exercices',
      valeur: -100,
      priorité:'🔴',
      tags: ['Test', 'DEMO', 'test']
    };
    console.log(JSON.stringify(dataToSend, null, 2));
    
    const response = await axios.post(`${API_URL}/test-items`, dataToSend, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log('\n✅ Item créé!', 'green');
    log('   Données reçues:', 'cyan');
    console.log('   ID:', response.data.item._id);
    console.log('   Titre:', response.data.item.titre);
    console.log('   Description:', response.data.item.description);
    console.log('   Valeur:', response.data.item.valeur);
    console.log('   Statut:', response.data.item.statut);
    console.log('   Tags:', response.data.item.tags);
    
    // 3. Récupérer l'item
    const itemId = response.data.item._id;
    log('\n🔍 Récupération de l\'item...', 'yellow');
    const getResponse = await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log('✅ Item récupéré:', 'green');
    console.log(JSON.stringify(getResponse.data, null, 2));
    
    // 4. Vérifications pour les exercices
    log('\n📊 VÉRIFICATIONS:', 'cyan');
    
    // Exercice 1: Titre en majuscules?
    const titreEnMajuscules = response.data.item.titre === response.data.item.titre.toUpperCase();
    log(`   ${titreEnMajuscules ? '✅' : '❌'} Exercice 1: Titre en majuscules`, titreEnMajuscules ? 'green' : 'red');
    if (!titreEnMajuscules) {
      console.log(`      Attendu: "${dataToSend.titre.toUpperCase()}"`);
      console.log(`      Reçu: "${response.data.item.titre}"`);
    }
    
    // Exercice 2: Champ priorité existe?
    const aPriorite = response.data.item.hasOwnProperty('priorite');
    log(`   ${aPriorite ? '✅' : '⚠️'} Exercice 2: Champ priorité`, aPriorite ? 'green' : 'yellow');
    if (aPriorite) {
      console.log(`      Priorité: ${response.data.item.priorite}`);
    }
    
    // Exercice 3: Valeur positive
    const valeurPositive = response.data.item.valeur >= 0;
    log(`   ${valeurPositive ? '✅' : '❌'} Exercice 3: Valeur positive`, valeurPositive ? 'green' : 'red');
    
    // Exercice 4: Compteur de vues?
    const aVues = response.data.item.hasOwnProperty('vues');
    log(`   ${aVues ? '✅' : '⚠️'} Exercice 4: Compteur de vues`, aVues ? 'green' : 'yellow');
    if (aVues) {
      console.log(`      Vues: ${response.data.item.vues}`);
    }
    
    // Exercice 5: Tags uniques et minuscules?
    const tagsOk = response.data.item.tags.every(tag => tag === tag.toLowerCase());
    const tagsUniques = new Set(response.data.item.tags).size === response.data.item.tags.length;
    log(`   ${tagsOk && tagsUniques ? '✅' : '⚠️'} Exercice 5: Tags uniques et minuscules`, tagsOk && tagsUniques ? 'green' : 'yellow');
    
    log('\n🎉 Test terminé!', 'green');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lance d\'abord le backend:', 'yellow');
      log('   cd mall-app/backend', 'cyan');
      log('   npm start', 'cyan');
    } else {
      log(`\n❌ Erreur: ${error.message}`, 'red');
      if (error.response) {
        console.log('\nDétails:', error.response.data);
      }
    }
  }
}

main();
