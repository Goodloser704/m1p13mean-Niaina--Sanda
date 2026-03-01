const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDoublePaiement() {
  try {
    // 1. Login commercant
    console.log('🔐 Login commercant...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Token obtenu');
    
    // 2. Récupérer les boutiques
    console.log('\n🏪 Récupération boutiques...');
    const boutiquesRes = await axios.get(`${API_URL}/commercant/boutiques/my-boutiques`, { headers });
    const boutiques = boutiquesRes.data.boutiques.filter(b => b.espace && b.statutBoutique === 'Actif');
    
    if (boutiques.length === 0) {
      console.log('❌ Aucune boutique active avec espace');
      return;
    }
    
    const boutique = boutiques[0];
    console.log(`Boutique sélectionnée: ${boutique.nom} (ID: ${boutique._id})`);
    
    // 3. Essayer de payer avril 2026 (déjà payé pour cscecevvevev)
    const periode = '2026-04';
    const montant = boutique.espace.loyer;
    
    console.log(`\n💰 Tentative de paiement pour ${periode}...`);
    console.log(`   Montant: ${montant}€`);
    
    try {
      const paiementRes = await axios.post(
        `${API_URL}/commercant/loyers/pay`,
        {
          boutiqueId: boutique._id,
          montant: montant,
          periode: periode
        },
        { headers }
      );
      
      console.log('✅ Paiement accepté (ne devrait pas arriver si déjà payé)');
      console.log('Réponse:', paiementRes.data);
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('déjà été payé')) {
        console.log('✅ CONTRÔLE FONCTIONNEL : Paiement refusé car déjà payé');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.response?.data || error.message);
      }
    }
    
    // 4. Essayer de payer un mois non payé (mai 2026)
    const periodeNonPayee = '2026-05';
    console.log(`\n💰 Tentative de paiement pour ${periodeNonPayee} (non payé)...`);
    
    try {
      const paiementRes = await axios.post(
        `${API_URL}/commercant/loyers/pay`,
        {
          boutiqueId: boutique._id,
          montant: montant,
          periode: periodeNonPayee
        },
        { headers }
      );
      
      console.log('✅ Paiement accepté pour période non payée');
      console.log(`   Nouveau solde: ${paiementRes.data.nouveauSolde}€`);
      
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testDoublePaiement();
