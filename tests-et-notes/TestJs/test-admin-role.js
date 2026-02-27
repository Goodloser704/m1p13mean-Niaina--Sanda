/**
 * 🧪 TEST RÔLE ADMIN
 * Vérifie le rôle exact de l'admin
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

async function testAdminRole() {
  console.log('🔍 Test du rôle admin\n');

  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });

    const user = loginResponse.data.user;
    console.log('✅ Login réussi');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rôle: "${user.role}"`);
    console.log(`   Rôle (type): ${typeof user.role}`);
    console.log(`   Rôle (length): ${user.role.length}`);
    console.log(`   Rôle (toLowerCase): "${user.role.toLowerCase()}"`);
    console.log(`   Rôle === 'Admin': ${user.role === 'Admin'}`);
    console.log(`   Rôle === 'admin': ${user.role === 'admin'}`);
    console.log(`   Rôle.toLowerCase() === 'admin': ${user.role.toLowerCase() === 'admin'}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAdminRole();
