const axios = require('axios');

/**
 * 🛒 Tests des routes Achats et Acheteurs - Serveur Local
 * Test complet des fonctionnalités d'achat pour les acheteurs
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
let acheteurId = '';
let commercantId = '';
let boutiqueId = '';
let produitId = '';
let achatId = '';
let factureId = '';

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
 * Préparer les données de test (boutique et produit)
 */
async function preparerDonneesTest() {
  afficherSection('📦 PRÉPARATION DES DONNÉES DE TEST');
  
  try {
    // Utiliser directement l'ID de la boutique créée par le seed
    // Récupérer les produits disponibles
    const produitsRes = await axios.get(`${BASE_URL}/produits`);
    
    if (produitsRes.data.produits && produitsRes.data.produits.length > 0) {
      // Trouver un produit avec du stock
      const produitAvecStock = produitsRes.data.produits.find(p => 
        p.stock && p.stock.nombreDispo > 0 && p.isActive
      );
      
      if (produitAvecStock) {
        produitId = produitAvecStock._id;
        boutiqueId = produitAvecStock.boutique;
        afficherResultat('Produit trouvé', true, `ID: ${produitId}, Nom: ${produitAvecStock.nom}, Stock: ${produitAvecStock.stock.nombreDispo}`);
        afficherResultat('Boutique trouvée', true, `ID: ${boutiqueId}`);
      } else {
        afficherResultat('Produit trouvé', false, 'Aucun produit avec stock disponible');
      }
    } else {
      afficherResultat('Produit trouvé', false, 'Aucun produit disponible');
    }
    
  } catch (error) {
    afficherResultat('Préparation données', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 1: Route de test API achats
 */
async function testRouteTestAchats() {
  afficherSection('🧪 TEST 1: Route de test API achats');
  
  try {
    // Note: Cette route nécessite l'authentification (comportement du serveur)
    // On teste avec un token valide
    const res = await axios.get(`${BASE_URL}/achats/test`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/test (Route de test avec auth)',
      res.status === 200 && res.data.message && res.data.endpoints,
      `${res.data.endpoints.length} endpoints disponibles`
    );
    
  } catch (error) {
    afficherResultat('GET /api/achats/test', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 2: Valider un panier
 */
async function testValiderPanier() {
  afficherSection('🛒 TEST 2: Valider un panier');
  
  if (!produitId) {
    afficherResultat('Validation panier', false, 'Pas de produit disponible pour le test');
    return;
  }
  
  try {
    // Récupérer les détails du produit
    const produitRes = await axios.get(`${BASE_URL}/produits/${produitId}`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    const produit = produitRes.data.produit;
    
    // Créer un panier avec 2 produits
    const panier = {
      achats: [
        {
          produit: produitId,
          quantite: 2,
          typeAchat: 'Recuperer',
          prixUnitaire: produit.prix
        }
      ],
      montantTotal: produit.prix * 2
    };
    
    const res = await axios.post(`${BASE_URL}/achats/panier/valider`, panier, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'POST /api/achats/panier/valider',
      res.status === 201 && res.data.facture && res.data.achats,
      `Facture: ${res.data.facture._id}, Achats: ${res.data.achats.length}`
    );
    
    if (res.data.achats && res.data.achats.length > 0) {
      achatId = res.data.achats[0]._id;
      factureId = res.data.facture._id;
    }
    
    // Test: Panier avec solde insuffisant
    try {
      const panierGrand = {
        achats: [
          {
            produit: produitId,
            quantite: 1000,
            typeAchat: 'Recuperer',
            prixUnitaire: produit.prix
          }
        ],
        montantTotal: produit.prix * 1000
      };
      
      await axios.post(`${BASE_URL}/achats/panier/valider`, panierGrand, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Validation panier (Solde insuffisant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Validation panier (Solde insuffisant)',
        error.response?.status === 400 && error.response?.data?.message.includes('insuffisant'),
        'Rejeté comme attendu'
      );
    }
    
    // Test: Panier vide
    try {
      await axios.post(`${BASE_URL}/achats/panier/valider`, {
        achats: [],
        montantTotal: 0
      }, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Validation panier (Vide)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Validation panier (Vide)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('POST /api/achats/panier/valider', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Obtenir mes achats en cours
 */
async function testObtenirAchatsEnCours() {
  afficherSection('📋 TEST 3: Obtenir mes achats en cours');
  
  try {
    // Via /api/achats/en-cours
    const res1 = await axios.get(`${BASE_URL}/achats/en-cours`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/en-cours',
      res1.status === 200 && res1.data.achats !== undefined,
      `${res1.data.count} achats en cours`
    );
    
    // Via /api/acheteur/achats/en-cours
    const res2 = await axios.get(`${BASE_URL}/acheteur/achats/en-cours`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/acheteur/achats/en-cours',
      res2.status === 200 && res2.data.achats !== undefined,
      `${res2.data.count} achats en cours`
    );
    
    // Via /api/acheteur/:id/achats/en-cours
    const res3 = await axios.get(`${BASE_URL}/acheteur/${acheteurId}/achats/en-cours`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/acheteur/:id/achats/en-cours',
      res3.status === 200 && res3.data.achats !== undefined,
      `${res3.data.count} achats en cours`
    );
    
    // Test: Commerçant ne peut pas accéder
    try {
      await axios.get(`${BASE_URL}/achats/en-cours`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('GET /api/achats/en-cours (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/achats/en-cours (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/achats/en-cours', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Obtenir mon historique d'achats
 */
async function testObtenirHistoriqueAchats() {
  afficherSection('📚 TEST 4: Obtenir mon historique d\'achats');
  
  try {
    // Sans pagination
    const res1 = await axios.get(`${BASE_URL}/achats/historique`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/historique (Sans pagination)',
      res1.status === 200 && res1.data.achats && res1.data.pagination,
      `${res1.data.achats.length} achats, Total: ${res1.data.pagination.total}`
    );
    
    // Avec pagination
    const res2 = await axios.get(`${BASE_URL}/achats/historique?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/historique (Avec pagination)',
      res2.status === 200 && res2.data.achats.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.achats.length}`
    );
    
    // Via route acheteur
    const res3 = await axios.get(`${BASE_URL}/acheteur/achats/historique`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/acheteur/achats/historique',
      res3.status === 200 && res3.data.achats !== undefined,
      `${res3.data.achats.length} achats dans l'historique`
    );
    
  } catch (error) {
    afficherResultat('GET /api/achats/historique', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Obtenir un achat par ID
 */
async function testObtenirAchatParId() {
  afficherSection('🔍 TEST 5: Obtenir un achat par ID');
  
  if (!achatId) {
    afficherResultat('Obtenir achat par ID', false, 'Pas d\'achat disponible pour le test');
    return;
  }
  
  try {
    const res = await axios.get(`${BASE_URL}/achats/${achatId}`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/:id',
      res.status === 200 && res.data.achat,
      `Achat: ${res.data.achat._id}, État: ${res.data.achat.etat}`
    );
    
    // Test: Achat inexistant
    try {
      await axios.get(`${BASE_URL}/achats/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('GET /api/achats/:id (Inexistant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/achats/:id (Inexistant)',
        error.response?.status === 404,
        'Non trouvé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/achats/:id', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Obtenir mes factures
 */
async function testObtenirFactures() {
  afficherSection('🧾 TEST 6: Obtenir mes factures');
  
  try {
    // Via /api/achats/factures
    const res1 = await axios.get(`${BASE_URL}/achats/factures`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/factures',
      res1.status === 200 && res1.data.factures && res1.data.pagination,
      `${res1.data.factures.length} factures, Total: ${res1.data.pagination.total}`
    );
    
    // Via /api/acheteur/factures
    const res2 = await axios.get(`${BASE_URL}/acheteur/factures`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/acheteur/factures',
      res2.status === 200 && res2.data.factures !== undefined,
      `${res2.data.factures.length} factures`
    );
    
    // Avec pagination
    const res3 = await axios.get(`${BASE_URL}/achats/factures?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/factures (Pagination)',
      res3.status === 200 && res3.data.factures.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res3.data.factures.length}`
    );
    
  } catch (error) {
    afficherResultat('GET /api/achats/factures', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 7: Obtenir une facture par ID
 */
async function testObtenirFactureParId() {
  afficherSection('📄 TEST 7: Obtenir une facture par ID');
  
  if (!factureId) {
    afficherResultat('Obtenir facture par ID', false, 'Pas de facture disponible pour le test');
    return;
  }
  
  try {
    const res = await axios.get(`${BASE_URL}/achats/factures/${factureId}`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/factures/:id',
      res.status === 200 && res.data.facture,
      `Facture: ${res.data.facture._id}, Montant: ${res.data.facture.montantTotal}€`
    );
    
  } catch (error) {
    afficherResultat('GET /api/achats/factures/:id', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 8: Obtenir les statistiques d'achats
 */
async function testObtenirStatistiques() {
  afficherSection('📊 TEST 8: Obtenir les statistiques d\'achats');
  
  try {
    const res = await axios.get(`${BASE_URL}/achats/statistiques`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'GET /api/achats/statistiques',
      res.status === 200 && res.data.totalAchats !== undefined,
      `Total achats: ${res.data.totalAchats}, Montant total: ${res.data.montantTotal}€`
    );
    
    console.log(`\n  ${colors.magenta}Détails des statistiques:${colors.reset}`);
    console.log(`  - Total achats: ${res.data.totalAchats}`);
    console.log(`  - Montant total: ${res.data.montantTotal}€`);
    
    if (res.data.achatsParEtat && res.data.achatsParEtat.length > 0) {
      console.log(`  - Achats par état:`);
      res.data.achatsParEtat.forEach(stat => {
        console.log(`    • ${stat._id}: ${stat.count} (${stat.montant}€)`);
      });
    }
    
    if (res.data.boutiquesPreferees && res.data.boutiquesPreferees.length > 0) {
      console.log(`  - Boutiques préférées:`);
      res.data.boutiquesPreferees.forEach((boutique, index) => {
        console.log(`    ${index + 1}. ${boutique.boutique}: ${boutique.count} achats (${boutique.montant}€)`);
      });
    }
    
  } catch (error) {
    afficherResultat('GET /api/achats/statistiques', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 9: Annuler un achat
 */
async function testAnnulerAchat() {
  afficherSection('❌ TEST 9: Annuler un achat');
  
  if (!achatId) {
    afficherResultat('Annuler achat', false, 'Pas d\'achat disponible pour le test');
    return;
  }
  
  try {
    // Créer un nouvel achat pour l'annulation
    const produitRes = await axios.get(`${BASE_URL}/produits/${produitId}`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    const produit = produitRes.data.produit;
    
    const panier = {
      achats: [
        {
          produit: produitId,
          quantite: 1,
          typeAchat: 'Recuperer',
          prixUnitaire: produit.prix
        }
      ],
      montantTotal: produit.prix
    };
    
    const createRes = await axios.post(`${BASE_URL}/achats/panier/valider`, panier, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    const nouvelAchatId = createRes.data.achats[0]._id;
    
    // Annuler l'achat
    const res = await axios.put(`${BASE_URL}/achats/${nouvelAchatId}/annuler`, {
      raison: 'Test d\'annulation'
    }, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    afficherResultat(
      'PUT /api/achats/:id/annuler',
      res.status === 200 && res.data.achat.etat === 'Annulee',
      `Achat annulé: ${res.data.achat._id}`
    );
    
    // Test: Annuler un achat déjà annulé
    try {
      await axios.put(`${BASE_URL}/achats/${nouvelAchatId}/annuler`, {
        raison: 'Deuxième tentative'
      }, {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      });
      afficherResultat('Annuler achat (Déjà annulé)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Annuler achat (Déjà annulé)',
        error.response?.status === 400,
        'Rejeté comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('PUT /api/achats/:id/annuler', false, error.response?.data?.message || error.message);
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
║     🛒 TESTS DES ROUTES ACHATS & ACHETEURS - LOCAL 🛒    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await preparerDonneesTest();
    await testRouteTestAchats();
    await testValiderPanier();
    await testObtenirAchatsEnCours();
    await testObtenirHistoriqueAchats();
    await testObtenirAchatParId();
    await testObtenirFactures();
    await testObtenirFactureParId();
    await testObtenirStatistiques();
    await testAnnulerAchat();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
