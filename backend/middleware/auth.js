const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] Vérification authentification`);
  console.log(`   🛣️  Route: ${req.method} ${req.originalUrl}`);
  
  try {
    const authHeader = req.header('Authorization');
    console.log(`   🎫 Header Authorization: ${authHeader ? 'Présent' : 'Absent'}`);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log(`❌ Token manquant`);
      return res.status(401).json({ 
        message: 'Token manquant, accès refusé',
        code: 'NO_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Vérification token JWT...`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log(`✅ Token décodé - User ID: ${decoded.id}`);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log(`❌ Utilisateur non trouvé: ${decoded.id}`);
      return res.status(401).json({ 
        message: 'Token invalide - utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    if (!user.isActive) {
      console.log(`⚠️  Compte désactivé: ${user._id}`);
      return res.status(401).json({ 
        message: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Authentification réussie: ${user._id} (${user.role})`);
    req.user = user;
    next();
  } catch (error) {
    console.log(`❌ Erreur authentification: ${error.message}`);
    
    // Gestion spécifique des erreurs JWT
    let errorMessage = 'Token invalide';
    let errorCode = 'INVALID_TOKEN';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expiré';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformé';
      errorCode = 'MALFORMED_TOKEN';
    }
    
    res.status(401).json({ 
      message: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware pour vérifier le rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`🛡️  [${timestamp}] Vérification autorisation`);
    console.log(`   👤 Utilisateur: ${req.user._id} (${req.user.role})`);
    console.log(`   🔑 Rôles requis: ${roles.join(', ')}`);
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Accès refusé - Rôle insuffisant`);
      return res.status(403).json({ 
        message: 'Accès refusé - Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Autorisation accordée`);
    next();
  };
};

// Middleware spécifique pour admin
const adminAuth = [auth, authorize('Admin', 'admin')];

// Middleware spécifique pour boutique
const boutiqueAuth = [auth, authorize('Commercant', 'boutique', 'Admin', 'admin')];

// Middleware de vérification admin avec logs détaillés
const requireAdmin = (req, res, next) => {
  console.log(`🛡️ [AUTH] Vérification admin détaillée`);
  console.log(`   👤 User ID: ${req.user?._id}`);
  console.log(`   📧 Email: ${req.user?.email}`);
  console.log(`   🎭 Rôle: "${req.user?.role}"`);
  console.log(`   📊 Type: ${typeof req.user?.role}`);
  
  if (!req.user) {
    console.log(`❌ [AUTH] Utilisateur non authentifié`);
    return res.status(401).json({ 
      message: 'Authentification requise' 
    });
  }
  
  if (req.user.role !== 'Admin' && req.user.role !== 'admin') {
    console.log(`❌ [AUTH] Accès refusé - Rôle: "${req.user.role}"`);
    return res.status(403).json({ 
      message: `Vous devez être connecté en tant qu'administrateur pour accéder à cette page. Votre rôle actuel: "${req.user.role}"`,
      currentRole: req.user.role,
      requiredRole: 'Admin'
    });
  }
  
  console.log(`✅ [AUTH] Accès admin autorisé`);
  next();
};

module.exports = { auth, authorize, adminAuth, boutiqueAuth, requireAdmin };