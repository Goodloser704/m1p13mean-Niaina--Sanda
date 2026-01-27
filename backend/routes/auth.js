const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Inscription utilisateur
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nom').notEmpty().trim(),
  body('prenom').notEmpty().trim(),
  body('role').isIn(['boutique', 'client'])
], async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] Tentative d'inscription`);
  console.log(`   📧 Email: ${req.body.email}`);
  console.log(`   👤 Rôle: ${req.body.role}`);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ Validation échouée:`, errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nom, prenom, role, telephone, adresse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    console.log(`🔍 Vérification existence utilisateur: ${email}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  Utilisateur existe déjà: ${email}`);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer nouvel utilisateur
    console.log(`➕ Création nouvel utilisateur: ${email}`);
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role,
      telephone,
      adresse
    });

    await user.save();
    console.log(`✅ Utilisateur créé avec succès: ${user._id}`);

    // Générer token
    const token = generateToken(user._id);
    console.log(`🎫 Token généré pour: ${user._id}`);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    console.error(`❌ Erreur inscription:`, error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] Tentative de connexion`);
  console.log(`   📧 Email: ${req.body.email}`);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ Validation échouée:`, errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    console.log(`🔍 Recherche utilisateur: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️  Utilisateur non trouvé: ${email}`);
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    console.log(`👤 Utilisateur trouvé: ${user._id} (${user.role})`);

    // Vérifier le mot de passe
    console.log(`🔑 Vérification mot de passe...`);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`❌ Mot de passe incorrect pour: ${email}`);
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      console.log(`⚠️  Compte désactivé: ${email}`);
      return res.status(400).json({ message: 'Compte désactivé' });
    }

    // Générer token
    const token = generateToken(user._id);
    console.log(`✅ Connexion réussie: ${user._id} (${user.role})`);
    console.log(`🎫 Token généré et envoyé`);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    console.error(`❌ Erreur connexion:`, error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/auth/me
// @desc    Obtenir les infos de l'utilisateur connecté
// @access  Private
router.get('/me', auth, async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`👤 [${timestamp}] Demande profil utilisateur`);
  console.log(`   🎫 User ID: ${req.user._id}`);
  console.log(`   👤 Rôle: ${req.user.role}`);
  
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        nom: req.user.nom,
        prenom: req.user.prenom,
        role: req.user.role,
        telephone: req.user.telephone,
        adresse: req.user.adresse
      }
    });
    console.log(`✅ Profil envoyé pour: ${req.user._id}`);
  } catch (error) {
    console.error(`❌ Erreur récupération profil:`, error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;