const https = require('https');

/**
 * 🧪 Test de création d'étage avec debug
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

async function getExistingEtages() {
  console.log('\n📋 === ÉTAGES EXISTANTS ===\n');
  
  try {
    const response = await makeRequest('GET', '/etages', null, adminToken);

    if (response.status === 200) {
      const etages = response.body.etages || [];
      console.log(`Nombre d'étages: ${etages.length}\n`);
      
      const numeros = etages.map(e => e.numero).sort((a, b) => a - b);
      console.log('Numéros utilisés:', numeros.join(', '));
      
      // Trouver un numéro libre
      let numeroLibre = 1;
      while (numeros.includes(numeroLibre)) {
        numeroLibre++;
      }
      
      console.log(`\n💡 Numéro libre suggéré: ${numeroLibre}`);
      return numeroLibre;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  return null;
}

async function testCreateEtage(numero, nom, description) {
  console.log('\n➕ === TEST CRÉATION ÉTAGE ===\n');
  
  const etageData = {
    numero: numero,
    nom: nom,
    description: description
  };

  console.log('Données envoyées:');
  console.log(JSON.stringify(etageData, null, 2));
  
  try {
    const response = await makeRequest('POST', '/etages', etageData, adminToken);

    console.log(`\nStatus: ${response.status}`);
    console.log('Réponse complète:');
    console.log(JSON.stringify(response.body, null, 2));
    
    if (response.status === 201) {
      console.log('\n✅ Création réussie');
      console.log(`🆔 ID: ${response.body.etage._id}`);
      console.log(`🏢 Étage: ${response.body.etage.numero} - ${response.body.etage.nom}`);
      return true;
    } else {
      console.log('\n❌ Création échouée');
      console.log(`Message: ${response.body.message}`);
      
      // Analyser l'erreur
      if (response.body.message.includes('existe déjà')) {
        console.log('\n💡 Cause: Un étage avec ce numéro existe déjà');
      } else if (response.body.message.includes('validation failed')) {
        console.log('\n💡 Cause: Erreur de validation des données');
      } else if (response.body.message.includes('maximum allowed')) {
        console.log('\n💡 Cause: Numéro d\'étage trop élevé (max: 50)');
      } else if (response.body.message.includes('minimum allowed')) {
        console.log('\n💡 Cause: Numéro d\'étage trop bas (min: -10)');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function run() {
  console.log('================================================================================');
  console.log('  🧪 TEST CRÉATION ÉTAGE AVEC DEBUG');
  console.log('================================================================================');

  const loginOk = await login();
  if (!loginOk) return;

  const numeroLibre = await getExistingEtages();
  
  if (numeroLibre) {
    console.log('\n🧪 Test 1: Création avec numéro libre');
    await testCreateEtage(numeroLibre, `Étage Test ${numeroLibre}`, 'Test automatique');
  }
  
  console.log('\n🧪 Test 2: Création avec numéro déjà utilisé (devrait échouer)');
  await testCreateEtage(2, 'Étage Test Doublon', 'Test doublon');
  
  console.log('\n🧪 Test 3: Création avec numéro trop élevé (devrait échouer)');
  await testCreateEtage(100, 'Étage Test 100', 'Test limite');
  
  console.log('\n🧪 Test 4: Création avec numéro négatif valide');
  await testCreateEtage(-5, 'Sous-sol -5', 'Test négatif');

  console.log('\n================================================================================\n');
}

run().catch(console.error);
