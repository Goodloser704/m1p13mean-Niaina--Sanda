/**
 * 🧪 Test de validation des horaires de boutique
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Compte acheteur
const ACHETEUR = {
  email: 'client@test.com',
  mdp: 'Client123456!'
};

let acheteurToken = '';
let boutiqueId = '';

async function login() {
  console.log('🔐 Connexion acheteur...');
  const res = await axios.post(`${API_URL}/auth/login`, ACHETEUR);
  acheteurToken = res.data.token;
  console.log('✅ Connecté');
}

async function getBoutiques() {
  console.log('\n📋 Récupération des boutiques...');
  const res = await axios.get(`${API_URL}/boutiques`, {
    headers: { Authorization: `Bearer ${acheteurToken}` }
  });
  
  if (res.data.boutiques && res.data.boutiques.length > 0) {
    boutiqueId = res.data.boutiques[0]._id;
    console.log(`✅ Boutique trouvée: ${res.data.boutiques[0].nom} (${boutiqueId})`);
    
    // Afficher les horaires
    if (res.data.boutiques[0].horairesHebdo) {
      console.log('\n📅 Horaires:');
      res.data.boutiques[0].horairesHebdo.forEach(h => {
        console.log(`   ${h.jour}: ${h.debut} - ${h.fin}`);
      });
    }
  }
}

async function testAchatBoutiqueFermee() {
  console.log('\n🛒 Test achat avec boutique fermée...');
  
  try {
    // Récupérer les produits de la boutique
    const prodRes = await axios.get(`${API_URL}/boutiques/${boutiqueId}/produits`, {
      headers: { Authorization: `Bearer ${acheteurToken}` }
    });
    
    if (!prodRes.data.produits || prodRes.data.produits.length === 0) {
      console.log('⚠️  Aucun produit disponible');
      return;
    }
    
    const produit = prodRes.data.produits[0];
    console.log(`   Produit: ${produit.nom} (${produit.prix}€)`);
    
    // Obtenir l'heure actuelle
    const now = new Date();
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    console.log(`   Heure actuelle: ${joursSemaine[now.getDay()]} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    
    // Tenter un achat
    const achatRes = await axios.post(
      `${API_URL}/achats/panier/valider`,
      {
        achats: [{
          produit: produit._id,
          quantite: 1,
          prixUnitaire: produit.prix,
          typeAchat: 'Recuperer'
        }],
        montantTotal: produit.prix
      },
      {
        headers: { Authorization: `Bearer ${acheteurToken}` }
      }
    );
    
    console.log('✅ Achat réussi (boutique ouverte)');
    console.log(`   Message: ${achatRes.data.message}`);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Achat refusé (boutique fermée)');
      console.log(`   Erreur: ${error.response.data.message}`);
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

async function main() {
  try {
    await login();
    await getBoutiques();
    await testAchatBoutiqueFermee();
    
    console.log('\n✅ Tests terminés');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

main();
