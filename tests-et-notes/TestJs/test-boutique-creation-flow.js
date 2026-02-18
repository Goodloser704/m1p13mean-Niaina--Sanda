/**
 * 🧪 TEST DU FLUX DE CRÉATION DE BOUTIQUE
 * Teste le processus complet de création d'une boutique
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

async function testBoutiqueCreationFlow() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 TEST DU FLUX DE CRÉATION DE BOUTIQUE                               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🌐 API URL: ${API_URL}\n`, 'cyan');

  try {
    // ÉTAPE 1: Créer un compte Commerçant
    log('\n📝 ÉTAPE 1: Création compte Commerçant', 'cyan');
    const email = `commercant.test.${Date.now()}@test.com`;
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      nom: 'TestCommercant',
      prenoms: 'Test',
      email: email,
      mdp: 'password123',
      role: 'Commercant',
      telephone: '0612345678'
    });

    if (registerResponse.status === 201) {
      log('✅ Compte Commerçant créé avec succès', 'green');
      log(`   Email: ${email}`, 'green');
      const token = registerResponse.data.token;
      log(`   Token: ${token.substring(0, 20)}...`, 'green');

      // ÉTAPE 2: Récupérer les catégories
      log('\n📋 ÉTAPE 2: Récupération des catégories', 'cyan');
      const categoriesResponse = await axios.get(`${API_URL}/categories-boutique`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (categoriesResponse.status === 200) {
        const categories = categoriesResponse.data.categories;
        log(`✅ ${categories.length} catégories récupérées`, 'green');
        
        if (categories.length > 0) {
          log(`   Première catégorie: ${categories[0].nom} (ID: ${categories[0]._id})`, 'green');

          // ÉTAPE 3: Créer une boutique
          log('\n🏪 ÉTAPE 3: Création de la boutique', 'cyan');
          const boutiqueData = {
            nom: `Boutique Test ${Date.now()}`,
            description: 'Boutique de test créée automatiquement',
            categorie: categories[0]._id,
            horairesHebdo: [
              { jour: 'Lundi', debut: '09:00', fin: '18:00' },
              { jour: 'Mardi', debut: '09:00', fin: '18:00' },
              { jour: 'Mercredi', debut: '09:00', fin: '18:00' },
              { jour: 'Jeudi', debut: '09:00', fin: '18:00' },
              { jour: 'Vendredi', debut: '09:00', fin: '18:00' }
            ]
          };

          log(`   Données boutique:`, 'yellow');
          log(`   - Nom: ${boutiqueData.nom}`, 'yellow');
          log(`   - Catégorie: ${categories[0].nom}`, 'yellow');
          log(`   - Horaires: ${boutiqueData.horairesHebdo.length} jours`, 'yellow');

          const boutiqueResponse = await axios.post(
            `${API_URL}/boutique/commercant/boutique`,
            boutiqueData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (boutiqueResponse.status === 201) {
            log('✅ Boutique créée avec succès!', 'green');
            const boutique = boutiqueResponse.data.boutique || boutiqueResponse.data;
            log(`   ID: ${boutique._id}`, 'green');
            log(`   Nom: ${boutique.nom}`, 'green');
            log(`   Statut: ${boutique.statut}`, 'green');

            // Attendre un peu pour la synchronisation de la base de données
            log('\n⏳ Attente de 2 secondes pour la synchronisation...', 'yellow');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ÉTAPE 4: Vérifier que la boutique apparaît dans "Mes Boutiques"
            log('\n🔍 ÉTAPE 4: Vérification "Mes Boutiques"', 'cyan');
            const myBoutiquesResponse = await axios.get(
              `${API_URL}/boutique/my-boutiques`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (myBoutiquesResponse.status === 200) {
              const mesBoutiques = myBoutiquesResponse.data.boutiques;
              log(`✅ ${mesBoutiques.length} boutique(s) trouvée(s)`, 'green');
              
              const boutiqueCreee = mesBoutiques.find(b => b._id === boutique._id);
              if (boutiqueCreee) {
                log('✅ La boutique créée est bien présente dans "Mes Boutiques"', 'green');
              } else {
                log('❌ La boutique créée n\'est PAS dans "Mes Boutiques"', 'red');
              }
            }

            // RÉSUMÉ
            log('\n' + '='.repeat(80), 'cyan');
            log('📊 RÉSUMÉ DU TEST', 'cyan');
            log('='.repeat(80), 'cyan');
            log('✅ Compte Commerçant créé', 'green');
            log('✅ Catégories récupérées', 'green');
            log('✅ Boutique créée', 'green');
            log('✅ Boutique visible dans "Mes Boutiques"', 'green');
            log('\n🎉 FLUX COMPLET FONCTIONNEL!', 'green');
            log('='.repeat(80) + '\n', 'cyan');

          } else {
            log(`❌ Erreur création boutique - Status: ${boutiqueResponse.status}`, 'red');
          }
        } else {
          log('❌ Aucune catégorie disponible', 'red');
        }
      } else {
        log(`❌ Erreur récupération catégories - Status: ${categoriesResponse.status}`, 'red');
      }
    } else {
      log(`❌ Erreur création compte - Status: ${registerResponse.status}`, 'red');
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
}

// Exécuter le test
testBoutiqueCreationFlow();
