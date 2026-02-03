/**
 * Test des nouvelles routes localement
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testLocalRoutes() {
  console.log('🚀 Test des nouvelles routes localement...\n');
  
  try {
    // 1. Test API catégories
    console.log('📋 Test API catégories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories-boutique`);
    console.log(`✅ Catégories: ${categoriesResponse.data.count} trouvées`);
    
    // 2. Test API produits (nouvelle route GET /api/produits)
    console.log('\n📦 Test API produits...');
    const produitsResponse = await axios.get(`${API_BASE_URL}/produits`);
    console.log(`✅ Produits: ${produitsResponse.data.produits?.length || 0} trouvés`);
    
    // 3. Test API boutiques (nouvelle route GET /api/boutique)
    console.log('\n🏪 Test API boutiques...');
    const boutiquesResponse = await axios.get(`${API_BASE_URL}/boutique`);
    console.log(`✅ Boutiques: ${boutiquesResponse.data.boutiques?.length || 0} trouvées`);
    
    // 4. Test API types de produits
    console.log('\n🏷️ Test API types de produits...');
    const typesResponse = await axios.get(`${API_BASE_URL}/types-produit`);
    console.log(`✅ Types de produits: API fonctionnelle`);
    
    // 5. Test API achats (nécessite authentification)
    console.log('\n🛒 Test API achats...');
    try {
      const achatsResponse = await axios.get(`${API_BASE_URL}/achats`);
      console.log(`✅ Achats: API fonctionnelle`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Achats: API fonctionnelle (authentification requise)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Toutes les nouvelles routes fonctionnent localement !');
    console.log('\n📝 Routes testées avec succès :');
    console.log('- ✅ GET /api/categories-boutique');
    console.log('- ✅ GET /api/produits (NOUVEAU)');
    console.log('- ✅ GET /api/boutique (NOUVEAU)');
    console.log('- ✅ GET /api/types-produit (NOUVEAU)');
    console.log('- ✅ GET /api/achats (avec auth)');
    
    console.log('\n🚀 Prêt pour le déploiement sur la branche niaina-dev !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des routes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testLocalRoutes();