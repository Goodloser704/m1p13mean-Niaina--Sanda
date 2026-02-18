/**
 * 🧪 TEST DEBUG ADMIN
 * Debug complet de l'authentification admin
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

async function testAdminDebug() {
  console.log('🔍 Test debug admin\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login réussi');
    console.log(`   Rôle: "${user.role}"`);
    console.log(`   Token: ${token.substring(0, 50)}...\n`);

    // Test avec différentes routes admin
    const routes = [
      '/boutique/pending',
      '/boutique/all',
      '/admin/dashboard'
    ];

    for (const route of routes) {
      console.log(`\n🧪 Test: GET ${route}`);
      try {
        const response = await axios.get(`${API_URL}${route}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true
        });

        console.log(`   Status: ${response.status}`);
        if (response.status === 403) {
          console.log(`   ❌ Message: ${response.data.message}`);
          console.log(`   Code: ${response.data.code}`);
          if (response.data.requiredRoles) {
            console.log(`   Rôles requis: ${JSON.stringify(response.data.requiredRoles)}`);
          }
          if (response.data.userRole) {
            console.log(`   Rôle utilisateur: ${response.data.userRole}`);
          }
        } else if (response.status === 200) {
          console.log(`   ✅ Succès`);
        } else {
          console.log(`   ⚠️  Autre erreur: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Data:', error.response.data);
    }
  }
}

testAdminDebug();
