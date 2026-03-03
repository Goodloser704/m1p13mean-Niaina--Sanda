const axios = require('axios');

/**
 * 🔐 Tests des routes Admin et Auth - Serveur Local
 * Test complet des fonctionnalités d'authentification et d'administration
 */

const BASE_URL = 'http://localhost:3000/api';

// Codes couleur pour l'affichage
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Compteurs de résultats
let totalTests = 0;
let testsReussis = 0;
let testsEchoues = 0;

// Tokens d'authentification
let adminToken = '';
let commercantToken = '';
let acheteurToken = '';

// IDs pour les tests
let adminId = '';
let commercantId = '';
let acheteurId = '';
let nouveauUserId = '';

/**
 * Afficher un résultat de test
 */
function afficherResultat(nom, succes, details = '') {
  totalTests++;
  if (succes) {
    testsReussis++;
    console.log(`${colors.green}✓${colors.reset} ${nom}`);
  } else {
    testsEchoues++;
    console.log(`${colors.red}✗${colors.reset} ${nom}`);
  }
  if (details) {
    console.log(`  ${colors.yellow}→${colors.reset} ${details}`);
  }
}

/**
 * Afficher une section
 */
function afficherSection(titre) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${titre}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Authentification des utilisateurs de test
 */
async function authentifierUtilisateurs() {
  afficherSection('🔐 AUTHENTIFICATION DES UTILISATEURS');
  
  try {
    // Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    adminToken = adminRes.data.token;
    adminId = adminRes.data.user.id;
    afficherResultat('Connexion Admin', true, `ID: ${adminId}, Token: ${adminToken.substring(0, 20)}...`);
    
    // Commerçant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    commercantToken = commercantRes.data.token;
    commercantId = commercantRes.data.user.id;
    afficherResultat('Connexion Commerçant', true, `ID: ${commercantId}`);
    
    // Acheteur
    const acheteurRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    acheteurToken = acheteurRes.data.token;
    acheteurId = acheteurRes.data.user.id;
    afficherResultat('Connexion Acheteur', true, `ID: ${acheteurId}`);
    
  } catch (error) {
    console.error(`${colors.red}Erreur d'authentification:${colors.reset}`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Test 1: Inscription d'un nouvel utilisateur
 */
async function testInscription() {
  afficherSection('📝 TEST 1: Inscription d\'un nouvel utilisateur');
  
  try {
    // Inscription réussie - Acheteur
    const timestamp = Date.now();
    const res1 = await axios.post(`${BASE_URL}/auth/register`, {
      email: `acheteur${timestamp}@test.com`,
      mdp: 'Test123456!',
      nom: 'Test',
      prenoms: 'Acheteur',
      role: 'Acheteur',
      telephone: '0123456789',
      photo: 'https://example.com/photo.jpg',
      genre: 'Masculin'
    });
    
    afficherResultat(
      'POST /api/auth/register (Acheteur)',
      res1.status === 201 && res1.data.token && res1.data.user && res1.data.portefeuille,
      `User: ${res1.data.user.id}, Portefeuille: ${res1.data.portefeuille._id}`
    );
    
    nouveauUserId = res1.data.user.id;
    
    // Inscription réussie - Commerçant
    const res2 = await axios.post(`${BASE_URL}/auth/register`, {
      email: `commercant${timestamp}@test.com`,
      mdp: 'Test123456!',
      nom: 'Test',
      prenoms: 'Commercant',
      role: 'Commercant',
      telephone: '0123456789'
    });
    
    afficherResultat(
      'POST /api/auth/register (Commerçant)',
      res2.status === 201 && res2.data.token && res2.data.user,
      `User: ${res2.data.user.id}`
    );
    
    // Test: Email déjà utilisé
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'admin@mall.com',
        mdp: 'Test123456!',
        nom: 'Test',
        prenoms: 'Duplicate',
        role: 'Acheteur',
        telephone: '0123456789'
      });
      afficherResultat('Inscription (Email existant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Inscription (Email existant)',
        error.response?.status === 400 && error.response?.data?.message.includes('déjà utilisé'),
        'Rejeté comme attendu'
      );
    }
    
    // Test: Données invalides
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'invalid-email',
        mdp: '123',
        nom: '',
        prenoms: 'Test',
        role: 'InvalidRole'
      });
      afficherResultat('Inscription (Données invalides)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Inscription (Données invalides)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('POST /api/auth/register', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 2: Connexion utilisateur
 */
async function testConnexion() {
  afficherSection('🔑 TEST 2: Connexion utilisateur');
  
  try {
    // Connexion réussie
    const res1 = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    afficherResultat(
      'POST /api/auth/login (Succès)',
      res1.status === 200 && res1.data.token && res1.data.user,
      `User: ${res1.data.user.id}, Role: ${res1.data.user.role}`
    );
    
    // Test: Email invalide
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'inexistant@test.com',
        mdp: 'Test123456!'
      });
      afficherResultat('Connexion (Email invalide)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Connexion (Email invalide)',
        error.response?.status === 400 && error.response?.data?.message.includes('Identifiants invalides'),
        'Rejeté comme attendu'
      );
    }
    
    // Test: Mot de passe incorrect
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@mall.com',
        mdp: 'MauvaisMotDePasse'
      });
      afficherResultat('Connexion (Mot de passe incorrect)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Connexion (Mot de passe incorrect)',
        error.response?.status === 400 && error.response?.data?.message.includes('Identifiants invalides'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('POST /api/auth/login', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Obtenir le profil utilisateur
 */
async function testObtenirProfil() {
  afficherSection('👤 TEST 3: Obtenir le profil utilisateur');
  
  try {
    // Via /api/auth/me
    const res1 = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/auth/me',
      res1.status === 200 && res1.data.user,
      `User: ${res1.data.user.id}, Email: ${res1.data.user.email}`
    );
    
    // Via /api/auth/profile
    const res2 = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/auth/profile',
      res2.status === 200 && res2.data.user,
      `User: ${res2.data.user.id}, Role: ${res2.data.user.role}`
    );
    
    // Via /api/users/:id/me
    const res3 = await axios.get(`${BASE_URL}/auth/users/${acheteurId}/me`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/users/:id/me',
      res3.status === 200 && res3.data.user,
      `User: ${res3.data.user.id}`
    );
    
    // Test: Sans authentification
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      afficherResultat('GET /api/auth/me (Sans auth)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/auth/me (Sans auth)',
        error.response?.status === 401,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/auth/me', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Mettre à jour le profil utilisateur
 */
async function testMettreAJourProfil() {
  afficherSection('📝 TEST 4: Mettre à jour le profil utilisateur');
  
  try {
    // Via /api/auth/profile
    const res1 = await axios.put(`${BASE_URL}/auth/profile`, {
      nom: 'NouveauNom',
      telephone: '0987654321'
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'PUT /api/auth/profile',
      res1.status === 200 && res1.data.user && res1.data.user.nom === 'NouveauNom',
      `Nom mis à jour: ${res1.data.user.nom}`
    );
    
    // Via /api/users/me
    const res2 = await axios.put(`${BASE_URL}/auth/users/me`, {
      prenoms: 'NouveauPrenom',
      genre: 'Feminin'
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'PUT /api/users/me',
      res2.status === 200 && res2.data.user,
      `Profil mis à jour`
    );
    
    // Test: Email déjà utilisé
    try {
      await axios.put(`${BASE_URL}/auth/profile`, {
        email: 'admin@mall.com'
      }, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Mise à jour profil (Email existant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Mise à jour profil (Email existant)',
        error.response?.status === 400 && error.response?.data?.message.includes('déjà utilisé'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('PUT /api/auth/profile', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Changer le mot de passe
 */
async function testChangerMotDePasse() {
  afficherSection('🔑 TEST 5: Changer le mot de passe');
  
  try {
    // Changement réussi
    const res1 = await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: 'Client123456!',
      newPassword: 'NouveauMdp123456!'
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'PUT /api/auth/change-password (Succès)',
      res1.status === 200 && res1.data.message,
      res1.data.message
    );
    
    // Vérifier que le nouveau mot de passe fonctionne
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'NouveauMdp123456!'
    });
    
    afficherResultat(
      'Connexion avec nouveau mot de passe',
      loginRes.status === 200 && loginRes.data.token,
      'Nouveau mot de passe valide'
    );
    
    // Remettre l'ancien mot de passe
    await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: 'NouveauMdp123456!',
      newPassword: 'Client123456!'
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    // Test: Mot de passe actuel incorrect
    try {
      await axios.put(`${BASE_URL}/auth/change-password`, {
        currentPassword: 'MauvaisMotDePasse',
        newPassword: 'NouveauMdp123456!'
      }, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Changement mot de passe (Incorrect)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Changement mot de passe (Incorrect)',
        error.response?.status === 400 && error.response?.data?.message.includes('incorrect'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('PUT /api/auth/change-password', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Rechercher des utilisateurs (Admin)
 */
async function testRechercherUtilisateurs() {
  afficherSection('🔍 TEST 6: Rechercher des utilisateurs (Admin)');
  
  try {
    // Recherche réussie
    const res1 = await axios.get(`${BASE_URL}/auth/users/search?q=test`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/auth/users/search (Admin)',
      res1.status === 200 && res1.data.users && res1.data.count !== undefined,
      `${res1.data.count} utilisateurs trouvés`
    );
    
    // Recherche avec filtre de rôle
    const res2 = await axios.get(`${BASE_URL}/auth/users/search?q=test&role=Commercant`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/auth/users/search (Avec filtre rôle)',
      res2.status === 200 && res2.data.users,
      `${res2.data.count} commerçants trouvés`
    );
    
    // Test: Requête trop courte
    try {
      await axios.get(`${BASE_URL}/auth/users/search?q=a`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Recherche (Requête courte)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Recherche (Requête courte)',
        error.response?.status === 400 && error.response?.data?.message.includes('2 caractères'),
        'Rejeté comme attendu'
      );
    }
    
    // Test: Non-admin ne peut pas rechercher
    try {
      await axios.get(`${BASE_URL}/auth/users/search?q=test`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Recherche (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Recherche (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('GET /api/auth/users/search', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 7: Mettre à jour le statut d'un utilisateur (Admin)
 */
async function testMettreAJourStatutUtilisateur() {
  afficherSection('🔄 TEST 7: Mettre à jour le statut d\'un utilisateur (Admin)');
  
  if (!nouveauUserId) {
    afficherResultat('Mise à jour statut utilisateur', false, 'Pas d\'utilisateur disponible pour le test');
    return;
  }
  
  try {
    // Désactiver un utilisateur
    const res1 = await axios.put(`${BASE_URL}/auth/users/${nouveauUserId}/status`, {
      isActive: false
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/auth/users/:userId/status (Désactiver)',
      res1.status === 200 && res1.data.user,
      `Utilisateur désactivé: ${res1.data.user.id}`
    );
    
    // Réactiver l'utilisateur
    const res2 = await axios.put(`${BASE_URL}/auth/users/${nouveauUserId}/status`, {
      isActive: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/auth/users/:userId/status (Réactiver)',
      res2.status === 200 && res2.data.user,
      `Utilisateur réactivé: ${res2.data.user.id}`
    );
    
    // Test: Non-admin ne peut pas modifier
    try {
      await axios.put(`${BASE_URL}/auth/users/${nouveauUserId}/status`, {
        isActive: false
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Mise à jour statut (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Mise à jour statut (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('PUT /api/auth/users/:userId/status', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 8: Obtenir les statistiques du dashboard admin
 */
async function testDashboardAdmin() {
  afficherSection('📊 TEST 8: Obtenir les statistiques du dashboard admin');
  
  try {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/admin/dashboard',
      res.status === 200 && res.data.boutiques && res.data.espaces && res.data.utilisateurs,
      `Boutiques: ${res.data.boutiques.total}, Espaces: ${res.data.espaces.total}, Users: ${res.data.utilisateurs.total}`
    );
    
    console.log(`\n  ${colors.magenta}Détails des statistiques:${colors.reset}`);
    console.log(`  - Boutiques:`);
    console.log(`    • Total: ${res.data.boutiques.total}`);
    console.log(`    • Actives: ${res.data.boutiques.actives}`);
    console.log(`    • Inactives: ${res.data.boutiques.inactives}`);
    console.log(`    • En attente: ${res.data.boutiques.enAttente}`);
    
    console.log(`  - Espaces:`);
    console.log(`    • Total: ${res.data.espaces.total}`);
    console.log(`    • Occupés: ${res.data.espaces.occupes}`);
    console.log(`    • Libres: ${res.data.espaces.libres}`);
    console.log(`    • Taux d'occupation: ${res.data.espaces.tauxOccupation}%`);
    
    console.log(`  - Utilisateurs:`);
    console.log(`    • Total: ${res.data.utilisateurs.total}`);
    console.log(`    • Commerçants: ${res.data.utilisateurs.commercants}`);
    console.log(`    • Acheteurs: ${res.data.utilisateurs.acheteurs}`);
    
    // Test: Non-admin ne peut pas accéder
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Dashboard (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Dashboard (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/admin/dashboard', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 9: Supprimer un compte utilisateur
 */
async function testSupprimerCompte() {
  afficherSection('🗑️ TEST 9: Supprimer un compte utilisateur');
  
  if (!nouveauUserId) {
    afficherResultat('Suppression compte', false, 'Pas d\'utilisateur disponible pour le test');
    return;
  }
  
  try {
    // Créer un nouvel utilisateur pour le supprimer
    const timestamp = Date.now();
    const createRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `delete${timestamp}@test.com`,
      mdp: 'Test123456!',
      nom: 'ToDelete',
      prenoms: 'User',
      role: 'Acheteur',
      telephone: '0123456789'
    });
    
    const deleteToken = createRes.data.token;
    const deleteUserId = createRes.data.user.id;
    
    // Supprimer le compte
    const res = await axios.delete(`${BASE_URL}/auth/account`, {
      headers: { Authorization: `Bearer ${deleteToken}` }
    });
    
    afficherResultat(
      'DELETE /api/auth/account',
      res.status === 200 && res.data.message,
      res.data.message
    );
    
    // Vérifier que le compte est supprimé
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${deleteToken}` }
      });
      afficherResultat('Vérification suppression', false, 'Le compte devrait être supprimé');
    } catch (error) {
      afficherResultat(
        'Vérification suppression',
        error.response?.status === 404 || error.response?.status === 401,
        'Compte supprimé avec succès'
      );
    }
    
    // Test: Admin ne peut pas supprimer son compte
    try {
      await axios.delete(`${BASE_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Suppression compte (Admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Suppression compte (Admin)',
        error.response?.status === 403 && error.response?.data?.message.includes('administrateur'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('DELETE /api/auth/account', false, error.response?.data?.message || error.message);
  }
}

/**
 * Afficher le résumé final
 */
function afficherResume() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}RÉSUMÉ DES TESTS${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  console.log(`Total de tests: ${totalTests}`);
  console.log(`${colors.green}✓ Tests réussis: ${testsReussis}${colors.reset}`);
  console.log(`${colors.red}✗ Tests échoués: ${testsEchoues}${colors.reset}`);
  
  const pourcentage = ((testsReussis / totalTests) * 100).toFixed(2);
  console.log(`\nTaux de réussite: ${pourcentage}%`);
  
  if (testsEchoues === 0) {
    console.log(`\n${colors.green}🎉 Tous les tests sont passés avec succès!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.${colors.reset}\n`);
  }
}

/**
 * Fonction principale
 */
async function executerTests() {
  console.log(`${colors.magenta}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🔐 TESTS DES ROUTES ADMIN & AUTH - LOCAL 🔐        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await testInscription();
    await testConnexion();
    await testObtenirProfil();
    await testMettreAJourProfil();
    await testChangerMotDePasse();
    await testRechercherUtilisateurs();
    await testMettreAJourStatutUtilisateur();
    await testDashboardAdmin();
    await testSupprimerCompte();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
