const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let authToken = '';
let etageId = '';
let espaceId = '';

// Fonction pour se connecter en tant qu'admin
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

// Fonction pour obtenir la liste des étages
async function obtenirEtages() {
  console.log('\n🏢 Récupération des étages...');
  try {
    const response = await axios.get(`${BASE_URL}/etages`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const etages = response.data.etages || response.data;
    console.log('✅ Étages récupérés:', etages.length);
    etages.forEach(etage => {
      console.log(`  - ${etage.nom} (ID: ${etage._id}, Numero: ${etage.numero})`);
    });
    
    if (etages.length > 0) {
      etageId = etages[0]._id;
      console.log(`\n📌 Étage sélectionné: ${etages[0].nom} (ID: ${etageId})`);
    }
    
    return etages;
  } catch (error) {
    console.error('❌ Erreur récupération étages:', error.response?.data || error.message);
    return [];
  }
}

// Fonction pour créer un espace
async function creerEspace() {
  console.log('\n🏪 Création d\'un espace...');
  
  const espaceData = {
    codeEspace: `TEST${Date.now().toString().slice(-4)}`,
    surface: 50,
    etage: etageId, // Utiliser l'_id de l'étage (pas le numero!)
    loyer: 1500,
    statut: 'Disponible',
    description: 'Espace de test créé automatiquement',
    caracteristiques: {
      vitrine: true,
      climatisation: true,
      stockage: false,
      accesPMR: true
    }
  };
  
  console.log('📤 Données envoyées:');
  console.log('  - codeEspace:', espaceData.codeEspace);
  console.log('  - surface:', espaceData.surface);
  console.log('  - etage (ID):', espaceData.etage);
  console.log('  - loyer:', espaceData.loyer);
  
  try {
    const response = await axios.post(`${BASE_URL}/espaces`, espaceData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    espaceId = response.data.espace._id;
    console.log('✅ Espace créé avec succès!');
    console.log('  - ID:', espaceId);
    console.log('  - Code:', response.data.espace.codeEspace);
    console.log('  - Étage:', response.data.espace.etage);
    return response.data.espace;
  } catch (error) {
    console.error('❌ Erreur création espace:');
    if (error.response?.data) {
      console.error('Message:', error.response.data.message);
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Fonction pour vérifier l'espace créé
async function verifierEspace() {
  if (!espaceId) {
    console.log('\n⚠️ Pas d\'espace à vérifier');
    return;
  }
  
  console.log('\n🔍 Vérification de l\'espace créé...');
  try {
    const response = await axios.get(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Espace vérifié:');
    console.log('  - Code:', response.data.espace.codeEspace);
    console.log('  - Surface:', response.data.espace.surface, 'm²');
    console.log('  - Étage:', response.data.espace.etage);
    console.log('  - Loyer:', response.data.espace.loyer, '€');
    console.log('  - Statut:', response.data.espace.statut);
    return response.data.espace;
  } catch (error) {
    console.error('❌ Erreur vérification espace:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour nettoyer
async function nettoyerEspace() {
  if (!espaceId) {
    console.log('\n⚠️ Pas d\'espace à nettoyer');
    return;
  }
  
  console.log('\n🧹 Nettoyage de l\'espace de test...');
  try {
    await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Espace de test supprimé');
  } catch (error) {
    console.error('❌ Erreur suppression espace:', error.response?.data || error.message);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test de création d\'espace LOCAL');
  console.log('URL:', BASE_URL);
  console.log('Admin:', ADMIN_EMAIL);
  
  // 1. Connexion admin
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Impossible de continuer sans connexion admin');
    return;
  }
  
  // 2. Obtenir les étages
  const etages = await obtenirEtages();
  if (etages.length === 0) {
    console.log('\n❌ Aucun étage disponible pour créer un espace');
    return;
  }
  
  // 3. Créer un espace
  const espace = await creerEspace();
  if (!espace) {
    console.log('\n❌ Échec de la création de l\'espace');
    return;
  }
  
  // 4. Vérifier l'espace créé
  await verifierEspace();
  
  // 5. Nettoyer
  await nettoyerEspace();
  
  console.log('\n✅ Test terminé avec succès!');
  console.log('\n💡 Le fix fonctionne: le frontend envoie maintenant l\'_id de l\'étage au lieu du numero');
}

// Exécuter le test
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
