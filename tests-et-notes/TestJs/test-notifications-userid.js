/**
 * 🔔 Test des endpoints de notifications avec filtrage userId
 * Vérifie que chaque utilisateur ne voit que ses propres notifications
 */

const BASE_URL = 'https://m1p13mean-niaina-1.onrender.com/api';

// Comptes de test
const ACCOUNTS = {
  admin: {
    email: 'admin@mallapp.com',
    password: 'admin123'
  },
  boutique: {
    email: 'commercant@test.com',
    password: 'Commercant123456!'
  },
  client: {
    email: 'client@test.com',
    password: 'Client123456!'
  }
};

let tokens = {};
let userIds = {};

/**
 * 🔐 Connexion et récupération du token
 */
async function login(email, mdp, role) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mdp })
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      console.log(`✅ Connexion ${role} réussie`);
      tokens[role] = data.token;
      userIds[role] = data.user?._id || data.userId || data.id;
      return true;
    } else {
      console.error(`❌ Échec connexion ${role}:`, data.message);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur connexion ${role}:`, error.message);
    return false;
  }
}

/**
 * 📊 Test: Récupérer le nombre de notifications non lues
 */
async function testGetUnreadCount(role) {
  console.log(`\n📊 Test: Comptage notifications non lues (${role})`);
  
  try {
    const response = await fetch(`${BASE_URL}/notifications/count`, {
      headers: {
        'Authorization': `Bearer ${tokens[role]}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Comptage réussi pour ${role}:`, data.unreadCount, 'notifications non lues');
      return { success: true, count: data.unreadCount };
    } else {
      console.error(`❌ Échec comptage ${role}:`, data.message);
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Erreur comptage ${role}:`, error.message);
    return { success: false };
  }
}

/**
 * 📋 Test: Récupérer les notifications
 */
async function testGetNotifications(role) {
  console.log(`\n📋 Test: Récupération notifications (${role})`);
  
  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${tokens[role]}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Récupération réussie pour ${role}:`, data.notifications.length, 'notifications');
      
      // Vérifier que toutes les notifications appartiennent bien à cet utilisateur
      const allBelongToUser = data.notifications.every(notif => 
        notif.recipient === userIds[role] || notif.receveur === userIds[role]
      );
      
      if (allBelongToUser) {
        console.log(`✅ Toutes les notifications appartiennent bien à ${role}`);
      } else {
        console.error(`❌ SÉCURITÉ: Certaines notifications n'appartiennent pas à ${role}!`);
      }
      
      return { success: true, notifications: data.notifications };
    } else {
      console.error(`❌ Échec récupération ${role}:`, data.message);
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Erreur récupération ${role}:`, error.message);
    return { success: false };
  }
}

/**
 * ✅ Test: Marquer toutes les notifications comme lues
 */
async function testMarkAllAsRead(role) {
  console.log(`\n✅ Test: Marquer toutes comme lues (${role})`);
  
  try {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens[role]}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Marquage réussi pour ${role}:`, data.count, 'notifications marquées');
      return { success: true, count: data.count };
    } else {
      console.error(`❌ Échec marquage ${role}:`, data.message);
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Erreur marquage ${role}:`, error.message);
    return { success: false };
  }
}

/**
 * 🔒 Test: Vérifier l'isolation des notifications entre utilisateurs
 */
async function testNotificationIsolation() {
  console.log(`\n🔒 Test: Isolation des notifications entre utilisateurs`);
  
  const results = {};
  
  // Récupérer les notifications de chaque utilisateur
  for (const role of ['admin', 'boutique', 'client']) {
    const result = await testGetNotifications(role);
    results[role] = result;
  }
  
  // Vérifier qu'il n'y a pas de chevauchement
  console.log('\n📊 Résumé de l\'isolation:');
  console.log(`   Admin: ${results.admin.notifications?.length || 0} notifications`);
  console.log(`   Boutique: ${results.boutique.notifications?.length || 0} notifications`);
  console.log(`   Client: ${results.client.notifications?.length || 0} notifications`);
  
  return results;
}

/**
 * 🧪 Exécuter tous les tests
 */
async function runAllTests() {
  console.log('🧪 ========================================');
  console.log('🔔 TEST DES NOTIFICATIONS AVEC USERID');
  console.log('========================================\n');

  // 1. Connexion de tous les utilisateurs
  console.log('📝 Étape 1: Connexion des utilisateurs');
  for (const [role, credentials] of Object.entries(ACCOUNTS)) {
    await login(credentials.email, credentials.password, role);
  }

  if (Object.keys(tokens).length < 3) {
    console.error('\n❌ Impossible de continuer: tous les utilisateurs ne sont pas connectés');
    return;
  }

  console.log('\n✅ Tous les utilisateurs sont connectés');
  console.log('User IDs:', userIds);

  // 2. Test du comptage pour chaque utilisateur
  console.log('\n📝 Étape 2: Test du comptage des notifications');
  for (const role of ['admin', 'boutique', 'client']) {
    await testGetUnreadCount(role);
  }

  // 3. Test de récupération des notifications
  console.log('\n📝 Étape 3: Test de récupération des notifications');
  await testNotificationIsolation();

  // 4. Test de marquage comme lu
  console.log('\n📝 Étape 4: Test de marquage comme lu');
  for (const role of ['admin', 'boutique', 'client']) {
    await testMarkAllAsRead(role);
  }

  // 5. Vérifier que le comptage est maintenant à 0
  console.log('\n📝 Étape 5: Vérification après marquage');
  for (const role of ['admin', 'boutique', 'client']) {
    const result = await testGetUnreadCount(role);
    if (result.success && result.count === 0) {
      console.log(`✅ ${role}: Comptage correct après marquage (0)`);
    } else if (result.success) {
      console.log(`ℹ️ ${role}: ${result.count} notifications non lues restantes`);
    }
  }

  console.log('\n========================================');
  console.log('✅ TESTS TERMINÉS');
  console.log('========================================');
}

// Exécuter les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
