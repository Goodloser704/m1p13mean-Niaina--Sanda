/**
 * 🧪 Test Complet - Routes Commercant et Demandes Location
 * Test de toutes les routes commercant (boutiques, produits) et demandes-location
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
  cyan: '\x1b[36m'
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
let commercantId = '';
let boutiqueId = '';
let produitId = '';
let espaceId = '';
let demandeId = '';

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
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Afficher les statistiques finales
 */
function logStats() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}RÉSULTATS FINAUX${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
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
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
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
    commercantId = commercantRes.data.user._id;
    logTest('Login Commercant', !!commercantToken);
    
  } catch (error) {
    logTest('Authentification', false, error.response?.data?.message || error.message);
  }
}

/**
 * 2. ROUTES BOUTIQUES - COMMERCANT
 */
async function testBoutiquesCommercant() {
  logSection('2. ROUTES BOUTIQUES - COMMERCANT');
  
  // 2.1 Créer une boutique
  try {
    const res = await axios.post(
      `${BASE_URL}/boutique/register`,
      {
        nom: 'Test Boutique ' + Date.now(),
        description: 'Boutique de test',
        categorie: 'Mode'
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    boutiqueId = res.data.boutique._id;
    logTest('POST /boutique/register - Créer boutique', res.status === 201);
  } catch (error) {
    console.log('  Détails erreur:', error.response?.data);
    logTest('POST /boutique/register', false, error.response?.data?.message || error.message);
  }
  
  // 2.2 Obtenir mes boutiques
  try {
    const res = await axios.get(
      `${BASE_URL}/boutique/my-boutiques`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /boutique/my-boutiques', res.status === 200 && Array.isArray(res.data.boutiques));
  } catch (error) {
    logTest('GET /boutique/my-boutiques', false, error.response?.data?.message || error.message);
  }
  
  // 2.3 Obtenir une boutique spécifique
  try {
    const res = await axios.get(
      `${BASE_URL}/boutique/me/${boutiqueId}`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /boutique/me/:id', res.status === 200 && res.data.boutique);
  } catch (error) {
    logTest('GET /boutique/me/:id', false, error.response?.data?.message || error.message);
  }
  
  // 2.4 Mettre à jour ma boutique
  try {
    const res = await axios.put(
      `${BASE_URL}/boutique/me/${boutiqueId}`,
      {
        description: 'Description mise à jour',
        horairesHebdo: {
          lundi: { ouvert: true, heureOuverture: '09:00', heureFermeture: '18:00' }
        }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('PUT /boutique/me/:id - Mise à jour', res.status === 200);
  } catch (error) {
    logTest('PUT /boutique/me/:id', false, error.response?.data?.message || error.message);
  }
  
  // 2.5 Obtenir boutiques par commerçant
  try {
    const res = await axios.get(
      `${BASE_URL}/boutique/commercant/${commercantId}/boutiques`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /boutique/commercant/:id/boutiques', res.status === 200);
  } catch (error) {
    logTest('GET /boutique/commercant/:id/boutiques', false, error.response?.data?.message || error.message);
  }
}

/**
 * 3. ROUTES PRODUITS - COMMERCANT
 */
async function testProduitsCommercant() {
  logSection('3. ROUTES PRODUITS - COMMERCANT');
  
  // Attendre que la boutique soit approuvée
  try {
    await axios.put(
      `${BASE_URL}/boutique/${boutiqueId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('  ℹ Boutique approuvée pour les tests produits\n');
  } catch (error) {
    console.log('  ⚠ Erreur approbation boutique:', error.response?.data?.message);
  }
  
  // 3.1 Créer un produit
  try {
    const res = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Produit Test ' + Date.now(),
        description: 'Description du produit',
        prix: 99.99,
        typeProduit: 'Vêtements',
        boutique: boutiqueId,
        stock: 50
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    produitId = res.data.produit._id;
    logTest('POST /produits - Créer produit', res.status === 201);
  } catch (error) {
    logTest('POST /produits', false, error.response?.data?.message || error.message);
  }
  
  // 3.2 Obtenir mes produits
  try {
    const res = await axios.get(
      `${BASE_URL}/produits/me`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /produits/me', res.status === 200 && Array.isArray(res.data.produits));
  } catch (error) {
    logTest('GET /produits/me', false, error.response?.data?.message || error.message);
  }
  
  // 3.3 Modifier un produit
  try {
    const res = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        nom: 'Produit Modifié',
        prix: 149.99
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('PUT /produits/:id - Modifier produit', res.status === 200);
  } catch (error) {
    logTest('PUT /produits/:id', false, error.response?.data?.message || error.message);
  }
  
  // 3.4 Modifier le stock
  try {
    const res = await axios.put(
      `${BASE_URL}/produits/${produitId}/stock`,
      { quantite: 100 },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('PUT /produits/:id/stock', res.status === 200);
  } catch (error) {
    logTest('PUT /produits/:id/stock', false, error.response?.data?.message || error.message);
  }
  
  // 3.5 Obtenir produits d'une boutique (public)
  try {
    const res = await axios.get(`${BASE_URL}/produits/boutique/${boutiqueId}`);
    
    logTest('GET /produits/boutique/:id (public)', res.status === 200);
  } catch (error) {
    logTest('GET /produits/boutique/:id', false, error.response?.data?.message || error.message);
  }
  
  // 3.6 Obtenir un produit par ID (public)
  try {
    const res = await axios.get(`${BASE_URL}/produits/${produitId}`);
    
    logTest('GET /produits/:id (public)', res.status === 200);
  } catch (error) {
    logTest('GET /produits/:id', false, error.response?.data?.message || error.message);
  }
}

/**
 * 4. ROUTES DEMANDES LOCATION - COMMERCANT
 */
async function testDemandesLocationCommercant() {
  logSection('4. ROUTES DEMANDES LOCATION - COMMERCANT');
  
  // Récupérer un espace disponible
  try {
    const espacesRes = await axios.get(
      `${BASE_URL}/espaces`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const espaceDisponible = espacesRes.data.espaces?.find(e => e.statut === 'Disponible');
    if (espaceDisponible) {
      espaceId = espaceDisponible._id;
      console.log(`  ℹ Espace disponible trouvé: ${espaceId}\n`);
    } else {
      console.log('  ⚠ Aucun espace disponible trouvé\n');
    }
  } catch (error) {
    console.log('  ⚠ Erreur récupération espaces:', error.response?.data?.message);
  }
  
  // 4.1 Créer une demande de location
  if (espaceId && boutiqueId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/demandes-location`,
        {
          boutiqueId: boutiqueId,
          espaceId: espaceId,
          dateDebutSouhaitee: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dureeContrat: 12,
          messageCommercant: 'Je souhaite louer cet espace'
        },
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      demandeId = res.data.demande._id;
      logTest('POST /demandes-location - Créer demande', res.status === 201);
    } catch (error) {
      logTest('POST /demandes-location', false, error.response?.data?.message || error.message);
    }
  } else {
    logTest('POST /demandes-location', false, 'Pas d\'espace ou boutique disponible');
  }
  
  // 4.2 Obtenir mes demandes
  try {
    const res = await axios.get(
      `${BASE_URL}/demandes-location/me`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    logTest('GET /demandes-location/me', res.status === 200 && Array.isArray(res.data.demandes));
  } catch (error) {
    logTest('GET /demandes-location/me', false, error.response?.data?.message || error.message);
  }
  
  // 4.3 Obtenir une demande par ID
  if (demandeId) {
    try {
      const res = await axios.get(
        `${BASE_URL}/demandes-location/${demandeId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      
      logTest('GET /demandes-location/:id', res.status === 200);
    } catch (error) {
      logTest('GET /demandes-location/:id', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 5. ROUTES DEMANDES LOCATION - ADMIN
 */
async function testDemandesLocationAdmin() {
  logSection('5. ROUTES DEMANDES LOCATION - ADMIN');
  
  // 5.1 Obtenir toutes les demandes
  try {
    const res = await axios.get(
      `${BASE_URL}/demandes-location`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /demandes-location (Admin)', res.status === 200 && Array.isArray(res.data.demandes));
  } catch (error) {
    logTest('GET /demandes-location', false, error.response?.data?.message || error.message);
  }
  
  // 5.2 Obtenir demandes par état
  try {
    const res = await axios.get(
      `${BASE_URL}/demandes-location/etat/EnAttente`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    logTest('GET /demandes-location/etat/:etat', res.status === 200);
  } catch (error) {
    logTest('GET /demandes-location/etat/:etat', false, error.response?.data?.message || error.message);
  }
  
  // 5.3 Accepter une demande
  if (demandeId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/demandes-location/${demandeId}/accepter`,
        {
          dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() + 370 * 24 * 60 * 60 * 1000).toISOString(),
          loyerMensuel: 1500,
          caution: 3000,
          conditionsSpeciales: 'Conditions de test',
          messageAdmin: 'Demande acceptée'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /demandes-location/:id/accepter', res.status === 200);
    } catch (error) {
      logTest('PUT /demandes-location/:id/accepter', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5.4 Créer une nouvelle demande pour tester le refus
  let demandeIdRefus = '';
  if (espaceId && boutiqueId) {
    try {
      // Trouver un autre espace disponible
      const espacesRes = await axios.get(
        `${BASE_URL}/espaces`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      const autreEspace = espacesRes.data.espaces?.find(e => e.statut === 'Disponible' && e._id !== espaceId);
      
      if (autreEspace) {
        const res = await axios.post(
          `${BASE_URL}/demandes-location`,
          {
            boutiqueId: boutiqueId,
            espaceId: autreEspace._id,
            dateDebutSouhaitee: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            dureeContrat: 6,
            messageCommercant: 'Demande pour test refus'
          },
          { headers: { Authorization: `Bearer ${commercantToken}` } }
        );
        
        demandeIdRefus = res.data.demande._id;
      }
    } catch (error) {
      console.log('  ⚠ Erreur création demande pour refus:', error.response?.data?.message);
    }
  }
  
  // 5.5 Refuser une demande
  if (demandeIdRefus) {
    try {
      const res = await axios.put(
        `${BASE_URL}/demandes-location/${demandeIdRefus}/refuser`,
        {
          messageAdmin: 'Demande refusée pour test'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      logTest('PUT /demandes-location/:id/refuser', res.status === 200);
    } catch (error) {
      logTest('PUT /demandes-location/:id/refuser', false, error.response?.data?.message || error.message);
    }
  }
}

/**
 * 6. NETTOYAGE
 */
async function testNettoyage() {
  logSection('6. NETTOYAGE');
  
  // Supprimer le produit
  if (produitId) {
    try {
      await axios.delete(
        `${BASE_URL}/produits/${produitId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      logTest('DELETE /produits/:id - Nettoyage', true);
    } catch (error) {
      logTest('DELETE /produits/:id', false, error.response?.data?.message || error.message);
    }
  }
  
  // Annuler les demandes
  if (demandeId) {
    try {
      await axios.delete(
        `${BASE_URL}/demandes-location/${demandeId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      logTest('DELETE /demandes-location/:id - Nettoyage', true);
    } catch (error) {
      // Peut échouer si déjà acceptée
      logTest('DELETE /demandes-location/:id', false, 'Demande peut-être déjà acceptée');
    }
  }
  
  // Supprimer la boutique (si en attente)
  if (boutiqueId) {
    try {
      await axios.delete(
        `${BASE_URL}/boutique/me/${boutiqueId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
      logTest('DELETE /boutique/me/:id - Nettoyage', true);
    } catch (error) {
      // Peut échouer si déjà approuvée
      logTest('DELETE /boutique/me/:id', false, 'Boutique peut-être déjà approuvée');
    }
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}TEST COMPLET - ROUTES COMMERCANT & DEMANDES LOCATION${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  try {
    await testAuthentification();
    await testBoutiquesCommercant();
    await testProduitsCommercant();
    await testDemandesLocationCommercant();
    await testDemandesLocationAdmin();
    await testNettoyage();
    
    logStats();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    logStats();
    process.exit(1);
  }
}

// Lancer les tests
runTests();
