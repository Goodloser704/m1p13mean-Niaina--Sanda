const express = require('express');
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * 🔐 Routes d'Authentification
 * Gestion de l'inscription, connexion et profils utilisateurs
 * Architecture: Route → Controller → Service
 */

// @route   POST /api/auth/register
// @desc    Inscription utilisateur (Commercant ou Acheteur)
// @access  Public
// @body    { email, mdp, nom, prenoms, role, telephone }
// @return  { message, token, user, portefeuille }
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('mdp').isLength({ min: 6 }), // Utiliser 'mdp' selon les spécifications
  body('nom').notEmpty().trim(),
  body('prenoms').notEmpty().trim(), // Utiliser 'prenoms' selon les spécifications
  body('role').isIn(['Admin', 'Commercant', 'Acheteur']) // Enums selon spécifications
], authController.register);

// @route   POST /api/auth/login
// @desc    Connexion utilisateur (Admin, Commercant ou Acheteur)
// @access  Public
// @body    { email, mdp }
// @return  { message, token, user }
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('mdp').exists() // Utiliser 'mdp' selon les spécifications
], authController.login);

// @route   GET /api/auth/me
// @desc    Obtenir les infos de l'utilisateur connecté
// @access  Private
// @return  { user }
router.get('/me', auth, authController.getProfile);

// @route   GET /api/users/:id/me (conforme aux spécifications)
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
// @return  { user }
router.get('/users/:id/me', auth, authController.getProfile);

// @route   GET /api/auth/profile (alias pour /me)
// @desc    Obtenir les infos de l'utilisateur connecté (alias)
// @access  Private
// @return  { user }
router.get('/profile', auth, authController.getProfile);

// @route   PUT /api/users/me (conforme aux spécifications)
// @desc    Mettre à jour le profil utilisateur
// @access  Private
// @body    { nom, prenoms, email, telephone, photo, genre }
// @return  { message, user }
router.put('/users/me', [
  // Champs obligatoires seulement s'ils sont présents
  body('nom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('prenom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  
  // Champs complètement optionnels
  body('telephone').optional({ nullable: true, checkFalsy: false }).trim(),
  body('dateNaissance').optional({ nullable: true, checkFalsy: false }),
  body('genre').optional({ nullable: true, checkFalsy: false }).isIn(['Masculin', 'Feminin']),
  body('adresse').optional({ nullable: true, checkFalsy: false }).trim(),
  
  // Champs boutique optionnels
  body('nomBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('descriptionBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('categorieActivite').optional({ nullable: true, checkFalsy: false }).isIn(['mode', 'electronique', 'maison', 'beaute', 'sport', 'alimentation', 'autre']),
  body('numeroSiret').optional({ nullable: true, checkFalsy: false }).trim(),
  body('adresseBoutique').optional({ nullable: true, checkFalsy: false }).trim()
], auth, authController.updateProfile);

// @route   PUT /api/auth/profile (maintenir la compatibilité)
// @desc    Mettre à jour le profil utilisateur
// @access  Private
// @body    { nom, prenoms, email, telephone, photo }
// @return  { message, user }
router.put('/profile', [
  // Champs obligatoires seulement s'ils sont présents
  body('nom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('prenom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  
  // Champs complètement optionnels
  body('telephone').optional({ nullable: true, checkFalsy: false }).trim(),
  body('dateNaissance').optional({ nullable: true, checkFalsy: false }),
  body('genre').optional({ nullable: true, checkFalsy: false }).isIn(['Masculin', 'Feminin']),
  body('adresse').optional({ nullable: true, checkFalsy: false }).trim(),
  
  // Champs boutique optionnels
  body('nomBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('descriptionBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('categorieActivite').optional({ nullable: true, checkFalsy: false }).isIn(['mode', 'electronique', 'maison', 'beaute', 'sport', 'alimentation', 'autre']),
  body('numeroSiret').optional({ nullable: true, checkFalsy: false }).trim(),
  body('adresseBoutique').optional({ nullable: true, checkFalsy: false }).trim()
], auth, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Changer le mot de passe
// @access  Private
router.put('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], auth, authController.changePassword);

// @route   DELETE /api/auth/account
// @desc    Supprimer le compte utilisateur
// @access  Private
router.delete('/account', auth, authController.deleteAccount);

// @route   GET /api/auth/users/search
// @desc    Rechercher des utilisateurs (Admin seulement)
// @access  Private (Admin)
router.get('/users/search', adminAuth, authController.searchUsers);

// @route   PUT /api/auth/users/:userId/status
// @desc    Mettre à jour le statut d'un utilisateur (Admin seulement)
// @access  Private (Admin)
router.put('/users/:userId/status', adminAuth, authController.updateUserStatus);

// @route   GET /api/auth/boutiques/pending
// @desc    Obtenir les boutiques en attente de validation (Admin seulement)
// @access  Private (Admin)
router.get('/boutiques/pending', adminAuth, authController.getPendingBoutiques);

// @route   PUT /api/auth/boutiques/:boutiqueId/approve
// @desc    Approuver une boutique (Admin seulement)
// @access  Private (Admin)
router.put('/boutiques/:boutiqueId/approve', adminAuth, authController.approveBoutique);

// @route   PUT /api/auth/boutiques/:boutiqueId/reject
// @desc    Rejeter une boutique (Admin seulement)
// @access  Private (Admin)
router.put('/boutiques/:boutiqueId/reject', [
  body('reason').optional().isLength({ max: 500 })
], adminAuth, authController.rejectBoutique);

module.exports = router;