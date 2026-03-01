const axios = require('axios');

/**
 * 🏪 Tests des routes Commercant et Demandes-Location - Serveur Local
 * Test complet des fonctionnalités de demandes de location
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
let clientToken = '';

// IDs pour les tests
let adminId = '';
let commercantId = '';
let clientId = '';
let boutiqueId = '';
let espaceId = '';
let demandeId = '';
let demandeId2 = '';

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
    
    // Client
    const clientRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@test.com',
      mdp: 'Client123456!'
    });
    clientToken = clientRes.data.token;
    clientId = clientRes.data.user.id;
    afficherResultat('Connexion Client', true, `ID: ${clientId}`);
    
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
 * Préparer les données de test (boutique et espace)
 */
async function preparerDonneesTest() {
  afficherSection('📦 PRÉPARATION DES DONNÉES DE TEST');
  
  try {
    // Récupérer les boutiques du commerçant
    const boutiquesRes = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    if (boutiquesRes.data.boutiques && boutiquesRes.data.boutiques.length > 0) {
      boutiqueId = boutiquesRes.data.boutiques[0]._id;
      afficherResultat('Boutique trouvée', true, `ID: ${boutiqueId}, Nom: ${boutiquesRes.data.boutiques[0].nom}`);
    } else {
      afficherResultat('Boutique trouvée', false, 'Aucune boutique disponible');
    }
    
    // Récupérer les espaces disponibles
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (espacesRes.data.espaces && espacesRes.data.espaces.length > 0) {
      // Trouver un espace disponible
      const espaceDisponible = espacesRes.data.espaces.find(e => e.statut === 'Disponible');
      
      if (espaceDisponible) {
        espaceId = espaceDisponible._id;
        afficherResultat('Espace disponible trouvé', true, `ID: ${espaceId}, Code: ${espaceDisponible.code}`);
      } else {
        afficherResultat('Espace disponible trouvé', false, 'Aucun espace disponible');
      }
    } else {
      afficherResultat('Espace disponible trouvé', false, 'Aucun espace dans la base');
    }
    
  } catch (error) {
    afficherResultat('Préparation données', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 1: Créer une demande de location
 */
async function testCreerDemande() {
  afficherSection('🏪 TEST 1: Créer une demande de location');
  
  if (!boutiqueId || !espaceId) {
    afficherResultat('Créer demande', false, 'Boutique ou espace manquant');
    return;
  }
  
  try {
    // Trouver un espace disponible sans demande en attente
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let espaceLibre = null;
    for (const espace of espacesRes.data.espaces) {
      if (espace.statut === 'Disponible') {
        // Vérifier s'il y a une demande en attente pour cet espace
        const demandesRes = await axios.get(`${BASE_URL}/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const demandeExistante = demandesRes.data.demandes.find(d => 
          d.espace._id === espace._id && d.etatDemande === 'EnAttente'
        );
        
        if (!demandeExistante) {
          espaceLibre = espace;
          break;
        }
      }
    }
    
    if (!espaceLibre) {
      afficherResultat('Créer demande', false, 'Aucun espace disponible sans demande en attente');
      return;
    }
    
    // Créer une demande valide
    const res = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceLibre._id,
      dateDebutSouhaitee: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      dureeContrat: 12,
      messageCommercant: 'Je souhaite louer cet espace pour ma boutique'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'POST /api/demandes-location',
      res.status === 201 && res.data.demande,
      `Demande créée: ${res.data.demande._id}, État: ${res.data.demande.etatDemande}`
    );
    
    if (res.data.demande) {
      demandeId = res.data.demande._id;
    }
    
    // Test: Créer une demande sans boutique
    try {
      await axios.post(`${BASE_URL}/demandes-location`, {
        espaceId: espaceLibre._id,
        dureeContrat: 12
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Créer demande (Sans boutique)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Créer demande (Sans boutique)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
    // Test: Créer une demande sans espace
    try {
      await axios.post(`${BASE_URL}/demandes-location`, {
        boutiqueId: boutiqueId,
        dureeContrat: 12
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Créer demande (Sans espace)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Créer demande (Sans espace)',
        error.response?.status === 400,
        'Validation échouée comme attendu'
      );
    }
    
    // Test: Client ne peut pas créer de demande
    try {
      await axios.post(`${BASE_URL}/demandes-location`, {
        boutiqueId: boutiqueId,
        espaceId: espaceLibre._id,
        dureeContrat: 12
      }, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      afficherResultat('Créer demande (Client)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Créer demande (Client)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('POST /api/demandes-location', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 2: Obtenir mes demandes (Commerçant)
 */
async function testObtenirMesDemandes() {
  afficherSection('📋 TEST 2: Obtenir mes demandes (Commerçant)');
  
  try {
    // Sans pagination
    const res1 = await axios.get(`${BASE_URL}/demandes-location/me`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/me',
      res1.status === 200 && res1.data.demandes && res1.data.pagination,
      `${res1.data.demandes.length} demandes, Total: ${res1.data.pagination.total}`
    );
    
    // Avec pagination
    const res2 = await axios.get(`${BASE_URL}/demandes-location/me?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/me (Pagination)',
      res2.status === 200 && res2.data.demandes.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.demandes.length}`
    );
    
    // Avec filtre par état
    const res3 = await axios.get(`${BASE_URL}/demandes-location/me?etat=EnAttente`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/me (Filtre état)',
      res3.status === 200,
      `${res3.data.demandes.length} demandes en attente`
    );
    
    // Test: Admin ne peut pas accéder à cette route
    try {
      await axios.get(`${BASE_URL}/demandes-location/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('GET /api/demandes-location/me (Admin)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location/me (Admin)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/demandes-location/me', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 3: Obtenir toutes les demandes (Admin)
 */
async function testObtenirToutesDemandes() {
  afficherSection('👨‍💼 TEST 3: Obtenir toutes les demandes (Admin)');
  
  try {
    // Sans filtre
    const res1 = await axios.get(`${BASE_URL}/demandes-location`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location',
      res1.status === 200 && res1.data.demandes && res1.data.pagination,
      `${res1.data.demandes.length} demandes, Total: ${res1.data.pagination.total}`
    );
    
    // Avec pagination
    const res2 = await axios.get(`${BASE_URL}/demandes-location?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location (Pagination)',
      res2.status === 200 && res2.data.demandes.length <= 5,
      `Page 1, Limite: 5, Reçu: ${res2.data.demandes.length}`
    );
    
    // Avec filtre par état
    const res3 = await axios.get(`${BASE_URL}/demandes-location?etat=EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location (Filtre état)',
      res3.status === 200,
      `${res3.data.demandes.length} demandes en attente`
    );
    
    // Test: Commerçant ne peut pas accéder
    try {
      await axios.get(`${BASE_URL}/demandes-location`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('GET /api/demandes-location (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/demandes-location', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 4: Obtenir les demandes par état (Admin)
 */
async function testObtenirDemandesParEtat() {
  afficherSection('📊 TEST 4: Obtenir les demandes par état (Admin)');
  
  try {
    // Demandes en attente
    const res1 = await axios.get(`${BASE_URL}/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/etat/EnAttente',
      res1.status === 200 && res1.data.demandes,
      `${res1.data.demandes.length} demandes en attente`
    );
    
    // Demandes acceptées
    const res2 = await axios.get(`${BASE_URL}/demandes-location/etat/Acceptee`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/etat/Acceptee',
      res2.status === 200 && res2.data.demandes,
      `${res2.data.demandes.length} demandes acceptées`
    );
    
    // Demandes refusées
    const res3 = await axios.get(`${BASE_URL}/demandes-location/etat/Refusee`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/etat/Refusee',
      res3.status === 200 && res3.data.demandes,
      `${res3.data.demandes.length} demandes refusées`
    );
    
    // Test: État invalide
    try {
      await axios.get(`${BASE_URL}/demandes-location/etat/InvalidEtat`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('GET /api/demandes-location/etat/:etat (Invalide)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location/etat/:etat (Invalide)',
        error.response?.status === 400,
        'État invalide rejeté comme attendu'
      );
    }
    
    // Test: Commerçant ne peut pas accéder
    try {
      await axios.get(`${BASE_URL}/demandes-location/etat/EnAttente`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('GET /api/demandes-location/etat/:etat (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location/etat/:etat (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/demandes-location/etat/:etat', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 5: Obtenir une demande par ID
 */
async function testObtenirDemandeParId() {
  afficherSection('🔍 TEST 5: Obtenir une demande par ID');
  
  if (!demandeId) {
    afficherResultat('Obtenir demande par ID', false, 'Pas de demande disponible');
    return;
  }
  
  try {
    // Commerçant propriétaire
    const res1 = await axios.get(`${BASE_URL}/demandes-location/${demandeId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/:id (Commerçant)',
      res1.status === 200 && res1.data.demande,
      `Demande: ${res1.data.demande._id}, État: ${res1.data.demande.etatDemande}`
    );
    
    // Admin
    const res2 = await axios.get(`${BASE_URL}/demandes-location/${demandeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'GET /api/demandes-location/:id (Admin)',
      res2.status === 200 && res2.data.demande,
      `Demande: ${res2.data.demande._id}`
    );
    
    // Test: Client ne peut pas accéder
    try {
      await axios.get(`${BASE_URL}/demandes-location/${demandeId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      afficherResultat('GET /api/demandes-location/:id (Client)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location/:id (Client)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
    // Test: Demande inexistante
    try {
      await axios.get(`${BASE_URL}/demandes-location/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('GET /api/demandes-location/:id (Inexistant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'GET /api/demandes-location/:id (Inexistant)',
        error.response?.status === 404,
        'Non trouvé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('GET /api/demandes-location/:id', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 6: Accepter une demande (Admin)
 */
async function testAccepterDemande() {
  afficherSection('✅ TEST 6: Accepter une demande (Admin)');
  
  // Créer une nouvelle demande pour l'acceptation
  try {
    // Trouver un espace disponible sans demande en attente
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let espaceLibre = null;
    for (const espace of espacesRes.data.espaces) {
      if (espace.statut === 'Disponible') {
        const demandesRes = await axios.get(`${BASE_URL}/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const demandeExistante = demandesRes.data.demandes.find(d => 
          d.espace._id === espace._id && d.etatDemande === 'EnAttente'
        );
        
        if (!demandeExistante) {
          espaceLibre = espace;
          break;
        }
      }
    }
    
    if (!espaceLibre) {
      afficherResultat('Accepter demande', false, 'Pas d\'espace disponible pour le test');
      return;
    }
    
    // Créer une demande
    const createRes = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceLibre._id,
      dureeContrat: 12,
      messageCommercant: 'Demande pour test d\'acceptation'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const nouvelleDemandeId = createRes.data.demande._id;
    
    // Accepter la demande
    const res = await axios.put(`${BASE_URL}/demandes-location/${nouvelleDemandeId}/accepter`, {
      dateDebut: new Date().toISOString(),
      loyerMensuel: 1500,
      caution: 3000,
      conditionsSpeciales: 'Paiement le 1er de chaque mois',
      messageAdmin: 'Demande acceptée, bienvenue!'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/demandes-location/:id/accepter',
      res.status === 200 && res.data.demande.etatDemande === 'Acceptee',
      `Demande acceptée: ${res.data.demande._id}`
    );
    
    // Test: Accepter une demande déjà traitée
    try {
      await axios.put(`${BASE_URL}/demandes-location/${nouvelleDemandeId}/accepter`, {
        loyerMensuel: 1500
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Accepter demande (Déjà traitée)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Accepter demande (Déjà traitée)',
        error.response?.status === 400,
        'Rejeté comme attendu'
      );
    }
    
    // Test: Commerçant ne peut pas accepter
    try {
      await axios.put(`${BASE_URL}/demandes-location/${demandeId}/accepter`, {
        loyerMensuel: 1500
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Accepter demande (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Accepter demande (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('PUT /api/demandes-location/:id/accepter', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 7: Refuser une demande (Admin)
 */
async function testRefuserDemande() {
  afficherSection('❌ TEST 7: Refuser une demande (Admin)');
  
  // Créer une nouvelle demande pour le refus
  try {
    // Trouver un espace disponible sans demande en attente
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let espaceLibre = null;
    for (const espace of espacesRes.data.espaces) {
      if (espace.statut === 'Disponible') {
        const demandesRes = await axios.get(`${BASE_URL}/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const demandeExistante = demandesRes.data.demandes.find(d => 
          d.espace._id === espace._id && d.etatDemande === 'EnAttente'
        );
        
        if (!demandeExistante) {
          espaceLibre = espace;
          break;
        }
      }
    }
    
    if (!espaceLibre) {
      afficherResultat('Refuser demande', false, 'Pas d\'espace disponible pour le test');
      return;
    }
    
    // Créer une demande
    const createRes = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceLibre._id,
      dureeContrat: 12,
      messageCommercant: 'Demande pour test de refus'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const nouvelleDemandeId = createRes.data.demande._id;
    
    // Refuser la demande
    const res = await axios.put(`${BASE_URL}/demandes-location/${nouvelleDemandeId}/refuser`, {
      raisonRefus: 'Espace réservé pour un autre projet',
      messageAdmin: 'Désolé, nous ne pouvons pas accepter votre demande'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/demandes-location/:id/refuser',
      res.status === 200 && res.data.demande.etatDemande === 'Refusee',
      `Demande refusée: ${res.data.demande._id}`
    );
    
    // Test: Refuser une demande déjà traitée
    try {
      await axios.put(`${BASE_URL}/demandes-location/${nouvelleDemandeId}/refuser`, {
        raisonRefus: 'Autre raison'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Refuser demande (Déjà traitée)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Refuser demande (Déjà traitée)',
        error.response?.status === 400,
        'Rejeté comme attendu'
      );
    }
    
    // Test: Commerçant ne peut pas refuser
    try {
      await axios.put(`${BASE_URL}/demandes-location/${demandeId}/refuser`, {
        raisonRefus: 'Test'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Refuser demande (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Refuser demande (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('PUT /api/demandes-location/:id/refuser', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 8: Mettre à jour l'état d'une demande (Admin)
 */
async function testMettreAJourEtatDemande() {
  afficherSection('🔄 TEST 8: Mettre à jour l\'état d\'une demande (Admin)');
  
  if (!demandeId) {
    afficherResultat('Mettre à jour état', false, 'Pas de demande disponible');
    return;
  }
  
  try {
    // Trouver un espace disponible sans demande en attente
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let espaceLibre = null;
    for (const espace of espacesRes.data.espaces) {
      if (espace.statut === 'Disponible') {
        const demandesRes = await axios.get(`${BASE_URL}/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const demandeExistante = demandesRes.data.demandes.find(d => 
          d.espace._id === espace._id && d.etatDemande === 'EnAttente'
        );
        
        if (!demandeExistante) {
          espaceLibre = espace;
          break;
        }
      }
    }
    
    if (!espaceLibre) {
      afficherResultat('Mettre à jour état', false, 'Pas d\'espace disponible');
      return;
    }
    
    const createRes = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceLibre._id,
      dureeContrat: 12
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const nouvelleDemandeId = createRes.data.demande._id;
    
    // Mettre à jour l'état
    const res = await axios.put(`${BASE_URL}/demandes-location/${nouvelleDemandeId}`, {
      etat: 'Acceptee'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    afficherResultat(
      'PUT /api/demandes-location/:id',
      res.status === 200 && res.data.demande.etatDemande === 'Acceptee',
      `État mis à jour: ${res.data.demande.etatDemande}`
    );
    
    // Test: État invalide
    try {
      await axios.put(`${BASE_URL}/demandes-location/${demandeId}`, {
        etat: 'InvalidEtat'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      afficherResultat('Mettre à jour état (Invalide)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Mettre à jour état (Invalide)',
        error.response?.status === 400,
        'État invalide rejeté comme attendu'
      );
    }
    
    // Test: Commerçant ne peut pas mettre à jour
    try {
      await axios.put(`${BASE_URL}/demandes-location/${demandeId}`, {
        etat: 'Acceptee'
      }, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Mettre à jour état (Commerçant)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Mettre à jour état (Commerçant)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('PUT /api/demandes-location/:id', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test 9: Annuler une demande (Commerçant)
 */
async function testAnnulerDemande() {
  afficherSection('🗑️ TEST 9: Annuler une demande (Commerçant)');
  
  // Créer une nouvelle demande pour l'annulation
  try {
    // Trouver un espace disponible sans demande en attente
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    let espaceLibre = null;
    for (const espace of espacesRes.data.espaces) {
      if (espace.statut === 'Disponible') {
        const demandesRes = await axios.get(`${BASE_URL}/demandes-location`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const demandeExistante = demandesRes.data.demandes.find(d => 
          d.espace._id === espace._id && d.etatDemande === 'EnAttente'
        );
        
        if (!demandeExistante) {
          espaceLibre = espace;
          break;
        }
      }
    }
    
    if (!espaceLibre) {
      afficherResultat('Annuler demande', false, 'Pas d\'espace disponible');
      return;
    }
    
    const createRes = await axios.post(`${BASE_URL}/demandes-location`, {
      boutiqueId: boutiqueId,
      espaceId: espaceLibre._id,
      dureeContrat: 12,
      messageCommercant: 'Demande pour test d\'annulation'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const nouvelleDemandeId = createRes.data.demande._id;
    
    // Annuler la demande
    const res = await axios.delete(`${BASE_URL}/demandes-location/${nouvelleDemandeId}`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    afficherResultat(
      'DELETE /api/demandes-location/:id',
      res.status === 200,
      'Demande annulée avec succès'
    );
    
    // Test: Annuler une demande inexistante
    try {
      await axios.delete(`${BASE_URL}/demandes-location/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${commercantToken}` }
      });
      afficherResultat('Annuler demande (Inexistante)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Annuler demande (Inexistante)',
        error.response?.status === 404,
        'Non trouvée comme attendu'
      );
    }
    
    // Test: Client ne peut pas annuler
    try {
      await axios.delete(`${BASE_URL}/demandes-location/${demandeId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      afficherResultat('Annuler demande (Client)', false, 'Devrait échouer');
    } catch (error) {
      afficherResultat(
        'Annuler demande (Client)',
        error.response?.status === 403,
        'Accès refusé comme attendu'
      );
    }
    
  } catch (error) {
    afficherResultat('DELETE /api/demandes-location/:id', false, error.response?.data?.message || error.message);
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
║   🏪 TESTS COMMERCANT & DEMANDES-LOCATION - LOCAL 🏪     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await authentifierUtilisateurs();
    await preparerDonneesTest();
    await testCreerDemande();
    await testObtenirMesDemandes();
    await testObtenirToutesDemandes();
    await testObtenirDemandesParEtat();
    await testObtenirDemandeParId();
    await testAccepterDemande();
    await testRefuserDemande();
    await testMettreAJourEtatDemande();
    await testAnnulerDemande();
    
    afficherResume();
  } catch (error) {
    console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Exécuter les tests
executerTests();
