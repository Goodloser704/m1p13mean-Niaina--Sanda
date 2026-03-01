const axios = require('axios');

// Configuration - RENDER
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let authToken = '';

async function loginAdmin() {
  console.log('\n🔐 Connexion admin...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Connexion admin réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    return false;
  }
}

async function testerObtenirEspaces() {
  console.log('\n📋 Test obtenirEspaces avec populate etage...');
  try {
    const response = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 3 }
    });
    
    const espaces = response.data.espaces || response.data;
    console.log(`✅ Espaces récupérés: ${espaces.length}`);
    
    if (espaces.length > 0) {
      const espace = espaces[0];
      console.log('\n📦 Premier espace:');
      console.log('  - Code:', espace.codeEspace);
      console.log('  - Étage (type):', typeof espace.etage);
      
      if (typeof espace.etage === 'object' && espace.etage !== null && espace.etage.nom) {
        console.log('  ✅ Étage est un objet (populate fonctionne!)');
        console.log('  - Étage.nom:', espace.etage.nom);
        console.log('  - Étage.numero:', espace.etage.numero);
        console.log('  - Étage.niveau:', espace.etage.niveau);
        return true;
      } else {
        console.log('  ❌ Étage n\'est pas populé');
        console.log('  - Étage:', espace.etage);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur obtenirEspaces:', error.response?.data || error.message);
    return false;
  }
}

async function testerCreationEspace() {
  console.log('\n➕ Test création espace avec populate etage...');
  try {
    // Obtenir un étage
    const etagesResponse = await axios.get(`${BASE_URL}/etages`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const etages = etagesResponse.data.etages || etagesResponse.data;
    if (etages.length === 0) {
      console.log('⚠️ Aucun étage disponible');
      return false;
    }
    
    const etageId = etages[0]._id;
    
    // Créer un espace
    const espaceData = {
      codeEspace: `RND${Date.now().toString().slice(-4)}`,
      surface: 65,
      etage: etageId,
      loyer: 1900,
      statut: 'Disponible',
      description: 'Test populate etage sur Render'
    };
    
    const response = await axios.post(`${BASE_URL}/espaces`, espaceData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const espace = response.data.espace;
    console.log('✅ Espace créé:', espace.codeEspace);
    console.log('  - Étage (type):', typeof espace.etage);
    
    let success = false;
    if (typeof espace.etage === 'object' && espace.etage !== null && espace.etage.nom) {
      console.log('  ✅ Étage est un objet (populate fonctionne!)');
      console.log('  - Étage.nom:', espace.etage.nom);
      console.log('  - Étage.numero:', espace.etage.numero);
      success = true;
    } else {
      console.log('  ❌ Étage n\'est pas populé');
      console.log('  - Étage:', espace.etage);
    }
    
    // Nettoyer
    await axios.delete(`${BASE_URL}/espaces/${espace._id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('  🧹 Espace de test supprimé');
    
    return success;
  } catch (error) {
    console.error('❌ Erreur création espace:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Populate Étage sur RENDER');
  console.log('═══════════════════════════════════════════════════════');
  console.log('URL:', BASE_URL);
  
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  const results = {
    obtenirEspaces: await testerObtenirEspaces(),
    creationEspace: await testerCreationEspace()
  };
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RÉSULTATS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('obtenirEspaces:      ', results.obtenirEspaces ? '✅' : '❌');
  console.log('creationEspace:      ', results.creationEspace ? '✅' : '❌');
  
  const allSuccess = results.obtenirEspaces && results.creationEspace;
  
  if (allSuccess) {
    console.log('\n🎉 Tous les tests sont passés sur Render!');
    console.log('Le populate("etage") fonctionne correctement en production.');
  } else {
    console.log('\n❌ Certains tests ont échoué.');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
