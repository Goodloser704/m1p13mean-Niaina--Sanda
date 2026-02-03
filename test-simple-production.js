/**
 * Test simple de l'API de production
 */

const axios = require('axios');

async function testSimple() {
  try {
    console.log('🌐 Test de la racine de l\'API...');
    const response = await axios.get('https://m1p13mean-niaina-1.onrender.com');
    console.log('✅ Réponse:', response.data);
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data || error.message);
  }
  
  try {
    console.log('\n🏥 Test du health check...');
    const healthResponse = await axios.get('https://m1p13mean-niaina-1.onrender.com/health');
    console.log('✅ Health:', healthResponse.data);
  } catch (error) {
    console.log('❌ Erreur health:', error.response?.data || error.message);
  }
}

testSimple();