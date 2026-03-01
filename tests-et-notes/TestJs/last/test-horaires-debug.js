/**
 * 🧪 Test debug des horaires
 */

// Simuler la fonction estBoutiqueOuverte
function estBoutiqueOuverte(boutique, date = new Date()) {
  console.log('\n🔍 DEBUG estBoutiqueOuverte');
  console.log('   Date:', date);
  console.log('   Statut boutique:', boutique.statutBoutique, '(ignoré pour validation horaires)');
  
  // NE PAS vérifier statutBoutique - on se base uniquement sur les horaires

  if (!boutique.horairesHebdo || boutique.horairesHebdo.length === 0) {
    console.log('   ⚠️  Pas d\'horaires définis');
    return {
      estOuverte: true,
      raison: 'Horaires non définis'
    };
  }

  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const jourActuel = joursSemaine[date.getDay()];
  console.log('   Jour actuel:', jourActuel);

  const horaireJour = boutique.horairesHebdo.find(h => h.jour === jourActuel);
  console.log('   Horaire trouvé:', horaireJour);

  if (!horaireJour) {
    return {
      estOuverte: false,
      raison: `Fermé le ${jourActuel}`
    };
  }

  const heureActuelle = date.getHours() * 100 + date.getMinutes();
  console.log('   Heure actuelle (HHMM):', heureActuelle);
  
  const [heureDebutH, heureDebutM] = horaireJour.debut.split(':').map(Number);
  const [heureFinH, heureFinM] = horaireJour.fin.split(':').map(Number);
  const heureDebut = heureDebutH * 100 + heureDebutM;
  const heureFin = heureFinH * 100 + heureFinM;
  
  console.log('   Heure début (HHMM):', heureDebut, `(${horaireJour.debut})`);
  console.log('   Heure fin (HHMM):', heureFin, `(${horaireJour.fin})`);
  console.log('   Comparaison:', heureActuelle, '<', heureDebut, '?', heureActuelle < heureDebut);
  console.log('   Comparaison:', heureActuelle, '>=', heureFin, '?', heureActuelle >= heureFin);

  if (heureActuelle < heureDebut) {
    return {
      estOuverte: false,
      raison: `Ouvre à ${horaireJour.debut}`
    };
  }

  if (heureActuelle >= heureFin) {
    return {
      estOuverte: false,
      raison: `Fermé (fermeture à ${horaireJour.fin})`
    };
  }

  return {
    estOuverte: true,
    raison: `Ouvert jusqu'à ${horaireJour.fin}`
  };
}

// Test avec différentes heures
const boutique = {
  nom: 'Test Boutique',
  statutBoutique: 'Inactif', // Même avec statut Inactif, on doit pouvoir acheter pendant les horaires
  horairesHebdo: [
    { jour: 'Lundi', debut: '08:00', fin: '17:00' },
    { jour: 'Dimanche', debut: '08:00', fin: '15:37' }
  ]
};

console.log('🏪 Boutique:', boutique.nom);
console.log('📅 Horaires:');
boutique.horairesHebdo.forEach(h => {
  console.log(`   ${h.jour}: ${h.debut} - ${h.fin}`);
});

// Test 1: Dimanche 14:39 (devrait être ouvert)
console.log('\n\n=== TEST 1: Dimanche 14:39 ===');
const date1 = new Date('2026-03-01T14:39:00'); // Dimanche
const result1 = estBoutiqueOuverte(boutique, date1);
console.log('   Résultat:', result1.estOuverte ? '✅ OUVERT' : '❌ FERMÉ');
console.log('   Raison:', result1.raison);

// Test 2: Dimanche 16:00 (devrait être fermé)
console.log('\n\n=== TEST 2: Dimanche 16:00 ===');
const date2 = new Date('2026-03-01T16:00:00'); // Dimanche
const result2 = estBoutiqueOuverte(boutique, date2);
console.log('   Résultat:', result2.estOuverte ? '✅ OUVERT' : '❌ FERMÉ');
console.log('   Raison:', result2.raison);

// Test 3: Dimanche 07:30 (devrait être fermé)
console.log('\n\n=== TEST 3: Dimanche 07:30 ===');
const date3 = new Date('2026-03-01T07:30:00'); // Dimanche
const result3 = estBoutiqueOuverte(boutique, date3);
console.log('   Résultat:', result3.estOuverte ? '✅ OUVERT' : '❌ FERMÉ');
console.log('   Raison:', result3.raison);

// Test 4: Samedi (pas d'horaire, devrait être fermé)
console.log('\n\n=== TEST 4: Samedi 10:00 ===');
const date4 = new Date('2026-02-28T10:00:00'); // Samedi
const result4 = estBoutiqueOuverte(boutique, date4);
console.log('   Résultat:', result4.estOuverte ? '✅ OUVERT' : '❌ FERMÉ');
console.log('   Raison:', result4.raison);
