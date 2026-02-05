const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 📊 Middleware de logging détaillé
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'Direct';
  
  console.log(`🌐 [${timestamp}] ${method} ${url}`);
  console.log(`   📱 Origin: ${origin}`);
  console.log(`   🔧 User-Agent: ${userAgent.substring(0, 50)}...`);
  
  // Log du body pour les requêtes POST/PUT (sans les mots de passe)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const bodyLog = { ...req.body };
    if (bodyLog.password) bodyLog.password = '[HIDDEN]';
    console.log(`   📦 Body:`, JSON.stringify(bodyLog, null, 2));
  }
  
  // Intercepter la réponse pour logger le statut
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`   ✅ Response: ${res.statusCode} - ${res.statusMessage}`);
    if (res.statusCode >= 400) {
      console.log(`   ❌ Error Response:`, data.substring(0, 200));
    }
    console.log(`   ⏱️  Duration: ${Date.now() - req.startTime}ms\n`);
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
});

// Middleware CORS avec logging
app.use(cors({
  origin: function(origin, callback) {
    console.log(`🔐 CORS Check - Origin: ${origin || 'No Origin'}`);
    
    const allowedOrigins = [
      'http://localhost:4200',
      'https://localhost:4200',
      'https://m1p13mean-niaina-1.onrender.com',
      'https://m1p13mean-niaina-xjl4.vercel.app', // Frontend Vercel principal
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Permettre les requêtes sans origin (Postman, curl, etc.)
    if (!origin) {
      console.log(`✅ CORS: Allowing request without origin`);
      return callback(null, true);
    }
    
    // Vérifier les origines exactes
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin ${origin} is allowed`);
      return callback(null, true);
    }
    
    // Vérifier les patterns Vercel (pour les branches de déploiement)
    const vercelPattern = /^https:\/\/m1p13mean-niaina-xjl4.*\.vercel\.app$/;
    if (vercelPattern.test(origin)) {
      console.log(`✅ CORS: Vercel deployment ${origin} is allowed`);
      return callback(null, true);
    }
    
    // Vérifier les patterns Render (pour les branches de déploiement)
    const renderPattern = /^https:\/\/m1p13mean-niaina.*\.onrender\.com$/;
    if (renderPattern.test(origin)) {
      console.log(`✅ CORS: Render deployment ${origin} is allowed`);
      return callback(null, true);
    }
    
    console.log(`❌ CORS: Origin ${origin} is NOT allowed`);
    console.log(`   Allowed origins:`, allowedOrigins);
    console.log(`   Vercel pattern: ${vercelPattern}`);
    console.log(`   Render pattern: ${renderPattern}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes avec logging
console.log('🛣️  Initialisation des routes...');

// Routes d'authentification
console.log('🛣️  Chargement route auth...');
app.use('/api/auth', require('./routes/auth'));

// Routes utilisateurs (conformes aux spécifications)
console.log('🛣️  Chargement routes utilisateurs...');
app.use('/api', require('./routes/auth')); // Pour /api/users/*

// Routes de notifications
console.log('🛣️  Chargement route notifications...');
app.use('/api/notifications', require('./routes/notifications'));

// Routes utilisateurs notifications (conformes aux spécifications)
console.log('🛣️  Chargement routes notifications utilisateurs...');
app.use('/api', require('./routes/notifications')); // Pour /api/users/:userId/notifications

// Routes d'administration
console.log('🛣️  Chargement route admin...');
app.use('/api/admin', require('./routes/admin'));

// Routes de boutiques
console.log('🛣️  Chargement route boutique...');
app.use('/api/boutique', require('./routes/boutique'));

// Routes publiques boutiques (conformes aux spécifications)
console.log('🛣️  Chargement routes boutiques publiques...');
app.use('/api', require('./routes/boutique')); // Pour /api/boutiques/*

// Routes client
console.log('🛣️  Chargement route client...');
app.use('/api/client', require('./routes/client'));

// Routes de produits (deux versions)
console.log('🛣️  Chargement route products...');
app.use('/api/products', require('./routes/products'));
console.log('🛣️  Chargement route produits...');
app.use('/api/produits', require('./routes/produits'));

// Routes de commandes
console.log('🛣️  Chargement route orders...');
app.use('/api/orders', require('./routes/orders'));

// Routes d'infrastructure
console.log('🛣️  Chargement route etages...');
app.use('/api/etages', require('./routes/etages'));
console.log('🛣️  Chargement route espaces...');
app.use('/api/espaces', require('./routes/espaces'));
console.log('🛣️  Chargement route centre-commercial...');
app.use('/api/centre-commercial', require('./routes/centre-commercial'));

// Routes de gestion financière
console.log('🛣️  Chargement route portefeuille...');
app.use('/api/portefeuille', require('./routes/portefeuille'));

// Routes utilisateurs portefeuille (conformes aux spécifications)
console.log('🛣️  Chargement routes portefeuille utilisateurs...');
app.use('/api', require('./routes/portefeuille')); // Pour /api/users/:id/wallet

console.log('🛣️  Chargement route achats...');
app.use('/api/achats', require('./routes/achats'));

// Routes de loyers (nouvelles)
console.log('🛣️  Chargement route loyers...');
app.use('/api/commercant/loyers', require('./routes/loyers'));

// Routes de factures (nouvelles)
console.log('🛣️  Chargement route factures...');
app.use('/api/factures', require('./routes/factures'));

// Routes de demandes
console.log('🛣️  Chargement route demandes-location...');
app.use('/api/demandes-location', require('./routes/demandes-location'));

// Routes de catégories
console.log('🛣️  Chargement route types-produit...');
app.use('/api/types-produit', require('./routes/types-produit'));
console.log('🛣️  Chargement route categories-boutique...');
app.use('/api/categories-boutique', require('./routes/categories-boutique'));

console.log('✅ Routes initialisées avec succès');

// 🗄️ Connexion MongoDB avec logs détaillés
console.log('🔌 Tentative de connexion à MongoDB...');
console.log(`📍 URI: ${process.env.MONGODB_URI ? 'MongoDB Atlas (URI configurée)' : 'mongodb://localhost:27017/mall_db'}`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mall_db', {
  serverSelectionTimeoutMS: 5000, // Timeout plus court
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connexion MongoDB réussie');
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);
    
    // Test de la base de données
    mongoose.connection.db.admin().ping()
      .then(() => console.log('🏓 Ping MongoDB: OK'))
      .catch(err => console.log('❌ Ping MongoDB: FAILED', err.message));
  })
  .catch(err => {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    console.warn('⚠️  MongoDB non disponible, serveur démarré sans base de données');
    console.warn('💡 Solutions possibles:');
    console.warn('   1. Vérifier MongoDB Atlas Network Access (IP Whitelist)');
    console.warn('   2. Vérifier la chaîne de connexion MONGODB_URI');
    console.warn('   3. Autoriser 0.0.0.0/0 temporairement pour test');
  });

// Événements MongoDB
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB: Connexion établie');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB: Erreur de connexion', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB: Connexion perdue');
});

// Route de test avec informations système
app.get('/', (req, res) => {
  const systemInfo = {
    message: 'API Centre Commercial - Serveur actif',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name || 'Non connecté',
      host: mongoose.connection.host || 'Non connecté'
    },
    server: {
      port: process.env.PORT || 3000,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  };
  
  console.log('📊 Status check requested:', systemInfo);
  res.json(systemInfo);
});

// Route de santé pour monitoring
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      server: 'OK',
      database: 'CHECKING'
    }
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.checks.database = 'OK';
    console.log('💚 Health check: Tout fonctionne');
    res.json(health);
  } catch (error) {
    health.checks.database = 'ERROR';
    health.status = 'DEGRADED';
    console.log('💛 Health check: Base de données inaccessible');
    res.status(503).json(health);
  }
});

// Gestion des erreurs avec logs détaillés
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`❌ [${timestamp}] Erreur serveur:`);
  console.error(`   🛣️  Route: ${req.method} ${req.url}`);
  console.error(`   📱 Origin: ${req.get('Origin') || 'Direct'}`);
  console.error(`   🔍 Stack:`, err.stack);
  
  // S'assurer que la réponse est toujours en JSON
  res.status(500).json({ 
    message: 'Erreur serveur interne',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp,
    path: req.url
  });
});

// Route 404 avec logging - TOUJOURS retourner du JSON
app.use('*', (req, res) => {
  const timestamp = new Date().toISOString();
  console.warn(`⚠️  [${timestamp}] Route non trouvée: ${req.method} ${req.originalUrl}`);
  console.warn(`   📱 Origin: ${req.get('Origin') || 'Direct'}`);
  console.warn(`   🎫 Authorization: ${req.get('Authorization') ? 'Présent' : 'Absent'}`);
  
  // IMPORTANT: Toujours retourner du JSON, jamais du HTML
  res.status(404).json({ 
    message: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    timestamp,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/etages/test',
      'GET /api/etages',
      'GET /api/espaces',
      'GET /api/boutique',
      'GET /api/notifications'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕐 Démarrage: ${new Date().toISOString()}`);
  console.log('🚀 ================================\n');
  
  // Test de connectivité au démarrage
  setTimeout(() => {
    console.log('🔍 Test de connectivité au démarrage...');
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB: Connecté et prêt');
    } else {
      console.log('⚠️  MongoDB: Non connecté - Fonctionnalités limitées');
    }
  }, 2000);
});