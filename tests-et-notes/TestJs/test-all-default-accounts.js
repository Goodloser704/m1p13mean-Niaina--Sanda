/**
 * 🧪 TEST DES COMPTES PAR DÉFAUT
 * Teste les 3 comptes: Admin, Client, Commerçant
 */

const axios = require('axios');

const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com';

const defaultAccounts = [
  {
    role: 'Admin',
    email: 'admin@mallapp.com',
    password: 'admin123',
    nom: 'Admin',
    prenom: 'Système'
  },
  {
    role: 'Acheteur',
    email: 'client@test.com',
    password: 'Client123456!',
    nom: 'Test',
    prenom: 'Client'
  },
  {
    role: 'Commercant',
    email: 'commercant@test.com',
    password: 'Commercant123456!',
    nom: 'Test',
    prenom: 'Commerçant'
  }
];

async function testLogin(account) {
  try {
    console.log(`\n🔐 Test: ${account.prenom} (${account.role})`);
    console.log(`   📧 Email: ${account.email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: account.email,
      mdp: account.password
    }, {
      validateStatus: () => true
    });

    if (response.status === 200) {
      console.log(`   ✅ Connexion réussie!`);
      console.log(`   👤 Utilisateur: ${response.data.user.prenom || response.data.user.prenoms} ${response.data.user.nom}`);
      console.log(`   🎭 Rôle: ${response.data.user.role}`);
      console.log(`   🎫 Token: ${response.data.token.substring(0, 30)}...`);
      return true;
    } else {
      console.log(`   ❌ Échec (${response.status}): ${response.data.message}`);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 === TEST DES COMPTES PAR DÉFAUT ===');
  console.log(`🌐 Backend: ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const account of defaultAccounts) {
    const success = await testLogin(account);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 === RÉSULTATS ===');
  console.log(`✅ Réussis: ${passed}/${defaultAccounts.length}`);
  console.log(`❌ Échoués: ${failed}/${defaultAccounts.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 Tous les comptes fonctionnent!');
    console.log('\n📋 Identifiants pour le frontend:');
    defaultAccounts.forEach(acc => {
      console.log(`   ${acc.role}: ${acc.email} / ${acc.password}`);
    });
  } else {
    console.log('\n⚠️ Certains comptes ne fonctionnent pas.');
  }
}

runTests();
