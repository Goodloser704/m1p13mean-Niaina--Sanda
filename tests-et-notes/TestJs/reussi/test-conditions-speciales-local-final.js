// Test en LOCAL - Définir l'URL locale
process.env.TEST_URL = 'http://localhost:5000/api';

// Importer et exécuter le script de test
require('./test-conditions-speciales-final.js');
