/**
 * 🧪 SUITE DE TESTS COMPLÈTE
 * Exécute tous les 73 tests réussis et génère un rapport détaillé
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TESTS_DIR = path.join(__dirname, 'reussi');
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

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

// Catégories de tests
const categories = {
  'Authentification': [
    'test-admin-login.js',
    'test-all-default-accounts.js',
    'test-login-frontend.js'
  ],
  'Boutiques': [
    'test-boutique-creation-flow.js',
    'test-creation-boutique.js',
    'test-admin-boutiques-pending.js',
    'test-pagination-boutiques.js',
    'test-statut-boutique-simplifie.js'
  ],
  'Espaces et Étages': [
    'test-create-espace.js',
    'test-create-etage-debug.js',
    'test-creation-espace-local.js',
    'test-creation-espace-render.js',
    'test-espace-populate-etage.js',
    'test-espace-populate-etage-render.js',
    'test-etage-stats-avec-espaces-inactifs.js',
    'test-stats-etage-apres-fix.js',
    'test-production-admin-etages.js'
  ],
  'Suppression': [
    'test-delete-complet-local.js',
    'test-delete-complet-render.js',
    'test-delete-etage.js',
    'test-delete-etage-avec-espaces.js',
    'test-delete-etage-render.js',
    'test-delete-logique-local.js',
    'test-delete-logique-render.js',
    'test-delete-simple-render.js'
  ],
  'Loyers et Paiements': [
    'test-ajouter-paiement-fevrier.js',
    'test-ajouter-paiement-mars.js',
    'test-historique-loyers.js',
    'test-historique-loyers-render.js',
    'test-loyers-complet-avec-donnees.js',
    'test-loyers-verification-coherence.js',
    'test-loyers-verification-coherence-render.js',
    'test-boutiques-payees.js',
    'test-boutiques-payees-render.js',
    'test-statut-paiements-mois-courant.js'
  ],
  'Notifications': [
    'test-notification-boutique.js',
    'test-notifications-count-readall.js',
    'test-notifications-local.js',
    'test-notifications-total-count.js',
    'test-notifications-userid.js'
  ],
  'Catégories': [
    'test-categories-apres-deploy.js',
    'test-categories-auth.js',
    'test-categories-publiques.js'
  ],
  'Conditions Spéciales': [
    'test-conditions-speciales-final.js',
    'test-conditions-speciales-local.js',
    'test-conditions-speciales-local-final.js',
    'test-conditions-speciales-render.js',
    'test-conditions-speciales-render-v2.js'
  ],
  'Conformité et Validation': [
    'test-corrections-critiques.js',
    'test-models-conformite.js',
    'test-models-conformite-render.js',
    'test-routes-manquantes.js',
    'test-routes-manquantes-render.js'
  ],
  'API et Production': [
    'test-api-production-complete.js',
    'test-production-complet.js',
    'test-frontend-deployed.js',
    'test-user-endpoints-production.js',
    'test-toutes-fonctions-spec.js',
    'test-fonctions-manquantes.js'
  ],
  'Edge Cases et Erreurs': [
    'test-edge-cases-v2.js',
    'test-edge-cases-v3.js',
    'test-erreurs-uniquement.js',
    'test-niveau-2.js'
  ],
  'Exercices': [
    'test-exercice.js',
    'test-tous-exercices.js',
    'test-inscription-photo-genre.js',
    'test-tags.js'
  ],
  'Autres': [
    'test-admin-debug.js',
    'test-admin-role.js',
    'test-local-vs-render.js',
    'test-vues.js',
    'test-workflow-complet.js',
    'test-fonctions-commercant-simple.js'
  ],
  'Fonctionnalités Manquantes': [
    'test-fonctionnalites-manquantes.js'
  ]
};

async function runTest(testFile) {
  const testPath = path.join(TESTS_DIR, testFile);
  
  if (!fs.existsSync(testPath)) {
    return { success: false, error: 'Fichier non trouvé', time: 0 };
  }

  const startTime = Date.now();
  
  try {
    execSync(`node "${testPath}"`, {
      stdio: 'pipe',
      timeout: 30000,
      encoding: 'utf8'
    });
    
    const endTime = Date.now();
    return { success: true, time: endTime - startTime };
  } catch (error) {
    const endTime = Date.now();
    return { 
      success: false, 
      error: error.message,
      time: endTime - startTime 
    };
  }
}

async function runAllTests() {
  console.clear();
  
  logSection('🧪 SUITE DE TESTS COMPLÈTE - MALL APP');
  log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`, 'cyan');
  log(`📁 Répertoire: ${TESTS_DIR}\n`, 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    byCategory: {},
    failedTests: [],
    totalTime: 0
  };

  const startTime = Date.now();

  // Exécuter les tests par catégorie
  for (const [category, tests] of Object.entries(categories)) {
    logSection(`📦 ${category} (${tests.length} tests)`);
    
    results.byCategory[category] = {
      total: tests.length,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const testFile of tests) {
      process.stdout.write(`  ${testFile.padEnd(50)} `);
      results.total++;

      const result = await runTest(testFile);
      
      if (result.success) {
        log('✅ PASS', 'green');
        results.passed++;
        results.byCategory[category].passed++;
      } else {
        log('❌ FAIL', 'red');
        results.failed++;
        results.byCategory[category].failed++;
        results.failedTests.push({ file: testFile, error: result.error });
      }

      results.totalTime += result.time;
      results.byCategory[category].tests.push({
        file: testFile,
        success: result.success,
        time: result.time
      });
    }

    const catPassed = results.byCategory[category].passed;
    const catTotal = results.byCategory[category].total;
    const catPercent = ((catPassed / catTotal) * 100).toFixed(1);
    
    log(`  Résultat: ${catPassed}/${catTotal} (${catPercent}%)`, 
        catPassed === catTotal ? 'green' : 'yellow');
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Rapport final
  logSection('📊 RAPPORT FINAL');
  
  console.log('\n📈 Statistiques Globales:');
  log(`  Total de tests:      ${results.total}`, 'cyan');
  log(`  Tests réussis:       ${results.passed} ✅`, 'green');
  log(`  Tests échoués:       ${results.failed} ❌`, results.failed === 0 ? 'green' : 'red');
  log(`  Taux de réussite:    ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  log(`  Temps total:         ${(totalTime / 1000).toFixed(2)}s`, 'cyan');
  log(`  Temps moyen/test:    ${(totalTime / results.total).toFixed(0)}ms`, 'cyan');

  // Résultats par catégorie
  console.log('\n📦 Résultats par Catégorie:');
  for (const [category, stats] of Object.entries(results.byCategory)) {
    const percent = ((stats.passed / stats.total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    log(`  ${category.padEnd(30)} ${bar} ${stats.passed}/${stats.total} (${percent}%)`, 
        stats.passed === stats.total ? 'green' : 'yellow');
  }

  // Tests échoués
  if (results.failedTests.length > 0) {
    console.log('\n❌ Tests Échoués:');
    results.failedTests.forEach(test => {
      log(`  - ${test.file}`, 'red');
      log(`    ${test.error}`, 'magenta');
    });
  } else {
    console.log('\n');
    log('🎉 PARFAIT! Tous les tests sont réussis! 🎉', 'green');
  }

  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    results,
    totalTime,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(2) + '%'
    }
  };

  const reportPath = path.join(__dirname, 'rapport-suite-complete.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n');
  log(`📄 Rapport sauvegardé: ${reportPath}`, 'cyan');
  
  console.log('\n' + '='.repeat(70) + '\n');

  // Code de sortie
  process.exit(results.failed === 0 ? 0 : 1);
}

// Exécution
runAllTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
