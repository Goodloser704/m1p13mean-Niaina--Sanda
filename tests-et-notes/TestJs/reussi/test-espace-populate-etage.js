const axios = require('axios');

// Configuration - LOCAL
const BASE_URL = 'http://localhost:3000/api';
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
      params: { limit: 5 }
    });
    
    const espaces = response.data.espaces || response.data;
    console.log(`✅ Espaces récupérés: ${espaces.length}`);
    
    if (espaces.length > 0) {
      const espace = espaces[0];
      console.log('\n📦 Premier espace:');
      console.log('  - Code:', espace.codeEspace);
      console.log('  - Étage (type):', typeof espace.etage);
      
      if (typeof espace.etage === 'object' && espace.etage !== null) {
        console.log('  ✅ Étage est un objet (populate fonctionne!)');
        console.log('  - Étage._id:', espace.etage._id);
        console.log('  - Étage.nom:', espace.etage.nom);
        console.log('  - Étage.numero:', espace.etage.numero);
        console.log('  - Étage.niveau:', espace.etage.niveau);
      } else {
        console.log('  ❌ Étage est un ObjectId (populate ne fonctionne pas)');
        console.log('  - Étage:', espace.etage);
      }
    }
    
    return espaces.length > 0 && typeof espaces[0].etage === 'object';
  } catch (error) {
    console.error('❌ Erreur obtenirEspaces:', error.response?.data || error.message);
    return false;
  }
}

async function testerObtenirEspaceParId() {
  console.log('\n🔍 Test obtenirEspaceParId avec populate etage...');
  try {
    // D'abord obtenir un espace
    const listResponse = await axios.get(`${BASE_URL}/espaces`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 1 }
    });
    
    const espaces = listResponse.data.espaces || listResponse.data;
    if (espaces.length === 0) {
      console.log('⚠️ Aucun espace disponible pour le test');
      return false;
    }
    
    const espaceId = espaces[0]._id;
    console.log(`  Test avec espace ID: ${espaceId}`);
    
    // Obtenir l'espace par ID
    const response = await axios.get(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const espace = response.data.espace || response.data;
    console.log('✅ Espace récupéré par ID');
    console.log('  - Code:', espace.codeEspace);
    console.log('  - Étage (type):', typeof espace.etage);
    
    if (typeof espace.etage === 'object' && espace.etage !== null) {
      console.log('  ✅ Étage est un objet (populate fonctionne!)');
      console.log('  - Étage.nom:', espace.etage.nom);
      console.log('  - Étage.numero:', espace.etage.numero);
      console.log('  - Étage.niveau:', espace.etage.niveau);
      return true;
    } else {
      console.log('  ❌ Étage est un ObjectId (populate ne fonctionne pas)');
      console.log('  - Étage:', espace.etage);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur obtenirEspaceParId:', error.response?.data || error.message);
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
      codeEspace: `POP${Date.now().toString().slice(-4)}`,
      surface: 60,
      etage: etageId,
      loyer: 1800,
      statut: 'Disponible',
      description: 'Test populate etage'
    };
    
    const response = await axios.post(`${BASE_URL}/espaces`, espaceData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const espace = response.data.espace;
    console.log('✅ Espace créé:', espace.codeEspace);
    console.log('  - Étage (type):', typeof espace.etage);
    console.log('  - Étage complet:', JSON.stringify(espace.etage));
    
    let success = false;
    if (typeof espace.etage === 'object' && espace.etage !== null && espace.etage.nom) {
      console.log('  ✅ Étage est un objet (populate fonctionne!)');
      console.log('  - Étage.nom:', espace.etage.nom);
      console.log('  - Étage.numero:', espace.etage.numero);
      success = true;
    } else {
      console.log('  ❌ Étage n\'est pas populé correctement');
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
  console.log('  Test Populate Étage dans espaceService');
  console.log('═══════════════════════════════════════════════════════');
  console.log('URL:', BASE_URL);
  
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  const results = {
    obtenirEspaces: await testerObtenirEspaces(),
    obtenirEspaceParId: await testerObtenirEspaceParId(),
    creationEspace: await testerCreationEspace()
  };
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RÉSULTATS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('obtenirEspaces:      ', results.obtenirEspaces ? '✅' : '❌');
  console.log('obtenirEspaceParId:  ', results.obtenirEspaceParId ? '✅' : '❌');
  console.log('creationEspace:      ', results.creationEspace ? '✅ ou ⚠️ (normal)' : '❌');
  
  const allSuccess = results.obtenirEspaces && results.obtenirEspaceParId;
  
  if (allSuccess) {
    console.log('\n🎉 Tous les tests principaux sont passés!');
    console.log('Le populate("etage") fonctionne correctement.');
  } else {
    console.log('\n❌ Certains tests ont échoué.');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
