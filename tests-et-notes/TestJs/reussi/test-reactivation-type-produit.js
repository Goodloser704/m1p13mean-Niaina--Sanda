/**
 * 🎯 Test Spécifique: Réactivation Type Produit (Modification Sanda)
 * Test détaillé de la fonctionnalité de réactivation au lieu d'erreur
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testReactivation() {
  console.log('\n🧪 TEST: Réactivation Type Produit (Modification Sanda)\n');
  console.log('='.repeat(70));

  try {
    // 1. Login commerçant
    console.log('\n1️⃣  Login commerçant...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'commercant@test.com',
      mdp: 'Commercant123456!'
    });
    const token = loginRes.data.token;
    console.log('✅ Connecté');

    // 2. Récupérer une boutique du commerçant
    console.log('\n2️⃣  Récupération boutique...');
    const boutiquesRes = await axios.get(`${BASE_URL}/boutique`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!boutiquesRes.data.boutiques || boutiquesRes.data.boutiques.length === 0) {
      console.log('❌ Aucune boutique trouvée pour ce commerçant');
      return;
    }
    
    const boutiqueId = boutiquesRes.data.boutiques[0]._id;
    console.log(`✅ Boutique trouvée: ${boutiqueId}`);

    // 3. Créer un type de produit
    console.log('\n3️⃣  Création type produit initial...');
    const createRes = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Test Réactivation',
        description: 'Description initiale',
        boutique: boutiqueId,
        icone: '📦',
        couleur: '#3498db',
        ordre: 1
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const typeProduitId = createRes.data.typeProduit._id;
    console.log(`✅ Type créé: ${typeProduitId}`);
    console.log(`   - Type: ${createRes.data.typeProduit.type}`);
    console.log(`   - Description: ${createRes.data.typeProduit.description}`);
    console.log(`   - Icône: ${createRes.data.typeProduit.icone}`);
    console.log(`   - Couleur: ${createRes.data.typeProduit.couleur}`);
    console.log(`   - Ordre: ${createRes.data.typeProduit.ordre}`);
    console.log(`   - isActive: ${createRes.data.typeProduit.isActive}`);

    // 4. Supprimer (soft delete) le type
    console.log('\n4️⃣  Suppression (soft delete) du type...');
    await axios.delete(
      `${BASE_URL}/types-produit/${typeProduitId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Type désactivé (isActive = false)');

    // 5. AVANT: Tentative de recréer le même type (devrait retourner erreur)
    console.log('\n5️⃣  🔴 COMPORTEMENT AVANT (sans modification Sanda):');
    console.log('   ❌ Retournerait: "Ce type de produit existe déjà pour cette boutique"');
    console.log('   ❌ Status: 400');

    // 6. APRÈS: Recréer le même type (doit le réactiver)
    console.log('\n6️⃣  🟢 COMPORTEMENT APRÈS (avec modification Sanda):');
    const reactivateRes = await axios.post(
      `${BASE_URL}/types-produit`,
      {
        type: 'Test Réactivation',
        description: 'Description mise à jour',
        boutique: boutiqueId,
        icone: '🎁',
        couleur: '#e74c3c',
        ordre: 5
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`✅ Status: ${reactivateRes.status}`);
    console.log(`✅ Message: "${reactivateRes.data.message}"`);
    console.log(`✅ Type réactivé: ${reactivateRes.data.typeProduit._id}`);
    console.log(`   - Type: ${reactivateRes.data.typeProduit.type}`);
    console.log(`   - Description: ${reactivateRes.data.typeProduit.description}`);
    console.log(`   - Icône: ${reactivateRes.data.typeProduit.icone}`);
    console.log(`   - Couleur: ${reactivateRes.data.typeProduit.couleur}`);
    console.log(`   - Ordre: ${reactivateRes.data.typeProduit.ordre}`);
    console.log(`   - isActive: ${reactivateRes.data.typeProduit.isActive}`);

    // 7. Vérifications
    console.log('\n7️⃣  Vérifications:');
    
    const checks = [
      {
        name: 'Status code = 200',
        pass: reactivateRes.status === 200
      },
      {
        name: 'Message = "Type de produit restauré avec succès"',
        pass: reactivateRes.data.message === 'Type de produit restauré avec succès'
      },
      {
        name: 'ID identique (même objet réactivé)',
        pass: reactivateRes.data.typeProduit._id === typeProduitId
      },
      {
        name: 'Description mise à jour',
        pass: reactivateRes.data.typeProduit.description === 'Description mise à jour'
      },
      {
        name: 'Icône mise à jour',
        pass: reactivateRes.data.typeProduit.icone === '🎁'
      },
      {
        name: 'Couleur mise à jour',
        pass: reactivateRes.data.typeProduit.couleur === '#e74c3c'
      },
      {
        name: 'Ordre mis à jour',
        pass: reactivateRes.data.typeProduit.ordre === 5
      },
      {
        name: 'isActive = true',
        pass: reactivateRes.data.typeProduit.isActive === true
      }
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (check.pass) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name}`);
        allPassed = false;
      }
    });

    // 8. Nettoyage
    console.log('\n8️⃣  Nettoyage...');
    await axios.delete(
      `${BASE_URL}/types-produit/${typeProduitId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Type supprimé');

    // Résultat final
    console.log('\n' + '='.repeat(70));
    if (allPassed) {
      console.log('🎉 RÉSULTAT: TOUTES LES VÉRIFICATIONS PASSÉES !');
      console.log('✨ La modification de Sanda est PROFITABLE !');
      console.log('\n📝 AVANTAGES:');
      console.log('   ✅ Évite les erreurs de duplication');
      console.log('   ✅ Permet de réutiliser les types désactivés');
      console.log('   ✅ Met à jour automatiquement les champs');
      console.log('   ✅ Meilleure expérience utilisateur');
      console.log('   ✅ Évite la pollution de la base de données');
    } else {
      console.log('⚠️  RÉSULTAT: Certaines vérifications ont échoué');
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

testReactivation();
