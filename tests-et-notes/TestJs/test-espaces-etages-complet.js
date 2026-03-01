/**
 * 🧪 Test Complet - Routes Espaces et Étages
 * Test de toutes les routes espaces et étages en local
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
let etageId = '';
let espaceId = '';
let centreCommercialId = '';

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
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES ÉTAGES - LECTURE (Authentifié)
 */
async function testEtagesLecture() {
  logSection('2. ROUTES ÉTAGES - LECTURE (Authentifié)');
  
  // 2.1 Test route de test
  try {
    const res = await axios.get(
      `${BASE_URL}/etages/test`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /etages/test', res.status === 200);
  } catch (error) {
    logTest('GET /etages/test', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Obtenir tous les étages
  try {
    const res = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const success = res.status === 200 && Array.isArray(res.data.etages);
    if (success && res.data.etages.length > 0) {
      etageId = res.data.etages[0]._id;
      centreCommercialId = res.data.etages[0].centreCommercial;
      console.log(`  ℹ Étage trouvé: ${etageId}`);
    }
    logTest('GET /etages - Tous les étages', success);
  } catch (error) {
    logTest('GET /etages', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 Obtenir un étage par ID
  if (etageId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/etages/${etageId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /etages/:id - Étage par ID', res.status === 200);
    } catch (error) {
      logTest('GET /etages/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 2.4 Accès commerçant aux étages
  try {
    const res = await axios.get(
      `${BASE_URL}/etages`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /etages (Commercant)', res.status === 200);
  } catch (error) {
    logTest('GET /etages (Commercant)', false, error.response?.data?.message || error.message);
  }
}

/**
 * 3. ROUTES ÉTAGES - ADMIN (CRUD)
 */
async function testEtagesAdmin() {
  logSection('3. ROUTES ÉTAGES - ADMIN (CRUD)');
  
  let newEtageId = '';
  
  // 3.1 Créer un étage
  if (centreCommercialId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/etages`,
        {
          niveau: 99,
          nom: 'Test Étage ' + Date.now(),
          description: 'Étage de test automatique',
          centreCommercial: centreCommercialId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      newEtageId = res.data.etage._id;
      logTest('POST /etages - Créer étage', res.status === 201);
    } catch (error) {
      logTest('POST /etages', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.2 Mettre à jour un étage
  if (newEtageId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/etages/${newEtageId}`,
        {
          nom: 'Test Étage Modifié',
          description: 'Description mise à jour'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /etages/:id - Modifier étage', res.status === 200);
    } catch (error) {
      logTest('PUT /etages/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.3 Obtenir statistiques
  try {
    const res = await axios.get(
      `${BASE_URL}/etages/stats`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /etages/stats - Statistiques', res.status === 200);
  } catch (error) {
    logTest('GET /etages/stats', false, error.response?.data?.message || error.message);
  }
  
  // 3.4 Supprimer un étage
  if (newEtageId) {
    try {
      const res = await axios.delete(
        `${BASE_URL}/etages/${newEtageId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('DELETE /etages/:id - Supprimer étage', res.status === 200);
    } catch (error) {
      logTest('DELETE /etages/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 3.5 Test accès refusé pour commerçant
  try {
    await axios.post(
      `${BASE_URL}/etages`,
      {
        niveau: 100,
        nom: 'Test Interdit',
        centreCommercial: centreCommercialId
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('POST /etages (Commercant) - Accès refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403;
    logTest('POST /etages (Commercant) - Accès refusé', isAccessDenied);
  }
}

/**
 * 4. ROUTES ESPACES - LECTURE
 */
async function testEspacesLecture() {
  logSection('4. ROUTES ESPACES - LECTURE');
  
  // 4.1 Test route de test
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces/test`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /espaces/test', res.status === 200);
  } catch (error) {
    logTest('GET /espaces/test', false, error.response?.data?.message || error.message);
  }
  
  // 4.2 Obtenir tous les espaces
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const success = res.status === 200 && Array.isArray(res.data.espaces);
    if (success && res.data.espaces.length > 0) {
      espaceId = res.data.espaces[0]._id;
      console.log(`  ℹ Espace trouvé: ${espaceId}`);
    }
    logTest('GET /espaces - Tous les espaces', success);
  } catch (error) {
    logTest('GET /espaces', false, error.response?.data?.message || error.message);
  }
  
  // 4.3 Rechercher espaces disponibles
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces/disponibles`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /espaces/disponibles', res.status === 200);
  } catch (error) {
    logTest('GET /espaces/disponibles', false, error.response?.data?.message || error.message);
  }
  
  // 4.4 Obtenir un espace par ID
  if (espaceId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/espaces/${espaceId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /espaces/:id - Espace par ID', res.status === 200);
    } catch (error) {
      logTest('GET /espaces/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4.5 Obtenir statistiques
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces/stats`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /espaces/stats - Statistiques', res.status === 200);
  } catch (error) {
    logTest('GET /espaces/stats', false, error.response?.data?.message || error.message);
  }
}

/**
 * 5. ROUTES ESPACES - ADMIN (CRUD)
 */
async function testEspacesAdmin() {
  logSection('5. ROUTES ESPACES - ADMIN (CRUD)');
  
  let newEspaceId = '';
  
  // 5.1 Créer un espace
  if (etageId && centreCommercialId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/espaces`,
        {
          code: 'TESTX' + Date.now().toString().slice(-4),
          etage: etageId,
          centreCommercial: centreCommercialId,
          superficie: 50,
          loyerBase: 1000,
          statut: 'Disponible',
          description: 'Espace de test automatique'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      newEspaceId = res.data.espace._id;
      logTest('POST /espaces - Créer espace', res.status === 201);
    } catch (error) {
      logTest('POST /espaces', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.2 Mettre à jour un espace
  if (newEspaceId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/espaces/${newEspaceId}`,
        {
          superficie: 60,
          loyerBase: 1200,
          description: 'Espace modifié'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /espaces/:id - Modifier espace', res.status === 200);
    } catch (error) {
      logTest('PUT /espaces/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.3 Mettre à jour partiellement (PATCH)
  if (newEspaceId) {
    try {
      const res = await axios.patch(
        `${BASE_URL}/espaces/${newEspaceId}`,
        {
          description: 'Espace modifié via PATCH'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PATCH /espaces/:id - Modifier partiellement', res.status === 200);
    } catch (error) {
      logTest('PATCH /espaces/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.4 Occuper un espace
  if (newEspaceId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/espaces/${newEspaceId}/occuper`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /espaces/:id/occuper - Occuper espace', res.status === 200);
    } catch (error) {
      logTest('PUT /espaces/:id/occuper', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.5 Libérer un espace
  if (newEspaceId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/espaces/${newEspaceId}/liberer`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /espaces/:id/liberer - Libérer espace', res.status === 200);
    } catch (error) {
      logTest('PUT /espaces/:id/liberer', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.6 Obtenir espace par code
  if (newEspaceId) {
    try {
      // Récupérer le code de l'espace
      const espaceRes = await axios.get(
        `${BASE_URL}/espaces/${newEspaceId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      const code = espaceRes.data.espace.code;
      
      const res = await axios.get(
        `${BASE_URL}/espaces/code/${code}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /espaces/code/:code - Espace par code', res.status === 200);
    } catch (error) {
      logTest('GET /espaces/code/:code', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.7 Supprimer un espace
  if (newEspaceId) {
    try {
      const res = await axios.delete(
        `${BASE_URL}/espaces/${newEspaceId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('DELETE /espaces/:id - Supprimer espace', res.status === 200);
    } catch (error) {
      logTest('DELETE /espaces/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.8 Test accès refusé pour commerçant
  try {
    await axios.post(
      `${BASE_URL}/espaces`,
      {
        code: 'TESTX999',
        etage: etageId,
        centreCommercial: centreCommercialId,
        superficie: 50,
        loyerBase: 1000
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('POST /espaces (Commercant) - Accès refusé', false, 'Devrait être refusé');
  } catch (error) {
    const isAccessDenied = error.response?.status === 403;
    logTest('POST /espaces (Commercant) - Accès refusé', isAccessDenied);
  }
}

/**
 * 6. TESTS DE FILTRES ET RECHERCHE
 */
async function testFiltresRecherche() {
  logSection('6. TESTS DE FILTRES ET RECHERCHE');
  
  // 6.1 Filtrer espaces par statut
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces?statut=Disponible`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /espaces?statut=Disponible - Filtrer par statut', res.status === 200);
  } catch (error) {
    logTest('GET /espaces?statut=Disponible', false, error.response?.data?.message || error.message);
  }
  
  // 6.2 Filtrer espaces par étage
  if (etageId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/espaces?etage=${etageId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('GET /espaces?etage=:id - Filtrer par étage', res.status === 200);
    } catch (error) {
      logTest('GET /espaces?etage=:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // 6.3 Filtrer avec pagination
  try {
    const res = await axios.get(
      `${BASE_URL}/espaces?page=1&limit=5`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /espaces?page=1&limit=5 - Pagination', res.status === 200);
  } catch (error) {
    logTest('GET /espaces?page=1&limit=5', false, error.response?.data?.message || error.message);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - ROUTES ESPACES & ÉTAGES${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testEtagesLecture();
    await testEtagesAdmin();
    await testEspacesLecture();
    await testEspacesAdmin();
    await testFiltresRecherche();
    
    logStats();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    logStats();
    process.exit(1);
  }
}

// Lancer les tests
runTests();
