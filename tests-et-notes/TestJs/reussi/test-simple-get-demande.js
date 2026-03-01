/**
 * Test simple pour GET demande par ID
 */

const axios = require('axios');
const API_URL = 'http://localhost:3000/api';

async function test() {
  try {
    // 1. Login commerçant
    console.log('1. Login commerçant...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    const token = loginRes.data.token;
    console.log('✅ Token:', token.substring(0, 20) + '...');

    // 2. Récupérer mes demandes
    console.log('\n2. Récupérer mes demandes...');
    const mesDemandesRes = await axios.get(`${API_URL}/demandes-location/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${mesDemandesRes.data.demandes.length} demande(s) trouvée(s)`);

    if (mesDemandesRes.data.demandes.length === 0) {
      console.log('⚠️  Aucune demande, création d\'une demande...');
      
      // Récupérer boutique
      const boutiquesRes = await axios.get(`${API_URL}/boutique/my-boutiques`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const boutiqueId = boutiquesRes.data.boutiques[0]._id;
      
      // Récupérer espace
      const espacesRes = await axios.get(`${API_URL}/espaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const espaceId = espacesRes.data.espaces[0]._id;
      
      // Créer demande
      const createRes = await axios.post(`${API_URL}/demandes-location`, {
        boutiqueId,
        espaceId,
        dureeContrat: 12
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Demande créée:', createRes.data.demande._id);
      mesDemandesRes.data.demandes = [createRes.data.demande];
    }

    const demandeId = mesDemandesRes.data.demandes[0]._id;
    console.log(`\n3. Test GET demande ${demandeId}...`);

    // 3. GET demande par ID
    const url = `${API_URL}/demandes-location/${demandeId}`;
    console.log(`   URL: ${url}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    const demandeRes = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Demande récupérée:');
    console.log('   Boutique:', demandeRes.data.demande.boutique?.nom || demandeRes.data.demande.boutique);
    console.log('   Espace:', demandeRes.data.demande.espace?.code || demandeRes.data.demande.espace);
    console.log('   État:', demandeRes.data.demande.etatDemande);

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

test();
