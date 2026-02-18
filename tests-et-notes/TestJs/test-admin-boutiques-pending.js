/**
 * 🧪 TEST ADMIN - BOUTIQUES EN ATTENTE
 * Teste l'accès admin aux boutiques en attente
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://m1p13mean-niaina-1.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAdminBoutiquesPending() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 TEST ADMIN - BOUTIQUES EN ATTENTE                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  try {
    // ÉTAPE 1: Login Admin
    log('📝 ÉTAPE 1: Login Admin', 'cyan');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mallapp.com',
      mdp: 'admin123'
    });

    if (loginResponse.status === 200) {
      log('✅ Login admin réussi', 'green');
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      
      log(`   Email: ${user.email}`, 'green');
      log(`   Rôle: ${user.role}`, 'green');
      log(`   ID: ${user._id}`, 'green');
      log(`   Token: ${token.substring(0, 30)}...`, 'green');

      // ÉTAPE 2: Créer une boutique avec un commerçant
      log('\n📝 ÉTAPE 2: Création boutique par commerçant', 'cyan');
      const commercantEmail = `commercant.${Date.now()}@test.com`;
      
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        nom: 'TestCommercant',
        prenoms: 'Test',
        email: commercantEmail,
        mdp: 'password123',
        role: 'Commercant',
        telephone: '0612345678'
      });

      if (registerResponse.status === 201) {
        log('✅ Commerçant créé', 'green');
        const commercantToken = registerResponse.data.token;

        // Récupérer les catégories
        const categoriesResponse = await axios.get(`${API_URL}/categories-boutique`, {
          headers: { Authorization: `Bearer ${commercantToken}` }
        });

        const categories = categoriesResponse.data.categories;
        log(`✅ ${categories.length} catégories récupérées`, 'green');

        // Créer une boutique
        const boutiqueResponse = await axios.post(
          `${API_URL}/boutique/commercant/boutique`,
          {
            nom: `Boutique Test ${Date.now()}`,
            description: 'Test boutique en attente',
            categorie: categories[0]._id,
            horairesHebdo: [
              { jour: 'Lundi', debut: '09:00', fin: '18:00' }
            ]
          },
          { headers: { Authorization: `Bearer ${commercantToken}` } }
        );

        if (boutiqueResponse.status === 201) {
          log('✅ Boutique créée', 'green');
          const boutique = boutiqueResponse.data.boutique || boutiqueResponse.data;
          log(`   ID: ${boutique._id}`, 'green');
          log(`   Nom: ${boutique.nom}`, 'green');

          // Attendre un peu
          log('\n⏳ Attente de 2 secondes...', 'yellow');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // ÉTAPE 3: Récupérer les boutiques en attente avec le token admin
          log('\n🔍 ÉTAPE 3: Récupération boutiques en attente (Admin)', 'cyan');
          log(`   Token utilisé: ${token.substring(0, 30)}...`, 'yellow');
          
          try {
            const pendingResponse = await axios.get(
              `${API_URL}/boutique/pending`,
              { 
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                validateStatus: () => true // Accepter tous les status
              }
            );

            log(`   Status: ${pendingResponse.status}`, pendingResponse.status === 200 ? 'green' : 'red');
            
            if (pendingResponse.status === 200) {
              const boutiques = pendingResponse.data.boutiques || [];
              log(`✅ ${boutiques.length} boutique(s) en attente`, 'green');
              
              const found = boutiques.find(b => b._id === boutique._id);
              if (found) {
                log('✅ La boutique créée est bien en attente', 'green');
              } else {
                log('⚠️  La boutique créée n\'est pas dans la liste', 'yellow');
              }
            } else if (pendingResponse.status === 403) {
              log('❌ ERREUR 403 - Accès refusé', 'red');
              log(`   Message: ${pendingResponse.data.message}`, 'red');
              log(`   Code: ${pendingResponse.data.code}`, 'red');
              if (pendingResponse.data.requiredRoles) {
                log(`   Rôles requis: ${pendingResponse.data.requiredRoles.join(', ')}`, 'red');
              }
              if (pendingResponse.data.userRole) {
                log(`   Rôle utilisateur: ${pendingResponse.data.userRole}`, 'red');
              }
            } else {
              log(`❌ Erreur ${pendingResponse.status}`, 'red');
              log(`   ${JSON.stringify(pendingResponse.data, null, 2)}`, 'red');
            }
          } catch (error) {
            log('❌ Erreur lors de la requête:', 'red');
            log(`   ${error.message}`, 'red');
            if (error.response) {
              log(`   Status: ${error.response.status}`, 'red');
              log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
            }
          }

          // ÉTAPE 4: Vérifier les notifications admin
          log('\n🔔 ÉTAPE 4: Vérification notifications admin', 'cyan');
          try {
            const notifResponse = await axios.get(
              `${API_URL}/notifications`,
              { 
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true
              }
            );

            log(`   Status: ${notifResponse.status}`, notifResponse.status === 200 ? 'green' : 'red');
            
            if (notifResponse.status === 200) {
              const notifications = notifResponse.data.notifications || [];
              log(`✅ ${notifications.length} notification(s)`, 'green');
              
              const boutiqueNotif = notifications.find(n => 
                n.type === 'nouvelle_boutique' || 
                n.message?.includes(boutique.nom)
              );
              
              if (boutiqueNotif) {
                log('✅ Notification de nouvelle boutique trouvée', 'green');
              } else {
                log('⚠️  Pas de notification pour la nouvelle boutique', 'yellow');
              }
            } else {
              log(`❌ Erreur ${notifResponse.status}`, 'red');
            }
          } catch (error) {
            log('❌ Erreur notifications:', 'red');
            log(`   ${error.message}`, 'red');
          }
        }
      }
    }

  } catch (error) {
    log('\n❌ ERREUR DURANT LE TEST:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data?.message || 'Pas de message'}`, 'red');
      log(`   Données: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    console.error(error);
  }

  log('\n' + '='.repeat(80) + '\n', 'cyan');
}

// Exécuter le test
testAdminBoutiquesPending();
