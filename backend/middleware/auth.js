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

// Middleware pour vérifier le rôle (insensible à la casse)
const authorize = (...roles) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`🛡️  [${timestamp}] Vérification autorisation`);
    console.log(`   👤 Utilisateur: ${req.user._id} (${req.user.role})`);
    console.log(`   🔑 Rôles requis: ${roles.join(', ')}`);
    
    // Comparaison insensible à la casse
    const userRoleLower = req.user.role.toLowerCase();
    const rolesLower = roles.map(r => r.toLowerCase());
    
    if (!rolesLower.includes(userRoleLower)) {
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

// Middleware spécifique pour admin (accepte Admin, admin, ADMIN)
const adminAuth = [auth, authorize('Admin')];

// Middleware spécifique pour boutique (accepte toutes les casses)
const boutiqueAuth = [auth, authorize('Commercant', 'Admin')];

module.exports = { auth, authorize, adminAuth, boutiqueAuth };