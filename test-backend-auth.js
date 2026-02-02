#!/usr/bin/env node

/**
 * 🧪 Script de test pour vérifier l'authentification backend
 * 
 * Ce script teste :
 * 1. La connexion au serveur backend
 * 2. L'authentification avec les identifiants admin
 * 3. L'accès aux endpoints protégés (etages)
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://m1p13mean-niaina-1.onrender.com';
const ADMIN_CREDENTIALS = {
  email: 'admin@mall.com',
  password: 'admin123'
};

console.log('🧪 === TEST AUTHENTIFICATION BACKEND ===\n');

/**
 * Fonction utilitaire pour faire des requêtes HTTP
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Test-Script/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          // Si ce n'est pas du JSON, retourner le texte brut
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data,
            isText: true
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test 1: Vérifier que le serveur répond
 */
async function testServerHealth() {
  console.log('1️⃣ Test de santé du serveur...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.status === 200) {
      console.log('✅ Serveur accessible');
      console.log(`   Status: ${response.status}`);
      console.log(`   Database: ${response.data.checks?.database || 'Unknown'}`);
      return true;
    } else {
      console.log(`❌ Serveur répond avec le status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Authentification admin
 */
async function testAdminLogin() {
  console.log('\n2️⃣ Test d\'authentification admin...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: ADMIN_CREDENTIALS
    });
    
    if (response.status === 200 && response.data.token) {
      console.log('✅ Authentification réussie');
      console.log(`   User: ${response.data.user.email} (${response.data.user.role})`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      console.log(`❌ Authentification échouée`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur lors de l'authentification: ${error.message}`);
    return null;
  }
}

/**
 * Test 3: Accès à l'endpoint de test des étages
 */
async function testEtagesEndpoint(token) {
  console.log('\n3️⃣ Test de l\'endpoint étages/test...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/etages/test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint étages/test accessible');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   User: ${response.data.user}`);
      return true;
    } else {
      console.log(`❌ Endpoint étages/test inaccessible`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur lors de l'accès à l'endpoint: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Accès à la liste des étages
 */
async function testEtagesList(token) {
  console.log('\n4️⃣ Test de la liste des étages...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/etages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Liste des étages accessible');
      console.log(`   Nombre d'étages: ${response.data.etages?.length || 0}`);
      console.log(`   Total: ${response.data.total || 0}`);
      return true;
    } else {
      console.log(`❌ Liste des étages inaccessible`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur lors de l'accès à la liste: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Test sans authentification (doit échouer)
 */
async function testWithoutAuth() {
  console.log('\n5️⃣ Test sans authentification (doit échouer)...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/etages/test`);
    
    if (response.status === 401) {
      console.log('✅ Sécurité OK - Accès refusé sans token');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Code: ${response.data.code}`);
      return true;
    } else {
      console.log(`❌ Problème de sécurité - Accès autorisé sans token`);
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur lors du test: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function runTests() {
  console.log(`🎯 Backend URL: ${BACKEND_URL}`);
  console.log(`👤 Admin: ${ADMIN_CREDENTIALS.email}\n`);
  
  const results = {
    serverHealth: false,
    adminLogin: false,
    etagesTest: false,
    etagesList: false,
    security: false
  };
  
  // Test 1: Santé du serveur
  results.serverHealth = await testServerHealth();
  
  if (!results.serverHealth) {
    console.log('\n❌ Impossible de continuer - Serveur inaccessible');
    return;
  }
  
  // Test 2: Authentification
  const token = await testAdminLogin();
  results.adminLogin = !!token;
  
  if (!token) {
    console.log('\n❌ Impossible de continuer - Authentification échouée');
    return;
  }
  
  // Test 3: Endpoint de test
  results.etagesTest = await testEtagesEndpoint(token);
  
  // Test 4: Liste des étages
  results.etagesList = await testEtagesList(token);
  
  // Test 5: Sécurité
  results.security = await testWithoutAuth();
  
  // Résumé
  console.log('\n📊 === RÉSUMÉ DES TESTS ===');
  console.log(`Santé du serveur: ${results.serverHealth ? '✅' : '❌'}`);
  console.log(`Authentification admin: ${results.adminLogin ? '✅' : '❌'}`);
  console.log(`Endpoint étages/test: ${results.etagesTest ? '✅' : '❌'}`);
  console.log(`Liste des étages: ${results.etagesList ? '✅' : '❌'}`);
  console.log(`Sécurité (sans auth): ${results.security ? '✅' : '❌'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Résultat: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Tous les tests sont passés ! Le backend fonctionne correctement.');
    console.log('\n💡 Si le frontend a encore des problèmes :');
    console.log('   1. Vérifiez que l\'utilisateur est connecté avec admin@mall.com');
    console.log('   2. Vérifiez que le token est valide dans localStorage/sessionStorage');
    console.log('   3. Vérifiez la configuration du proxy dans proxy.conf.json');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration du backend.');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});