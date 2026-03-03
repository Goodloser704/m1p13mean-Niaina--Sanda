/**
 * 🧪 Test des Demandes de Location - Accepter et Refuser
 * Test des modifications du collaborateur
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Tokens de test (à remplacer par vos vrais tokens)
let adminToken = '';
let commercantToken = '';
let demandeId = '';

async function loginAdmin() {
  try {
    log('\n📝 1. Connexion Admin...', 'cyan');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    adminToken = response.data.token;
    log('✅ Admin connecté', 'green');
    log(`   Token: ${adminToken.substring(0, 20)}...`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion admin: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function loginCommercant() {
  try {
    log('\n📝 2. Connexion Commerçant...', 'cyan');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    commercantToken = response.data.token;
    log('✅ Commerçant connecté', 'green');
    log(`   Token: ${commercantToken.substring(0, 20)}...`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Erreur connexion commerçant: ${error.response?.data?.message || error.message}`, 'red');
    log('   Créez un compte commerçant avec: email=commercant@test.com, mdp=test123', 'yellow');
    return false;
  }
}

async function obtenirDemandesEnAttente() {
  try {
    log('\n📝 3. Récupération des demandes en attente...', 'cyan');
    const response = await axios.get(`${API_URL}/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const demandes = response.data.demandes;
    log(`✅ ${demandes.length} demande(s) en attente trouvée(s)`, 'green');
    
    if (demandes.length > 0) {
      demandeId = demandes[0]._id;
      log(`   Demande ID: ${demandeId}`, 'blue');
      log(`   Boutique: ${demandes[0].boutique?.nom || 'N/A'}`, 'blue');
      log(`   Espace: ${demandes[0].espace?.code || 'N/A'}`, 'blue');
      return true;
    } else {
      log('⚠️  Aucune demande en attente. Créez-en une d\'abord.', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur récupération demandes: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testAccepterDemande() {
  try {
    log('\n📝 4. Test ACCEPTER une demande...', 'cyan');
    
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setFullYear(dateFin.getFullYear() + 1); // +1 an
    
    const response = await axios.put(
      `${API_URL}/demandes-location/${demandeId}/accepter`,
      {
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        loyerMensuel: 1500,
        caution: 3000,
        conditionsSpeciales: 'Paiement le 1er de chaque mois',
        messageAdmin: 'Demande acceptée. Bienvenue dans notre centre commercial !'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    log('✅ Demande ACCEPTÉE avec succès !', 'green');
    log(`   État: ${response.data.demande.etatDemande}`, 'blue');
    log(`   Loyer: ${response.data.demande.contrat?.loyerMensuel}€/mois`, 'blue');
    log(`   Caution: ${response.data.demande.contrat?.caution}€`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Erreur acceptation: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        log(`   - ${err.msg}`, 'red');
      });
    }
    return false;
  }
}

async function testRefuserDemande() {
  try {
    log('\n📝 5. Test REFUSER une demande...', 'cyan');
    
    // Récupérer une autre demande en attente
    const response = await axios.get(`${API_URL}/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const demandes = response.data.demandes;
    if (demandes.length === 0) {
      log('⚠️  Aucune autre demande en attente pour tester le refus', 'yellow');
      return true;
    }
    
    const autreDemandeId = demandes[0]._id;
    log(`   Demande à refuser: ${autreDemandeId}`, 'blue');
    
    const refusResponse = await axios.put(
      `${API_URL}/demandes-location/${autreDemandeId}/refuser`,
      {
        raisonRefus: 'Espace déjà réservé pour un autre projet',
        messageAdmin: 'Nous vous invitons à consulter d\'autres espaces disponibles.'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    log('✅ Demande REFUSÉE avec succès !', 'green');
    log(`   État: ${refusResponse.data.demande.etatDemande}`, 'blue');
    log(`   Raison: ${refusResponse.data.demande.raisonRefus}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Erreur refus: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        log(`   - ${err.msg}`, 'red');
      });
    }
    return false;
  }
}

async function testUpdateEtatGenerique() {
  try {
    log('\n📝 6. Test UPDATE état générique...', 'cyan');
    
    // Récupérer une demande en attente
    const response = await axios.get(`${API_URL}/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const demandes = response.data.demandes;
    if (demandes.length === 0) {
      log('⚠️  Aucune demande en attente pour tester l\'update générique', 'yellow');
      return true;
    }
    
    const demandeId = demandes[0]._id;
    log(`   Demande à mettre à jour: ${demandeId}`, 'blue');
    
    const updateResponse = await axios.put(
      `${API_URL}/demandes-location/${demandeId}`,
      {
        etat: 'Acceptee'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    log('✅ État mis à jour avec succès !', 'green');
    log(`   Nouvel état: ${updateResponse.data.demande.etatDemande}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Erreur update état: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function verifierStatistiques() {
  try {
    log('\n📝 7. Vérification des statistiques...', 'cyan');
    
    const enAttente = await axios.get(`${API_URL}/demandes-location/etat/EnAttente`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const acceptees = await axios.get(`${API_URL}/demandes-location/etat/Acceptee`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const refusees = await axios.get(`${API_URL}/demandes-location/etat/Refusee`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    log('✅ Statistiques des demandes:', 'green');
    log(`   📋 En attente: ${enAttente.data.demandes.length}`, 'blue');
    log(`   ✅ Acceptées: ${acceptees.data.demandes.length}`, 'green');
    log(`   ❌ Refusées: ${refusees.data.demandes.length}`, 'red');
    
    return true;
  } catch (error) {
    log(`❌ Erreur statistiques: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🚀 ========================================', 'cyan');
  log('🧪 TEST DES DEMANDES DE LOCATION', 'cyan');
  log('   Accepter et Refuser - Modifications Collaborateur', 'cyan');
  log('🚀 ========================================\n', 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test 1: Login Admin
  results.total++;
  if (await loginAdmin()) {
    results.passed++;
  } else {
    results.failed++;
    log('\n❌ Impossible de continuer sans connexion admin', 'red');
    return;
  }
  
  // Test 2: Login Commerçant (optionnel)
  results.total++;
  if (await loginCommercant()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Obtenir demandes en attente
  results.total++;
  const hasDemandesEnAttente = await obtenirDemandesEnAttente();
  if (hasDemandesEnAttente) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Accepter une demande
  if (hasDemandesEnAttente && demandeId) {
    results.total++;
    if (await testAccepterDemande()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Test 5: Refuser une demande
  results.total++;
  if (await testRefuserDemande()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 6: Update état générique
  results.total++;
  if (await testUpdateEtatGenerique()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 7: Statistiques
  results.total++;
  if (await verifierStatistiques()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Résumé
  log('\n🏁 ========================================', 'cyan');
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  log('🏁 ========================================', 'cyan');
  log(`   Total: ${results.total}`, 'blue');
  log(`   ✅ Réussis: ${results.passed}`, 'green');
  log(`   ❌ Échoués: ${results.failed}`, 'red');
  log(`   📈 Taux de réussite: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
    log('✅ Les modifications du collaborateur fonctionnent correctement', 'green');
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('   Vérifiez les erreurs ci-dessus', 'yellow');
  }
  
  log('\n');
}

// Lancer les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
