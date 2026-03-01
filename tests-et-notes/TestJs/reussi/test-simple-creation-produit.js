/**
 * Test simple de création de produit pour voir l'erreur exacte
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const COMMERCANT = { email: 'commercant@test.com', mdp: 'Commercant123456!' };

const run = async () => {
  try {
    // 1. Login
    console.log('🔐 Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, COMMERCANT);
    const token = loginResponse.data.token;
    console.log('✅ Token:', token.substring(0, 20) + '...');
    
    // 2. Récupérer boutique
    console.log('\n🏪 Récupération boutique...');
    const boutiqueResponse = await axios.get(`${BASE_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const boutiqueId = boutiqueResponse.data.boutiques[0]._id;
    console.log('✅ Boutique ID:', boutiqueId);
    
    // 3. Récupérer types produits
    console.log('\n📦 Récupération types produits...');
    const typesResponse = await axios.get(`${BASE_URL}/types-produit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📋 Réponse complète:', JSON.stringify(typesResponse.data, null, 2));
    
    let typeProduitId;
    if (typesResponse.data.typesProduits && typesResponse.data.typesProduits.length > 0) {
      // Chercher un type qui appartient à cette boutique
      const typeForBoutique = typesResponse.data.typesProduits.find(
        t => t.boutique && (t.boutique._id === boutiqueId || t.boutique === boutiqueId)
      );
      
      if (typeForBoutique) {
        typeProduitId = typeForBoutique._id;
        console.log('✅ Type Produit ID:', typeProduitId);
      } else {
        console.log('⚠️ Aucun type pour cette boutique, création...');
        const createTypeResponse = await axios.post(
          `${BASE_URL}/types-produit`,
          {
            type: `Type Test ${Date.now()}`,
            description: 'Test',
            boutique: boutiqueId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        typeProduitId = createTypeResponse.data.typeProduit._id;
        console.log('✅ Type créé:', typeProduitId);
      }
    } else {
      console.log('⚠️ Aucun type trouvé, création...');
      const createTypeResponse = await axios.post(
        `${BASE_URL}/types-produit`,
        {
          type: `Type Test ${Date.now()}`,
          description: 'Test',
          boutique: boutiqueId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      typeProduitId = createTypeResponse.data.typeProduit._id;
      console.log('✅ Type créé:', typeProduitId);
    }
    
    // 4. Créer produit
    console.log('\n🛍️ Création produit...');
    const produitData = {
      nom: `Produit Test ${Date.now()}`,
      description: 'Test création',
      photo: 'https://example.com/photo.jpg',
      prix: 25.99,
      typeProduit: typeProduitId,
      boutique: boutiqueId,
      stock: { nombreDispo: 10 }
    };
    console.log('📝 Données:', JSON.stringify(produitData, null, 2));
    
    const produitResponse = await axios.post(
      `${BASE_URL}/produits`,
      produitData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Produit créé:', produitResponse.data);
    
  } catch (error) {
    console.error('\n❌ ERREUR:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
};

run();
