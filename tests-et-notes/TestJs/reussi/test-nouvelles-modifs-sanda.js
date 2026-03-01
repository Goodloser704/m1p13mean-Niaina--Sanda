/**
 * 🧪 Test des Nouvelles Modifications de Sanda
 * - Champ photo dans Produit
 * - Extension des champs modifiables (photo, typeProduit, stock)
 * - Filtre statutBoutique pour récupérer produits
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let adminToken = '';
let commercantToken = '';
let boutiqueId = '';
let typeProduitId = '';
let produitId = '';

let stats = {
  total: 0,
  success: 0,
  failed: 0,
  warnings: []
};

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
  stats.success++;
}

function logError(message, error) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
  if (error) console.log(`  ${colors.red}${error}${colors.reset}`);
  stats.failed++;
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  stats.warnings.push(message);
}

async function test(description, testFn) {
  stats.total++;
  try {
    await testFn();
    logSuccess(description);
  } catch (error) {
    logError(description, error.response?.data?.message || error.message);
  }
}

// ============================================
// 1. AUTHENTIFICATION
// ============================================
async function testAuthentification() {
  console.log('\n' + '='.repeat(70));
  console.log('📝 PHASE 1: Authentification');
  console.log('='.repeat(70));

  await test('Login Admin', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });
    adminToken = response.data.token;
    if (!adminToken) throw new Error('Token admin non reçu');
  });

  await test('Login Commerçant', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    commercantToken = response.data.token;
    if (!commercantToken) throw new Error('Token commerçant non reçu');
  });
}

// ============================================
// 2. PRÉPARATION: Créer boutique et type
// ============================================
async function prepareData() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 PHASE 2: Préparation des données');
  console.log('='.repeat(70));

  // Récupérer une boutique existante
  await test('Récupérer boutique du commerçant', async () => {
    const response = await axios.get(`${BASE_URL}/boutique`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    if (response.data.boutiques && response.data.boutiques.length > 0) {
      boutiqueId = response.data.boutiques[0]._id;
      logInfo(`Boutique trouvée: ${boutiqueId}`);
    } else {
      throw new Error('Aucune boutique trouvée');
    }
  });

  // Créer un type de produit
  await test('Créer un type de produit', async () => {
    const response = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Électronique Test Photo',
        description: 'Pour tester le champ photo',
        boutique: boutiqueId,
        icone: '📱',
        couleur: '#3498db',
        ordre: 1
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    typeProduitId = response.data.typeProduit._id;
    logInfo(`Type produit créé: ${typeProduitId}`);
  });
}

// ============================================
// 3. TEST NOUVEAU CHAMP PHOTO
// ============================================
async function testChampPhoto() {
  console.log('\n' + '='.repeat(70));
  console.log('📸 PHASE 3: Test du Champ Photo (Nouvelle Modification)');
  console.log('='.repeat(70));

  // Créer un produit AVEC photo
  await test('🎯 Créer produit AVEC photo', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Smartphone avec Photo',
        description: 'Test du nouveau champ photo',
        photo: 'https://example.com/images/smartphone.jpg',  // ← NOUVEAU CHAMP
        prix: 599.99,
        typeProduit: typeProduitId,
        boutique: boutiqueId,
        stock: {
          nombreDispo: 10,
          seuilAlerte: 2
        }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    produitId = response.data.produit._id;
    
    // Vérifier que le champ photo est bien enregistré
    if (!response.data.produit.photo) {
      throw new Error('Champ photo non enregistré');
    }
    
    if (response.data.produit.photo !== 'https://example.com/images/smartphone.jpg') {
      throw new Error('URL photo incorrecte');
    }
    
    logInfo(`Produit créé avec photo: ${produitId}`);
    logInfo(`Photo URL: ${response.data.produit.photo}`);
  });

  // Créer un produit SANS photo (optionnel) - ne pas écraser produitId
  await test('Créer produit SANS photo (champ optionnel)', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Produit sans Photo',
        description: 'Le champ photo est optionnel',
        // photo: pas fourni
        prix: 299.99,
        typeProduit: typeProduitId,
        boutique: boutiqueId,
        stock: {
          nombreDispo: 5,
          seuilAlerte: 1
        }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    // Vérifier que ça fonctionne sans photo
    if (response.data.produit.photo !== undefined && response.data.produit.photo !== null) {
      logWarning('Champ photo devrait être undefined ou null quand non fourni');
    }
    
    logInfo('Produit créé sans photo (OK)');
    // Ne pas écraser produitId ici, on garde celui avec photo pour les tests suivants
  });
}

// ============================================
// 4. TEST MODIFICATION CHAMPS ÉTENDUS
// ============================================
async function testModificationChampsEtendus() {
  console.log('\n' + '='.repeat(70));
  console.log('✏️  PHASE 4: Test Modification Champs Étendus');
  console.log('='.repeat(70));

  // Modifier la photo
  await test('🎯 Modifier le champ PHOTO', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        photo: 'https://example.com/images/smartphone-v2.jpg'  // ← MODIFICATION
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (response.data.produit.photo !== 'https://example.com/images/smartphone-v2.jpg') {
      throw new Error('Photo non modifiée');
    }
    
    logInfo(`Photo modifiée: ${response.data.produit.photo}`);
  });

  // Créer un nouveau type pour tester le changement
  let nouveauTypeId = '';
  await test('Créer un nouveau type de produit', async () => {
    const response = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Accessoires Test',
        description: 'Pour tester le changement de type',
        boutique: boutiqueId,
        icone: '🎧',
        couleur: '#e74c3c',
        ordre: 2
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    nouveauTypeId = response.data.typeProduit._id;
    logInfo(`Nouveau type créé: ${nouveauTypeId}`);
  });

  // Modifier le typeProduit
  await test('🎯 Modifier le champ TYPEPRODUIT', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        typeProduit: nouveauTypeId  // ← CHANGEMENT DE TYPE
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    const typeId = response.data.produit.typeProduit._id || response.data.produit.typeProduit;
    if (typeId !== nouveauTypeId) {
      throw new Error('Type produit non modifié');
    }
    
    logInfo(`Type produit modifié vers: ${nouveauTypeId}`);
  });

  // Modifier le stock
  await test('🎯 Modifier le champ STOCK', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        stock: {
          nombreDispo: 25,  // ← MODIFICATION
          seuilAlerte: 5
        }
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (response.data.produit.stock.nombreDispo !== 25) {
      throw new Error('Stock non modifié');
    }
    
    logInfo(`Stock modifié: ${response.data.produit.stock.nombreDispo} unités`);
  });
}

// ============================================
// 5. TEST FILTRE STATUT BOUTIQUE
// ============================================
async function testFiltreStatutBoutique() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 PHASE 5: Test Filtre Statut Boutique');
  console.log('='.repeat(70));

  // Récupérer produits sans filtre (comportement par défaut)
  await test('Récupérer produits sans filtre statut', async () => {
    const response = await axios.get(
      `${BASE_URL}/boutique/${boutiqueId}/produits`
    );
    
    if (!response.data.produits) {
      throw new Error('Pas de produits retournés');
    }
    
    logInfo(`${response.data.produits.length} produit(s) trouvé(s)`);
  });

  // Récupérer produits avec filtre statutBoutique=Actif
  await test('🎯 Récupérer produits avec filtre statutBoutique=Actif', async () => {
    const response = await axios.get(
      `${BASE_URL}/boutique/${boutiqueId}/produits?statutBoutique=Actif`
    );
    
    if (!response.data.produits) {
      throw new Error('Pas de produits retournés');
    }
    
    logInfo(`${response.data.produits.length} produit(s) avec statut Actif`);
  });

  // Tester avec statutBoutique=Inactif (devrait retourner vide ou erreur)
  await test('Tester filtre statutBoutique=Inactif', async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/boutique/${boutiqueId}/produits?statutBoutique=Inactif`
      );
      
      if (response.data.produits && response.data.produits.length > 0) {
        logWarning('Des produits retournés pour boutique Inactif (boutique probablement active)');
      } else {
        logInfo('Aucun produit pour boutique Inactif (normal)');
      }
    } catch (error) {
      // C'est normal si la boutique n'existe pas avec ce statut
      logInfo('Boutique non trouvée avec statut Inactif (comportement attendu)');
    }
  });
}

// ============================================
// 6. TESTS DE RÉGRESSION
// ============================================
async function testRegression() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 PHASE 6: Tests de Régression');
  console.log('='.repeat(70));

  // Vérifier que les anciennes fonctionnalités marchent toujours
  await test('Modifier nom du produit (ancien champ)', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        nom: 'Smartphone Modifié'
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (response.data.produit.nom !== 'Smartphone Modifié') {
      throw new Error('Nom non modifié');
    }
    
    // Vérifier immédiatement dans la réponse
    if (response.data.produit.photo !== 'https://example.com/images/smartphone-v2.jpg') {
      throw new Error('Photo non persistée dans la modification');
    }
    
    logInfo('Nom modifié et photo persistée ✓');
  });

  await test('Modifier prix du produit (ancien champ)', async () => {
    const response = await axios.put(
      `${BASE_URL}/produits/${produitId}`,
      {
        prix: 649.99
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    if (response.data.produit.prix !== 649.99) {
      throw new Error('Prix non modifié');
    }
    
    // Vérifier que toutes les modifications précédentes sont toujours là
    if (response.data.produit.nom !== 'Smartphone Modifié') {
      throw new Error('Nom non persisté');
    }
    
    if (response.data.produit.stock.nombreDispo !== 25) {
      throw new Error('Stock non persisté');
    }
    
    logInfo('Prix modifié et toutes les modifications persistées ✓');
  });
}

// ============================================
// 7. NETTOYAGE
// ============================================
async function cleanup() {
  console.log('\n' + '='.repeat(70));
  console.log('🧹 PHASE 7: Nettoyage');
  console.log('='.repeat(70));

  // Supprimer les produits de test
  if (produitId) {
    await test('Supprimer les produits de test', async () => {
      await axios.delete(
        `${BASE_URL}/produits/${produitId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
    });
  }

  // Supprimer les types de produits
  await test('Supprimer les types de produits', async () => {
    const response = await axios.get(
      `${BASE_URL}/types-produit/boutique/${boutiqueId}`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    for (const type of response.data.typesProduits) {
      if (type.type.includes('Test')) {
        await axios.delete(
          `${BASE_URL}/types-produit/${type._id}`,
          { headers: { Authorization: `Bearer ${commercantToken}` } }
        );
      }
    }
  });
}

// ============================================
// EXÉCUTION
// ============================================
async function runTests() {
  console.log('\n' + '█'.repeat(70));
  console.log('🧪 TEST DES NOUVELLES MODIFICATIONS DE SANDA');
  console.log('█'.repeat(70));
  console.log(`📍 URL: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);

  try {
    await testAuthentification();
    await prepareData();
    await testChampPhoto();
    await testModificationChampsEtendus();
    await testFiltreStatutBoutique();
    await testRegression();  // Récupère le produit modifié
    await cleanup();         // Puis le supprime

    // Résumé
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(70));
    console.log(`Total: ${stats.total}`);
    console.log(`${colors.green}✓ Réussis: ${stats.success}${colors.reset}`);
    console.log(`${colors.red}✗ Échoués: ${stats.failed}${colors.reset}`);
    
    if (stats.warnings.length > 0) {
      console.log(`${colors.yellow}⚠ Avertissements: ${stats.warnings.length}${colors.reset}`);
      stats.warnings.forEach(w => console.log(`  - ${w}`));
    }
    
    console.log(`Taux de réussite: ${((stats.success / stats.total) * 100).toFixed(1)}%`);

    if (stats.failed === 0) {
      console.log(`\n${colors.green}🎉 TOUS LES TESTS SONT PASSÉS !${colors.reset}`);
      console.log(`${colors.green}✨ Les nouvelles modifications de Sanda sont validées !${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué${colors.reset}`);
      console.log(`${colors.yellow}📝 Signaler les erreurs à Sanda${colors.reset}`);
    }

  } catch (error) {
    console.error(`\n${colors.red}❌ Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

runTests();
