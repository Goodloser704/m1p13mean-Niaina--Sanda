/**
 * Test de réutilisation d'un code d'espace après suppression
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Comptes de test
const ADMIN_CREDENTIALS = {
  email: 'admin@mallapp.com',
  mdp: 'admin123'
};

let adminToken = '';
let etageId = '';
let espaceId = '';

async function login() {
  console.log('🔐 Connexion admin...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.token;
    console.log('✅ Connecté');
  } catch (error) {
    console.error('❌ Erreur connexion:', error.response?.data || error.message);
    throw error;
  }
}

async function getEtage() {
  console.log('\n📋 Récupération d\'un étage...');
  try {
    const response = await axios.get(`${BASE_URL}/etages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.etages && response.data.etages.length > 0) {
      etageId = response.data.etages[0]._id;
      console.log(`✅ Étage trouvé: ${response.data.etages[0].nom} (ID: ${etageId})`);
    } else {
      console.log('⚠️  Aucun étage trouvé, création d\'un étage de test...');
      const createResponse = await axios.post(
        `${BASE_URL}/etages`,
        {
          nom: 'Étage Test',
          niveau: 1,
          description: 'Étage créé pour les tests'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('Réponse création:', createResponse.data);
      etageId = createResponse.data.etage?._id || createResponse.data._id;
      console.log(`✅ Étage créé (ID: ${etageId})`);
    }
  } catch (error) {
    console.error('❌ Erreur récupération étage:', error.response?.data || error.message);
    throw error;
  }
}

async function createEspace(code) {
  console.log(`\n➕ Création d'un espace avec le code "${code}"...`);
  try {
    const response = await axios.post(
      `${BASE_URL}/espaces`,
      {
        code: code,
        etage: etageId,
        surface: 50,
        loyer: 1000,
        description: 'Test de réutilisation de code'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    const espace = response.data.espace || response.data;
    espaceId = espace._id;
    console.log(`✅ Espace créé avec succès (ID: ${espaceId})`);
    console.log(`   Code: ${espace.code}`);
    console.log(`   Statut: ${espace.statut}`);
    console.log(`   isActive: ${espace.isActive}`);
    return espace;
  } catch (error) {
    console.error(`❌ Erreur création: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function deleteEspace(id) {
  console.log(`\n🗑️  Suppression de l'espace (ID: ${id})...`);
  try {
    const response = await axios.delete(
      `${BASE_URL}/espaces/${id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log(`✅ ${response.data.message}`);
  } catch (error) {
    console.error(`❌ Erreur suppression: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function listEspaces() {
  console.log('\n📋 Liste des espaces (actifs et inactifs)...');
  try {
    const response = await axios.get(`${BASE_URL}/espaces?actifSeulement=false`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`Total: ${response.data.total} espaces`);
    response.data.espaces.forEach(e => {
      console.log(`   - ${e.code} (${e.statut}) - isActive: ${e.isActive}`);
    });
  } catch (error) {
    console.error(`❌ Erreur liste: ${error.response?.data?.message || error.message}`);
  }
}

async function runTest() {
  try {
    console.log('🧪 TEST: Réutilisation d\'un code d\'espace après suppression\n');
    console.log('='.repeat(60));

    // 1. Connexion
    await login();

    // 2. Récupérer un étage
    await getEtage();

    // Utiliser un code unique pour ce test
    const testCode = 'TEST' + Date.now().toString().slice(-4);
    console.log(`\nℹ️  Code de test: ${testCode}`);

    // 3. Créer un espace avec le code de test
    console.log('\n--- ÉTAPE 1: Création initiale ---');
    await createEspace(testCode);
    await listEspaces();

    // 4. Supprimer l'espace
    console.log('\n--- ÉTAPE 2: Suppression ---');
    await deleteEspace(espaceId);
    await listEspaces();

    // 5. Recréer un espace avec le même code
    console.log('\n--- ÉTAPE 3: Recréation avec le même code ---');
    await createEspace(testCode);
    await listEspaces();

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST RÉUSSI: Le code peut être réutilisé après suppression!');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ TEST ÉCHOUÉ');
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

runTest();
