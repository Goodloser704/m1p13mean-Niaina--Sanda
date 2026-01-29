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
      return res.status(401).json({ message: 'Token manquant, accès refusé' });
    }

    console.log(`🔍 Vérification token JWT...`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log(`✅ Token décodé - User ID: ${decoded.id}`);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log(`❌ Utilisateur non trouvé: ${decoded.id}`);
      return res.status(401).json({ message: 'Token invalide' });
    }

    if (!user.isActive) {
      console.log(`⚠️  Compte désactivé: ${user._id}`);
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    console.log(`✅ Authentification réussie: ${user._id} (${user.role})`);
    req.user = user;
    next();
  } catch (error) {
    console.log(`❌ Erreur authentification: ${error.message}`);
    res.status(401).json({ message: 'Token invalide' });
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
        message: 'Accès refusé - Permissions insuffisantes' 
      });
    }
    
    console.log(`✅ Autorisation accordée`);
    next();
  };
};

// Middleware spécifique pour admin
const adminAuth = [auth, authorize('admin')];

// Middleware spécifique pour boutique
const boutiqueAuth = [auth, authorize('boutique', 'admin')];

module.exports = { auth, authorize, adminAuth, boutiqueAuth };