const axios = require('axios');

/**
 * 🏪 Tests des routes Boutiques et Catégories - Serveur Local
 * Test complet des fonctionnalités boutiques et catégories
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
let categorieId = '';
let boutiqueId = '';
let nouvelleCategorieId = '';

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
    afficherResultat('Connexion Admin', true, `ID: ${adminId}`);
    
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
    afficherResultat('Connexion Acheteur', true, `ID: ${acheteurRes.data.user.id}`);
    
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
 * Test 1: Routes catégories boutique (publiques)
 */
async function testCategoriesBoutique() {
  afficherSection('📋 TEST 1: Routes catégories boutique (publiques)');
  
  try {
    // Test route de test
    const testRes = await axios.get(`${BASE_URL}/categories-boutique/test`);
    afficherResultat(
      'GET /api/categories-boutique/test',
      testRes.status === 200 && testRes.data.message,
      `${testRes.data.counts.totalCategories} catégories en base`
    );
    
    // Obtenir toutes les catégories (sans auth)
    const res1 = await axios.get(`${BASE_URL}/categories-boutique`);
    afficherResultat(
      'GET /api/categories-boutique (Sans auth)',
      res1.status === 200 && res1.data.categories && res1.data.count !== undefined,
      `${res1.data.count} catégories trouvées`
    );
    
    if (res1.data.categories.length > 0) {
      categorieId = res1.data.categories[0]._id;
    }
    
    // Obtenir catégories actives uniquement
    const res2 = await axios.get(`${BASE_URL}/categories-boutique?actives=true`);
    afficherResultat(
      'GET /api/categories-boutique?actives=true',
      res2.status === 200 && res2.data.categories,
      `${res2.data.count} catégories actives`
    );
    
    // Obtenir une catégorie par ID
    if (categorieId) {
      const res3 = await axios.get(`${BASE_URL}/categories-boutique/${categorieId}`);
      afficherResultat(
        'GET /api/categories-boutique/:id',
        res3.status === 200 && res3.data.categorie,
        `Catégorie: ${res3.data.categorie.nom}`
      );
    }
    
  } catch (error) {
    afficherResultat('Routes catégories publiques', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 2: Gestion des catégories (Admin)
 */
async function testGestionCategories() {
  afficherSection('🔧 TEST 2: Gestion des catégories (Admin)');
  
  try {
    // Créer une nouvelle catégorie
    const timestamp = Date.now();
    const res1 = await axios.post(`${BASE_URL}/categories-boutique`, {
      nom: `Test Catégorie ${timestamp}`,
      description: 'Catégorie de test',
      icone: '🧪',
      couleur: '#FF5733'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'POST /api/categories-boutique (Admin)',
      res1.status === 201 && res1.data.categorie,
      `Catégorie créée: ${res1.data.categorie.nom}`
    );
    
    nouvelleCategorieId = res1.data.categorie._id;
    
    // Mettre à jour la catégorie
    const res2 = await axios.put(`${BASE_URL}/categories-boutique/${nouvelleCategorieId}`, {
      nom: `Test Catégorie ${timestamp} Updated`,
      description: 'Description mise à jour',
      couleur: '#00FF00'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/categories-boutique/:id (Admin)',
      res2.status === 200 && res2.data.categorie,
      'Catégorie mise à jour'
    );
    
    // Obtenir les statistiques
    const res3 = await axios.get(`${BASE_URL}/categories-boutique/admin/statistiques`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/categories-boutique/admin/statistiques',
      res3.status === 200 && res3.data.totalCategories !== undefined,
      `Total: ${res3.data.totalCategories}, Actives: ${res3.data.categoriesActives}`
    );
    
    // Test: Non-admin ne peut pas créer
    try {
      await axios.post(`${BASE_URL}/categories-boutique`, {
        nom: 'Test Unauthorized',
        description: 'Test'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Création catégorie (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Création catégorie (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
    // Test: Catégorie avec nom existant (créer une nouvelle pour tester)
    try {
      const testName = 'Catégorie Test Duplicate';
      // Créer d'abord une catégorie
      await axios.post(`${BASE_URL}/categories-boutique`, {
        nom: testName,
        description: 'Test'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      // Essayer de créer une catégorie avec le même nom
      await axios.post(`${BASE_URL}/categories-boutique`, {
        nom: testName,
        description: 'Duplicate'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Création catégorie (Nom existant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Création catégorie (Nom existant)',
        error.response?.status === 400 && error.response?.data?.message.includes('existe déjà'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('Gestion catégories Admin', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Routes boutiques publiques
 */
async function testBoutiquesPubliques() {
  afficherSection('🏪 TEST 3: Routes boutiques publiques');
  
  try {
    // Obtenir toutes les boutiques
    const res1 = await axios.get(`${BASE_URL}/boutique`);
    afficherResultat(
      'GET /api/boutique (Sans auth)',
      res1.status === 200 && res1.data.boutiques && res1.data.count !== undefined,
      `${res1.data.count} boutiques trouvées`
    );
    
    if (res1.data.boutiques.length > 0) {
      boutiqueId = res1.data.boutiques[0]._id;
    }
    
    // Obtenir boutiques avec pagination
    const res2 = await axios.get(`${BASE_URL}/boutique?page=1&limit=5`);
    afficherResultat(
      'GET /api/boutique (Avec pagination)',
      res2.status === 200 && res2.data.boutiques.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.boutiques.length}`
    );
    
    // Obtenir boutiques par statut
    const res3 = await axios.get(`${BASE_URL}/boutique/by-statut?statut=Actif`);
    afficherResultat(
      'GET /api/boutique/by-statut?statut=Actif',
      res3.status === 200 && res3.data.boutiques,
      `${res3.data.count} boutiques actives`
    );
    
    // Rechercher des boutiques
    const res4 = await axios.get(`${BASE_URL}/boutique/search?keyword=test`);
    afficherResultat(
      'GET /api/boutique/search?keyword=test',
      res4.status === 200 && res4.data.boutiques && res4.data.pagination,
      `${res4.data.count} résultats`
    );
    
    // Obtenir produits d'une boutique
    if (boutiqueId) {
      const res5 = await axios.get(`${BASE_URL}/boutique/${boutiqueId}/produits`);
      afficherResultat(
        'GET /api/boutique/:id/produits',
        res5.status === 200 && res5.data.produits !== undefined,
        `${res5.data.produits.length} produits`
      );
    }
    
    // Test: Recherche avec mot-clé trop court
    try {
      await axios.get(`${BASE_URL}/boutique/search?keyword=a`);
      afficherResultat('Recherche (Mot-clé court)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Recherche (Mot-clé court)',
        error.response?.status === 400 && error.response?.data?.message.includes('2 caractères'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('Routes boutiques publiques', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Création et gestion de boutique (Commerçant)
 */
async function testGestionBoutique() {
  afficherSection('🏪 TEST 4: Création et gestion de boutique (Commerçant)');
  
  if (!categorieId) {
    afficherResultat('Gestion boutique', false, 'Pas de catégorie disponible pour le test');
    return;
  }
  
  try {
    // Créer une nouvelle boutique
    const timestamp = Date.now();
    const res1 = await axios.post(`${BASE_URL}/boutique/register`, {
      nom: `Boutique Test ${timestamp}`,
      description: 'Boutique de test',
      categorie: categorieId,
      photo: 'https://example.com/photo.jpg'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'POST /api/boutique/register (Commerçant)',
      res1.status === 201 && res1.data.boutique,
      `Boutique créée: ${res1.data.boutique.nom}`
    );
    
    const nouvelleBoutiqueId = res1.data.boutique._id;
    
    // Obtenir mes boutiques
    const res2 = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/boutique/my-boutiques',
      res2.status === 200 && res2.data.boutiques && res2.data.count !== undefined,
      `${res2.data.count} boutiques trouvées`
    );
    
    // Obtenir une boutique spécifique
    const res3 = await axios.get(`${BASE_URL}/boutique/me/${nouvelleBoutiqueId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/boutique/me/:boutiqueId',
      res3.status === 200 && res3.data.boutique,
      `Boutique: ${res3.data.boutique.nom}`
    );
    
    // Obtenir boutiques du commerçant
    const res4 = await axios.get(`${BASE_URL}/boutique/commercant/${commercantId}/boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/commercant/:id/boutiques',
      res4.status === 200 && res4.data.boutiques,
      `${res4.data.boutiques.length} boutiques`
    );
    
    // Mettre à jour la boutique
    const res5 = await axios.put(`${BASE_URL}/boutique/me/${nouvelleBoutiqueId}`, {
      description: 'Description mise à jour',
      horairesHebdo: [
        { jour: 'Lundi', debut: '09:00', fin: '18:00' }
      ]
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'PUT /api/boutique/me/:boutiqueId',
      res5.status === 200 && res5.data.boutique,
      'Boutique mise à jour'
    );
    
    // Test: Acheteur ne peut pas créer de boutique
    try {
      await axios.post(`${BASE_URL}/boutique/register`, {
        nom: 'Test Unauthorized',
        description: 'Test',
        categorie: categorieId
      }, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Création boutique (Acheteur)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Création boutique (Acheteur)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
    // Test: Création sans catégorie
    try {
      await axios.post(`${BASE_URL}/boutique/register`, {
        nom: 'Test Sans Catégorie',
        description: 'Test'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Création boutique (Sans catégorie)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Création boutique (Sans catégorie)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    afficherResultat('Gestion boutique Commerçant', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Gestion des boutiques (Admin)
 */
async function testGestionBoutiquesAdmin() {
  afficherSection('🔧 TEST 5: Gestion des boutiques (Admin)');
  
  try {
    // Obtenir toutes les boutiques (Admin)
    const res1 = await axios.get(`${BASE_URL}/boutique/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/boutique/all (Admin)',
      res1.status === 200 && res1.data.boutiques,
      `${res1.data.count} boutiques trouvées`
    );
    
    // Obtenir les boutiques en attente
    const res2 = await axios.get(`${BASE_URL}/boutique/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/boutique/pending (Admin)',
      res2.status === 200 && res2.data.boutiques !== undefined,
      `${res2.data.count} boutiques en attente`
    );
    
    // Obtenir les statistiques
    const res3 = await axios.get(`${BASE_URL}/boutique/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/boutique/admin/stats',
      res3.status === 200 && res3.data,
      'Statistiques récupérées'
    );
    
    // Test: Non-admin ne peut pas accéder aux stats
    try {
      await axios.get(`${BASE_URL}/boutique/admin/stats`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Stats boutiques (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Stats boutiques (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('Gestion boutiques Admin', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Suppression de catégorie
 */
async function testSuppressionCategorie() {
  afficherSection('🗑️ TEST 6: Suppression de catégorie');
  
  if (!nouvelleCategorieId) {
    afficherResultat('Suppression catégorie', false, 'Pas de catégorie disponible pour le test');
    return;
  }
  
  try {
    // Supprimer la catégorie créée
    const res = await axios.delete(`${BASE_URL}/categories-boutique/${nouvelleCategorieId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'DELETE /api/categories-boutique/:id',
      res.status === 200 && res.data.message,
      res.data.message
    );
    
    // Vérifier que la catégorie est supprimée
    try {
      await axios.get(`${BASE_URL}/categories-boutique/${nouvelleCategorieId}`);
      afficherResultat('Vérification suppression catégorie', false, 'La catégorie devrait être supprimée');
    } catch (error) {
      afficherResultat(
        'Vérification suppression catégorie',
        error.response?.status === 404,
        'Catégorie supprimée avec succès'
      );
    }
    
    // Test: Non-admin ne peut pas supprimer
    if (categorieId) {
      try {
        await axios.delete(`${BASE_URL}/categories-boutique/${categorieId}`, {
          headers: { Authorization: `Bearer ${commercantToken}` }
        });
        afficherResultat('Suppression catégorie (Non-admin)', false, 'Devrait échouer');
      } catch (error) {
        afficherResultat(
          'Suppression catégorie (Non-admin)',
          error.response?.status === 403,
          'Accès refusé comme attendu'
        );
      }
    }
    
  } catch (error) {
    afficherResultat('Suppression catégorie', false, error.response?.data?.message || error.message);
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
║   🏪 TESTS DES ROUTES BOUTIQUES & CATÉGORIES - LOCAL 🏪  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await testCategoriesBoutique();
    await testGestionCategories();
    await testBoutiquesPubliques();
    await testGestionBoutique();
    await testGestionBoutiquesAdmin();
    await testSuppressionCategorie();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
