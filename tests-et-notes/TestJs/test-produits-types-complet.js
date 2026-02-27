/**
 * 🧪 Test Complet - Routes Produits et Types-Produits
 * Test de toutes les routes produits et types-produits en local
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

// Variables globales pour les tests
let adminToken = '';
let commercantToken = '';
let clientToken = '';
let boutiqueId = '';
let produitId = '';
let typeProduitId = '';

/**
 * Afficher un résultat de test
 */
function logTest(name, success, details = '') {
  stats.total++;
  if (success) {
    stats.success++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    stats.failed++;
    stats.errors.push({ name, details });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (details) console.log(`  ${colors.yellow}${details}${colors.reset}`);
  }
}

/**
 * Afficher une section
 */
function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

/**
 * Afficher les statistiques finales
 */
function logStats() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}RÉSULTATS FINAUX${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`Total: ${stats.total}`);
  console.log(`${colors.green}Réussis: ${stats.success}${colors.reset}`);
  console.log(`${colors.red}Échoués: ${stats.failed}${colors.reset}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n${colors.red}ERREURS:${colors.reset}`);
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.name}`);
      if (error.details) console.log(`   ${error.details}`);
    });
  }
  
  const successRate = ((stats.success / stats.total) * 100).toFixed(2);
  console.log(`\n${colors.blue}Taux de réussite: ${successRate}%${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

/**
 * 1. AUTHENTIFICATION
 */
async function testAuthentification() {
  logSection('1. AUTHENTIFICATION');
  
  try {
    // Login Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    adminToken = adminRes.data.token;
    logTest('Login Admin', !!adminToken);
    
    // Login Commercant
    const commercantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    commercantToken = commercantRes.data.token;
    logTest('Login Commercant', !!commercantToken);
    
    // Login Client
    const clientRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    
    clientToken = clientRes.data.token;
    logTest('Login Client', !!clientToken);
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES PRODUITS - PUBLIQUES
 */
async function testProduitsPubliques() {
  logSection('2. ROUTES PRODUITS - PUBLIQUES');
  
  // 2.1 Route de test
  try {
    const res = await axios.get(`${BASE_URL}/produits/test`);
    logTest('GET /produits/test - Route de test', res.status === 200);
  } catch (error) {
    logTest('GET /produits/test', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Obtenir tous les produits
  try {
    const res = await axios.get(`${BASE_URL}/produits`);
    
    if (res.data.produits && res.data.produits.length > 0) {
      produitId = res.data.produits[0]._id;
      console.log(`  ℹ Produit trouvé: ${produitId}`);
    }
    logTest('GET /produits - Liste des produits', res.status === 200);
  } catch (error) {
    logTest('GET /produits', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 Obtenir produits avec pagination
  try {
    const res = await axios.get(`${BASE_URL}/produits?page=1&limit=5`);
    logTest('GET /produits?page&limit - Pagination', res.status === 200);
  } catch (error) {
    logTest('GET /produits?page&limit', false, error.response?.data?.message || error.message);
  }
  
  // 2.4 Obtenir produits avec recherche
  try {
    const res = await axios.get(`${BASE_URL}/produits?search=test`);
    logTest('GET /produits?search - Recherche', res.status === 200);
  } catch (error) {
    logTest('GET /produits?search', false, error.response?.data?.message || error.message);
  }
  
  // 2.5 Obtenir un produit par ID
  if (produitId) {
    try {
      const res = await axios.get(`${BASE_URL}/produits/${produitId}`);
      logTest('GET /produits/:id - Produit par ID', res.status === 200);
    } catch (error) {
      logTest('GET /produits/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.6 Récupérer une boutique pour les tests
  try {
    const res = await axios.get(
      `${BASE_URL}/boutique/my-boutiques`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (res.data.boutiques && res.data.boutiques.length > 0) {
      boutiqueId = res.data.boutiques[0]._id;
      console.log(`  ℹ Boutique trouvée: ${boutiqueId}`);
    }
    logTest('Récupération boutique pour tests', res.status === 200);
  } catch (error) {
    logTest('Récupération boutique', false, error.response?.data?.message || error.message);
  }
  
  // 2.7 Obtenir produits par boutique
  if (boutiqueId) {
    try {
      const res = await axios.get(`${BASE_URL}/produits/boutique/${boutiqueId}`);
      logTest('GET /produits/boutique/:id - Produits par boutique', res.status === 200);
    } catch (error) {
      logTest('GET /produits/boutique/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 3. ROUTES PRODUITS - COMMERCANT
 */
async function testProduitsCommercant() {
  logSection('3. ROUTES PRODUITS - COMMERCANT');
  
  // 3.0 Créer un type de produit d'abord (requis pour créer un produit)
  if (boutiqueId && !typeProduitId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/types-produit`,
        {
          type: `Type Pour Test Produit ${Date.now()}`,
          description: 'Type créé pour tester la création de produit',
          boutique: boutiqueId,
          icone: '📦',
          couleur: '#4CAF50'
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      if (res.data.typeProduit) {
        typeProduitId = res.data.typeProduit._id;
        console.log(`  ℹ Type créé pour tests: ${typeProduitId}`);
      }
      logTest('Création type pour tests produits', res.status === 201 || res.status === 200);
    } catch (error) {
      logTest('Création type pour tests', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.1 Obtenir mes produits
  try {
    const res = await axios.get(
      `${BASE_URL}/produits/me`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /produits/me - Mes produits', res.status === 200);
  } catch (error) {
    logTest('GET /produits/me', false, error.response?.data?.message || error.message);
  }
  
  // 3.2 Créer un produit
  if (boutiqueId && typeProduitId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/produits`,
        {
          nom: 'Produit Test Auto',
          description: 'Produit créé automatiquement par les tests',
          prix: 29.99,
          boutique: boutiqueId,
          typeProduit: typeProduitId,
          stock: {
            nombreDispo: 100
          },
          tempsPreparation: '00:30:00'
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      if (res.data.produit) {
        produitId = res.data.produit._id;
        console.log(`  ℹ Produit créé: ${produitId}`);
      }
      logTest('POST /produits - Créer produit', res.status === 201);
    } catch (error) {
      logTest('POST /produits', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.3 Modifier un produit
  if (produitId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/produits/${produitId}`,
        {
          nom: 'Produit Test Modifié',
          prix: 39.99
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('PUT /produits/:id - Modifier produit', res.status === 200);
    } catch (error) {
      logTest('PUT /produits/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.4 Modifier le stock
  if (produitId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/produits/${produitId}/stock`,
        {
          nombreDispo: 150
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('PUT /produits/:id/stock - Modifier stock', res.status === 200);
    } catch (error) {
      logTest('PUT /produits/:id/stock', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.5 Supprimer un produit (soft delete)
  if (produitId) {
    try {
      const res = await axios.delete(
        `${BASE_URL}/produits/${produitId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('DELETE /produits/:id - Supprimer produit', res.status === 200);
    } catch (error) {
      logTest('DELETE /produits/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 4. ROUTES TYPES-PRODUIT - PUBLIQUES
 */
async function testTypesProduitPubliques() {
  logSection('4. ROUTES TYPES-PRODUIT - PUBLIQUES');
  
  // 4.1 Obtenir tous les types
  try {
    const res = await axios.get(`${BASE_URL}/types-produit`);
    
    if (res.data.types && res.data.types.length > 0) {
      typeProduitId = res.data.types[0]._id;
      console.log(`  ℹ Type produit trouvé: ${typeProduitId}`);
    }
    logTest('GET /types-produit - Liste des types', res.status === 200);
  } catch (error) {
    logTest('GET /types-produit', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 Obtenir types par boutique
  if (boutiqueId) {
    try {
      const res = await axios.get(`${BASE_URL}/types-produit/boutique/${boutiqueId}`);
      logTest('GET /types-produit/boutique/:id - Types par boutique', res.status === 200);
    } catch (error) {
      logTest('GET /types-produit/boutique/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 5. ROUTES TYPES-PRODUIT - COMMERCANT
 */
async function testTypesProduitCommercant() {
  logSection('5. ROUTES TYPES-PRODUIT - COMMERCANT');
  
  // 5.1 Obtenir mes types
  try {
    const res = await axios.get(
      `${BASE_URL}/types-produit/me`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /types-produit/me - Mes types', res.status === 200);
  } catch (error) {
    logTest('GET /types-produit/me', false, error.response?.data?.message || error.message);
  }
  
  // 5.2 Créer un type de produit
  if (boutiqueId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/types-produit`,
        {
          type: `Type Test Auto ${Date.now()}`,
          description: 'Type créé automatiquement par les tests',
          boutique: boutiqueId,
          icone: '🧪',
          couleur: '#FF5733'
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      if (res.data.typeProduit) {
        typeProduitId = res.data.typeProduit._id;
        console.log(`  ℹ Type créé: ${typeProduitId}`);
      }
      logTest('POST /types-produit - Créer type', res.status === 201 || res.status === 200);
    } catch (error) {
      logTest('POST /types-produit', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.4 Modifier un type
  if (typeProduitId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/types-produit/${typeProduitId}`,
        {
          type: `Type Test Modifié ${Date.now()}`,
          description: 'Description modifiée'
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('PUT /types-produit/:id - Modifier type', res.status === 200);
    } catch (error) {
      logTest('PUT /types-produit/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.5 Créer types par défaut
  if (boutiqueId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/types-produit/boutique/${boutiqueId}/defaut`,
        {},
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('POST /types-produit/boutique/:id/defaut - Types par défaut', res.status === 201 || res.status === 200);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      // Si déjà créés, c'est normal
      if (msg.includes('déjà') || msg.includes('existe')) {
        logTest('POST /types-produit/boutique/:id/defaut', true, 'Types déjà créés (normal)');
      } else {
        logTest('POST /types-produit/boutique/:id/defaut', false, msg);
      }
    }
  }
  
  // 5.6 Supprimer un type
  if (typeProduitId) {
    try {
      const res = await axios.delete(
        `${BASE_URL}/types-produit/${typeProduitId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('DELETE /types-produit/:id - Supprimer type', res.status === 200);
    } catch (error) {
      logTest('DELETE /types-produit/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 6. TESTS DE PERMISSIONS
 */
async function testPermissions() {
  logSection('6. TESTS DE PERMISSIONS');
  
  // 6.1 Client ne peut pas créer de produit
  try {
    await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Test',
        prix: 10,
        boutique: boutiqueId
      },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('Client créer produit - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403 || error.response?.status === 401;
    logTest('Client créer produit - Refusé', isAccessDenied);
  }
  
  // 6.2 Client ne peut pas créer de type
  try {
    await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Test',
        boutique: boutiqueId
      },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    
    logTest('Client créer type - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403 || error.response?.status === 401;
    logTest('Client créer type - Refusé', isAccessDenied);
  }
  
  // 6.3 Sans authentification ne peut pas créer
  try {
    await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Test',
        prix: 10
      }
    );
    
    logTest('Sans auth créer produit - Refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 401;
    logTest('Sans auth créer produit - Refusé', isAccessDenied);
  }
}

/**
 * 7. TESTS DE VALIDATION
 */
async function testValidation() {
  logSection('7. TESTS DE VALIDATION');
  
  // 7.1 Créer produit sans nom
  try {
    await axios.post(
      `${BASE_URL}/produits`,
      {
        prix: 10,
        boutique: boutiqueId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Produit sans nom - Rejeté', false, 'Devrait être rejeté');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('Produit sans nom - Rejeté', isValidationError);
  }
  
  // 7.2 Créer produit avec prix négatif
  try {
    await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Test',
        prix: -10,
        boutique: boutiqueId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Produit prix négatif - Rejeté', false, 'Devrait être rejeté');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('Produit prix négatif - Rejeté', isValidationError);
  }
  
  // 7.3 Créer type sans nom
  try {
    await axios.post(
      `${BASE_URL}/types-produit`,
      {
        boutique: boutiqueId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('Type sans nom - Rejeté', false, 'Devrait être rejeté');
  } catch (error) {
    const isValidationError = error.response?.status === 400;
    logTest('Type sans nom - Rejeté', isValidationError);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - ROUTES PRODUITS & TYPES-PRODUITS${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testProduitsPubliques();
    await testProduitsCommercant();
    await testTypesProduitPubliques();
    await testTypesProduitCommercant();
    await testPermissions();
    await testValidation();
    
    logStats();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    logStats();
    process.exit(1);
  }
}

// Lancer les tests
runTests();
