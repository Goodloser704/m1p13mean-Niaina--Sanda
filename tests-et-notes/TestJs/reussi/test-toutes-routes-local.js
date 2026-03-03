/**
 * 🧪 TEST COMPLET DE TOUTES LES ROUTES EN LOCAL
 * 
 * Ce test vérifie systématiquement toutes les routes du backend
 * organisées par module et par rôle (Public, Admin, Commercant, Acheteur)
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Variables globales pour les tokens et IDs
let adminToken = '';
let commercantToken = '';
let acheteurToken = '';
let commercantId = '';
let acheteurId = '';
let boutiqueId = '';
let espaceId = '';
let etageId = '';
let categorieId = '';
let produitId = '';
let typeProduitId = '';
let demandeLocationId = '';
let achatId = '';
let factureId = '';
let notificationId = '';

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  byCategory: {},
  tests: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

function logTest(category, name, status, message = '') {
  testResults.total++;
  
  if (!testResults.byCategory[category]) {
    testResults.byCategory[category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
  }
  testResults.byCategory[category].total++;
  
  if (status === 'passed') {
    testResults.passed++;
    testResults.byCategory[category].passed++;
    log(`✅ ${name}`, 'green');
  } else if (status === 'failed') {
    testResults.failed++;
    testResults.byCategory[category].failed++;
    log(`❌ ${name}`, 'red');
    if (message) log(`   ${message}`, 'yellow');
  } else if (status === 'skipped') {
    testResults.skipped++;
    testResults.byCategory[category].skipped++;
    log(`⏭️  ${name}`, 'yellow');
    if (message) log(`   ${message}`, 'blue');
  }
  
  testResults.tests.push({ category, name, status, message });
}

async function testRoute(category, name, testFn) {
  try {
    await testFn();
    logTest(category, name, 'passed');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    logTest(category, name, 'failed', message);
    return false;
  }
}

// ============================================================================
// SECTION 1: AUTHENTIFICATION
// ============================================================================

async function testAuthentification() {
  logSection('1️⃣  AUTHENTIFICATION');
  
  const timestamp = Date.now();
  
  // 1.1 Login Admin
  await testRoute('Authentification', 'POST /api/auth/login (Admin)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    adminToken = res.data.token;
    if (!adminToken) throw new Error('Token admin non reçu');
  });
  
  // 1.2 Inscription Commercant
  await testRoute('Authentification', 'POST /api/auth/register (Commercant)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestCommercant${timestamp}`,
      prenoms: 'Test',
      email: `commercant${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000000',
      role: 'Commercant'
    });
    commercantToken = res.data.token;
    commercantId = res.data.user.id || res.data.user._id; // Support des deux formats
    if (!commercantToken) throw new Error('Token commercant non reçu');
  });
  
  // 1.3 Inscription Acheteur
  await testRoute('Authentification', 'POST /api/auth/register (Acheteur)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestAcheteur${timestamp}`,
      prenoms: 'Test',
      email: `acheteur${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000001',
      role: 'Acheteur'
    });
    acheteurToken = res.data.token;
    acheteurId = res.data.user.id || res.data.user._id; // Support des deux formats
    if (!acheteurToken) throw new Error('Token acheteur non reçu');
  });
  
  // 1.4 Get Profile
  await testRoute('Authentification', 'GET /api/auth/me', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data.user) throw new Error('Profil non reçu');
  });
  
  // 1.5 Get Profile (spec)
  await testRoute('Authentification', 'GET /api/users/:id/me', async () => {
    const res = await axios.get(`${BASE_URL}/auth/users/${commercantId}/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.user) throw new Error('Profil non reçu');
  });
  
  // 1.6 Update Profile
  await testRoute('Authentification', 'PUT /api/users/me', async () => {
    const res = await axios.put(`${BASE_URL}/auth/users/me`, {
      telephone: '0340000099'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.user) throw new Error('Profil non mis à jour');
  });
}

// ============================================================================
// SECTION 2: CENTRE COMMERCIAL
// ============================================================================

async function testCentreCommercial() {
  logSection('2️⃣  CENTRE COMMERCIAL');
  
  // 2.1 Get Centre Commercial
  await testRoute('Centre Commercial', 'GET /api/centre-commercial', async () => {
    const res = await axios.get(`${BASE_URL}/centre-commercial`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data.centreCommercial) throw new Error('Centre commercial non reçu');
  });
  
  // 2.2 Update Centre Commercial
  await testRoute('Centre Commercial', 'PUT /api/admin/centre-commercial', async () => {
    const res = await axios.put(`${BASE_URL}/admin/centre-commercial`, {
      description: 'Test description'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error('Mise à jour échouée');
  });
}

// ============================================================================
// SECTION 3: ÉTAGES ET ESPACES
// ============================================================================

async function testEtagesEtEspaces() {
  logSection('3️⃣  ÉTAGES ET ESPACES');
  
  // 3.1 Create Etage - Utiliser un niveau unique basé sur millisecondes
  await testRoute('Étages', 'POST /api/admin/etages', async () => {
    // Générer un niveau unique entre 10 et 99 basé sur les millisecondes
    const niveau = 10 + (Date.now() % 90);
    const res = await axios.post(`${BASE_URL}/admin/etages`, {
      niveau: niveau
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    etageId = res.data.etage._id;
    if (!etageId) throw new Error('Étage non créé');
  });
  
  // 3.2 Get All Etages
  await testRoute('Étages', 'GET /api/admin/etages', async () => {
    const res = await axios.get(`${BASE_URL}/admin/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.etages)) throw new Error('Liste étages non reçue');
  });
  
  // 3.3 Get Etage by ID
  await testRoute('Étages', 'GET /api/admin/etages/:id', async () => {
    const res = await axios.get(`${BASE_URL}/admin/etages/${etageId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data.etage) throw new Error('Étage non reçu');
  });
  
  // 3.4 Create Espace
  await testRoute('Espaces', 'POST /api/admin/espaces', async () => {
    const res = await axios.post(`${BASE_URL}/admin/espaces`, {
      code: `TST${Date.now().toString().slice(-6)}`,
      surface: 50,
      loyer: 1000,
      etage: etageId,
      statut: 'Disponible'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    espaceId = res.data.espace._id;
    if (!espaceId) throw new Error('Espace non créé');
  });
  
  // 3.5 Get All Espaces
  await testRoute('Espaces', 'GET /api/admin/espaces', async () => {
    const res = await axios.get(`${BASE_URL}/admin/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.espaces)) throw new Error('Liste espaces non reçue');
  });
  
  // 3.6 Get Espace by ID
  await testRoute('Espaces', 'GET /api/admin/espaces/:id', async () => {
    const res = await axios.get(`${BASE_URL}/admin/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data.espace) throw new Error('Espace non reçu');
  });
}

// ============================================================================
// SECTION 4: CATÉGORIES
// ============================================================================

async function testCategories() {
  logSection('4️⃣  CATÉGORIES');
  
  // 4.1 Create Categorie
  await testRoute('Catégories', 'POST /api/categories-boutique', async () => {
    const res = await axios.post(`${BASE_URL}/categories-boutique`, {
      nom: `Catégorie Test ${Date.now()}`,
      description: 'Test'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    categorieId = res.data.categorie._id;
    if (!categorieId) throw new Error('Catégorie non créée');
  });
  
  // 4.2 Get All Categories (Public)
  await testRoute('Catégories', 'GET /api/categories-boutique (Public)', async () => {
    // Créer une nouvelle instance axios sans headers par défaut
    const res = await axios.create().get(`${BASE_URL}/categories-boutique`);
    if (!Array.isArray(res.data.categories)) throw new Error('Liste catégories non reçue');
  });
  
  // 4.3 Get All Categories (Auth)
  await testRoute('Catégories', 'GET /api/categories-boutique (Auth)', async () => {
    const res = await axios.get(`${BASE_URL}/categories-boutique`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.categories)) throw new Error('Liste catégories non reçue');
  });
}

// ============================================================================
// SECTION 5: BOUTIQUES
// ============================================================================

async function testBoutiques() {
  logSection('5️⃣  BOUTIQUES');
  
  // 5.1 Create Boutique (Commercant)
  await testRoute('Boutiques', 'POST /api/boutique/register', async () => {
    const res = await axios.post(`${BASE_URL}/boutique/register`, {
      nom: `Boutique Test ${Date.now()}`,
      description: 'Test boutique',
      categorie: categorieId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    boutiqueId = res.data.boutique._id;
    if (!boutiqueId) throw new Error('Boutique non créée');
  });
  
  // 5.2 Get My Boutiques
  await testRoute('Boutiques', 'GET /api/boutique/my-boutiques', async () => {
    const res = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.boutiques)) throw new Error('Liste boutiques non reçue');
  });
  
  // 5.3 Get Boutique by ID (Commercant)
  await testRoute('Boutiques', 'GET /api/boutique/me/:id', async () => {
    const res = await axios.get(`${BASE_URL}/boutique/me/${boutiqueId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.boutique) throw new Error('Boutique non reçue');
  });
  
  // 5.4 Get All Boutiques (Public)
  await testRoute('Boutiques', 'GET /api/boutique (Public)', async () => {
    const res = await axios.get(`${BASE_URL}/boutique`);
    if (!Array.isArray(res.data.boutiques)) throw new Error('Liste boutiques non reçue');
  });
  
  // 5.5 Search Boutiques (Public)
  await testRoute('Boutiques', 'GET /api/boutique/search (Public)', async () => {
    const res = await axios.get(`${BASE_URL}/boutique/search`, {
      params: { keyword: 'Test' }
    });
    if (!Array.isArray(res.data.boutiques)) throw new Error('Résultats recherche non reçus');
  });
  
  // 5.6 Get Pending Boutiques (Admin)
  await testRoute('Boutiques', 'GET /api/boutique/pending (Admin)', async () => {
    const res = await axios.get(`${BASE_URL}/boutique/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.boutiques)) throw new Error('Liste boutiques en attente non reçue');
  });
  
  // 5.7 Approve Boutique (Admin) - Nécessaire pour les tests suivants
  await testRoute('Boutiques', 'PUT /api/boutique/:id/approve (Admin)', async () => {
    const res = await axios.put(`${BASE_URL}/boutique/${boutiqueId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error('Approbation échouée');
  });
}

// ============================================================================
// SECTION 6: DEMANDES DE LOCATION
// ============================================================================

async function testDemandesLocation() {
  logSection('6️⃣  DEMANDES DE LOCATION');
  
  // 6.1 Create Demande Location
  await testRoute('Demandes Location', 'POST /api/demandes-location', async () => {
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + 7); // +7 jours
    
    const res = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceId,
      dateDebutSouhaitee: dateDebut.toISOString(),
      dureeContrat: 12,
      messageCommercant: 'Demande de location test'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    demandeLocationId = res.data.demande._id;
    if (!demandeLocationId) throw new Error('Demande non créée');
  });
  
  // 6.2 Get All Demandes (Admin)
  await testRoute('Demandes Location', 'GET /api/admin/demandes-location', async () => {
    const res = await axios.get(`${BASE_URL}/admin/demandes-location`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.demandes)) throw new Error('Liste demandes non reçue');
  });
  
  // 6.3 Get Demandes by Etat
  await testRoute('Demandes Location', 'GET /api/admin/demandes-location/etat/:etat', async () => {
    const res = await axios.get(`${BASE_URL}/admin/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(res.data.demandes)) throw new Error('Liste demandes par état non reçue');
  });
  
  // 6.4 Update Demande Etat - Accepter la demande pour affecter l'espace
  await testRoute('Demandes Location', 'PUT /api/admin/demandes-location/:id', async () => {
    const res = await axios.put(`${BASE_URL}/admin/demandes-location/${demandeLocationId}`, {
      etat: 'Acceptee'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error('Mise à jour demande échouée');
  });
}

// ============================================================================
// SECTION 7: TYPES PRODUIT ET PRODUITS
// ============================================================================

async function testProduitsEtTypes() {
  logSection('7️⃣  TYPES PRODUIT ET PRODUITS');
  
  // 7.1 Create Type Produit
  await testRoute('Types Produit', 'POST /api/types-produit', async () => {
    const res = await axios.post(`${BASE_URL}/types-produit`, {
      type: `Type Test ${Date.now()}`,
      boutique: boutiqueId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    typeProduitId = res.data.typeProduit._id;
    if (!typeProduitId) throw new Error('Type produit non créé');
  });
  
  // 7.2 Get All Types Produit
  await testRoute('Types Produit', 'GET /api/types-produit', async () => {
    const res = await axios.get(`${BASE_URL}/types-produit`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.typesProduit)) throw new Error('Liste types produit non reçue');
  });
  
  // 7.3 Create Produit
  await testRoute('Produits', 'POST /api/commercant/produits', async () => {
    const res = await axios.post(`${BASE_URL}/produits`, {
      nom: `Produit Test ${Date.now()}`,
      description: 'Produit de test',
      prix: 1500,
      typeProduit: typeProduitId,
      boutique: boutiqueId,
      tempsPreparation: '00:30:00',
      stock: {
        nombreDispo: 10
      }
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    produitId = res.data.produit._id;
    if (!produitId) throw new Error('Produit non créé');
  });
  
  // 7.4 Get Produits by Boutique (Public)
  await testRoute('Produits', 'GET /api/boutique/:id/produits (Public)', async () => {
    const res = await axios.get(`${BASE_URL}/boutique/${boutiqueId}/produits`);
    if (!Array.isArray(res.data.produits)) throw new Error('Liste produits non reçue');
  });
  
  // 7.5 Update Stock
  await testRoute('Produits', 'PUT /api/commercant/produits/:id/stock', async () => {
    const res = await axios.put(`${BASE_URL}/produits/${produitId}/stock`, {
      nombreDispo: 20
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.produit) throw new Error('Stock non mis à jour');
  });
}

// ============================================================================
// SECTION 8: ACHATS ET PANIER
// ============================================================================

async function testAchatsEtPanier() {
  logSection('8️⃣  ACHATS ET PANIER');
  
  if (!produitId) {
    logTest('Achats', 'Tests achats', 'skipped', 'Produit non créé');
    return;
  }
  
  // 8.1 Valider Panier
  await testRoute('Achats', 'POST /api/acheteur/:id/achats/panier/validate', async () => {
    // D'abord, récupérer le produit pour avoir son prix
    const produitRes = await axios.get(`${BASE_URL}/boutique/${boutiqueId}/produits`);
    const produit = produitRes.data.produits.find(p => p._id === produitId);
    
    if (!produit) {
      throw new Error('Produit non trouvé pour validation panier');
    }
    
    const res = await axios.post(`${BASE_URL}/acheteur/${acheteurId}/achats/panier/validate`, {
      achats: [
        {
          produit: produitId,
          quantite: 1,
          typeAchat: 'Recuperer',
          prixUnitaire: produit.prix
        }
      ],
      montantTotal: produit.prix
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    factureId = res.data.facture?._id;
    achatId = res.data.achats?.[0]?._id;
    if (!factureId) throw new Error('Facture non créée');
  });
  
  // 8.2 Get My Achats En Cours (Acheteur)
  await testRoute('Achats', 'GET /api/acheteur/:id/achats/en-cours', async () => {
    const res = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/achats/en-cours`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    if (!Array.isArray(res.data.achats)) throw new Error('Liste achats non reçue');
  });
  
  // 8.3 Get My Historique Achats
  await testRoute('Achats', 'GET /api/acheteur/:id/achats/historique', async () => {
    const res = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/achats/historique`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    if (!Array.isArray(res.data.achats)) throw new Error('Historique achats non reçu');
  });
  
  // 8.4 Get Achats En Cours (Commercant)
  await testRoute('Achats', 'GET /api/commercant/achats/en-cours', async () => {
    const res = await axios.get(`${BASE_URL}/commercant/achats/en-cours`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.achats)) throw new Error('Liste achats commercant non reçue');
  });
}

// ============================================================================
// SECTION 9: FACTURES
// ============================================================================

async function testFactures() {
  logSection('9️⃣  FACTURES');
  
  // 9.1 Get My Factures - Sans ID dans params (utilise req.user)
  await testRoute('Factures', 'GET /api/acheteur/factures', async () => {
    const res = await axios.get(`${BASE_URL}/acheteur/factures`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    if (!Array.isArray(res.data.factures)) throw new Error('Liste factures non reçue');
  });
}

// ============================================================================
// SECTION 10: LOYERS
// ============================================================================

async function testLoyers() {
  logSection('🔟 LOYERS');
  
  // 10.1 Pay Loyer
  await testRoute('Loyers', 'POST /api/commercant/loyers/pay', async () => {
    const res = await axios.post(`${BASE_URL}/commercant/loyers/pay`, {
      boutiqueId: boutiqueId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.recepisse) throw new Error('Reçu non créé');
  });
  
  // 10.2 Get Historique Loyers
  await testRoute('Loyers', 'GET /api/commercant/loyers/historique', async () => {
    const res = await axios.get(`${BASE_URL}/commercant/loyers/historique`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.loyers)) throw new Error('Historique loyers non reçu');
  });
}

// ============================================================================
// SECTION 11: NOTIFICATIONS
// ============================================================================

async function testNotifications() {
  logSection('1️⃣1️⃣  NOTIFICATIONS');
  
  // 11.1 Get My Notifications
  await testRoute('Notifications', 'GET /api/notifications', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.notifications)) throw new Error('Liste notifications non reçue');
    if (res.data.notifications.length > 0) {
      notificationId = res.data.notifications[0]._id;
    }
  });
  
  // 11.2 Get My Notifications (spec) - Sans ID dans params
  await testRoute('Notifications', 'GET /api/notifications (paginé)', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      params: { page: 1, limit: 10 },
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.notifications)) throw new Error('Liste notifications paginée non reçue');
  });
  
  // 11.3 Mark as Read
  if (notificationId) {
    await testRoute('Notifications', 'PUT /api/notifications/:id/read', async () => {
      const res = await axios.put(`${BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      if (!res.data.notification) throw new Error('Notification non marquée comme lue');
    });
  } else {
    logTest('Notifications', 'PUT /api/notifications/:id/read', 'skipped', 'Aucune notification disponible');
  }
  
  // 11.4 Mark All as Read
  await testRoute('Notifications', 'PUT /api/notifications/read-all', async () => {
    const res = await axios.put(`${BASE_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (res.status !== 200) throw new Error('Notifications non marquées comme lues');
  });
  
  // 11.5 Get Unread Count
  await testRoute('Notifications', 'GET /api/notifications/count', async () => {
    const res = await axios.get(`${BASE_URL}/notifications/count`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (res.data.unreadCount === undefined) throw new Error('Compteur non reçu');
  });
}

// ============================================================================
// SECTION 12: PORTEFEUILLE
// ============================================================================

async function testPorteFeuille() {
  logSection('1️⃣2️⃣  PORTEFEUILLE');
  
  // 12.1 Get My Wallet
  await testRoute('PorteFeuille', 'GET /api/portefeuille/users/:id/wallet', async () => {
    const res = await axios.get(`${BASE_URL}/portefeuille/users/${commercantId}/wallet`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!res.data.wallet) throw new Error('Portefeuille non reçu');
  });
  
  // 12.2 Get Wallet Transactions
  await testRoute('PorteFeuille', 'GET /api/portefeuille/transactions', async () => {
    const res = await axios.get(`${BASE_URL}/portefeuille/transactions`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    if (!Array.isArray(res.data.transactions)) throw new Error('Transactions non reçues');
  });
}

// ============================================================================
// SECTION 13: DASHBOARD ADMIN
// ============================================================================

async function testDashboard() {
  logSection('1️⃣3️⃣  DASHBOARD ADMIN');
  
  // 13.1 Get Dashboard Stats
  await testRoute('Dashboard', 'GET /api/admin/dashboard', async () => {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data) throw new Error('Statistiques non reçues');
  });
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function runAllTests() {
  console.clear();
  
  log('╔' + '═'.repeat(78) + '╗', 'cyan');
  log('║' + ' '.repeat(20) + '🧪 TEST COMPLET DES ROUTES EN LOCAL' + ' '.repeat(23) + '║', 'cyan');
  log('╚' + '═'.repeat(78) + '╝', 'cyan');
  
  log(`\n📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');
  log(`🌐 URL: ${BASE_URL}\n`, 'blue');
  
  const startTime = Date.now();
  
  try {
    await testAuthentification();
    await testCentreCommercial();
    await testEtagesEtEspaces();
    await testCategories();
    await testBoutiques();
    await testDemandesLocation();
    await testProduitsEtTypes();
    await testAchatsEtPanier();
    await testFactures();
    await testLoyers();
    await testNotifications();
    await testPorteFeuille();
    await testDashboard();
  } catch (error) {
    log(`\n💥 Erreur fatale: ${error.message}`, 'red');
    console.error(error);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Rapport final
  logSection('📊 RAPPORT FINAL');
  
  log(`\nTotal de tests:      ${testResults.total}`, 'cyan');
  log(`Tests réussis:       ${testResults.passed} ✅`, 'green');
  log(`Tests échoués:       ${testResults.failed} ❌`, testResults.failed === 0 ? 'green' : 'red');
  log(`Tests ignorés:       ${testResults.skipped} ⏭️`, 'yellow');
  log(`Taux de réussite:    ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
      testResults.failed === 0 ? 'green' : 'yellow');
  log(`Temps d'exécution:   ${duration}s`, 'cyan');
  
  // Résultats par catégorie
  log('\n📦 Résultats par Catégorie:', 'cyan');
  for (const [category, stats] of Object.entries(testResults.byCategory)) {
    const percent = ((stats.passed / stats.total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    log(`  ${category.padEnd(25)} ${bar} ${stats.passed}/${stats.total} (${percent}%)`, 
        stats.passed === stats.total ? 'green' : 'yellow');
  }
  
  // Tests échoués
  if (testResults.failed > 0) {
    log('\n❌ Tests échoués:', 'red');
    testResults.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        log(`   - ${t.name}`, 'red');
        if (t.message) log(`     ${t.message}`, 'yellow');
      });
  } else {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS! 🎉', 'green');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Exécution
runAllTests().catch(error => {
  log(`\n💥 Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
