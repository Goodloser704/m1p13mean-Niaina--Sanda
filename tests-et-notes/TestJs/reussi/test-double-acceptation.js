/**
 * Test spécifique pour vérifier qu'on ne peut pas accepter une demande déjà acceptée
 */

const axios = require('axios');
const API_URL = 'http://localhost:3000/api';

async function test() {
  try {
    console.log('🧪 Test: Double acceptation d\'une demande\n');
    
    // 1. Login admin
    console.log('1. Login admin...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    const adminToken = adminRes.data.token;
    console.log('✅ Admin connecté\n');
    
    // 2. Login commerçant
    console.log('2. Login commerçant...');
    const commercantRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    const commercantToken = commercantRes.data.token;
    console.log('✅ Commerçant connecté\n');
    
    // 3. Récupérer boutique et espace
    console.log('3. Récupération boutique et espace...');
    const boutiquesRes = await axios.get(`${API_URL}/boutique/my-boutiques`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    const boutiqueId = boutiquesRes.data.boutiques[0]._id;
    
    const espacesRes = await axios.get(`${API_URL}/espaces`, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    const espaceDispo = espacesRes.data.espaces.find(e => e.statut === 'Disponible');
    
    if (!espaceDispo) {
      console.log('❌ Aucun espace disponible');
      return;
    }
    
    console.log(`✅ Boutique: ${boutiqueId}`);
    console.log(`✅ Espace: ${espaceDispo._id}\n`);
    
    // 4. Créer une demande
    console.log('4. Création d\'une demande...');
    const createRes = await axios.post(`${API_URL}/demandes-location`, {
      boutiqueId,
      espaceId: espaceDispo._id,
      dureeContrat: 12,
      messageCommercant: 'Test double acceptation'
    }, {
      headers: { Authorization: `Bearer ${commercantToken}` }
    });
    
    const demandeId = createRes.data.demande._id;
    console.log(`✅ Demande créée: ${demandeId}`);
    console.log(`   État: ${createRes.data.demande.etatDemande}\n`);
    
    // 5. Accepter la demande (première fois)
    console.log('5. Acceptation de la demande (1ère fois)...');
    const acceptRes = await axios.put(
      `${API_URL}/demandes-location/${demandeId}/accepter`,
      {
        dateDebut: new Date().toISOString(),
        dateFin: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        loyerMensuel: 1500,
        caution: 3000
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log('✅ Demande acceptée');
    console.log(`   État: ${acceptRes.data.demande.etatDemande}\n`);
    
    // 6. Essayer d'accepter à nouveau (devrait échouer)
    console.log('6. Tentative d\'acceptation à nouveau (devrait échouer)...');
    try {
      await axios.put(
        `${API_URL}/demandes-location/${demandeId}/accepter`,
        {
          dateDebut: new Date().toISOString(),
          dateFin: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
          loyerMensuel: 2000,
          caution: 4000
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      console.log('❌ ERREUR: La demande a été acceptée à nouveau !');
      console.log('🚨 ANOMALIE DÉTECTÉE: On peut accepter une demande déjà acceptée\n');
      
    } catch (error) {
      if (error.response?.data?.message === 'Cette demande a déjà été traitée') {
        console.log('✅ SUCCÈS: La double acceptation a été bloquée');
        console.log(`   Message: ${error.response.data.message}`);
        console.log('✅ Le système fonctionne correctement\n');
      } else {
        console.log(`⚠️  Erreur inattendue: ${error.response?.data?.message || error.message}\n`);
      }
    }
    
    console.log('🎉 Test terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

test();
