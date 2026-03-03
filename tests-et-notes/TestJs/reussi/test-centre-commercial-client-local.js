const axios = require('axios');

/**
 * 🏢 Tests des routes Centre Commercial et Client - Serveur Local
 * Test complet des fonctionnalités centre commercial et client
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
let boutiqueId = '';

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
    afficherResultat('Connexion Admin', true, `Token: ${adminToken.substring(0, 20)}...`);
    
    // Commerçant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    commercantToken = commercantRes.data.token;
    afficherResultat('Connexion Commerçant', true);
    
    // Acheteur
    const acheteurRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    acheteurToken = acheteurRes.data.token;
    afficherResultat('Connexion Acheteur', true);
    
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
 * Test 1: Routes Centre Commercial (publiques)
 */
async function testCentreCommercialPublic() {
  afficherSection('🏢 TEST 1: Routes Centre Commercial (publiques)');
  
  try {
    // Obtenir les informations du centre commercial (sans auth)
    const res1 = await axios.get(`${BASE_URL}/centre-commercial`);
    afficherResultat(
      'GET /api/centre-commercial (Sans auth)',
      res1.status === 200 && res1.data.centreCommercial,
      `Centre: ${res1.data.centreCommercial?.nom || 'Non défini'}`
    );
    
  } catch (error) {
    // Si le centre commercial n'existe pas encore, c'est normal
    if (error.response?.status === 404) {
      afficherResultat(
        'GET /api/centre-commercial (Sans auth)',
        true,
        'Centre commercial non encore créé (normal)'
      );
    } else {
      afficherResultat('GET /api/centre-commercial', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * Test 2: Gestion du Centre Commercial (Admin)
 */
async function testGestionCentreCommercial() {
  afficherSection('🔧 TEST 2: Gestion du Centre Commercial (Admin)');
  
  try {
    // Créer/Mettre à jour le centre commercial
    const res1 = await axios.put(`${BASE_URL}/centre-commercial`, {
      nom: 'Mall Test Center',
      description: 'Centre commercial de test',
      adresse: '123 Rue Test, Ville Test',
      email: 'contact@malltest.com',
      telephone: '+261 34 00 000 00',
      horairesGeneraux: [
        { jour: 'Lundi', debut: '09:00', fin: '20:00' },
        { jour: 'Mardi', debut: '09:00', fin: '20:00' }
      ]
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/centre-commercial (Admin)',
      res1.status === 200 && res1.data.centreCommercial,
      `Centre: ${res1.data.centreCommercial.nom}`
    );
    
    // Obtenir les statistiques
    const res2 = await axios.get(`${BASE_URL}/centre-commercial/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/centre-commercial/stats (Admin)',
      res2.status === 200 && res2.data.statistiques,
      `Boutiques: ${res2.data.statistiques.nombreBoutiques}, Espaces: ${res2.data.statistiques.nombreEspaces}`
    );
    
    // Test: Non-admin ne peut pas modifier
    try {
      await axios.put(`${BASE_URL}/centre-commercial`, {
        nom: 'Unauthorized Update'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Modification centre (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Modification centre (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
    // Test: Non-admin ne peut pas voir les stats
    try {
      await axios.get(`${BASE_URL}/centre-commercial/stats`, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Stats centre (Non-admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Stats centre (Non-admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('Gestion Centre Commercial', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Routes Client - Boutiques
 */
async function testClientBoutiques() {
  afficherSection('🏪 TEST 3: Routes Client - Boutiques');
  
  try {
    // Liste des boutiques (sans auth)
    const res1 = await axios.get(`${BASE_URL}/client/boutiques`);
    afficherResultat(
      'GET /api/client/boutiques (Sans auth)',
      res1.status === 200 && res1.data.boutiques && res1.data.total !== undefined,
      `${res1.data.total} boutiques trouvées`
    );
    
    if (res1.data.boutiques.length > 0) {
      boutiqueId = res1.data.boutiques[0]._id;
    }
    
    // Liste avec pagination
    const res2 = await axios.get(`${BASE_URL}/client/boutiques?page=1&limit=5`);
    afficherResultat(
      'GET /api/client/boutiques (Avec pagination)',
      res2.status === 200 && res2.data.boutiques.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.boutiques.length}`
    );
    
    // Liste avec recherche
    const res3 = await axios.get(`${BASE_URL}/client/boutiques?search=test`);
    afficherResultat(
      'GET /api/client/boutiques (Avec recherche)',
      res3.status === 200 && res3.data.boutiques,
      `${res3.data.total} résultats pour "test"`
    );
    
    // Détails d'une boutique
    if (boutiqueId) {
      const res4 = await axios.get(`${BASE_URL}/client/boutiques/${boutiqueId}`);
      afficherResultat(
        'GET /api/client/boutiques/:id',
        res4.status === 200 && res4.data._id,
        `Boutique: ${res4.data.nom}`
      );
      
      // Produits d'une boutique
      const res5 = await axios.get(`${BASE_URL}/client/boutiques/${boutiqueId}/products`);
      afficherResultat(
        'GET /api/client/boutiques/:id/products',
        res5.status === 200 && res5.data.products !== undefined,
        `${res5.data.total} produits`
      );
      
      // Produits avec pagination
      const res6 = await axios.get(`${BASE_URL}/client/boutiques/${boutiqueId}/products?page=1&limit=5`);
      afficherResultat(
        'GET /api/client/boutiques/:id/products (Pagination)',
        res6.status === 200 && res6.data.products.length <= 5,
        `Page 1, Limite: 5, Reçu: ${res6.data.products.length}`
      );
    }
    
    // Test: Boutique inexistante
    try {
      await axios.get(`${BASE_URL}/client/boutiques/507f1f77bcf86cd799439011`);
      afficherResultat('Boutique inexistante', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Boutique inexistante',
        error.response?.status === 404,
        'Non trouvée comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('Routes Client Boutiques', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Routes Client - Recherche
 */
async function testClientRecherche() {
  afficherSection('🔍 TEST 4: Routes Client - Recherche');
  
  try {
    // Recherche globale
    const res1 = await axios.get(`${BASE_URL}/client/search?q=test`);
    afficherResultat(
      'GET /api/client/search?q=test',
      res1.status === 200 && (res1.data.boutiques || res1.data.products),
      `Boutiques: ${res1.data.boutiques?.length || 0}, Produits: ${res1.data.products?.length || 0}`
    );
    
    // Recherche boutiques uniquement
    const res2 = await axios.get(`${BASE_URL}/client/search?q=test&type=boutiques`);
    afficherResultat(
      'GET /api/client/search (Type: boutiques)',
      res2.status === 200 && res2.data.boutiques,
      `${res2.data.boutiques.length} boutiques trouvées`
    );
    
    // Recherche produits uniquement
    const res3 = await axios.get(`${BASE_URL}/client/search?q=test&type=products`);
    afficherResultat(
      'GET /api/client/search (Type: products)',
      res3.status === 200 && res3.data.products,
      `${res3.data.products.length} produits trouvés`
    );
    
    // Test: Recherche sans terme
    try {
      await axios.get(`${BASE_URL}/client/search`);
      afficherResultat('Recherche sans terme', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Recherche sans terme',
        error.response?.status === 400 && error.response?.data?.message.includes('requis'),
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('Routes Client Recherche', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Routes Client - Catégories
 */
async function testClientCategories() {
  afficherSection('📋 TEST 5: Routes Client - Catégories');
  
  try {
    // Liste des catégories
    const res = await axios.get(`${BASE_URL}/client/categories`);
    afficherResultat(
      'GET /api/client/categories',
      res.status === 200 && Array.isArray(res.data),
      `${res.data.length} catégories trouvées`
    );
    
  } catch (error) {
    afficherResultat('Routes Client Catégories', false, error.response?.data?.message || error.message);
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
║  🏢 TESTS DES ROUTES CENTRE COMMERCIAL & CLIENT - LOCAL  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await testCentreCommercialPublic();
    await testGestionCentreCommercial();
    await testClientBoutiques();
    await testClientRecherche();
    await testClientCategories();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
