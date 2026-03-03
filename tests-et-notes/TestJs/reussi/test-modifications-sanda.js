/**
 * 🧪 Test des modifications de Sanda
 * - typeProduitController: Réactivation au lieu d'erreur sur doublon
 * - boutiqueService: Petites corrections
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Couleurs pour le terminal
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

// Statistiques
let stats = {
  total: 0,
  success: 0,
  failed: 0
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
  console.log('\n' + '='.repeat(60));
  console.log('📝 PHASE 1: Authentification');
  console.log('='.repeat(60));

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
// 2. TEST BOUTIQUE SERVICE (Modifications Sanda)
// ============================================
async function testBoutiqueService() {
  console.log('\n' + '='.repeat(60));
  console.log('🏪 PHASE 2: Test BoutiqueService (modifications Sanda)');
  console.log('='.repeat(60));

  // Récupérer une catégorie
  let categorieId = '';
  await test('Récupérer catégories boutique', async () => {
    const response = await axios.get(`${BASE_URL}/categories-boutique`);
    if (response.data.categories.length === 0) {
      throw new Error('Aucune catégorie disponible');
    }
    categorieId = response.data.categories[0]._id;
    logInfo(`Catégorie trouvée: ${response.data.categories[0].nom}`);
  });

  // Créer une boutique
  await test('Créer une boutique', async () => {
    const response = await axios.post(
      `${BASE_URL}/boutiques/register`,
      {
        nom: 'Boutique Test Sanda',
        description: 'Test des modifications de Sanda',
        categorie: categorieId,
        telephone: '0340000001',
        email: 'boutique.sanda@test.com'
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    boutiqueId = response.data.boutique._id;
    logInfo(`Boutique créée: ${boutiqueId}`);
  });

  // Récupérer les boutiques en attente
  await test('Récupérer boutiques en attente (getPendingBoutiques)', async () => {
    const response = await axios.get(
      `${BASE_URL}/admin/boutiques/pending`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const found = response.data.boutiques.find(b => b._id === boutiqueId);
    if (!found) throw new Error('Boutique non trouvée dans les boutiques en attente');
    logInfo(`Boutique trouvée dans les boutiques en attente`);
  });

  // Approuver la boutique
  await test('Approuver boutique (approveBoutique)', async () => {
    const response = await axios.put(
      `${BASE_URL}/admin/boutiques/${boutiqueId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.data.boutique.statutBoutique !== 'Actif') {
      throw new Error('Boutique non activée');
    }
    logInfo(`Boutique approuvée et activée`);
  });
}

// ============================================
// 3. TEST TYPE PRODUIT CONTROLLER (Modifications Sanda)
// ============================================
async function testTypeProduitController() {
  console.log('\n' + '='.repeat(60));
  console.log('📦 PHASE 3: Test TypeProduitController (modifications Sanda)');
  console.log('='.repeat(60));

  // Créer un type de produit
  await test('Créer un type de produit', async () => {
    const response = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Électronique Test',
        description: 'Produits électroniques',
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

  // Supprimer (soft delete) le type de produit
  await test('Supprimer (soft delete) le type de produit', async () => {
    await axios.delete(
      `${BASE_URL}/types-produit/${typeProduitId}`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    logInfo(`Type produit désactivé`);
  });

  // TEST PRINCIPAL: Recréer le même type (doit le réactiver au lieu d'erreur)
  await test('🎯 RÉACTIVER type produit existant (modification Sanda)', async () => {
    const response = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Électronique Test',
        description: 'Produits électroniques mis à jour',
        boutique: boutiqueId,
        icone: '💻',
        couleur: '#2ecc71',
        ordre: 2
      },
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    // Vérifier que c'est bien une réactivation
    if (response.status !== 200) {
      throw new Error(`Status attendu: 200, reçu: ${response.status}`);
    }
    
    if (response.data.message !== 'Type de produit restauré avec succès') {
      throw new Error(`Message attendu: "Type de produit restauré avec succès", reçu: "${response.data.message}"`);
    }
    
    // Vérifier que les champs ont été mis à jour
    const typeProduit = response.data.typeProduit;
    if (typeProduit.description !== 'Produits électroniques mis à jour') {
      throw new Error('Description non mise à jour');
    }
    if (typeProduit.icone !== '💻') {
      throw new Error('Icône non mise à jour');
    }
    if (typeProduit.couleur !== '#2ecc71') {
      throw new Error('Couleur non mise à jour');
    }
    if (typeProduit.ordre !== 2) {
      throw new Error('Ordre non mis à jour');
    }
    
    logInfo(`✨ Type produit réactivé avec succès et champs mis à jour`);
    logInfo(`   - Description: "${typeProduit.description}"`);
    logInfo(`   - Icône: ${typeProduit.icone}`);
    logInfo(`   - Couleur: ${typeProduit.couleur}`);
    logInfo(`   - Ordre: ${typeProduit.ordre}`);
  });

  // Vérifier que le type est bien actif
  await test('Vérifier que le type est actif', async () => {
    const response = await axios.get(
      `${BASE_URL}/types-produit/boutique/${boutiqueId}`,
      { headers: { Authorization: `Bearer ${commercantToken}` } }
    );
    
    const typeActif = response.data.typesProduits.find(t => t._id === typeProduitId);
    if (!typeActif) {
      throw new Error('Type produit non trouvé dans les types actifs');
    }
    if (!typeActif.isActive) {
      throw new Error('Type produit non actif');
    }
    logInfo(`Type produit bien actif dans la liste`);
  });
}

// ============================================
// 4. TESTS COMPLÉMENTAIRES
// ============================================
async function testComplementaires() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 PHASE 4: Tests complémentaires');
  console.log('='.repeat(60));

  // Test: Créer un produit avec le type réactivé
  await test('Créer un produit avec le type réactivé', async () => {
    const response = await axios.post(
      `${BASE_URL}/produits`,
      {
        nom: 'Smartphone Test',
        description: 'Un smartphone de test',
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
    logInfo(`Produit créé avec le type réactivé: ${response.data.produit._id}`);
  });

  // Test: Récupérer les produits de la boutique
  await test('Récupérer les produits de la boutique', async () => {
    const response = await axios.get(
      `${BASE_URL}/produits/boutique/${boutiqueId}`
    );
    if (response.data.produits.length === 0) {
      throw new Error('Aucun produit trouvé');
    }
    logInfo(`${response.data.produits.length} produit(s) trouvé(s)`);
  });
}

// ============================================
// NETTOYAGE
// ============================================
async function cleanup() {
  console.log('\n' + '='.repeat(60));
  console.log('🧹 PHASE 5: Nettoyage');
  console.log('='.repeat(60));

  // Supprimer le type de produit
  if (typeProduitId) {
    await test('Supprimer le type de produit', async () => {
      await axios.delete(
        `${BASE_URL}/types-produit/${typeProduitId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
    });
  }

  // Supprimer la boutique
  if (boutiqueId) {
    await test('Supprimer la boutique', async () => {
      await axios.delete(
        `${BASE_URL}/boutiques/${boutiqueId}`,
        { headers: { Authorization: `Bearer ${commercantToken}` } }
      );
    });
  }
}

// ============================================
// EXÉCUTION
// ============================================
async function runTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('🧪 TEST DES MODIFICATIONS DE SANDA');
  console.log('█'.repeat(60));
  console.log(`📍 URL: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);

  try {
    await testAuthentification();
    await testBoutiqueService();
    await testTypeProduitController();
    await testComplementaires();
    await cleanup();

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log(`Total: ${stats.total}`);
    console.log(`${colors.green}✓ Réussis: ${stats.success}${colors.reset}`);
    console.log(`${colors.red}✗ Échoués: ${stats.failed}${colors.reset}`);
    console.log(`Taux de réussite: ${((stats.success / stats.total) * 100).toFixed(1)}%`);

    if (stats.failed === 0) {
      console.log(`\n${colors.green}🎉 TOUS LES TESTS SONT PASSÉS !${colors.reset}`);
      console.log(`${colors.green}✨ Les modifications de Sanda sont profitables !${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué${colors.reset}`);
    }

  } catch (error) {
    console.error(`\n${colors.red}❌ Erreur fatale:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Lancer les tests
runTests();
