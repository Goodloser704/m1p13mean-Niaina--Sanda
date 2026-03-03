/**
 * 🧪 Test des Champs Photo et Genre dans l'Inscription
 * Validation des modifications apportées à authController et authService
 * 
 * Modifications testées:
 * 1. POST /api/auth/register avec photo et genre
 * 2. Vérification que les champs sont bien enregistrés
 * 3. Validation des champs optionnels
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Fonction utilitaire pour faire des requêtes HTTP
 */
async function request(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      json = { error: 'Invalid JSON', body: text };
    }

    return {
      status: response.status,
      ok: response.ok,
      data: json
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.message }
    };
  }
}

/**
 * Générer un email unique pour les tests
 */
function generateTestEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-photo-genre-${timestamp}-${random}@example.com`;
}

/**
 * TEST 1: Inscription avec photo et genre
 */
async function testInscriptionAvecPhotoEtGenre() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 1: Inscription avec photo et genre', 'cyan');
  log('='.repeat(80), 'cyan');

  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Dupont',
    prenoms: 'Jean',
    role: 'Acheteur',
    telephone: '0123456789',
    photo: 'https://example.com/photos/jean-dupont.jpg',
    genre: 'Masculin'
  };

  log(`\n📝 Données d'inscription:`, 'blue');
  log(`   Email: ${userData.email}`, 'blue');
  log(`   Nom: ${userData.prenoms} ${userData.nom}`, 'blue');
  log(`   Photo: ${userData.photo}`, 'blue');
  log(`   Genre: ${userData.genre}`, 'blue');

  const response = await request('POST', '/auth/register', userData);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    log(`✅ Succès: Inscription réussie`, 'green');
    
    if (response.data.user) {
      const user = response.data.user;
      log('\n👤 Utilisateur créé:', 'blue');
      log(`   ID: ${user.id}`, 'blue');
      log(`   Email: ${user.email}`, 'blue');
      log(`   Nom: ${user.prenoms} ${user.nom}`, 'blue');
      log(`   Photo: ${user.photo || 'null'}`, user.photo ? 'green' : 'red');
      log(`   Genre: ${user.genre || 'null'}`, user.genre ? 'green' : 'red');
      
      // Vérifier que photo et genre sont bien présents
      if (user.photo === userData.photo && user.genre === userData.genre) {
        log('\n✅ VALIDATION: Photo et genre correctement enregistrés', 'green');
        return { success: true, user };
      } else {
        log('\n❌ ERREUR: Photo ou genre non enregistrés correctement', 'red');
        log(`   Attendu - Photo: ${userData.photo}, Genre: ${userData.genre}`, 'yellow');
        log(`   Reçu - Photo: ${user.photo}, Genre: ${user.genre}`, 'yellow');
        return { success: false, user };
      }
    } else {
      log('❌ Erreur: Pas de données utilisateur dans la réponse', 'red');
      return { success: false };
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    log(`   Détails: ${JSON.stringify(response.data, null, 2)}`, 'red');
    return { success: false };
  }
}

/**
 * TEST 2: Inscription sans photo ni genre (optionnels)
 */
async function testInscriptionSansPhotoNiGenre() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 2: Inscription sans photo ni genre (champs optionnels)', 'cyan');
  log('='.repeat(80), 'cyan');

  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Martin',
    prenoms: 'Marie',
    role: 'Commercant',
    telephone: '0987654321'
    // Pas de photo ni genre
  };

  log(`\n📝 Données d'inscription:`, 'blue');
  log(`   Email: ${userData.email}`, 'blue');
  log(`   Nom: ${userData.prenoms} ${userData.nom}`, 'blue');
  log(`   Photo: non fournie`, 'yellow');
  log(`   Genre: non fourni`, 'yellow');

  const response = await request('POST', '/auth/register', userData);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok) {
    log(`✅ Succès: Inscription réussie sans photo ni genre`, 'green');
    
    if (response.data.user) {
      const user = response.data.user;
      log('\n👤 Utilisateur créé:', 'blue');
      log(`   ID: ${user.id}`, 'blue');
      log(`   Email: ${user.email}`, 'blue');
      log(`   Photo: ${(user.photo === null || user.photo === undefined) ? 'null/undefined (OK)' : user.photo}`, (user.photo === null || user.photo === undefined) ? 'green' : 'yellow');
      log(`   Genre: ${(user.genre === null || user.genre === undefined) ? 'null/undefined (OK)' : user.genre}`, (user.genre === null || user.genre === undefined) ? 'green' : 'yellow');
      
      log('\n✅ VALIDATION: Champs optionnels fonctionnent correctement', 'green');
      return { success: true, user };
    } else {
      log('❌ Erreur: Pas de données utilisateur dans la réponse', 'red');
      return { success: false };
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    return { success: false };
  }
}

/**
 * TEST 3: Inscription avec photo mais sans genre
 */
async function testInscriptionAvecPhotoSansGenre() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 3: Inscription avec photo mais sans genre', 'cyan');
  log('='.repeat(80), 'cyan');

  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Bernard',
    prenoms: 'Sophie',
    role: 'Acheteur',
    photo: 'https://example.com/photos/sophie.jpg'
    // Pas de genre
  };

  log(`\n📝 Données d'inscription:`, 'blue');
  log(`   Photo: ${userData.photo}`, 'blue');
  log(`   Genre: non fourni`, 'yellow');

  const response = await request('POST', '/auth/register', userData);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok && response.data.user) {
    const user = response.data.user;
    const photoOk = user.photo === userData.photo;
    const genreOk = user.genre === null || user.genre === undefined;
    
    log(`   Photo: ${user.photo}`, photoOk ? 'green' : 'red');
    log(`   Genre: ${user.genre || 'null/undefined'}`, genreOk ? 'green' : 'red');
    
    if (photoOk && genreOk) {
      log('\n✅ VALIDATION: Photo enregistrée, genre null/undefined', 'green');
      return { success: true };
    } else {
      log('\n❌ ERREUR: Comportement inattendu', 'red');
      return { success: false };
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    return { success: false };
  }
}

/**
 * TEST 4: Inscription avec genre mais sans photo
 */
async function testInscriptionAvecGenreSansPhoto() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 4: Inscription avec genre mais sans photo', 'cyan');
  log('='.repeat(80), 'cyan');

  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Leroy',
    prenoms: 'Pierre',
    role: 'Commercant',
    genre: 'Masculin'
    // Pas de photo
  };

  log(`\n📝 Données d'inscription:`, 'blue');
  log(`   Photo: non fournie`, 'yellow');
  log(`   Genre: ${userData.genre}`, 'blue');

  const response = await request('POST', '/auth/register', userData);

  log(`\n📊 Statut: ${response.status}`, response.ok ? 'green' : 'red');
  
  if (response.ok && response.data.user) {
    const user = response.data.user;
    const photoOk = user.photo === null || user.photo === undefined;
    const genreOk = user.genre === userData.genre;
    
    log(`   Photo: ${user.photo || 'null/undefined'}`, photoOk ? 'green' : 'red');
    log(`   Genre: ${user.genre}`, genreOk ? 'green' : 'red');
    
    if (photoOk && genreOk) {
      log('\n✅ VALIDATION: Genre enregistré, photo null/undefined', 'green');
      return { success: true };
    } else {
      log('\n❌ ERREUR: Comportement inattendu', 'red');
      return { success: false };
    }
  } else {
    log(`❌ Échec: ${response.data.message || 'Erreur inconnue'}`, 'red');
    return { success: false };
  }
}

/**
 * TEST 5: Validation genre invalide
 */
async function testGenreInvalide() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 5: Validation genre invalide', 'cyan');
  log('='.repeat(80), 'cyan');

  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Test',
    prenoms: 'Invalid',
    role: 'Acheteur',
    genre: 'Autre' // Genre invalide
  };

  log(`\n📝 Test avec genre invalide: ${userData.genre}`, 'blue');

  const response = await request('POST', '/auth/register', userData);

  log(`\n📊 Statut: ${response.status}`, 'blue');
  
  if (!response.ok && response.status === 400) {
    log(`✅ Succès: Validation rejette le genre invalide`, 'green');
    log(`   Message: ${response.data.message || response.data.errors?.[0]?.msg}`, 'blue');
    return { success: true };
  } else {
    log(`❌ Échec: La validation devrait rejeter ce genre`, 'red');
    return { success: false };
  }
}

/**
 * TEST 6: Mise à jour profil avec photo et genre
 */
async function testMiseAJourProfilPhotoGenre() {
  log('\n' + '='.repeat(80), 'cyan');
  log('TEST 6: Mise à jour profil avec photo et genre', 'cyan');
  log('='.repeat(80), 'cyan');

  // D'abord créer un utilisateur
  const userData = {
    email: generateTestEmail(),
    mdp: 'Test123456!',
    nom: 'Update',
    prenoms: 'Test',
    role: 'Acheteur'
  };

  log(`\n📝 Étape 1: Création utilisateur sans photo ni genre`, 'blue');
  const registerResponse = await request('POST', '/auth/register', userData);

  if (!registerResponse.ok) {
    log(`❌ Échec création utilisateur`, 'red');
    return { success: false };
  }

  const token = registerResponse.data.token;
  log(`✅ Utilisateur créé`, 'green');

  // Mettre à jour avec photo et genre
  log(`\n📝 Étape 2: Mise à jour avec photo et genre`, 'blue');
  const updateData = {
    photo: 'https://example.com/photos/updated.jpg',
    genre: 'Feminin'
  };

  const updateResponse = await request('PUT', '/users/me', updateData, token);

  log(`\n📊 Statut: ${updateResponse.status}`, updateResponse.ok ? 'green' : 'red');
  
  if (updateResponse.ok && updateResponse.data.user) {
    const user = updateResponse.data.user;
    const photoOk = user.photo === updateData.photo;
    const genreOk = user.genre === updateData.genre;
    
    log(`   Photo: ${user.photo}`, photoOk ? 'green' : 'red');
    log(`   Genre: ${user.genre}`, genreOk ? 'green' : 'red');
    
    if (photoOk && genreOk) {
      log('\n✅ VALIDATION: Mise à jour photo et genre réussie', 'green');
      return { success: true };
    } else {
      log('\n❌ ERREUR: Mise à jour incorrecte', 'red');
      return { success: false };
    }
  } else {
    log(`❌ Échec: ${updateResponse.data.message || 'Erreur inconnue'}`, 'red');
    return { success: false };
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '🚀'.repeat(40), 'cyan');
  log('TEST DES CHAMPS PHOTO ET GENRE', 'cyan');
  log('🚀'.repeat(40) + '\n', 'cyan');

  log(`🌐 URL de base: ${BASE_URL}`, 'blue');
  log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');
  log(`🔧 Modifications testées:`, 'blue');
  log(`   - authController.js: Transmission photo et genre`, 'blue');
  log(`   - authService.js: Utilisation valeurs fournies`, 'blue');
  log(`   - routes/auth.js: Validation optionnelle`, 'blue');

  const results = {
    total: 0,
    success: 0,
    failed: 0
  };

  try {
    const tests = [
      { name: 'Inscription avec photo et genre', fn: testInscriptionAvecPhotoEtGenre },
      { name: 'Inscription sans photo ni genre', fn: testInscriptionSansPhotoNiGenre },
      { name: 'Inscription avec photo sans genre', fn: testInscriptionAvecPhotoSansGenre },
      { name: 'Inscription avec genre sans photo', fn: testInscriptionAvecGenreSansPhoto },
      { name: 'Validation genre invalide', fn: testGenreInvalide },
      { name: 'Mise à jour profil photo et genre', fn: testMiseAJourProfilPhotoGenre }
    ];

    for (const test of tests) {
      results.total++;
      const result = await test.fn();
      if (result && result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    // Résumé
    log('\n' + '='.repeat(80), 'cyan');
    log('📊 RÉSUMÉ DES TESTS', 'cyan');
    log('='.repeat(80), 'cyan');

    log(`\n✅ Tests réussis: ${results.success}/${results.total}`, 'green');
    log(`❌ Tests échoués: ${results.failed}/${results.total}`, results.failed > 0 ? 'red' : 'green');
    
    const percentage = ((results.success / results.total) * 100).toFixed(1);
    log(`📈 Taux de réussite: ${percentage}%`, percentage >= 80 ? 'green' : 'yellow');

    if (results.success === results.total) {
      log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
      log('✅ Les modifications photo et genre fonctionnent correctement', 'green');
      log('✅ authController transmet bien les champs', 'green');
      log('✅ authService utilise les valeurs fournies', 'green');
      log('✅ Validation optionnelle fonctionne', 'green');
    } else {
      log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
      log('🔍 Vérifiez les logs ci-dessus pour plus de détails', 'yellow');
    }

    // Informations supplémentaires
    log('\n' + '='.repeat(80), 'cyan');
    log('📝 INFORMATIONS', 'cyan');
    log('='.repeat(80), 'cyan');

    log('\n💡 Champs testés:', 'blue');
    log('   - photo: String (URL ou chemin)', 'blue');
    log('   - genre: Enum (Masculin ou Feminin)', 'blue');
    log('   - Les deux champs sont optionnels', 'blue');

    log('\n📄 Fichiers modifiés:', 'blue');
    log('   - backend/controllers/authController.js', 'blue');
    log('   - backend/services/authService.js', 'blue');
    log('   - backend/routes/auth.js', 'blue');

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }

  log('\n' + '🏁'.repeat(40) + '\n', 'cyan');
}

// Exécution
main().catch(console.error);
