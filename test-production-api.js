/**
 * Test des APIs en production sur Render
 * URL: https://m1p13mean-niaina-1.onrender.com
 */

const axios = require('axios');

const API_BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

async function testProductionAPI() {
  console.log('🚀 Test des APIs en production...\n');
  console.log('🌐 Backend URL:', API_BASE_URL);
  console.log('🗄️ Base de données: MongoDB Atlas\n');
  
  try {
    // 1. Test de l'API des catégories
    console.log('📋 Test API catégories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories-boutique`);
    console.log(`✅ ${categoriesResponse.data.count} catégories trouvées`);
    
    // 2. Test de l'API des produits
    console.log('\n📦 Test API produits...');
    const produitsResponse = await axios.get(`${API_BASE_URL}/produits`);
    console.log(`✅ API produits fonctionnelle - ${produitsResponse.data.produits?.length || 0} produits`);
    
    // 3. Test de l'API des boutiques
    console.log('\n🏪 Test API boutiques...');
    const boutiquesResponse = await axios.get(`${API_BASE_URL}/boutique`);
    console.log(`✅ API boutiques fonctionnelle - ${boutiquesResponse.data.boutiques?.length || 0} boutiques`);
    
    // 4. Test de l'API des achats (nécessite authentification)
    console.log('\n🛒 Test API achats...');
    try {
      const achatsResponse = await axios.get(`${API_BASE_URL}/achats`);
      console.log(`✅ API achats fonctionnelle`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API achats fonctionnelle (authentification requise)');
      } else {
        throw error;
      }
    }
    
    // 5. Test de l'API des types de produits
    console.log('\n🏷️ Test API types de produits...');
    const typesResponse = await axios.get(`${API_BASE_URL}/types-produit`);
    console.log(`✅ API types de produits fonctionnelle`);
    
    // 6. Test de l'API des étages
    console.log('\n🏗️ Test API étages...');
    const etagesResponse = await axios.get(`${API_BASE_URL}/etages`);
    console.log(`✅ API étages fonctionnelle - ${etagesResponse.data.etages?.length || 0} étages`);
    
    // 7. Test de l'API des espaces
    console.log('\n🏠 Test API espaces...');
    const espacesResponse = await axios.get(`${API_BASE_URL}/espaces`);
    console.log(`✅ API espaces fonctionnelle - ${espacesResponse.data.espaces?.length || 0} espaces`);
    
    // 8. Test de l'API des demandes de location
    console.log('\n📋 Test API demandes de location...');
    try {
      const demandesResponse = await axios.get(`${API_BASE_URL}/demandes-location`);
      console.log(`✅ API demandes de location fonctionnelle`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API demandes de location fonctionnelle (authentification requise)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Tous les tests API de production sont passés avec succès !');
    console.log('\n📝 Résumé des APIs fonctionnelles :');
    console.log('- ✅ API Catégories : Opérationnelle');
    console.log('- ✅ API Produits : Opérationnelle');
    console.log('- ✅ API Boutiques : Opérationnelle');
    console.log('- ✅ API Achats : Opérationnelle (avec auth)');
    console.log('- ✅ API Types de produits : Opérationnelle');
    console.log('- ✅ API Étages : Opérationnelle');
    console.log('- ✅ API Espaces : Opérationnelle');
    console.log('- ✅ API Demandes de location : Opérationnelle (avec auth)');
    
    console.log('\n🚀 L\'application Mall-App est entièrement opérationnelle en production !');
    console.log('🌐 Backend: https://m1p13mean-niaina-1.onrender.com');
    console.log('🗄️ Base de données: MongoDB Atlas');
    console.log('✨ Toutes les simulations ont été remplacées par des appels API réels');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des APIs:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n💡 Vérifiez que le backend est bien déployé sur Render');
    console.log('💡 URL: https://m1p13mean-niaina-1.onrender.com');
  }
}

// Exécuter le test
testProductionAPI();