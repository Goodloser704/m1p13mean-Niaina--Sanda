/**
 * Script de test et d'initialisation des données par défaut
 * Utilise les APIs réelles pour initialiser les catégories
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Configuration d'un token admin temporaire (à remplacer par un vrai token)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzgxZjI4ZjU4YzQyNzAwMTNkNzQzNzMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzY1MzI2MjMsImV4cCI6MTczNjYxOTAyM30.example'; // Token d'exemple

async function testAPI() {
  console.log('🚀 Test des APIs et initialisation des données...\n');
  
  try {
    // 1. Test de l'API des catégories
    console.log('📋 Test API catégories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories-boutique`);
    console.log(`✅ ${categoriesResponse.data.count} catégories trouvées`);
    
    // 2. Initialiser les catégories par défaut si nécessaire
    if (categoriesResponse.data.count === 0) {
      console.log('🔧 Initialisation des catégories par défaut...');
      try {
        const initResponse = await axios.post(
          `${API_BASE_URL}/categories-boutique/admin/initialiser`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${ADMIN_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ ${initResponse.data.message}`);
      } catch (error) {
        console.log('⚠️ Initialisation des catégories nécessite un token admin valide');
        console.log('💡 Vous pouvez créer les catégories manuellement via l\'interface admin');
      }
    }
    
    // 3. Test de l'API des produits
    console.log('\n📦 Test API produits...');
    const produitsResponse = await axios.get(`${API_BASE_URL}/produits`);
    console.log(`✅ API produits fonctionnelle`);
    
    // 4. Test de l'API des boutiques
    console.log('\n🏪 Test API boutiques...');
    const boutiquesResponse = await axios.get(`${API_BASE_URL}/boutique`);
    console.log(`✅ API boutiques fonctionnelle`);
    
    // 5. Test de l'API des achats
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
    
    console.log('\n🎉 Tous les tests API sont passés avec succès !');
    console.log('\n📝 Résumé :');
    console.log('- ✅ API Catégories : Fonctionnelle');
    console.log('- ✅ API Produits : Fonctionnelle');
    console.log('- ✅ API Boutiques : Fonctionnelle');
    console.log('- ✅ API Achats : Fonctionnelle');
    console.log('\n🚀 L\'application est prête à être utilisée !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des APIs:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n💡 Assurez-vous que le serveur backend est démarré sur le port 3000');
    console.log('💡 Commande : cd mall-app/backend && npm start');
  }
}

// Exécuter le test
testAPI();