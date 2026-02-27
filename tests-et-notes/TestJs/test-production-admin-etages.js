const https = require('https');

/**
 * 🧪 Test de l'API admin-etages en production
 * URL: https://m1p13mean-niaina-1.onrender.com
 */

const API_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

// Credentials
const ADMIN_EMAIL = 'admin@mallapp.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = null;

// Fonction pour faire une requête HTTPS
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test de connexion admin
async function testAdminLogin() {
  console.log('\n🔐 === TEST CONNEXION ADMIN ===\n');
  
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 && response.body.token) {
      adminToken = response.body.token;
      console.log('✅ Connexion réussie');
      console.log(`👤 Utilisateur: ${response.body.user.email}`);
      console.log(`🎭 Rôle: ${response.body.user.role}`);
      console.log(`🎫 Token: ${adminToken.substring(0, 50)}...`);
      return true;
    } else {
      console.log('❌ Connexion échouée');
      console.log('Réponse:', JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Test de récupération des étages
async function testGetEtages() {
  console.log('\n📋 === TEST GET ÉTAGES ===\n');
  
  try {
    const response = await makeRequest('GET', '/etages', null, adminToken);

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Récupération réussie');
      console.log(`📊 Nombre d'étages: ${response.body.etages?.length || 0}`);
      
      if (response.body.etages && response.body.etages.length > 0) {
        console.log('\n📋 Liste des étages:');
        response.body.etages.forEach((etage, index) => {
          console.log(`  ${index + 1}. Étage ${etage.numero}: ${etage.nom}`);
          console.log(`     ID: ${etage._id}`);
        });
      }
      return response.body.etages;
    } else {
      console.log('❌ Récupération échouée');
      console.log('Réponse:', JSON.stringify(response.body, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test de création d'un étage
async function testCreateEtage() {
  console.log('\n➕ === TEST CRÉATION ÉTAGE ===\n');
  
  // Générer un numéro unique
  const numeroEtage = Math.floor(Math.random() * 1000) + 100;
  
  const etageData = {
    numero: numeroEtage,
    nom: `Test Étage ${numeroEtage}`,
    description: 'Étage créé par test automatique'
  };

  console.log('Données:', JSON.stringify(etageData, null, 2));
  
  try {
    const response = await makeRequest('POST', '/etages', etageData, adminToken);

    console.log(`Status: ${response.status}`);
    
    if (response.status === 201) {
      console.log('✅ Création réussie');
      console.log(`🆔 ID: ${response.body.etage._id}`);
      console.log(`🏢 Étage: ${response.body.etage.numero} - ${response.body.etage.nom}`);
      return response.body.etage;
    } else {
      console.log('❌ Création échouée');
      console.log('Réponse:', JSON.stringify(response.body, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test de vérification du token
async function testTokenValidity() {
  console.log('\n🔍 === TEST VALIDITÉ TOKEN ===\n');
  
  try {
    // Tester avec le endpoint /auth/me ou /etages
    const response = await makeRequest('GET', '/etages', null, adminToken);

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Token valide');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Token invalide ou expiré');
      console.log('Réponse:', JSON.stringify(response.body, null, 2));
      return false;
    } else {
      console.log('⚠️  Réponse inattendue');
      console.log('Réponse:', JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('================================================================================');
  console.log('  🧪 TEST API ADMIN-ETAGES EN PRODUCTION');
  console.log('  URL:', API_URL);
  console.log('================================================================================');

  const startTime = Date.now();

  // 1. Test de connexion
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }

  // 2. Test de validité du token
  await testTokenValidity();

  // 3. Test de récupération des étages
  const etages = await testGetEtages();

  // 4. Test de création d'un étage
  await testCreateEtage();

  // 5. Re-test de récupération pour voir le nouvel étage
  console.log('\n🔄 === VÉRIFICATION APRÈS CRÉATION ===\n');
  await testGetEtages();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n================================================================================');
  console.log(`  ⏱️  Durée totale: ${duration}s`);
  console.log('================================================================================\n');
}

// Lancer les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
