const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDetectionPaiement() {
  try {
    // 1. Login commercant
    console.log('🔐 Login commercant...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Token obtenu');
    
    // 2. Récupérer les boutiques
    console.log('\n🏪 Récupération boutiques...');
    const boutiquesRes = await axios.get(`${API_URL}/commercant/boutiques/my-boutiques`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const boutiques = boutiquesRes.data.boutiques.filter(b => b.espace && b.statutBoutique === 'Actif');
    console.log(`Boutiques actives avec espace: ${boutiques.length}`);
    
    boutiques.forEach(b => {
      console.log(`  - ${b.nom} (ID: ${b._id})`);
    });
    
    // 3. Récupérer l'historique
    console.log('\n📋 Récupération historique...');
    const historiqueRes = await axios.get(`${API_URL}/commercant/loyers/historique`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50 }
    });
    
    const paiements = historiqueRes.data.loyers;
    console.log(`Total paiements: ${paiements.length}`);
    
    // 4. Analyser les paiements
    console.log('\n🔍 ANALYSE DES PAIEMENTS:');
    
    const paiementsMap = new Map();
    
    paiements.forEach(p => {
      const matchPeriode = p.description?.match(/Période (\d{4}-\d{2})/);
      const matchBoutique = p.description?.match(/Loyer boutique (.+?) - Période/);
      
      if (matchPeriode && matchBoutique) {
        const periode = matchPeriode[1];
        const nomBoutique = matchBoutique[1].trim();
        
        // Trouver la boutique correspondante
        const boutique = boutiques.find(b => b.nom === nomBoutique);
        
        if (boutique) {
          const key = `${boutique._id}-${periode}`;
          paiementsMap.set(key, true);
          
          console.log(`✅ ${nomBoutique} → ${periode} (ID: ${boutique._id})`);
        } else {
          console.log(`⚠️  Boutique "${nomBoutique}" non trouvée dans la liste`);
        }
      }
    });
    
    // 5. Vérifier avril 2026
    console.log('\n📅 VÉRIFICATION AVRIL 2026:');
    boutiques.forEach(b => {
      const key = `${b._id}-2026-04`;
      const estPaye = paiementsMap.get(key) || false;
      console.log(`  ${b.nom}: ${estPaye ? '✅ PAYÉ' : '❌ IMPAYÉ'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testDetectionPaiement();
