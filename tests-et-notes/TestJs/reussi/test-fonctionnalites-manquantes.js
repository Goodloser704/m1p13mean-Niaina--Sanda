/**
 * 🧪 TEST COMPLET DES FONCTIONNALITÉS MANQUANTES
 * 
 * Ce test couvre toutes les fonctionnalités non testées ou partiellement testées:
 * - Profil utilisateur (consultation, modification)
 * - PorteFeuille (affichage, transactions)
 * - Centre Commercial (modification)
 * - Demandes de Location (workflow complet)
 * - Dashboard Admin (statistiques)
 * - Produits (CRUD, stock)
 * - Achats (workflow complet)
 * - Panier (validation, facture)
 * - Factures (consultation)
 * - Recherche (boutiques, produits)
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

// Variables globales
let adminToken = '';
let commercantToken = '';
let acheteurToken = '';
let commercantId = '';
let acheteurId = '';
let centreCommercialId = '';
let categorieId = '';
let boutiqueId = '';
let espaceId = '';
let produitId = '';
let typeProduitId = '';

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
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

function logTest(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${name}`, 'red');
    if (message) log(`   ${message}`, 'yellow');
  }
  testResults.tests.push({ name, passed, message });
}

// ============================================================================
// SECTION 1: AUTHENTIFICATION ET PROFIL
// ============================================================================

async function testAuthentificationEtProfil() {
  logSection('1️⃣  AUTHENTIFICATION ET PROFIL');
  
  try {
    // 1.1 Login Admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    adminToken = adminRes.data.token;
    logTest('Login Admin', !!adminToken);
    
    // 1.2 Inscription Commercant
    const timestamp = Date.now();
    const commercantRes = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestCommercant${timestamp}`,
      prenoms: 'Test',
      email: `commercant${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000000',
      role: 'Commercant'
    });
    commercantToken = commercantRes.data.token;
    commercantId = commercantRes.data.user._id;
    const portefeuilleCreated = !!commercantRes.data.portefeuille;
    logTest('Inscription Commercant avec PorteFeuille', portefeuilleCreated);
    
    // 1.3 Inscription Acheteur
    const acheteurRes = await axios.post(`${BASE_URL}/auth/register`, {
      nom: `TestAcheteur${timestamp}`,
      prenoms: 'Test',
      email: `acheteur${timestamp}@test.com`,
      mdp: 'Test123456!',
      telephone: '0340000001',
      role: 'Acheteur'
    });
    acheteurToken = acheteurRes.data.token;
    acheteurId = acheteurRes.data.user._id;
    logTest('Inscription Acheteur', !!acheteurToken);
    
    // 1.4 Get My Profile (Commercant)
    try {
      const profileRes = await axios.get(`${BASE_URL}/users/${commercantId}/me`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logTest('Get My Profile', profileRes.data.user?.email === `commercant${timestamp}@test.com`);
    } catch (error) {
      logTest('Get My Profile', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 1.5 Update My Profile
    try {
      const updateRes = await axios.put(`${BASE_URL}/users/me`, {
        telephone: '0340000099'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logTest('Update My Profile', updateRes.data.user?.telephone === '0340000099');
    } catch (error) {
      logTest('Update My Profile', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Authentification: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 2: PORTEFEUILLE
// ============================================================================

async function testPorteFeuille() {
  logSection('2️⃣  PORTEFEUILLE');
  
  try {
    // 2.1 Get My Wallet
    try {
      const walletRes = await axios.get(`${BASE_URL}/users/${commercantId}/wallet`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      const hasWallet = !!walletRes.data.wallet;
      const hasTransactions = Array.isArray(walletRes.data.transactions);
      logTest('Get My Wallet', hasWallet && hasTransactions);
    } catch (error) {
      logTest('Get My Wallet', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 2.2 Vérifier balance initiale
    try {
      const walletRes = await axios.get(`${BASE_URL}/users/${commercantId}/wallet`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      const balance = walletRes.data.wallet?.balance;
      logTest('Balance initiale = 0', balance === 0);
    } catch (error) {
      logTest('Balance initiale', false, 'Impossible de vérifier');
    }
    
  } catch (error) {
    log(`Erreur section PorteFeuille: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 3: CENTRE COMMERCIAL
// ============================================================================

async function testCentreCommercial() {
  logSection('3️⃣  CENTRE COMMERCIAL');
  
  try {
    // 3.1 Get Centre Commercial
    const centreRes = await axios.get(`${BASE_URL}/centre-commercial`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    centreCommercialId = centreRes.data.centreCommercial._id;
    logTest('Get Centre Commercial', !!centreCommercialId);
    
    // 3.2 Update Centre Commercial
    try {
      const updateRes = await axios.put(`${BASE_URL}/admin/centre-commercial`, {
        description: 'Centre commercial test - Description mise à jour'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Update Centre Commercial', updateRes.status === 200);
    } catch (error) {
      logTest('Update Centre Commercial', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Centre Commercial: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 4: DEMANDES DE LOCATION
// ============================================================================

async function testDemandesLocation() {
  logSection('4️⃣  DEMANDES DE LOCATION');
  
  try {
    // 4.1 Créer une catégorie
    const catRes = await axios.post(`${BASE_URL}/categories-boutique`, {
      nom: `Catégorie Test ${Date.now()}`,
      description: 'Test'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    categorieId = catRes.data.categorie._id;
    
    // 4.2 Créer une boutique
    const boutiqueRes = await axios.post(`${BASE_URL}/commercant/boutiques`, {
      nom: `Boutique Test ${Date.now()}`,
      description: 'Test boutique',
      categorie: categorieId
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    boutiqueId = boutiqueRes.data.boutique._id;
    logTest('Créer Boutique', !!boutiqueId);
    
    // 4.3 Créer un espace
    const etagesRes = await axios.get(`${BASE_URL}/admin/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const etageId = etagesRes.data.etages[0]?._id;
    
    const espaceRes = await axios.post(`${BASE_URL}/admin/espaces`, {
      code: `TST${Date.now().toString().slice(-6)}`,
      surface: 50,
      loyer: 1000,
      etage: etageId,
      statut: 'Disponible'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    espaceId = espaceRes.data.espace._id;
    logTest('Créer Espace', !!espaceId);
    
    // 4.4 Créer demande de location
    try {
      const demandeRes = await axios.post(`${BASE_URL}/commercant/demandes-location`, {
        boutique: boutiqueId,
        espace: espaceId,
        message: 'Demande de location test'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      const demandeId = demandeRes.data.demande._id;
      logTest('Créer Demande Location', !!demandeId);
      
      // 4.5 Get Demandes Location (Admin)
      try {
        const demandesRes = await axios.get(`${BASE_URL}/admin/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Get Demandes Location', Array.isArray(demandesRes.data.demandes));
      } catch (error) {
        logTest('Get Demandes Location', false, error.response?.data?.message || 'Route non implémentée');
      }
      
      // 4.6 Get Demandes par État
      try {
        const demandesEtatRes = await axios.get(`${BASE_URL}/admin/demandes-location/etat/EnAttente`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Get Demandes par État', Array.isArray(demandesEtatRes.data.demandes));
      } catch (error) {
        logTest('Get Demandes par État', false, error.response?.data?.message || 'Route non implémentée');
      }
      
      // 4.7 Approuver demande
      try {
        const approveRes = await axios.put(`${BASE_URL}/admin/demandes-location/${demandeId}/approve`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Approuver Demande', approveRes.status === 200);
        
        // Vérifier que l'espace est maintenant occupé
        const espaceCheck = await axios.get(`${BASE_URL}/admin/espaces/${espaceId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Espace devient Occupee', espaceCheck.data.espace.statut === 'Occupee');
      } catch (error) {
        logTest('Approuver Demande', false, error.response?.data?.message || 'Route non implémentée');
      }
      
    } catch (error) {
      logTest('Workflow Demande Location', false, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    log(`Erreur section Demandes Location: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 5: DASHBOARD ADMIN
// ============================================================================

async function testDashboardAdmin() {
  logSection('5️⃣  DASHBOARD ADMIN');
  
  try {
    const dashboardRes = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const stats = dashboardRes.data;
    const hasStats = stats.totalBoutiques !== undefined &&
                     stats.actives !== undefined &&
                     stats.inactives !== undefined &&
                     stats.tauxOccupation !== undefined;
    
    logTest('Get Dashboard Stats', hasStats);
    
    if (hasStats) {
      log(`   Total boutiques: ${stats.totalBoutiques}`, 'blue');
      log(`   Actives: ${stats.actives}`, 'blue');
      log(`   Inactives: ${stats.inactives}`, 'blue');
      log(`   Taux occupation: ${stats.tauxOccupation}%`, 'blue');
    }
    
  } catch (error) {
    logTest('Get Dashboard Stats', false, error.response?.data?.message || 'Route non implémentée');
  }
}

// ============================================================================
// SECTION 6: PRODUITS ET STOCK
// ============================================================================

async function testProduitsEtStock() {
  logSection('6️⃣  PRODUITS ET STOCK');
  
  try {
    // 6.1 Créer Type Produit
    try {
      const typeRes = await axios.post(`${BASE_URL}/types-produit`, {
        type: `Type Test ${Date.now()}`,
        boutique: boutiqueId
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      typeProduitId = typeRes.data.typeProduit._id;
      logTest('Créer Type Produit', !!typeProduitId);
    } catch (error) {
      logTest('Créer Type Produit', false, error.response?.data?.message || error.message);
    }
    
    // 6.2 Créer Produit
    try {
      const produitRes = await axios.post(`${BASE_URL}/commercant/produits`, {
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
      produitId = produitRes.data.produit._id;
      logTest('Créer Produit avec Stock', !!produitId);
    } catch (error) {
      logTest('Créer Produit', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 6.3 Update Stock
    try {
      const updateStockRes = await axios.put(`${BASE_URL}/commercant/produits/${produitId}/stock`, {
        nombreDispo: 20
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logTest('Update Stock', updateStockRes.data.produit?.stock?.nombreDispo === 20);
    } catch (error) {
      logTest('Update Stock', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 6.4 Get Produits by Boutique (Public)
    try {
      const produitsRes = await axios.get(`${BASE_URL}/boutiques/${boutiqueId}/produits`);
      logTest('Get Produits by Boutique', Array.isArray(produitsRes.data.produits));
    } catch (error) {
      logTest('Get Produits by Boutique', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Produits: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 7: BOUTIQUES PUBLIC ET RECHERCHE
// ============================================================================

async function testBoutiquesPublic() {
  logSection('7️⃣  BOUTIQUES PUBLIC ET RECHERCHE');
  
  try {
    // 7.1 Get Boutiques (avec pagination)
    try {
      const boutiquesRes = await axios.get(`${BASE_URL}/boutiques`, {
        params: { page: 1, limit: 10 }
      });
      logTest('Get Boutiques avec pagination', Array.isArray(boutiquesRes.data.boutiques));
    } catch (error) {
      logTest('Get Boutiques', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 7.2 Search Boutiques
    try {
      const searchRes = await axios.get(`${BASE_URL}/boutiques/search`, {
        params: { keyword: 'Test' }
      });
      logTest('Search Boutiques', Array.isArray(searchRes.data.boutiques));
    } catch (error) {
      logTest('Search Boutiques', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Boutiques Public: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 8: PANIER ET ACHATS
// ============================================================================

async function testPanierEtAchats() {
  logSection('8️⃣  PANIER ET ACHATS');
  
  if (!produitId) {
    log('⚠️  Produit non créé, tests d\'achats ignorés', 'yellow');
    return;
  }
  
  try {
    // 8.1 Valider Panier
    try {
      const panierData = {
        achats: [
          {
            produit: produitId,
            typeAchat: {
              type: 'Recuperer',
              dateDebut: new Date(),
              dateFin: new Date(Date.now() + 30 * 60 * 1000) // +30 min
            },
            etat: 'EnAttente'
          }
        ]
      };
      
      const validateRes = await axios.post(`${BASE_URL}/acheteur/${acheteurId}/achats/panier/validate`, 
        panierData,
        {
          headers: { Authorization: `Bearer ${acheteurToken}` }
        }
      );
      
      const factureCreated = !!validateRes.data.facture;
      const achatsCreated = Array.isArray(validateRes.data.achats);
      logTest('Valider Panier (Facture + Achats)', factureCreated && achatsCreated);
      
      // Vérifier que le stock a été déduit
      try {
        const produitCheck = await axios.get(`${BASE_URL}/boutiques/${boutiqueId}/produits`);
        const produit = produitCheck.data.produits.find(p => p._id === produitId);
        logTest('Stock déduit après achat', produit?.stock?.nombreDispo < 20);
      } catch (error) {
        logTest('Vérification stock', false, 'Impossible de vérifier');
      }
      
    } catch (error) {
      logTest('Valider Panier', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 8.2 Get My Achats En Cours (Acheteur)
    try {
      const achatsRes = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/achats/en-cours`, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      logTest('Get My Achats En Cours', Array.isArray(achatsRes.data.achats));
    } catch (error) {
      logTest('Get My Achats En Cours', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 8.3 Get My Historique Achats
    try {
      const historiqueRes = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/achats/historique`, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      logTest('Get My Historique Achats', Array.isArray(historiqueRes.data.achats));
    } catch (error) {
      logTest('Get My Historique Achats', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 8.4 Get Achats En Cours (Commercant)
    try {
      const achatsCommercantRes = await axios.get(`${BASE_URL}/commercant/achats/en-cours`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      logTest('Get Achats En Cours (Commercant)', Array.isArray(achatsCommercantRes.data.achats));
    } catch (error) {
      logTest('Get Achats En Cours (Commercant)', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Panier et Achats: ${error.message}`, 'red');
  }
}

// ============================================================================
// SECTION 9: FACTURES
// ============================================================================

async function testFactures() {
  logSection('9️⃣  FACTURES');
  
  try {
    const facturesRes = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/factures`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    logTest('Get My Factures', Array.isArray(facturesRes.data.factures));
  } catch (error) {
    logTest('Get My Factures', false, error.response?.data?.message || 'Route non implémentée');
  }
}

// ============================================================================
// SECTION 10: NOTIFICATIONS AVANCÉES
// ============================================================================

async function testNotificationsAvancees() {
  logSection('🔟 NOTIFICATIONS AVANCÉES');
  
  try {
    // 10.1 Get My Notifications avec pagination
    try {
      const notifRes = await axios.get(`${BASE_URL}/users/${commercantId}/notifications`, {
        params: { page: 1, limit: 10 },
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      
      const hasData = Array.isArray(notifRes.data.data);
      const hasTotal = notifRes.data.total !== undefined;
      const hasUnreadCount = notifRes.data.unreadCount !== undefined;
      
      logTest('Get My Notifications (paginé)', hasData && hasTotal && hasUnreadCount);
    } catch (error) {
      logTest('Get My Notifications', false, error.response?.data?.message || 'Route non implémentée');
    }
    
    // 10.2 Mark Notification As Read
    try {
      // D'abord récupérer une notification
      const notifRes = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      
      if (notifRes.data.notifications && notifRes.data.notifications.length > 0) {
        const notifId = notifRes.data.notifications[0]._id;
        
        const markRes = await axios.put(`${BASE_URL}/notifications/${notifId}/read`, {}, {
          headers: { Authorization: `Bearer ${commercantToken}` }
        });
        
        logTest('Mark Notification As Read', markRes.data.notification?.estLu === true);
      } else {
        logTest('Mark Notification As Read', false, 'Aucune notification disponible');
      }
    } catch (error) {
      logTest('Mark Notification As Read', false, error.response?.data?.message || 'Route non implémentée');
    }
    
  } catch (error) {
    log(`Erreur section Notifications: ${error.message}`, 'red');
  }
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function runAllTests() {
  console.clear();
  
  log('╔' + '═'.repeat(78) + '╗', 'cyan');
  log('║' + ' '.repeat(15) + '🧪 TEST DES FONCTIONNALITÉS MANQUANTES' + ' '.repeat(24) + '║', 'cyan');
  log('╚' + '═'.repeat(78) + '╝', 'cyan');
  
  log(`\n📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'blue');
  log(`🌐 URL: ${BASE_URL}\n`, 'blue');
  
  const startTime = Date.now();
  
  await testAuthentificationEtProfil();
  await testPorteFeuille();
  await testCentreCommercial();
  await testDemandesLocation();
  await testDashboardAdmin();
  await testProduitsEtStock();
  await testBoutiquesPublic();
  await testPanierEtAchats();
  await testFactures();
  await testNotificationsAvancees();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Rapport final
  logSection('📊 RAPPORT FINAL');
  
  log(`\nTotal de tests:      ${testResults.total}`, 'cyan');
  log(`Tests réussis:       ${testResults.passed} ✅`, 'green');
  log(`Tests échoués:       ${testResults.failed} ❌`, testResults.failed === 0 ? 'green' : 'red');
  log(`Taux de réussite:    ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
      testResults.failed === 0 ? 'green' : 'yellow');
  log(`Temps d'exécution:   ${duration}s`, 'cyan');
  
  // Tests échoués
  if (testResults.failed > 0) {
    log('\n❌ Tests échoués:', 'red');
    testResults.tests
      .filter(t => !t.passed)
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
