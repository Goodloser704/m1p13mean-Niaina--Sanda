/**
 * 🧪 Test du frontend déployé sur Vercel
 * Vérifie que l'application Angular est accessible et fonctionne
 */

const https = require('https');

const FRONTEND_URL = 'https://m1p13mean-niaina-sanda.vercel.app';
const API_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

// Fonction pour faire une requête HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Test de l'API backend
async function testBackendAPI() {
  console.log('\n🔧 === TEST BACKEND API ===\n');
  
  try {
    const response = await makeRequest(API_URL + '/etages');
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 401) {
      console.log('✅ Backend accessible');
      console.log(`📊 Content-Type: ${response.headers['content-type']}`);
      return true;
    } else {
      console.log('⚠️  Backend répond mais avec un status inattendu');
      return false;
    }
  } catch (error) {
    console.error('❌ Backend inaccessible:', error.message);
    return false;
  }
}

// Test du frontend
async function testFrontend() {
  console.log('\n🌐 === TEST FRONTEND VERCEL ===\n');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Frontend accessible');
      console.log(`📊 Content-Type: ${response.headers['content-type']}`);
      
      // Vérifier que c'est bien du HTML
      if (response.body.includes('<html') || response.body.includes('<!DOCTYPE')) {
        console.log('✅ Page HTML valide');
        
        // Vérifier la présence de l'app Angular
        if (response.body.includes('app-root') || response.body.includes('ng-version')) {
          console.log('✅ Application Angular détectée');
        } else {
          console.log('⚠️  Application Angular non détectée dans le HTML');
        }
        
        // Vérifier la configuration de l'API
        if (response.body.includes('m1p13mean-niaina-1.onrender.com')) {
          console.log('✅ URL API configurée correctement');
        } else {
          console.log('⚠️  URL API non trouvée dans le HTML (peut être dans les fichiers JS)');
        }
        
        return true;
      } else {
        console.log('⚠️  Réponse n\'est pas du HTML valide');
        return false;
      }
    } else {
      console.log('❌ Frontend inaccessible');
      console.log(`Réponse: ${response.body.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Frontend inaccessible:', error.message);
    return false;
  }
}

// Test de la page admin-etages
async function testAdminEtagesPage() {
  console.log('\n🏢 === TEST PAGE ADMIN-ETAGES ===\n');
  
  try {
    const response = await makeRequest(FRONTEND_URL + '/admin-etages');
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Page admin-etages accessible');
      return true;
    } else {
      console.log('⚠️  Page admin-etages retourne un status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Page admin-etages inaccessible:', error.message);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('================================================================================');
  console.log('  🧪 TEST FRONTEND DÉPLOYÉ');
  console.log('  Frontend:', FRONTEND_URL);
  console.log('  Backend:', API_URL);
  console.log('================================================================================');

  const startTime = Date.now();

  const backendOk = await testBackendAPI();
  const frontendOk = await testFrontend();
  const adminPageOk = await testAdminEtagesPage();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n================================================================================');
  console.log('  📊 RÉSUMÉ');
  console.log('================================================================================');
  console.log(`Backend API:        ${backendOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log(`Frontend:           ${frontendOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log(`Page Admin-Etages:  ${adminPageOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log('');
  console.log(`⏱️  Durée totale: ${duration}s`);
  console.log('================================================================================');
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('1. Ouvrir le frontend dans un navigateur:', FRONTEND_URL);
  console.log('2. Se connecter avec: admin@mallapp.com');
  console.log('3. Aller sur la page Admin > Étages');
  console.log('4. Vérifier que la page se charge sans erreur');
  console.log('');
}

// Lancer les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
