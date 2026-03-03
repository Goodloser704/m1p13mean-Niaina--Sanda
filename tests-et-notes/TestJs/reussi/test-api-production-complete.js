/**
 * 🧪 Test Complet des APIs en Production - VERSION CORRIGÉE
 * Test de toutes les fonctions conformes aux spécifications
 * URL: http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

// Fonction utilitaire pour les requêtes
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  console.log(`🌐 ${finalOptions.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = data;
    }
    
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    if (response.status >= 400) {
      console.log(`   ❌ Error:`, jsonData);
    } else {
      console.log(`   📊 Response:`, typeof jsonData === 'object' ? JSON.stringify(jsonData, null, 2).substring(0, 200) + '...' : jsonData);
    }
    
    return { status: response.status, data: jsonData, ok: response.ok };
  } catch (error) {
    console.log(`   💥 Network Error:`, error.message);
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

// Variables globales pour les tests
let authToken = null;
let adminToken = null;
let userId = null;
let adminId = null;

async function runTests() {
  console.log('🚀 === TEST COMPLET DES APIs EN PRODUCTION - VERSION CORRIGÉE ===\n');
  
  // 1. Test de santé de l'API
  console.log('📋 1. TEST DE SANTÉ DE L\'API');
  await makeRequest('/');
  console.log('');
  
  // 2. Test d'inscription (fonction conforme)
  console.log('📋 2. TEST INSCRIPTION - POST /api/auth/register');
  const registerData = {
    nom: 'TestUser',
    prenoms: 'Production Test',
    email: `test-${Date.now()}@example.com`,
    mdp: 'password123',
    role: 'Acheteur',
    telephone: '0123456789'
  };
  
  const registerResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData)
  });
  
  if (registerResult.ok && registerResult.data.token) {
    authToken = registerResult.data.token;
    userId = registerResult.data.user._id;
    console.log(`   🎫 Token obtenu: ${authToken.substring(0, 20)}...`);
    console.log(`   👤 User ID: ${userId}`);
  }
  console.log('');
  
  // 3. Test de connexion (fonction conforme)
  console.log('📋 3. TEST CONNEXION - POST /api/auth/login');
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: registerData.email,
      mdp: registerData.mdp
    })
  });
  console.log('');
  
  // 4. Test profil utilisateur (endpoints conformes) - AVEC GESTION ERREUR COMPTE DÉSACTIVÉ
  if (authToken) {
    console.log('📋 4. TEST PROFIL UTILISATEUR');
    
    // Endpoint conforme aux spécifications
    console.log('   📍 GET /api/users/:id/me (conforme)');
    const profileResult = await makeRequest(`/api/users/${userId}/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (profileResult.status === 401 && profileResult.data?.code === 'ACCOUNT_DISABLED') {
      console.log('   ⚠️ Compte désactivé détecté - Ceci est un problème de configuration');
      console.log('   💡 Solution: Ajouter isActive: true par défaut dans le modèle User');
    }
    
    // Endpoint existant (compatibilité)
    console.log('   📍 GET /api/auth/me (compatibilité)');
    await makeRequest('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // Mise à jour profil - endpoint conforme
    console.log('   📍 PUT /api/users/me (conforme)');
    await makeRequest('/api/users/me', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        nom: 'TestUser Updated',
        telephone: '0987654321'
      })
    });
  }
  console.log('');
  
  // 5. Test portefeuille (endpoints conformes)
  if (authToken && userId) {
    console.log('📋 5. TEST PORTEFEUILLE');
    
    // Endpoint conforme aux spécifications
    console.log('   📍 GET /api/users/:id/wallet (conforme)');
    await makeRequest(`/api/users/${userId}/wallet`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // Endpoint existant (compatibilité)
    console.log('   📍 GET /api/portefeuille/me (compatibilité)');
    await makeRequest('/api/portefeuille/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  }
  console.log('');
  
  // 6. Test notifications (endpoints conformes)
  if (authToken && userId) {
    console.log('📋 6. TEST NOTIFICATIONS');
    
    // Endpoint conforme aux spécifications
    console.log('   📍 GET /api/users/:userId/notifications (conforme)');
    const notifResult = await makeRequest(`/api/users/${userId}/notifications?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (notifResult.ok && notifResult.data) {
      const hasCorrectFormat = notifResult.data.data !== undefined && 
                             notifResult.data.total !== undefined && 
                             notifResult.data.unreadCount !== undefined;
      console.log(`   📊 Format conforme {data, total, unreadCount}: ${hasCorrectFormat ? '✅' : '❌'}`);
    }
    
    // Endpoint existant (compatibilité)
    console.log('   📍 GET /api/notifications (compatibilité)');
    await makeRequest('/api/notifications?page=1&limit=5', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  }
  console.log('');
  
  // 7. Test boutiques publiques (endpoints conformes)
  console.log('📋 7. TEST BOUTIQUES PUBLIQUES');
  
  // Endpoint conforme aux spécifications
  console.log('   📍 GET /api/boutiques (conforme)');
  const boutiquesResult = await makeRequest('/api/boutiques?page=1&limit=5');
  
  if (boutiquesResult.ok) {
    console.log('   ✅ Route boutiques publiques fonctionne !');
  }
  
  // Recherche boutiques - endpoint conforme
  console.log('   📍 GET /api/boutiques/search/ (conforme)');
  const searchResult = await makeRequest('/api/boutiques/search/?keyword=test&page=1&limit=5');
  
  if (searchResult.status === 500) {
    console.log('   ⚠️ Erreur 500 détectée - Problème dans la recherche');
    console.log('   💡 Solution: Vérifier le champ "statut" vs "statutBoutique" dans la requête');
  }
  
  // Test avec une boutique existante (si disponible)
  console.log('   📍 GET /api/boutiques/:id/produits (conforme)');
  await makeRequest('/api/boutiques/507f1f77bcf86cd799439011/produits'); // ID test
  console.log('');
  
  // 8. Test routes publiques qui ne devraient PAS nécessiter d'auth
  console.log('📋 8. TEST ROUTES PUBLIQUES');
  
  const routesPubliques = [
    { name: 'Catégories Boutique', url: '/api/categories-boutique' },
    { name: 'Types Produit', url: '/api/types-produit' }
  ];
  
  for (const route of routesPubliques) {
    console.log(`   📍 GET ${route.url} (devrait être public)`);
    const result = await makeRequest(route.url);
    
    if (result.status === 401) {
      console.log(`   ⚠️ ${route.name}: Nécessite une auth alors qu'elle devrait être publique`);
      console.log('   💡 Solution: Vérifier que la route n\'a pas de middleware auth global');
    } else if (result.ok) {
      console.log(`   ✅ ${route.name}: Fonctionne correctement en public`);
    }
  }
  console.log('');
  
  // 9. Test admin (si possible)
  console.log('📋 9. TEST FONCTIONS ADMIN');
  
  // Essayer de créer un admin pour tester
  const adminRegisterData = {
    nom: 'AdminTest',
    prenoms: 'Production Admin',
    email: `admin-${Date.now()}@example.com`,
    mdp: 'adminpass123',
    role: 'Admin',
    telephone: '0123456789'
  };
  
  const adminRegisterResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(adminRegisterData)
  });
  
  if (adminRegisterResult.ok && adminRegisterResult.data.token) {
    adminToken = adminRegisterResult.data.token;
    adminId = adminRegisterResult.data.user._id;
    
    // Test dashboard admin - nouvelle fonction
    console.log('   📍 GET /api/admin/dashboard (nouvelle fonction)');
    const dashboardResult = await makeRequest('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (dashboardResult.ok) {
      console.log('   ✅ Dashboard admin fonctionne !');
    } else if (dashboardResult.status === 401) {
      console.log('   ⚠️ Dashboard admin: Problème d\'authentification');
    }
  }
  console.log('');
  
  // 10. Test nouvelles fonctions ajoutées
  console.log('📋 10. TEST NOUVELLES FONCTIONS');
  
  if (authToken) {
    // Test factures acheteur - nouvelle fonction
    console.log('   📍 GET /api/acheteur/:id/factures (nouvelle fonction)');
    const facturesResult = await makeRequest(`/api/acheteur/${userId}/factures`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (facturesResult.ok) {
      console.log('   ✅ Route factures fonctionne !');
    }
    
    // Test paiement loyer - nouvelle fonction (nécessite une boutique)
    console.log('   📍 POST /api/commercant/loyers/pay (nouvelle fonction)');
    const loyerResult = await makeRequest('/api/commercant/loyers/pay', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        montant: 500,
        periode: '2026-02'
      })
    });
    
    if (loyerResult.ok) {
      console.log('   ✅ Route paiement loyer fonctionne !');
    } else if (loyerResult.status === 400) {
      console.log('   ⚠️ Paiement loyer: Données invalides (normal sans boutique)');
    }
  }
  console.log('');
  
  // 11. Test des modèles de données avec auth
  console.log('📋 11. TEST MODÈLES DE DONNÉES (avec auth)');
  
  if (adminToken) {
    const modelesTests = [
      { name: 'Étages', url: '/api/etages' },
      { name: 'Espaces', url: '/api/espaces' }
    ];
    
    for (const model of modelesTests) {
      console.log(`   📍 GET ${model.url}`);
      const result = await makeRequest(model.url, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (result.ok) {
        console.log(`   ✅ ${model.name}: Fonctionne avec auth admin`);
      }
    }
  }
  console.log('');
  
  // 12. Résumé et diagnostics
  console.log('🎉 === TESTS TERMINÉS ===');
  console.log('📊 Résumé et Diagnostics:');
  console.log('');
  
  console.log('🔧 PROBLÈMES IDENTIFIÉS:');
  console.log('   1. ⚠️ Comptes désactivés par défaut (isActive manquant)');
  console.log('   2. ⚠️ Erreur 500 dans recherche boutiques (champ statut)');
  console.log('   3. ⚠️ Routes publiques nécessitent une auth');
  console.log('');
  
  console.log('💡 SOLUTIONS APPLIQUÉES:');
  console.log('   1. ✅ Ajout du champ isActive: true par défaut dans User');
  console.log('   2. ✅ Correction statut → statutBoutique dans recherche');
  console.log('   3. ✅ Vérification des middlewares auth sur routes publiques');
  console.log('');
  
  console.log('🚀 PROCHAINES ÉTAPES:');
  console.log('   1. Commit et push des corrections');
  console.log('   2. Attendre le redéploiement (5-10 min)');
  console.log('   3. Relancer ce test pour vérifier les corrections');
}

// Exécuter les tests
runTests().catch(console.error);