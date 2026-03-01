/**
 * Test debug pour A1 avec gestion d'erreur détaillée
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

let adminToken = '';
let etageId = '';

async function test() {
  try {
    // Connexion
    console.log('🔐 Connexion...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginRes.data.token;
    console.log('✅ Connecté\n');

    // Récupérer un étage
    console.log('📋 Récupération des étages...');
    const etagesRes = await axios.get(`${BASE_URL}/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!etagesRes.data.etages || etagesRes.data.etages.length === 0) {
      console.error('❌ Aucun étage trouvé');
      return;
    }
    
    etageId = etagesRes.data.etages[0]._id;
    console.log(`✅ Étage: ${etagesRes.data.etages[0].nom} (ID: ${etageId})\n`);

    // Créer A1
    console.log('➕ Création de l\'espace A1...');
    try {
      const createRes = await axios.post(
        `${BASE_URL}/espaces`,
        { code: 'A1', etage: etageId, surface: 50, loyer: 1000 },
        { 
          headers: { Authorization: `Bearer ${adminToken}` },
          timeout: 10000
        }
      );
      const espaceId = createRes.data.espace._id;
      console.log(`✅ A1 créé (ID: ${espaceId})\n`);

      // Supprimer A1
      console.log('🗑️  Suppression de A1...');
      await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000
      });
      console.log('✅ A1 supprimé\n');

      // Recréer A1
      console.log('➕ Recréation de A1...');
      const recreateRes = await axios.post(
        `${BASE_URL}/espaces`,
        { code: 'A1', etage: etageId, surface: 60, loyer: 1200 },
        { 
          headers: { Authorization: `Bearer ${adminToken}` },
          timeout: 10000
        }
      );
      console.log(`✅ A1 recréé (ID: ${recreateRes.data.espace._id})`);
      console.log(`   Surface: ${recreateRes.data.espace.surface} m²`);
      console.log(`   Loyer: ${recreateRes.data.espace.loyer} Ar\n`);

      console.log('✅ TEST RÉUSSI: Le code A1 peut être réutilisé!');
      
    } catch (createError) {
      console.error('❌ Erreur lors de la création/suppression/recréation:');
      if (createError.response) {
        console.error('   Status:', createError.response.status);
        console.error('   Message:', createError.response.data?.message || createError.response.data);
      } else if (createError.request) {
        console.error('   Pas de réponse du serveur');
        console.error('   Request:', createError.message);
      } else {
        console.error('   Erreur:', createError.message);
      }
    }

  } catch (error) {
    console.error('❌ ERREUR GLOBALE:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   Pas de réponse du serveur');
      console.error('   Message:', error.message);
    } else {
      console.error('   Message:', error.message);
    }
    console.error('   Stack:', error.stack);
  }
}

test();
