const https = require('https');

const API_URL = 'http://localhost:3000/api';
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
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: body ? JSON.parse(body) : null
          });
        } catch (error) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login() {
  const response = await makeRequest('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    mdp: ADMIN_PASSWORD
  });

  if (response.status === 200 && response.body.token) {
    adminToken = response.body.token;
    console.log('✅ Connecté:', response.body.user.email, '\n');
    return true;
  }
  return false;
}

async function testCreateEspace() {
  console.log('🧪 Test 1: Création avec etage comme string (comme le frontend)');
  
  const espaceData1 = {
    codeEspace: 'TEST-001',
    surface: 50,
    etage: '15',  // STRING comme le frontend
    loyer: 1000,
    statut: 'Disponible',
    description: 'Test avec etage string'
  };

  console.log('Données:', JSON.stringify(espaceData1, null, 2));
  
  let response = await makeRequest('POST', '/espaces', espaceData1, adminToken);
  console.log(`Status: ${response.status}`);
  console.log('Réponse:', JSON.stringify(response.body, null, 2));
  
  console.log('\n🧪 Test 2: Création avec etage comme number');
  
  const espaceData2 = {
    codeEspace: 'TEST-002',
    surface: 50,
    etage: 15,  // NUMBER
    loyer: 1000,
    statut: 'Disponible',
    description: 'Test avec etage number'
  };

  console.log('Données:', JSON.stringify(espaceData2, null, 2));
  
  response = await makeRequest('POST', '/espaces', espaceData2, adminToken);
  console.log(`Status: ${response.status}`);
  console.log('Réponse:', JSON.stringify(response.body, null, 2));
}

async function run() {
  console.log('================================================================================');
  console.log('  🧪 TEST CRÉATION ESPACE');
  console.log('================================================================================\n');

  if (await login()) {
    await testCreateEspace();
  }

  console.log('\n================================================================================\n');
}

run().catch(console.error);
