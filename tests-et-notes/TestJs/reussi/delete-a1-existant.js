const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

async function deleteA1() {
  try {
    // Connexion
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginRes.data.token;

    // Trouver A1
    const espacesRes = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const a1 = espacesRes.data.espaces.find(e => e.code === 'A1' && e.isActive);
    
    if (a1) {
      console.log(`🗑️  Suppression de A1 (ID: ${a1._id})...`);
      await axios.delete(`${BASE_URL}/espaces/${a1._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ A1 supprimé');
    } else {
      console.log('ℹ️  Aucun A1 actif trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
  }
}

deleteA1();
