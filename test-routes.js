// Test des routes disponibles
console.log('🧪 Test des routes disponibles...\n');

// Routes attendues
const routes = [
  'GET /api/auth/me',
  'PUT /api/auth/profile',
  'PUT /api/auth/change-password', 
  'DELETE /api/auth/account',
  'POST /api/auth/login',
  'POST /api/auth/register'
];

console.log('📋 Routes d\'authentification attendues:');
routes.forEach(route => {
  console.log(`   ✅ ${route}`);
});

console.log('\n🔍 Vérification des fichiers de routes...');

try {
  const authRoutes = require('./backend/routes/auth.js');
  console.log('   ✅ backend/routes/auth.js - OK');
} catch (error) {
  console.log('   ❌ backend/routes/auth.js - ERREUR:', error.message);
}

try {
  const authController = require('./backend/controllers/authController.js');
  console.log('   ✅ backend/controllers/authController.js - OK');
} catch (error) {
  console.log('   ❌ backend/controllers/authController.js - ERREUR:', error.message);
}

try {
  const authService = require('./backend/services/authService.js');
  console.log('   ✅ backend/services/authService.js - OK');
} catch (error) {
  console.log('   ❌ backend/services/authService.js - ERREUR:', error.message);
}

console.log('\n🚀 Pour déployer les nouvelles routes:');
console.log('   1. Committer tous les changements');
console.log('   2. Merger vers main: git checkout main && git merge niaina-dev');
console.log('   3. Push: git push origin main');
console.log('   4. Attendre le redéploiement automatique sur Render');

console.log('\n📊 URLs de test après déploiement:');
console.log('   Backend: https://m1p13mean-niaina-1.onrender.com/api/auth/me');
console.log('   Frontend: https://m1p13mean-niaina-xjl4.vercel.app/profile');