const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function checkBoutique() {
  try {
    console.log('🔍 Recherche de la boutique Cscecevvevev...\n');
    
    // Récupérer toutes les boutiques (public)
    const boutiquesRes = await axios.get(`${API_URL}/boutiques`);
    
    const boutique = boutiquesRes.data.boutiques.find(b => 
      b.nom && b.nom.toLowerCase().includes('cscecevvevev'.toLowerCase())
    );
    
    if (boutique) {
      console.log('✅ Boutique trouvée:');
      console.log('   Nom:', boutique.nom);
      console.log('   ID:', boutique._id);
      console.log('   Commerçant ID:', boutique.commercant);
      
      // Login admin pour voir plus de détails
      console.log('\n🔐 Connexion admin pour voir les détails...');
      const adminLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@mall.com',
        mdp: 'Admin123456!'
      });
      
      const token = adminLogin.data.token;
      
      // Récupérer les détails de la boutique
      const boutiqueDetails = await axios.get(`${API_URL}/boutique/admin/${boutique._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('\n📋 Détails complets:');
      console.log('   Commerçant:', boutiqueDetails.data.boutique.commercant);
      
      // Récupérer les produits de cette boutique
      const produitsRes = await axios.get(`${API_URL}/produits?boutique=${boutique._id}`);
      console.log('\n📦 Produits:', produitsRes.data.produits.length);
      produitsRes.data.produits.forEach(p => {
        console.log(`   - ${p.nom} (${p.prix}€) - Stock: ${p.stock?.nombreDispo || 0}`);
      });
      
    } else {
      console.log('❌ Boutique non trouvée');
      console.log('\n📋 Boutiques disponibles:');
      boutiquesRes.data.boutiques.slice(0, 10).forEach(b => {
        console.log(`   - ${b.nom}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

checkBoutique();
