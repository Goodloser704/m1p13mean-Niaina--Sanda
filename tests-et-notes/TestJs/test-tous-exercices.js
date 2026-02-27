/**
 * 🎯 Test Complet - Tous les Exercices
 * Vérifie rapidement quels exercices sont faits
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let token;
const exercices = {
  niveau1: [],
  niveau2: [],
  niveau3: []
};

async function checkExercice1() {
  try {
    const res = await axios.post(`${API_URL}/test-items`, {
      titre: 'test minuscule',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const enMajuscules = res.data.item.titre === 'TEST MINUSCULE';
    exercices.niveau1.push({
      num: 1,
      nom: 'Titre en MAJUSCULES',
      fait: enMajuscules
    });
  } catch (error) {
    exercices.niveau1.push({ num: 1, nom: 'Titre en MAJUSCULES', fait: false });
  }
}

async function checkExercice2() {
  try {
    const res = await axios.post(`${API_URL}/test-items`, {
      titre: 'test',
      priorité: '🔥',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const aPriorite = res.data.item.priorité !== undefined;
    exercices.niveau1.push({
      num: 2,
      nom: 'Champ priorité avec emojis',
      fait: aPriorite
    });
  } catch (error) {
    exercices.niveau1.push({ num: 2, nom: 'Champ priorité avec emojis', fait: false });
  }
}

async function checkExercice3() {
  try {
    await axios.post(`${API_URL}/test-items`, {
      titre: 'test',
      valeur: -100
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    // Si ça passe, c'est pas bon
    exercices.niveau1.push({
      num: 3,
      nom: 'Valeur non négative',
      fait: false
    });
  } catch (error) {
    // Si ça échoue, c'est bon (validation fonctionne)
    const valide = error.response?.status === 400 || error.response?.data?.message?.includes('valeur');
    exercices.niveau1.push({
      num: 3,
      nom: 'Valeur non négative',
      fait: valide
    });
  }
}

async function checkExercice4() {
  try {
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'test vues',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const itemId = createRes.data.item._id;
    
    // Récupérer 2 fois
    await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const res = await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const aVues = res.data.vues !== undefined && res.data.vues > 0;
    exercices.niveau1.push({
      num: 4,
      nom: 'Compteur de vues',
      fait: aVues
    });
  } catch (error) {
    exercices.niveau1.push({ num: 4, nom: 'Compteur de vues', fait: false });
  }
}

async function checkExercice5() {
  try {
    const res = await axios.post(`${API_URL}/test-items`, {
      titre: 'test',
      valeur: 50,
      tags: ['Test', 'DEMO', 'test']
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const tags = res.data.item.tags;
    const tousMinuscules = tags.every(t => t === t.toLowerCase());
    const pasDeDoublons = tags.length === new Set(tags).size;
    
    exercices.niveau1.push({
      num: 5,
      nom: 'Tags uniques et minuscules',
      fait: tousMinuscules && pasDeDoublons
    });
  } catch (error) {
    exercices.niveau1.push({ num: 5, nom: 'Tags uniques et minuscules', fait: false });
  }
}

async function checkExercice6() {
  try {
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'test note',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const itemId = createRes.data.item._id;
    
    await axios.post(`${API_URL}/test-items/${itemId}/rate`, {
      note: 5
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const res = await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const aNotation = res.data.noteMoyenne !== undefined;
    exercices.niveau2.push({
      num: 6,
      nom: 'Système de notation',
      fait: aNotation
    });
  } catch (error) {
    exercices.niveau2.push({ num: 6, nom: 'Système de notation', fait: false });
  }
}

async function checkExercice7() {
  try {
    await axios.get(`${API_URL}/test-items/archive-old`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    exercices.niveau2.push({
      num: 7,
      nom: 'Archivage automatique',
      fait: true
    });
  } catch (error) {
    exercices.niveau2.push({ num: 7, nom: 'Archivage automatique', fait: false });
  }
}

async function checkExercice8() {
  try {
    const res = await axios.get(`${API_URL}/test-items?minValeur=100&maxValeur=200`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Si la requête passe, on suppose que les filtres sont implémentés
    exercices.niveau2.push({
      num: 8,
      nom: 'Recherche avancée',
      fait: true
    });
  } catch (error) {
    exercices.niveau2.push({ num: 8, nom: 'Recherche avancée', fait: false });
  }
}

async function checkExercice9() {
  try {
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'test historique',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const itemId = createRes.data.item._id;
    
    await axios.put(`${API_URL}/test-items/${itemId}`, {
      valeur: 100
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const res = await axios.get(`${API_URL}/test-items/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const aHistorique = res.data.historique && res.data.historique.length > 0;
    exercices.niveau2.push({
      num: 9,
      nom: 'Historique des modifications',
      fait: aHistorique
    });
  } catch (error) {
    exercices.niveau2.push({ num: 9, nom: 'Historique des modifications', fait: false });
  }
}

async function checkExercice10() {
  try {
    const createRes = await axios.post(`${API_URL}/test-items`, {
      titre: 'Original',
      valeur: 50
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    
    const itemId = createRes.data.item._id;
    
    await axios.post(`${API_URL}/test-items/${itemId}/duplicate`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    exercices.niveau2.push({
      num: 10,
      nom: 'Duplication d\'items',
      fait: true
    });
  } catch (error) {
    exercices.niveau2.push({ num: 10, nom: 'Duplication d\'items', fait: false });
  }
}

async function main() {
  log('\n🎯 VÉRIFICATION RAPIDE - TOUS LES EXERCICES', 'magenta');
  log('='.repeat(70), 'magenta');
  
  try {
    // Connexion
    const auth = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });
    
    token = auth.data.token;
    
    // Vérifier tous les exercices
    log('\n⏳ Vérification en cours...', 'yellow');
    
    await checkExercice1();
    await checkExercice2();
    await checkExercice3();
    await checkExercice4();
    await checkExercice5();
    await checkExercice6();
    await checkExercice7();
    await checkExercice8();
    await checkExercice9();
    await checkExercice10();
    
    // Afficher les résultats
    console.log('\n' + '='.repeat(70));
    log('  NIVEAU 1 - Modifications Simples', 'cyan');
    console.log('='.repeat(70));
    
    exercices.niveau1.forEach(ex => {
      const icon = ex.fait ? '✅' : '❌';
      const color = ex.fait ? 'green' : 'gray';
      log(`   ${icon} Exercice ${ex.num}: ${ex.nom}`, color);
    });
    
    const niveau1Done = exercices.niveau1.filter(e => e.fait).length;
    const niveau1Total = exercices.niveau1.length;
    log(`\n   Progression: ${niveau1Done}/${niveau1Total}`, niveau1Done === niveau1Total ? 'green' : 'yellow');
    
    console.log('\n' + '='.repeat(70));
    log('  NIVEAU 2 - Modifications Moyennes', 'cyan');
    console.log('='.repeat(70));
    
    exercices.niveau2.forEach(ex => {
      const icon = ex.fait ? '✅' : '❌';
      const color = ex.fait ? 'green' : 'gray';
      log(`   ${icon} Exercice ${ex.num}: ${ex.nom}`, color);
    });
    
    const niveau2Done = exercices.niveau2.filter(e => e.fait).length;
    const niveau2Total = exercices.niveau2.length;
    log(`\n   Progression: ${niveau2Done}/${niveau2Total}`, niveau2Done === niveau2Total ? 'green' : 'yellow');
    
    // Résumé global
    console.log('\n' + '='.repeat(70));
    log('  RÉSUMÉ GLOBAL', 'magenta');
    console.log('='.repeat(70));
    
    const totalDone = niveau1Done + niveau2Done;
    const totalExercices = niveau1Total + niveau2Total;
    const pourcentage = ((totalDone / totalExercices) * 100).toFixed(0);
    
    log(`\n   📊 Progression totale: ${totalDone}/${totalExercices} (${pourcentage}%)`, 'cyan');
    
    // Barre de progression
    const barLength = 50;
    const filled = Math.round((totalDone / totalExercices) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    log(`   ${bar}`, 'cyan');
    
    // Conseils
    if (totalDone === totalExercices) {
      log('\n🎉 FÉLICITATIONS! Tous les exercices sont terminés!', 'green');
    } else {
      log('\n💡 Prochaines étapes:', 'yellow');
      
      const prochainNiveau1 = exercices.niveau1.find(e => !e.fait);
      if (prochainNiveau1) {
        log(`   📝 Niveau 1: Faire l'exercice ${prochainNiveau1.num} (${prochainNiveau1.nom})`, 'cyan');
      } else if (niveau2Done < niveau2Total) {
        const prochainNiveau2 = exercices.niveau2.find(e => !e.fait);
        log(`   📝 Niveau 2: Faire l'exercice ${prochainNiveau2.num} (${prochainNiveau2.nom})`, 'cyan');
      }
      
      log('\n   📖 Consulte: EXERCICES-MODIFICATIONS-FARFELUES.md', 'cyan');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Erreur: Le serveur local n\'est pas démarré!', 'red');
      log('\n💡 Lance d\'abord le backend:', 'yellow');
      log('   cd mall-app/backend', 'cyan');
      log('   npm start', 'cyan');
    } else {
      log(`\n❌ Erreur: ${error.message}`, 'red');
    }
  }
}

main();
