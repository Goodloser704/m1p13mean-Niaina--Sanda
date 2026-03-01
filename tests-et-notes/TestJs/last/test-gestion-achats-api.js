const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testGestionAchats() {
  try {
    console.log('🔐 Connexion en tant que commercant...');
    
    // Login commercant
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });

    const token = loginRes.data.token;
    console.log('✅ Token obtenu:', token.substring(0, 20) + '...');

    // Récupérer les achats en cours
    console.log('\n📦 Récupération des achats en cours...');
    const achatsRes = await axios.get(`${API_URL}/commercant/achats/en-cours`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📊 Résultat:');
    console.log('Total achats:', achatsRes.data.count);
    console.log('Pagination:', achatsRes.data.pagination);
    
    if (achatsRes.data.achats && achatsRes.data.achats.length > 0) {
      console.log('\n🛒 Achats trouvés:');
      achatsRes.data.achats.forEach((achat, i) => {
        console.log(`\n${i + 1}. Client: ${achat.acheteur?.nom} ${achat.acheteur?.prenoms}`);
        console.log(`   Email: ${achat.acheteur?.email}`);
        console.log(`   Produit: ${achat.produit?.nom}`);
        console.log(`   Quantité: ${achat.quantite}`);
        console.log(`   Montant: ${achat.montantTotal}€`);
        console.log(`   État: ${achat.etat}`);
        console.log(`   Type: ${achat.typeAchat?.type}`);
      });
    } else {
      console.log('\n⚠️  Aucun achat trouvé');
      
      // Vérifier avec tous les états
      console.log('\n🔍 Vérification avec tous les états...');
      const allAchatsRes = await axios.get(`${API_URL}/commercant/achats/en-cours?etatsAchat=EnAttente&etatsAchat=EnPreparation&etatsAchat=Validee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Total avec tous les états:', allAchatsRes.data.count);
      if (allAchatsRes.data.achats && allAchatsRes.data.achats.length > 0) {
        console.log('\n🛒 Achats trouvés (tous états):');
        allAchatsRes.data.achats.forEach((achat, i) => {
          console.log(`\n${i + 1}. Client: ${achat.acheteur?.nom} ${achat.acheteur?.prenoms}`);
          console.log(`   Produit: ${achat.produit?.nom}`);
          console.log(`   État: ${achat.etat}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testGestionAchats();
