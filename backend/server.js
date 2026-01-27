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
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Permettre les requêtes sans origin (Postman, curl, etc.)
    if (!origin) {
      console.log(`✅ CORS: Allowing request without origin`);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin ${origin} is NOT allowed`);
      console.log(`   Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes avec logging
console.log('🛣️  Initialisation des routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/boutique', require('./routes/boutique'));
app.use('/api/client', require('./routes/client'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
console.log('✅ Routes initialisées avec succès');

// 🗄️ Connexion MongoDB avec logs détaillés
console.log('🔌 Tentative de connexion à MongoDB...');
console.log(`📍 URI: ${process.env.MONGODB_URI ? 'MongoDB Atlas (URI configurée)' : 'mongodb://localhost:27017/mall_db'}`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mall_db')
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
    console.warn('💡 Pour utiliser toutes les fonctionnalités, vérifiez votre connexion MongoDB');
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
  
  res.status(500).json({ 
    message: 'Erreur serveur interne',
    timestamp,
    path: req.url
  });
});

// Route 404 avec logging
app.use('*', (req, res) => {
  const timestamp = new Date().toISOString();
  console.warn(`⚠️  [${timestamp}] Route non trouvée: ${req.method} ${req.originalUrl}`);
  console.warn(`   📱 Origin: ${req.get('Origin') || 'Direct'}`);
  
  res.status(404).json({ 
    message: 'Route non trouvée',
    path: req.originalUrl,
    timestamp
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