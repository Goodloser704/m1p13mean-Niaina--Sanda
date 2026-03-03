/**
 * Comparaison des routes disponibles entre local et production
 */

const axios = require('axios');

const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://m1p13mean-niaina-1.onrender.com';

async function compareRoutes() {
  console.log('🔍 Comparaison des routes Local vs Production\n');
  
  try {
    // Test des routes locales
    console.log('🏠 Test des routes LOCALES...');
    const localTests = await testRoutes(LOCAL_URL);
    
    console.log('\n🌐 Test des routes PRODUCTION...');
    const productionTests = await testRoutes(PRODUCTION_URL);
    
    console.log('\n📊 COMPARAISON DES RÉSULTATS:\n');
    
    const routes = [
      'categories-boutique',
      'produits', 
      'boutique',
      'types-produit',
      'achats'
    ];
    
    console.log('| Route | Local | Production | Status |');
    console.log('|-------|-------|------------|--------|');
    
    routes.forEach(route => {
      const localStatus = localTests[route] ? '✅' : '❌';
      const prodStatus = productionTests[route] ? '✅' : '❌';
      const status = localTests[route] && productionTests[route] ? '🟢 OK' : 
                    localTests[route] && !productionTests[route] ? '🟡 DEPLOY NEEDED' : '🔴 ERROR';
      
      console.log(`| ${route} | ${localStatus} | ${prodStatus} | ${status} |`);
    });
    
    console.log('\n📝 RÉSUMÉ:');
    const localCount = Object.values(localTests).filter(Boolean).length;
    const prodCount = Object.values(productionTests).filter(Boolean).length;
    
    console.log(`- Routes locales fonctionnelles: ${localCount}/${routes.length}`);
    console.log(`- Routes production fonctionnelles: ${prodCount}/${routes.length}`);
    
    if (localCount > prodCount) {
      console.log('\n🚀 ACTION REQUISE: Redéploiement nécessaire sur Render');
      console.log('   Les nouvelles routes sont prêtes localement mais pas en production');
    } else if (localCount === prodCount) {
      console.log('\n✅ SYNCHRONISÉ: Local et production sont alignés');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la comparaison:', error.message);
  }
}

async function testRoutes(baseUrl) {
  const results = {};
  const routes = [
    'categories-boutique',
    'produits', 
    'boutique',
    'types-produit',
    'achats'
  ];
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${baseUrl}/api/${route}`);
      results[route] = true;
      console.log(`  ✅ ${route}: OK`);
    } catch (error) {
      results[route] = false;
      console.log(`  ❌ ${route}: ${error.response?.status || 'ERROR'}`);
    }
  }
  
  return results;
}

compareRoutes();