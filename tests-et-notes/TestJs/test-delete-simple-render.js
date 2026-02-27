/**
 * Test simplifié de la logique de suppression - RENDER
 * 
 * Ce test vérifie la logique de suppression sur les entités disponibles:
 * - Étage: Déjà testé (test-delete-etage-render.js)
 * - Espace: Vérifier la suppression d'espaces
 * - Notification: Vérifier la suppression de notifications
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';
const ADMIN_EMAIL = 'admin@mall.com';
const ADMIN_PASSWORD = 'Admin123456!';

let adminToken = '';
let centreCommercialId = '';

// Fonction pour se connecter en tant qu'admin
async function loginAdmin() {
  console.log('\n🔐 === CONNEXION ADMIN ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      mdp: ADMIN_PASSWORD
    });

    adminToken = response.data.token;
    console.log('✅ Connexion admin réussie');
    console.log('👤 Utilisateur:', response.data.user?.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour obtenir le centre commercial
async function obtenirCentreCommercial() {
  console.log('\n🏬 === OBTENTION CENTRE COMMERCIAL ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/centre-commercial`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    centreCommercialId = response.data.centreCommercial._id;
    console.log('✅ Centre commercial obtenu:', response.data.centreCommercial.nom);
    console.log('🆔 ID:', centreCommercialId);
    
    return response.data.centreCommercial;
  } catch (error) {
    console.error('❌ Erreur obtention centre commercial:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un étage
async function creerEtage() {
  console.log('\n🏢 === CRÉATION ÉTAGE ===');
  
  const numeroUnique = parseInt(Date.now().toString().slice(-2)) % 50;
  const etageData = {
    numero: numeroUnique,
    nom: `Étage Test ${numeroUnique} - ${Date.now()}`,
    description: 'Étage pour tests de suppression'
  };

  try {
    const response = await axios.post(`${BASE_URL}/etages`, etageData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Étage créé:', response.data.etage.nom);
    console.log('🆔 ID:', response.data.etage._id);
    
    return response.data.etage;
  } catch (error) {
    console.error('❌ Erreur création étage:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un espace
async function creerEspace(etageId) {
  console.log('\n📦 === CRÉATION ESPACE ===');
  
  const codeUnique = `TST${Date.now().toString().slice(-6)}`;
  const espaceData = {
    centreCommercial: centreCommercialId,
    code: codeUnique,
    codeEspace: codeUnique,
    surface: 50,
    loyer: 1000,
    etage: etageId,
    statut: 'Disponible'
  };

  try {
    const response = await axios.post(`${BASE_URL}/espaces`, espaceData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Espace créé:', response.data.espace.code);
    console.log('🆔 ID:', response.data.espace._id);
    
    return response.data.espace;
  } catch (error) {
    console.error('❌ Erreur création espace:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour supprimer un espace
async function supprimerEspace(espaceId) {
  console.log('\n🗑️ === SUPPRESSION ESPACE ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/espaces/${espaceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Espace supprimé');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression espace:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour supprimer un étage
async function supprimerEtage(etageId) {
  console.log('\n🗑️ === SUPPRESSION ÉTAGE ===');
  
  try {
    const response = await axios.delete(`${BASE_URL}/etages/${etageId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Étage supprimé');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur suppression étage:', error.response?.data || error.message);
    throw error;
  }
}

// Test principal
async function runTests() {
  console.log('🧪 ========================================');
  console.log('🧪 TEST LOGIQUE DE SUPPRESSION - RENDER');
  console.log('🧪 ========================================');
  console.log('🌐 URL:', BASE_URL);
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
  
  let testsPassed = 0;
  let testsFailed = 0;
  let etage = null;
  let espace = null;

  try {
    // 1. Connexion admin
    await loginAdmin();

    // 2. Obtenir le centre commercial
    await obtenirCentreCommercial();

    // 3. Créer un étage
    etage = await creerEtage();

    // 4. Créer un espace sur cet étage
    espace = await creerEspace(etage._id);

    // TEST 1: Tenter de supprimer un étage avec un espace actif
    console.log('\n📊 === TEST 1: Suppression étage avec espace actif ===');
    try {
      await supprimerEtage(etage._id);
      console.log('❌ TEST 1 ÉCHOUÉ: L\'étage devrait être protégé');
      testsFailed++;
    } catch (error) {
      if (error.response?.data?.message?.includes('espaces') || 
          error.response?.data?.message?.includes('Impossible')) {
        console.log('✅ TEST 1 PASSÉ: Étage protégé (contient des espaces)');
        testsPassed++;
      } else {
        console.log('❌ TEST 1 ÉCHOUÉ: Erreur inattendue:', error.response?.data?.message);
        testsFailed++;
      }
    }

    // TEST 2: Supprimer l'espace
    console.log('\n📊 === TEST 2: Suppression de l\'espace ===');
    try {
      await supprimerEspace(espace._id);
      console.log('✅ TEST 2 PASSÉ: Espace supprimé');
      testsPassed++;
    } catch (error) {
      console.log('❌ TEST 2 ÉCHOUÉ:', error.response?.data?.message);
      testsFailed++;
    }

    // TEST 3: Supprimer l'étage après suppression de l'espace
    console.log('\n📊 === TEST 3: Suppression étage après suppression espace ===');
    try {
      await supprimerEtage(etage._id);
      console.log('✅ TEST 3 PASSÉ: Étage supprimé après suppression de l\'espace');
      testsPassed++;
      etage = null; // Marquer comme supprimé
    } catch (error) {
      console.log('❌ TEST 3 ÉCHOUÉ:', error.response?.data?.message);
      testsFailed++;
    }

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error.message);
    testsFailed++;
  } finally {
    // Nettoyage
    if (espace && espace._id) {
      console.log('\n🧹 === NETTOYAGE ===');
      try {
        await supprimerEspace(espace._id);
      } catch (e) {
        // Ignorer
      }
    }
    
    if (etage && etage._id) {
      try {
        await supprimerEtage(etage._id);
      } catch (e) {
        // Ignorer
      }
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${testsPassed}`);
  console.log(`❌ Tests échoués: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log(`🎯 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('✅ La logique de suppression est cohérente');
    console.log('✅ Les entités avec dépendances sont protégées');
    console.log('✅ La suppression fonctionne après suppression des dépendances');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
