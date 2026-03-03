const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testHistoriqueLoyers() {
  try {
    // 1. Login commercant
    console.log('🔐 Login commercant...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Token obtenu');
    
    // 2. Récupérer l'historique
    console.log('\n📋 Récupération historique loyers...');
    const historiqueRes = await axios.get(`${API_URL}/commercant/loyers/historique`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50 }
    });
    
    console.log('\n📊 HISTORIQUE DES PAIEMENTS:');
    console.log('Total:', historiqueRes.data.loyers.length);
    
    historiqueRes.data.loyers.forEach((loyer, index) => {
      console.log(`\n${index + 1}. Paiement:`);
      console.log(`   ID: ${loyer._id}`);
      console.log(`   Montant: ${loyer.amount}€`);
      console.log(`   Description: ${loyer.description}`);
      console.log(`   Date: ${loyer.createdAt}`);
      console.log(`   Statut: ${loyer.statut}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testHistoriqueLoyers();
