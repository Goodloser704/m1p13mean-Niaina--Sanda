const https = require('https');

/**
 * 🧪 Test de suppression d'étage
 */

const API_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mallapp.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = null;

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

async function login() {
  console.log('🔐 Connexion admin...\n');
  
  const response = await makeRequest('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    mdp: ADMIN_PASSWORD
  });

  if (response.status === 200 && response.body.token) {
    adminToken = response.body.token;
    console.log('✅ Connecté:', response.body.user.email);
    return true;
  }
  
  console.log('❌ Échec connexion');
  return false;
}

async function testDeleteEtage() {
  console.log('\n🗑️  === TEST SUPPRESSION ÉTAGE ===\n');
  
  const etageId = '6985aedffcaa8128885ff512';
  
  console.log(`Tentative de suppression de l'étage: ${etageId}`);
  
  try {
    const response = await makeRequest('DELETE', `/etages/${etageId}`, null, adminToken);

    console.log(`\nStatus: ${response.status}`);
    console.log('Réponse:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ Suppression réussie');
    } else {
      console.log('\n❌ Suppression échouée');
      console.log('Message:', response.body.message);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function getEtageDetails() {
  console.log('\n📋 === DÉTAILS DE L\'ÉTAGE ===\n');
  
  const etageId = '6985aedffcaa8128885ff512';
  
  try {
    const response = await makeRequest('GET', `/etages/${etageId}`, null, adminToken);

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('Détails:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('Erreur:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function run() {
  console.log('================================================================================');
  console.log('  🧪 TEST SUPPRESSION ÉTAGE');
  console.log('================================================================================');

  const loginOk = await login();
  if (!loginOk) return;

  await getEtageDetails();
  await testDeleteEtage();

  console.log('\n================================================================================\n');
}

run().catch(console.error);
