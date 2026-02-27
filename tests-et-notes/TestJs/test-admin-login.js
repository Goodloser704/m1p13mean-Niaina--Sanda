/**
 * 🔐 TEST LOGIN ADMIN
 * 
 * Note: Les identifiants utilisés sont ceux actuellement configurés en production.
 * Référence: tests-et-notes/COMPTES-TEST.md pour la documentation des comptes de test.
 */

const axios = require('axios');

const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com';

async function testAdminLogin() {
  try {
    console.log('🔐 Test de connexion admin...\n');
    
    // Identifiants admin actuels en production
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    }, {
      validateStatus: () => true
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('\n✅ Login admin réussi!');
      console.log('Token:', response.data.token.substring(0, 50) + '...');
    } else {
      console.log('\n❌ Login admin échoué');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAdminLogin();
